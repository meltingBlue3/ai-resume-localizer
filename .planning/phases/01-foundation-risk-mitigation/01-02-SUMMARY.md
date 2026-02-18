---
phase: 01-foundation-risk-mitigation
plan: 02
subsystem: api, pdf-generation
tags: [fastapi, weasyprint, noto-sans-jp, css-tables, rirekisho, mhlw]

requires:
  - phase: none
    provides: greenfield project
provides:
  - FastAPI backend with health endpoint at /api/health
  - WeasyPrint-compatible base.css with print styles (border-collapse separate, mm units)
  - Bundled Noto Sans JP font files (Regular 400 + Bold 700 weights)
  - Complete MHLW-format 履歴書 HTML template with CSS tables
  - Python dependency manifest (requirements.txt)
affects: [01-03, 02-pdf-generation, 03-data-processing]

tech-stack:
  added: [fastapi 0.115.8, uvicorn 0.34.0, weasyprint 63.1, jinja2 3.1.6, python-multipart 0.0.20, noto-sans-jp]
  patterns: [css-tables-for-print, mm-based-dimensions, border-collapse-separate, font-instancer-from-variable]

key-files:
  created:
    - backend/app/main.py
    - backend/app/config.py
    - backend/app/templates/base.css
    - backend/app/templates/rirekisho.html
    - backend/app/fonts/download_fonts.py
    - backend/requirements.txt
    - backend/.env.example
    - .gitignore
  modified: []

key-decisions:
  - "Used fontTools.varLib.instancer to create static font instances from Noto Sans JP variable font"
  - "Font files (>5MB each) excluded from git via .gitignore with download script provided"
  - "WeasyPrint 63.1 used (stable, confirmed working on Windows with pip install)"
  - "CSS tables with border-collapse: separate for all print layouts — no flexbox/grid"

patterns-established:
  - "Print CSS: border-collapse: separate; border-spacing: 0 with cell-level border removal for visual single-border grid"
  - "Font strategy: variable font → static instances via fontTools, bundled in backend/app/fonts/"
  - "Template structure: inline <style> for template-specific rules, shared base.css via <link>"

duration: 6min
completed: 2026-02-18
---

# Phase 1 Plan 02: Backend Scaffold & 履歴書 Template Summary

**FastAPI backend with WeasyPrint deps, bundled Noto Sans JP CJK fonts, and complete MHLW-format 履歴書 HTML template using CSS tables with mm-based dimensions**

## Performance

- **Duration:** 6 min
- **Started:** 2026-02-18T17:33:52Z
- **Completed:** 2026-02-18T17:40:21Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- FastAPI server running on port 8000 with /api/health returning {"status": "ok"}
- Complete 2-page MHLW-format 履歴書 HTML template (456 lines) with all standard sections
- WeasyPrint-compatible print CSS using only CSS tables, mm units, and border-collapse: separate
- Noto Sans JP Regular + Bold font files generated from variable font via fontTools instancer

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold FastAPI backend with deps, CJK fonts, and print CSS** - `50f8100` (feat)
2. **Task 2: Complete MHLW-format rirekisho HTML template** - `6ad8aac` (feat)

## Files Created/Modified
- `backend/app/main.py` - FastAPI app with CORS and /api/health endpoint
- `backend/app/config.py` - Path configuration (FONTS_DIR, TEMPLATES_DIR)
- `backend/app/templates/base.css` - Shared print styles (@page A4, CSS table rules, helper classes)
- `backend/app/templates/rirekisho.html` - Complete 2-page 履歴書 template with MHLW format
- `backend/app/fonts/download_fonts.py` - Font download/generation script
- `backend/app/fonts/NotoSansJP-Regular.ttf` - CJK font (400 weight, ~9.4MB, gitignored)
- `backend/app/fonts/NotoSansJP-Bold.ttf` - CJK font (700 weight, ~9.4MB, gitignored)
- `backend/requirements.txt` - Python dependencies with pinned versions
- `backend/.env.example` - Environment variable template
- `backend/app/__init__.py` - Package marker
- `.gitignore` - Git ignore rules for Python, Node, fonts, env files

## Decisions Made
- Used WeasyPrint 63.1 (stable release, confirmed working via pip on Windows)
- Generated static font instances from Noto Sans JP variable font using fontTools.varLib.instancer (avoids needing to find static font downloads)
- Font files (~9.4MB each) excluded from git with download script provided — keeps repo lean
- All template CSS uses only CSS tables with mm dimensions — zero flexbox/grid per WeasyPrint constraints
- Template uses inline `<style>` for template-specific rules, external `base.css` for shared print rules

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Static font download unavailable, used variable font instancer**
- **Found during:** Task 1 (font download)
- **Issue:** Google Fonts download API returned non-zip format; static .ttf files not directly available from GitHub repo (now variable-only)
- **Fix:** Downloaded variable font, used fontTools.varLib.instancer to create static 400/700 weight instances
- **Files modified:** backend/app/fonts/NotoSansJP-Regular.ttf, NotoSansJP-Bold.ttf, download_fonts.py
- **Verification:** Font files exist at correct paths with expected sizes
- **Committed in:** 50f8100 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Font files created correctly via alternative method. No scope creep.

## Issues Encountered
- PowerShell heredoc syntax not supported — used multi-message git commit format instead
- CJK characters in PowerShell scripts cause encoding issues — used grep/file-based verification instead

## User Setup Required
None - no external service configuration required. Run `python backend/app/fonts/download_fonts.py` if font files are missing.

## Next Phase Readiness
- Backend skeleton ready for PDF generation service (Plan 03)
- 履歴書 template ready for WeasyPrint rendering validation
- Font files bundled and ready for @font-face url() references
- base.css patterns established for 職務経歴書 template (Plan 04)

---
*Phase: 01-foundation-risk-mitigation*
*Completed: 2026-02-18*
