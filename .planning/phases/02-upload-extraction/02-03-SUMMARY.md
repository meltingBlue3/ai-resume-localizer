---
phase: 02-upload-extraction
plan: 03
subsystem: frontend
tags: [react, react-pdf, docx-preview, i18n, typescript]

requires:
  - phase: 02-upload-extraction
    plan: 02
    provides: "useResumeStore with resumeFile/cnResumeData, UploadStep with extraction trigger"
provides:
  - "DocumentViewer component rendering PDF (react-pdf) and DOCX (docx-preview)"
  - "ResumeFieldEditor editable form for all CnResumeData fields with array add/remove"
  - "ReviewExtractionStep side-by-side layout with independent scrolling panels"
  - "Bilingual i18n keys for all review field labels and section headers"
affects: [03-translation, 04-review-generation]

tech-stack:
  added: [react-pdf@10, docx-preview]
  patterns: [react-pdf Document+Page multi-page rendering, docx-preview renderAsync with cleanup, useState+useEffect for blob URL lifecycle]

key-files:
  created:
    - frontend/src/components/review/DocumentViewer.tsx
    - frontend/src/components/review/ResumeFieldEditor.tsx
  modified:
    - frontend/src/steps/ReviewExtractionStep.tsx
    - frontend/src/main.tsx
    - frontend/src/i18n/locales/zh/wizard.json
    - frontend/src/i18n/locales/ja/wizard.json
    - frontend/package.json
    - backend/app/services/pdf_generator.py

key-decisions:
  - "useState+useEffect for blob URLs instead of useMemo — avoids StrictMode URL revocation bug"
  - "react-pdf worker configured via new URL() + import.meta.url pattern for Vite compatibility"
  - "FONTCONFIG_FILE env var set before WeasyPrint import to resolve MSYS2 fontconfig on Windows"
  - "ResumeFieldEditor uses collapsible sections with immutable array update helpers"

patterns-established:
  - "Blob URL lifecycle: useState+useEffect create/revoke pattern (not useMemo) for StrictMode safety"
  - "Document viewer pattern: conditional PDF/DOCX rendering based on file.type"
  - "Form editor pattern: collapsible sections with add/remove for array fields"

duration: 8min
completed: 2026-02-18
---

# Phase 2 Plan 3: Review UI — DocumentViewer, ResumeFieldEditor & Side-by-Side Layout

**Side-by-side review with react-pdf/docx-preview document viewer (left) and editable CnResumeData form (right), human-verified end-to-end upload→extract→review flow**

## Performance

- **Duration:** 8 min
- **Started:** 2026-02-18T10:42:00Z
- **Completed:** 2026-02-18T10:50:00Z
- **Tasks:** 3 (2 auto + 1 human checkpoint)
- **Files modified:** 9

## Accomplishments
- DocumentViewer renders multi-page PDFs via react-pdf and DOCX files via docx-preview with proper cleanup
- ResumeFieldEditor displays all CnResumeData fields in collapsible sections with add/remove for array entries
- ReviewExtractionStep provides dual-panel layout with independent scrolling for cross-referencing
- No-data guard redirects users to upload step when accessing review without extraction data
- Human-verified: full upload → Dify extraction → side-by-side review → field editing flow works end-to-end
- Fixed StrictMode blob URL revocation bug in PdfViewer
- Fixed Windows fontconfig error by setting FONTCONFIG_FILE env var for MSYS2

## Task Commits

Each task was committed atomically:

1. **Task 1: Install viewer libraries & create DocumentViewer and ResumeFieldEditor** - `6b6e1eb` (feat)
2. **Task 2: Replace ReviewExtractionStep with side-by-side layout** - `cbea397` (feat)
3. **Task 3: Human verification** - approved (no commit needed)

**Bug fixes during verification:**
- `a99c89c` - fix: resolve PDF blob URL revocation in StrictMode
- `64a0ebb` - fix: set FONTCONFIG_FILE for MSYS2 fontconfig on Windows

## Files Created/Modified
- `frontend/src/components/review/DocumentViewer.tsx` - PDF (react-pdf) and DOCX (docx-preview) viewer with blob URL lifecycle management
- `frontend/src/components/review/ResumeFieldEditor.tsx` - Editable form for all CnResumeData fields with collapsible sections
- `frontend/src/steps/ReviewExtractionStep.tsx` - Side-by-side layout replacing placeholder, with no-data guard
- `frontend/src/main.tsx` - react-pdf worker configuration and CSS imports
- `frontend/src/i18n/locales/zh/wizard.json` - Added review section headers and field labels (Chinese)
- `frontend/src/i18n/locales/ja/wizard.json` - Added review section headers and field labels (Japanese)
- `frontend/package.json` - Added react-pdf@10 and docx-preview dependencies
- `backend/app/services/pdf_generator.py` - Added FONTCONFIG_FILE env var for MSYS2 fontconfig

## Decisions Made
- Used `useState` + `useEffect` instead of `useMemo` for blob URLs to avoid React StrictMode double-mount URL revocation
- Configured react-pdf worker via `new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url)` for Vite 7 compatibility
- Set `FONTCONFIG_FILE` environment variable pointing to MSYS2 ucrt64 fonts.conf before WeasyPrint import
- ResumeFieldEditor organized into collapsible sections matching CnResumeData structure

## Deviations from Plan

### Auto-fixed Issues

**1. PDF blob URL revocation in StrictMode**
- **Found during:** Human verification (Task 3)
- **Issue:** `useMemo` created blob URL once, StrictMode unmount revoked it, re-mount reused revoked URL
- **Fix:** Replaced `useMemo` with `useState` + `useEffect` for fresh URL on each mount
- **Files modified:** `frontend/src/components/review/DocumentViewer.tsx`
- **Verification:** PDF renders correctly after page reload
- **Committed in:** `a99c89c`

**2. Windows fontconfig configuration missing**
- **Found during:** Human verification (Task 3)
- **Issue:** Fontconfig error at backend startup: "Cannot load default config file: No such file: (null)"
- **Fix:** Set `FONTCONFIG_FILE` env var to MSYS2 `fonts.conf` path before WeasyPrint import
- **Files modified:** `backend/app/services/pdf_generator.py`
- **Verification:** Backend starts without fontconfig error after full restart
- **Committed in:** `64a0ebb`

---

**Total deviations:** 2 auto-fixed (2 blocking runtime bugs)
**Impact on plan:** Both fixes necessary for correct rendering. No scope creep.

## Issues Encountered
- React StrictMode double-mount pattern breaks `useMemo` blob URLs — resolved by switching to `useState`+`useEffect`
- MSYS2 fontconfig on Windows needs explicit `FONTCONFIG_FILE` env var — resolved by adding to DLL setup block

## User Setup Required

None - no additional external service configuration required beyond 02-01 Dify setup.

## Next Phase Readiness
- Full upload → extract → review pipeline functional end-to-end
- Review step field edits persist in Zustand store for translation step consumption
- DocumentViewer pattern reusable for Phase 4 preview
- Ready for Phase 3: Translation & Data Processing

---
*Phase: 02-upload-extraction*
*Completed: 2026-02-18*
