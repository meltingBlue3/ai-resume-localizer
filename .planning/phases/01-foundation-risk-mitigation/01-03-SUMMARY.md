---
phase: 01-foundation-risk-mitigation
plan: 03
subsystem: pdf-generation, templates
tags: [weasyprint, noto-sans-jp, shokumukeirekisho, pdf-generator, font-configuration, msys2, pango]

requires:
  - phase: 01-02
    provides: "FastAPI backend, base.css, rirekisho.html, bundled Noto Sans JP fonts"
provides:
  - Complete 職務経歴書 HTML template with all standard sections
  - Reusable WeasyPrint PDF generation service with embedded CJK fonts
  - Pytest validation for both resume templates (rirekisho + shokumukeirekisho)
  - Test API endpoint GET /api/test-pdf/{template_name} for browser preview
  - Human-verified PDF output — CJK rendering confirmed correct, no tofu glyphs
affects: [02-pdf-generation, 03-data-processing, 04-template-rendering]

tech-stack:
  added: [pytest 9.0.2, pypdf 6.7.1, msys2-ucrt64-pango]
  patterns: [os-add-dll-directory-for-windows, font-config-dual-pass, url-based-font-face, generate-pdf-from-template]

key-files:
  created:
    - backend/app/templates/shokumukeirekisho.html
    - backend/app/services/__init__.py
    - backend/app/services/pdf_generator.py
    - backend/tests/__init__.py
    - backend/tests/test_pdf_generation.py
    - backend/conftest.py
  modified:
    - backend/app/main.py
    - backend/requirements.txt
    - .gitignore

key-decisions:
  - "MSYS2 ucrt64 Pango/Cairo/GLib required for WeasyPrint on Windows — os.add_dll_directory() needed in Python 3.8+"
  - "pypdf used for reliable PDF page counting (WeasyPrint compressed object streams hide /Type /Page markers)"
  - "FontConfiguration passed to both CSS() and write_pdf() — omitting either causes tofu glyphs"
  - "Font paths use url('file:///...') with forward slashes via Path.as_posix() for cross-platform compatibility"

patterns-established:
  - "PDF generation: FontConfiguration instance shared across CSS() and write_pdf() calls"
  - "Windows DLL loading: os.add_dll_directory(MSYS2_UCRT64_BIN) before WeasyPrint import"
  - "Font URL strategy: Path.resolve().as_posix() for file:// URLs on all platforms"
  - "Test output: generated PDFs written to tests/output/ (gitignored) for manual inspection"

duration: 13min
completed: 2026-02-18
---

# Phase 1 Plan 03: 職務経歴書 Template & PDF Generation Service Summary

**WeasyPrint PDF generation service rendering both 履歴書 and 職務経歴書 templates to A4 PDFs with embedded Noto Sans JP CJK fonts, validated by 3 pytest tests and human visual inspection**

## Performance

- **Duration:** 13 min
- **Started:** 2026-02-18T17:43:32Z
- **Completed:** 2026-02-18T17:56:13Z
- **Tasks:** 3 (2 auto + 1 human-verify checkpoint)
- **Files modified:** 9

## Accomplishments
- Complete 職務経歴書 HTML template (392 lines) with career summary, work history, skills, certifications, and self-PR
- Reusable PDF generator service producing 71KB (履歴書) and 87KB (職務経歴書) PDFs with embedded CJK fonts
- All 3 pytest tests pass: both template PDFs valid (>10KB, %PDF- header), rirekisho has 3 pages
- Human-verified: CJK characters (漢字, ひらがな, カタカナ) render correctly, grid borders intact, Noto Sans JP font clean
- Test API endpoint serves PDFs at /api/test-pdf/rirekisho and /api/test-pdf/shokumukeirekisho

## Task Commits

Each task was committed atomically:

1. **Task 1: Build static 職務経歴書 HTML template** - `9fa5e76` (feat)
2. **Task 2: WeasyPrint PDF service, tests, API endpoint** - `dbd6409` (feat)
3. **Task 3: Human verification of PDF output** - approved (no code commit)

## Files Created/Modified
- `backend/app/templates/shokumukeirekisho.html` - Complete 職務経歴書 template with all standard sections
- `backend/app/services/__init__.py` - Services package marker
- `backend/app/services/pdf_generator.py` - WeasyPrint PDF generation with FontConfiguration and bundled fonts
- `backend/tests/__init__.py` - Tests package marker
- `backend/tests/test_pdf_generation.py` - 3 validation tests for both templates
- `backend/conftest.py` - MSYS2 DLL directory setup for Windows
- `backend/app/main.py` - Added GET /api/test-pdf/{template_name} endpoint
- `backend/requirements.txt` - Added pytest and pypdf
- `.gitignore` - Added tests/output/ and .pytest_cache/

## Decisions Made
- Installed MSYS2 ucrt64 Pango/Cairo/GLib packages for WeasyPrint native dependencies on Windows
- Used os.add_dll_directory() (Python 3.8+ requirement) instead of PATH manipulation for DLL loading
- Used pypdf for reliable PDF page counting since WeasyPrint produces compressed object streams
- FontConfiguration passed to both CSS() constructor and html.write_pdf() — the critical dual-pass pattern that prevents tofu glyphs

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] MSYS2 GTK/Pango libraries required for WeasyPrint on Windows**
- **Found during:** Task 2 (test execution)
- **Issue:** WeasyPrint could not load libgobject-2.0-0.dll — only copy was incomplete Tesseract-OCR bundle. Python 3.8+ requires os.add_dll_directory() for native DLL resolution.
- **Fix:** Installed mingw-w64-ucrt-x86_64-pango and mingw-w64-ucrt-x86_64-glib2 via MSYS2 pacman. Added os.add_dll_directory(r"C:\msys64\ucrt64\bin") to pdf_generator.py and conftest.py.
- **Files modified:** backend/app/services/pdf_generator.py, backend/conftest.py
- **Verification:** WeasyPrint imports and generates PDFs successfully
- **Committed in:** dbd6409 (Task 2 commit)

**2. [Rule 1 - Bug] PDF page count detection used unreliable byte pattern**
- **Found during:** Task 2 (test execution)
- **Issue:** Test used pdf_bytes.count(b"/Type /Page") which returns 0 for compressed object streams produced by WeasyPrint.
- **Fix:** Installed pypdf library, used PdfReader for reliable page counting.
- **Files modified:** backend/tests/test_pdf_generation.py, backend/requirements.txt
- **Verification:** Page count test correctly reports 3 pages for rirekisho PDF
- **Committed in:** dbd6409 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug)
**Impact on plan:** Both fixes necessary for Windows compatibility and test correctness. No scope creep.

## Issues Encountered
- WeasyPrint warns about unknown `ruby-align: center` CSS property — harmless, ruby rendering falls back gracefully
- WeasyPrint warns about relative URI for `<link href="base.css">` when using HTML(string=...) — resolved by passing base.css via stylesheets parameter
- fontTools deprecation warning for instantiateVariableFont — cosmetic, does not affect PDF output

## User Setup Required
MSYS2 with ucrt64 Pango packages must be installed for WeasyPrint to function on Windows:
```
C:\msys64\usr\bin\pacman.exe -S --noconfirm mingw-w64-ucrt-x86_64-pango mingw-w64-ucrt-x86_64-glib2
```

## Next Phase Readiness
- **Highest technical risk retired:** Both JIS resume templates render correctly through WeasyPrint with embedded CJK fonts
- PDF generator service is reusable — `generate_pdf(html_content)` and `generate_pdf_from_template(name)` ready for Phase 4 dynamic rendering
- All Phase 1 plans complete — frontend wizard shell, backend scaffold, and PDF generation validated
- Ready for Phase 2 (Dify integration, file upload, API layer)

## Self-Check: PASSED

- All 9 files verified present on disk
- Commit `9fa5e76` (Task 1) verified in git log
- Commit `dbd6409` (Task 2) verified in git log
- Human verification: approved

---
*Phase: 01-foundation-risk-mitigation*
*Completed: 2026-02-18*
