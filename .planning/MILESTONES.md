# Milestones

## v1.0 MVP (Shipped: 2026-02-20)

**Phases:** 1–5 (14 plans, 10 quick tasks)
**Timeline:** 2026-02-18 → 2026-02-20 (3 days)
**LOC:** ~2,929 TypeScript/TSX + ~950 Python | 147 files, 23,279 lines added

**Delivered:** A complete web application that converts a Chinese resume into two production-quality Japanese PDFs (履歴書 + 職務経歴書) via a 4-step wizard with AI extraction, translation, and human review.

**Key accomplishments:**
- 4-step bilingual wizard shell (zh/ja i18n) with Zustand state management and no-data guards
- JIS-standard 履歴書 (MHLW-format) and 職務経歴書 HTML templates rendered via WeasyPrint with embedded Noto Sans JP — zero tofu glyphs, human verified
- Dify AI extraction pipeline: PDF/DOCX upload → CnResumeData with side-by-side review/edit
- Dify AI translation pipeline: CnResumeData → JpResumeData with wareki dates (和暦/元年), credential mapping, and culture tip tooltips
- Dynamic Jinja2 template rendering: iframe srcdoc preview with 500ms debounced live editing, 3:4 photo crop, and PDF download
- Production-quality UX: 5-type error classification, stage-specific loading progress, completeness indicators, Docker deployment with nginx

**Archive:** `.planning/milestones/v1.0-ROADMAP.md`

---

## v1.1 Quality & OCR (Shipped: 2026-02-21)

**Phases completed:** 8 phases, 19 plans, 0 tasks

**Key accomplishments:**
- (none recorded)

---


## v1.2 PDF Quality & Workflow Fixes (Shipped: 2026-02-24)

**Phases completed:** 13 phases, 26 plans, 0 tasks

**Key accomplishments:**
- (none recorded)

---

