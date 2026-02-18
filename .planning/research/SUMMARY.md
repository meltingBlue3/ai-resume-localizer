# Project Research Summary

**Project:** AI Resume Localizer
**Domain:** Chinese-to-Japanese resume conversion web application
**Researched:** 2026-02-18
**Confidence:** MEDIUM-HIGH

## Executive Summary

This is a specialized document conversion pipeline — not a generic translation tool. The product takes Chinese resumes (in wildly varying formats), extracts structured data via AI, translates it into natural Japanese business language, and generates two strictly formatted output documents: 履歴書 (JIS standard rirekisho) and 職務経歴書 (shokumukeirekisho). The recommended approach is a React SPA frontend with a stateless Python FastAPI backend, using Dify Cloud for the AI-heavy extraction and translation workflows, and WeasyPrint for server-side HTML-to-PDF generation with bundled CJK fonts. No database is needed — the frontend Zustand store holds all wizard state, and the backend is pure request/response.

The architecture follows a clear pipeline pattern: file upload → text extraction (PyMuPDF) → Dify extraction workflow (CN text → structured CN JSON) → Dify translation workflow (CN JSON → JP JSON) → Jinja2 template rendering → WeasyPrint PDF generation. Each step maps to a distinct API endpoint and UI step, with human review gates after extraction and translation. The stateless backend pattern (no sessions, no database, no auth) keeps complexity low while the step-by-step wizard flow with side-by-side editing is the core UX differentiator — no competitor combines AI extraction, domain-aware translation, and JIS-format generation in a single guided flow.

The three highest risks are: (1) the JIS 履歴書 grid layout is notoriously difficult to reproduce in HTML/CSS with WeasyPrint's limited CSS engine — this must be validated early with static templates before building the dynamic pipeline, (2) LLM hallucination of resume data that doesn't exist in the source document — anti-hallucination prompting and null-field handling must be designed into the Dify workflows from day one, and (3) CJK font rendering failures in PDF output that produce invisible "tofu" characters — fonts must be bundled and tested in the production-identical environment (Docker) early. The mitigation strategy is consistent: de-risk the hardest parts first by building static HTML templates and verifying PDF generation before tackling the AI pipeline.

## Key Findings

### Recommended Stack

The stack splits cleanly into a TypeScript React frontend and a Python FastAPI backend, connected by a typed JSON contract. The frontend uses Vite 7.3 for builds, Tailwind CSS 4 for styling, Zustand for wizard state management, and react-i18next for bilingual UI. The backend uses FastAPI 0.129 with Pydantic 2.12 for validation, httpx for async Dify API calls (never synchronous `requests`), Jinja2 for HTML template rendering, and WeasyPrint 68 for PDF generation. PaddleOCR 3.4 is available for scanned documents but is not required for MVP (text-based PDF/DOCX extraction via PyMuPDF suffices).

**Core technologies:**
- **React 19 + Vite 7 + TypeScript:** SPA frontend with type safety for complex CN/JP data models
- **Tailwind CSS 4:** Utility-first CSS with first-party Vite plugin
- **Zustand 5:** Lightweight state management for wizard flow — no providers, hook-based, supports persist middleware
- **FastAPI 0.129 + Pydantic 2.12:** Async Python backend with auto-validation and OpenAPI docs
- **httpx 0.28:** Async HTTP client for Dify API calls — mandatory over `requests` to avoid blocking the event loop
- **WeasyPrint 68:** HTML/CSS → PDF with CSS Paged Media support — no browser dependency, but limited CSS (no flexbox/grid)
- **Jinja2 3.1:** Template engine for 履歴書/職務経歴書 HTML rendering
- **Noto Sans JP/SC (bundled):** CJK fonts for reliable PDF text rendering across all environments

### Expected Features

**Must have (table stakes) — 12 P1 features:**
- Resume upload (PDF + DOCX) — the entry point
- Structured data extraction via Dify — the AI core
- Chinese → Japanese translation via Dify — domain-aware business Japanese
- Side-by-side extraction review — trust-building, user verifies AI output
- Side-by-side translation review (editable) — quality control per field
- 履歴書 HTML generation + PDF download — primary output, JIS standard
- 職務経歴書 HTML generation + PDF download — secondary output, required for mid-career
- Photo upload + crop (3:4 ratio) — mandatory 履歴書 field
- Japanese era date conversion (和暦) — mandatory, deterministic (not LLM)
- Bilingual UI (Chinese primary, Japanese secondary) — core UX for target users
- Step-by-step wizard flow — the differentiating UX paradigm
- HTML preview before download — WYSIWYG confirmation

**Should have (v1.x differentiators):**
- Chinese name → katakana furigana auto-generation — unique value-add
- Education credential mapping (本科→学士, 硕士→修士) — helps users present degrees correctly
- Japanese resume culture guidance (contextual tips) — low effort, high trust
- Field-level editing in preview stage — reduces friction
- Honorific/keigo language adjustment — Dify prompt tuning

**Defer (v2+):**
- Batch processing, user accounts, cover letter generation — scope creep for v1
- Template gallery — JIS 履歴書 has ONE correct format; "creative" templates hurt applicants
- ATS optimization scoring — irrelevant for JIS-format resumes in Japanese hiring

### Architecture Approach

Stateless backend with client-side wizard state. Four backend endpoints (`upload-and-extract`, `translate`, `preview`, `generate-pdf`) compose focused services via FastAPI dependency injection. The frontend Zustand store holds the entire wizard state (file blob, raw text, CN JSON, JP JSON, preview HTML, current step) and each API call is self-contained. One Jinja2 template per document type serves both the browser preview (iframe) and PDF generation (WeasyPrint), ensuring WYSIWYG fidelity. Dify Cloud handles both AI workflows in blocking mode — streaming is an anti-pattern for structured JSON output.

**Major components:**
1. **Wizard Shell + Step Components** — React SPA with 5 steps: upload, review extraction, review translation, preview, download
2. **Zustand Store** — Single source of truth for all resume data and wizard state; `persist` middleware for page-refresh survival
3. **FastAPI Router + Services** — 4 endpoints composing TextExtractor, DifyClient, TemplateRenderer, PDFGenerator services
4. **Dify Client** — httpx-based async wrapper calling two Dify workflows (extraction key + translation key) in blocking mode with 90s timeout
5. **HTML Templates** — Jinja2 templates for 履歴書 (CSS table layout, not flexbox) and 職務経歴書, with @font-face referencing bundled Noto Sans JP
6. **PDF Generator** — WeasyPrint with FontConfiguration for CJK, producing A4 PDFs with embedded font subsets

### Critical Pitfalls

1. **JIS 履歴書 table layout in WeasyPrint** — The rigid grid format requires CSS `table` or `position: absolute` with mm-based dimensions. WeasyPrint has no flexbox/grid support. Build and validate the static template EARLY with extreme-length test data before connecting to the dynamic pipeline. This is the single highest technical risk.
2. **LLM hallucination of resume data** — LLMs fill gaps with plausible fictions. Instruct Dify extraction prompts to return `null` for missing fields, never invent. Display null fields as "未記入" in the UI. Test with deliberately incomplete resumes.
3. **CJK font rendering failures** — PDFs render "tofu" (□) without bundled fonts. Use `@font-face` with absolute file paths to bundled Noto Sans JP. Test in the production-identical Docker environment, not just locally.
4. **Date conversion errors (Western → 和暦)** — Deterministic backend logic only, never LLM. Handle era boundaries precisely (2019-05-01 = 令和元年, not 令和1年). Mixed formats in one document is a critical error.
5. **Simplified Chinese characters leaking into Japanese output** — The translation pipeline must convert all characters to Japanese kanji (JIS X 0208/0213). Post-processing validation step catches common misses (电→電, 车→車).

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation, Schema & Template Risk Mitigation
**Rationale:** The data schema is the contract everything depends on, and the 履歴書 HTML template in WeasyPrint is the highest technical risk. Validating both before building the AI pipeline avoids costly rework.
**Delivers:** Working project scaffolding, typed resume data models, static 履歴書 and 職務経歴書 HTML templates verified in WeasyPrint with bundled CJK fonts, wizard shell with step navigation, i18n framework.
**Addresses:** Project setup, data schema (Pydantic + TypeScript), bilingual UI foundation, wizard flow shell.
**Avoids:** Pitfall 4 (JIS table layout breaking), Pitfall 5 (CJK font rendering failures) — both de-risked by static template validation.

### Phase 2: Upload & AI Extraction Pipeline
**Rationale:** Upload is the user's entry point and extraction is the first AI-dependent step. Must work before translation can be built. Chinese resume format diversity is a risk that surfaces here.
**Delivers:** File upload UI with drag-and-drop, backend text extraction (PyMuPDF for PDF, python-docx for DOCX), Dify extraction workflow integration, side-by-side extraction review UI.
**Addresses:** Resume upload (P1), structured data extraction (P1), extraction review (P1).
**Avoids:** Pitfall 6 (LLM hallucination) — anti-hallucination prompting built into extraction schema. Pitfall 7 (Dify cascade failures) — error handling designed from the start. Pitfall 8 (format diversity) — format-agnostic extraction prompt.

### Phase 3: Translation Pipeline & Data Processing
**Rationale:** Translation depends on extraction output. Date conversion and character validation are backend processing steps that must be correct before generating any output documents.
**Delivers:** Dify translation workflow integration, side-by-side translation review (editable), deterministic 和暦 date conversion utility, simplified→Japanese kanji validation, furigana generation.
**Addresses:** CN→JP translation (P1), translation review (P1), era date conversion (P1), name furigana.
**Avoids:** Pitfall 1 (furigana omission) — furigana is a first-class output field. Pitfall 2 (kanji mismatch) — character validation in pipeline. Pitfall 3 (date conversion) — deterministic backend logic.

### Phase 4: Dynamic Preview & PDF Generation
**Rationale:** Preview validates the template rendering before adding PDF generation. Both use the same Jinja2 templates — preview in iframe, PDF via WeasyPrint. The static templates from Phase 1 are now connected to real data.
**Delivers:** Dynamic Jinja2 rendering from JP JSON, HTML preview in browser (both document types), WeasyPrint PDF generation with font subsetting, PDF download for 履歴書 and 職務経歴書.
**Addresses:** HTML preview (P1), PDF download (P1), 履歴書 generation (P1), 職務経歴書 generation (P1).
**Avoids:** Pitfall 4 (layout breaking) — already validated static template in Phase 1; this phase connects to real data.

### Phase 5: Photo, Polish & Production Readiness
**Rationale:** Photo handling, error states, null-field UX, and loading indicators are essential for a complete product but depend on the full pipeline being functional. Polish touches all components and benefits from a working end-to-end flow.
**Delivers:** Photo upload + 3:4 crop, complete bilingual UI strings, loading state indicators with stage feedback, null field handling ("未記入" labels, completeness percentage), error handling for all failure modes, end-to-end testing with diverse Chinese resumes.
**Addresses:** Photo upload (P1), remaining bilingual UI strings, all UX pitfalls (progress feedback, null fields, guidance).
**Avoids:** UX pitfalls (no progress feedback, hidden null fields, missing guidance for Chinese users).

### Phase Ordering Rationale

- **Schema + templates first** because the data contract is the spine of the app, and the JIS 履歴書 layout in WeasyPrint is the highest-risk unknown — validating it early avoids discovering a showstopper at the end.
- **Upload before translation** because extraction output is the input to translation. Building the pipeline linearly mirrors the user flow and makes each phase independently testable.
- **Translation before preview** because preview needs real translated data to be meaningful, and date conversion + character validation must be proven correct before generating documents.
- **Preview before PDF** because preview validates the template rendering in the browser before adding the WeasyPrint layer. If the template looks right in an iframe, it will look right in the PDF (same template, same data).
- **Polish last** because error handling, loading states, and photo cropping touch all components and benefit from a working end-to-end flow.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1:** 履歴書 JIS grid layout CSS — the exact cell dimensions, border weights, and spacing of the JIS standard need reference templates and iterative testing with WeasyPrint.
- **Phase 2:** Dify extraction workflow prompt engineering — the extraction schema design and anti-hallucination prompting requires experimentation with real Chinese resumes from different platforms.
- **Phase 3:** Chinese name → furigana mapping — the on'yomi reading convention and common surname dictionary need careful sourcing.

Phases with standard patterns (skip deeper research):
- **Phase 4:** Jinja2 template rendering + WeasyPrint PDF generation — well-documented patterns, standard FastAPI integration.
- **Phase 5:** File upload/crop, i18n, error handling — established React patterns with mature libraries.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All versions verified against npm/PyPI (Feb 2026). Compatibility matrix documented. No experimental dependencies. |
| Features | MEDIUM | No direct CN→JP conversion competitor exists for comparison. Feature list derived from adjacent products (JIS resume builders + generic translators) and Japanese resume standards. MVP scope is well-defined. |
| Architecture | HIGH | Stateless backend + client-side state is a proven pattern. Dify Cloud API documented and verified. Build order accounts for dependency graph. |
| Pitfalls | MEDIUM-HIGH | Most pitfalls multi-source verified. CJK-specific edge cases (character mapping, font rendering) based on domain expertise and community reports, not always official docs. |

**Overall confidence:** MEDIUM-HIGH — the stack and architecture are solid, the feature scope is clear, and the major pitfalls are identified with actionable prevention strategies. The remaining uncertainty is in the JIS 履歴書 template fidelity (requires hands-on iteration) and the Dify extraction prompt quality for diverse Chinese resume formats (requires a test corpus).

### Gaps to Address

- **JIS 履歴書 exact specifications:** Research identified the general format but precise cell dimensions (in mm) need a reference template scan or official JIS document. Plan to source a high-quality reference during Phase 1 template development.
- **Dify Cloud rate limits under load:** Free tier is only 200 message credits total. Professional tier ($59/mo) is needed for any real usage. Dify pricing changes could impact project viability — monitor.
- **WeasyPrint CSS limitations:** Known no-flexbox/no-grid constraints, but edge cases with CJK text wrapping in fixed-height cells need hands-on testing. Playwright (headless Chromium) is the fallback if WeasyPrint can't handle the 履歴書 grid.
- **Chinese resume test corpus:** No test corpus exists yet. Need 20+ real resumes from top 5 Chinese job platforms (Zhaopin, 51job, BOSS直聘, Liepin, generic) to validate extraction accuracy before claiming coverage.
- **PaddleOCR necessity:** Current plan uses PyMuPDF for text extraction from digital PDFs. Scanned/image-based resumes require PaddleOCR (adds ~2GB deployment size). Decision on whether to support scanned resumes in v1 or defer to v2 is open.

## Sources

### Primary (HIGH confidence)
- React 19.2.4, Vite 7.3.1, TypeScript 5.9.3, Tailwind CSS 4.1.18 — npmjs.com (verified Feb 2026)
- FastAPI 0.129.0, Pydantic 2.12.5, WeasyPrint 68.1, httpx 0.28.1 — pypi.org (verified Feb 2026)
- Dify Workflow Execution API — docs.dify.ai/api-reference/workflow-execution (verified via WebFetch)
- Dify File Upload API, authentication, best practices — docs.dify.ai (verified via WebFetch)
- PaddleOCR 3.4.0 — pypi.org (verified Feb 2026)
- Noto Sans JP — fontsource.org, notofonts.github.io (SIL OFL 1.1 license)

### Secondary (MEDIUM confidence)
- JIS 履歴書 format — japanhandbook.com, kotora.jp, success-job.jp, rirekishobuilder.com (multiple sources agree)
- 職務経歴書 format — daijob.com, japan-dev.com (multiple sources agree)
- WeasyPrint CJK font handling — Stack Overflow, GitHub issues (community sources, consistent findings)
- Kyoto University CJK character mapping — ACL Anthology LREC 2012 (academic source)
- Japanese date conventions — japanconvert.com (87% wareki preference statistic)
- Babel Street — Japanese transliteration of Chinese names, 1972 treaty conventions
- ExtractBench (2025) — LLM structured extraction evaluation
- Competitor analysis — RirekishoBuilder.com, OpenL Doc Translator, yeschat.ai GPT

### Tertiary (LOW confidence)
- Playwright vs WeasyPrint PDF benchmarks — single-source blog (garstecki.gitlab.io)
- Dify token limit per document (10K) — GitHub issue #20604 (may change with updates)
- Chinese resume platform market share — inferred from job board traffic data, not verified

---
*Research completed: 2026-02-18*
*Ready for roadmap: yes*
