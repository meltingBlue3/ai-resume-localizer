---
phase: 02-upload-extraction
plan: 02
subsystem: frontend
tags: [react, zustand, react-dropzone, i18n, typescript]

requires:
  - phase: 02-upload-extraction
    plan: 01
    provides: "TypeScript resume interfaces, backend upload endpoint, CnResumeData contract"
provides:
  - "useResumeStore Zustand store with typed resume/upload/extraction state"
  - "uploadAndExtract API client with FormData POST and error handling"
  - "FileDropzone drag-and-drop component for PDF/DOCX upload"
  - "PhotoDropzone component with image preview thumbnail"
  - "Functional UploadStep with extraction trigger, loading/error states, and auto-advance"
affects: [02-upload-extraction, 03-translation, 04-review-generation]

tech-stack:
  added: [react-dropzone@14]
  patterns: [Zustand store without persist for File objects, URL.createObjectURL with revoke cleanup, FormData POST via fetch API]

key-files:
  created:
    - frontend/src/stores/useResumeStore.ts
    - frontend/src/api/client.ts
    - frontend/src/components/upload/FileDropzone.tsx
    - frontend/src/components/upload/PhotoDropzone.tsx
  modified:
    - frontend/src/steps/UploadStep.tsx
    - frontend/src/i18n/locales/zh/wizard.json
    - frontend/src/i18n/locales/ja/wizard.json
    - frontend/package.json

key-decisions:
  - "react-dropzone v14 (not v15) to avoid breaking isDragReject change per research"
  - "No persist middleware on useResumeStore — File objects are not serializable"
  - "API client uses native fetch with FormData — no axios needed"
  - "Two-column layout on lg (FileDropzone larger, PhotoDropzone smaller) stacked on mobile"

patterns-established:
  - "Zustand store pattern: initialState const + spread reset for clean state management"
  - "API client pattern: typed fetch wrapper with error detail extraction"
  - "Dropzone pattern: useDropzone with typed accept map, maxFiles, maxSize"
  - "Component-level URL.createObjectURL with useEffect cleanup"

duration: 3min
completed: 2026-02-18
---

# Phase 2 Plan 2: Frontend Upload UI & Store Summary

**Zustand resume store, fetch API client, react-dropzone v14 FileDropzone + PhotoDropzone, and fully functional UploadStep replacing Phase 1 placeholder**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-18T10:38:55Z
- **Completed:** 2026-02-18T10:41:30Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- useResumeStore with typed state for resume file, photo file, raw text, CnResumeData, extraction loading, and error — plus clean reset action
- uploadAndExtract API client that POSTs FormData to /api/upload-and-extract with typed response and error detail parsing
- FileDropzone component: drag-and-drop PDF/DOCX with 10MB limit, file validation, rejection messages, accepted-file display with name/size
- PhotoDropzone component: image upload with 5MB limit, live thumbnail preview via URL.createObjectURL with proper revoke cleanup
- UploadStep fully rewritten: step header, responsive two-column dropzone layout, extract button with disabled/loading/error states, auto-advance on success
- 14 new i18n keys added in both Chinese and Japanese for all upload UI text

## Task Commits

Each task was committed atomically:

1. **Task 1: Create typed Zustand store & API client** - `205b6b3` (feat)
2. **Task 2: Create dropzone components & replace UploadStep** - `d06f8ea` (feat)

## Files Created/Modified
- `frontend/src/stores/useResumeStore.ts` - Zustand store with resume data, file, extraction, and loading state
- `frontend/src/api/client.ts` - Typed API client with uploadAndExtract function
- `frontend/src/components/upload/FileDropzone.tsx` - Drag-and-drop PDF/DOCX upload with validation
- `frontend/src/components/upload/PhotoDropzone.tsx` - Photo upload with image preview thumbnail
- `frontend/src/steps/UploadStep.tsx` - Full rewrite: dropzones, extract button, loading spinner, error banner
- `frontend/src/i18n/locales/zh/wizard.json` - Added 14 upload step i18n keys (Chinese)
- `frontend/src/i18n/locales/ja/wizard.json` - Added 14 upload step i18n keys (Japanese)
- `frontend/package.json` - Added react-dropzone@14 dependency

## Decisions Made
- Used react-dropzone v14 (not v15) per research findings about breaking isDragReject API change
- No persist middleware on useResumeStore since File objects are not serializable (localStorage would fail)
- Native fetch API with FormData for file upload — no extra HTTP library needed
- Two-column responsive layout: FileDropzone takes majority width, PhotoDropzone in narrow 48px-wide column

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- None. All TypeScript compilation passed on first build for both tasks.

## Next Phase Readiness
- useResumeStore provides cnResumeData for the Review Extraction step (02-03)
- API client ready for real backend calls once Dify API key configured
- Upload UI fully functional and bilingual
- Store's setCnResumeData action ready for review step field editing

---
*Phase: 02-upload-extraction*
*Completed: 2026-02-18*
