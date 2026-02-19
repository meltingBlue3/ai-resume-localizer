# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-18)

**Core value:** 用户上传一份中文简历，经过结构化提取、日文翻译、人工审核修正后，得到两份符合日本企业招聘标准的PDF简历（履歴書 + 職務経歴書）
**Current focus:** All 5 phases COMPLETE

## Current Position

Phase: 5 of 5 (Polish & Production Readiness) — COMPLETE
Plan: 2 of 2 in current phase — COMPLETE
Status: All phases complete. Project fully implemented.
Last activity: 2026-02-19 - Completed quick task 006: Fix PDF generation date year/month in rirekisho

Progress: [██████████] 100% (All 5 phases complete, all 14 plans executed)

## Performance Metrics

**Velocity:**
- Total plans completed: 14
- Average duration: ~5.4min
- Total execution time: ~1.3 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation | 3 | ~27min | ~9min |
| 02-upload-extraction | 3 | ~15min | ~5min |
| 03-translation-data-processing | 3 | ~15min | ~5min |
| 04-preview-pdf-generation | 3 | ~16min | ~5.3min |
| 05-polish-production-readiness | 2/2 | ~10min | ~5min |

**Recent Trend:**
- Last 5 plans: 04-01 (~7min), 04-02 (~4min), 04-03 (~5min), 05-01 (~2min), 05-02 (~8min)
- Trend: Stable ~2-8min per plan

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap]: 5-phase structure derived from 35 requirements; JIS template validation prioritized in Phase 1 to de-risk highest technical uncertainty
- [Roadmap]: DOCG-06 (和暦 dates) mapped to Phase 3 (data processing) rather than Phase 4 (generation) per research recommendation
- [01-01]: Manually configured React 19 after Vite 8 create-vite defaulted to vanilla TS template
- [01-01]: BrowserRouter wrapping for future route support; wizard uses Zustand state navigation
- [01-01]: All UI text uses t() translation functions — zero hardcoded strings
- [01-02]: Used fontTools.varLib.instancer to create static font instances from Noto Sans JP variable font
- [01-02]: Font files (>5MB) excluded from git via .gitignore with download script provided
- [01-02]: WeasyPrint 63.1 confirmed working on Windows via pip install
- [01-02]: CSS tables with border-collapse: separate for all print layouts — zero flexbox/grid
- [01-03]: MSYS2 ucrt64 Pango/Cairo/GLib required for WeasyPrint on Windows — os.add_dll_directory() needed in Python 3.8+
- [01-03]: pypdf used for reliable PDF page counting (WeasyPrint compressed object streams hide /Type /Page markers)
- [01-03]: FontConfiguration must be passed to both CSS() and write_pdf() — omitting either causes tofu glyphs
- [01-03]: Font paths use url('file:///...') with forward slashes via Path.as_posix() for cross-platform compatibility
- [02-01]: Backward-compatible config aliases (BASE_DIR, FONTS_DIR, TEMPLATES_DIR) preserved alongside new pydantic-settings Settings class
- [02-01]: DOCX extractor iterates both paragraphs and tables for Chinese resume table layouts
- [02-01]: DifyClient uses 90s timeout (under Cloudflare 100s limit) with 10s connect timeout
- [02-01]: Upload endpoint returns 422 for empty text (scanned PDF), 503 for missing API key, 502/504 for Dify errors
- [02-02]: react-dropzone v14 (not v15) to avoid breaking isDragReject API change
- [02-02]: No persist middleware on useResumeStore — File objects are not serializable
- [02-02]: Native fetch API with FormData for file upload — no axios needed
- [02-03]: useState+useEffect for blob URLs instead of useMemo — avoids StrictMode URL revocation bug
- [02-03]: react-pdf worker configured via new URL() + import.meta.url for Vite 7 compatibility
- [02-03]: FONTCONFIG_FILE env var set before WeasyPrint import to resolve MSYS2 fontconfig on Windows
- [02-03]: ResumeFieldEditor uses collapsible sections with immutable array update helpers
- [03-02]: Intl.DateTimeFormat('ja-JP-u-ca-japanese') for wareki — zero library dependency, browser-native
- [03-02]: Gannen (元年) handled via Unicode Script=Han regex, not hardcoded era boundaries
- [03-02]: Store keeps pure state; step component orchestrates API calls (no translate store action)
- [03-02]: @radix-ui/react-tooltip pre-installed for 03-03 UI plan
- [03-01]: DifyClient.translate_resume() follows extract_resume() pattern — raises DifyWorkflowError, route converts to HTTPException
- [03-01]: Jp* models use 3.10+ syntax (str | None, list[...]) matching existing Cn* models
- [03-01]: Translate route creates own DifyClient instance with translation API key — same lifecycle as upload route
- [03-03]: JpResumeFieldEditor uses own CollapsibleSection/FieldInput (not shared from ResumeFieldEditor) — needs helperText and ReactNode labels for tooltip integration
- [03-03]: Culture tips on section headers (summary, motivation, education) and inline on name_katakana — context without clutter
- [03-03]: Skills array as comma-separated string, responsibilities/achievements as newline-separated textarea
- [03-03]: Human verification passed all 7 test cases — complete Phase 3 flow confirmed end-to-end
- [04-03]: Human verification passed all 8 test cases — complete Phase 4 preview/download flow confirmed end-to-end
- [04-03]: iframe srcdoc with pointer-events:none and ResizeObserver+transform:scale() for responsive A4 preview
- [04-03]: 500ms debounce on preview fetching; programmatic anchor click with blob URL for PDF download
- [04-01]: Jinja2 default filter with boolean=True catches None specifically (not falsy strings) — '未記入' shown for null fields
- [04-01]: CSS inlined via string replacement in render_document_for_preview — lightweight, no dependency
- [04-01]: Separate *_processed arrays (education_processed, work_history_processed, certifications_processed) with split year/month for rirekisho grid
- [04-01]: Wareki year = gregorian_year - 2018 for Reiwa era (sufficient 2019-2099)
- [04-01]: Shokumukeirekisho uses original work_history (full text dates), rirekisho uses processed version (split year/month cells)
- [04-02]: Raw base64 (no data URI prefix) sent to backend -- backend adds prefix in Jinja2 templates
- [04-02]: 354x472px target dimensions (30mm x 40mm at 300 DPI) for Japanese passport photo standard
- [04-02]: JPEG quality 0.85 balances file size and photo clarity
- [05-01]: Duck-typing via 'personal_info' property to distinguish JpResumeData from CnResumeData
- [05-01]: Array fields counted as binary (has entries or not) for completeness -- 15 total fields each for Jp and Cn
- [05-01]: Error fallback uses errors.unknown i18n keys rather than reusing errors.server
- [05-02]: Shared useProgressStages hook in frontend/src/hooks/ — avoids code duplication across UploadStep and ReviewTranslationStep
- [05-02]: lastDocType tracked via useRef for retry callback in PreviewStep and DownloadStep error banners

### Pending Todos

None yet.

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 001 | 前端问题：审核提取页面、审核翻译页面、预览简历页面，左右有对比的页面，宽度太窄，请尽量拉长宽度和高度 | 2026-02-19 | 83b2da3 | [001-widen-review-preview-pages](./quick/001-widen-review-preview-pages/) |
| 002 | Fix panel height overflow so nav buttons always visible on review/preview steps | 2026-02-19 | 40aadad | [002-fix-panel-height-overflow](./quick/002-fix-panel-height-overflow/) |
| 003 | Remove redundant DownloadStep -- PreviewStep already has download toolbar | 2026-02-19 | 5a5a1eb | [003-remove-download-step](./quick/003-remove-download-step/) |
| 004 | Fix WizardShell main element collapsing to content width on narrow steps | 2026-02-19 | 8538f09 | [004-fix-wizardshell-main-collapse](./quick/004-fix-wizardshell-main-collapse/) |
| 005 | Remove PhotoDropzone from UploadStep — photo upload only via PreviewStep | 2026-02-19 | b70e51a | [005-remove-photo-upload-from-uploadstep-keep](./quick/5-remove-photo-upload-from-uploadstep-keep/) |
| 006 | Fix PDF year cells (strip trailing 年) and two-row education/work format | 2026-02-19 | 6ecae56 | [6-fix-pdf-generation-date-year-month-in-ta](./quick/6-fix-pdf-generation-date-year-month-in-ta/) |

### Blockers/Concerns

- ~~JIS 履歴書 exact cell dimensions (mm) need a reference template~~ — RESOLVED: Complete MHLW-format template created in 01-02
- Dify Cloud free tier limited to 200 message credits — Professional tier ($59/mo) needed for real usage
- ~~WeasyPrint CSS limitations (no flexbox/grid)~~ — RESOLVED: CSS tables approach validated through WeasyPrint rendering in 01-03, both PDFs human-verified
- ~~WeasyPrint rendering validation~~ — RESOLVED: Both 履歴書 and 職務経歴書 PDFs render correctly with embedded CJK fonts (01-03)

## Session Continuity

Last session: 2026-02-19
Stopped at: Completed quick task 006 — Fix PDF generation date year/month in rirekisho
Resume file: N/A — project fully implemented
