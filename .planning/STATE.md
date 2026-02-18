# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-18)

**Core value:** 用户上传一份中文简历，经过结构化提取、日文翻译、人工审核修正后，得到两份符合日本企业招聘标准的PDF简历（履歴書 + 職務経歴書）
**Current focus:** Phase 1 — Foundation & Risk Mitigation

## Current Position

Phase: 1 of 5 (Foundation & Risk Mitigation) — COMPLETE
Plan: 3 of 3 in current phase (all complete)
Status: Phase 1 Complete — Ready for Phase 2
Last activity: 2026-02-18 — Completed 01-03 (職務経歴書 Template & PDF Generation Service)

Progress: [██░░░░░░░░] 20%

## Performance Metrics

**Velocity:**
- Total plans completed: 3
- Average duration: ~9min
- Total execution time: ~0.45 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation | 3 | ~27min | ~9min |

**Recent Trend:**
- Last 5 plans: 01-01 (~8min), 01-02 (~6min), 01-03 (~13min)
- Trend: Steady (01-03 longer due to MSYS2 library installation + human checkpoint)

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

### Pending Todos

None yet.

### Blockers/Concerns

- ~~JIS 履歴書 exact cell dimensions (mm) need a reference template~~ — RESOLVED: Complete MHLW-format template created in 01-02
- Dify Cloud free tier limited to 200 message credits — Professional tier ($59/mo) needed for real usage
- ~~WeasyPrint CSS limitations (no flexbox/grid)~~ — RESOLVED: CSS tables approach validated through WeasyPrint rendering in 01-03, both PDFs human-verified
- ~~WeasyPrint rendering validation~~ — RESOLVED: Both 履歴書 and 職務経歴書 PDFs render correctly with embedded CJK fonts (01-03)

## Session Continuity

Last session: 2026-02-18
Stopped at: Completed 01-03-PLAN.md (職務経歴書 Template & PDF Generation Service) — Phase 1 COMPLETE
Resume file: .planning/phases/01-foundation-risk-mitigation/01-03-SUMMARY.md
