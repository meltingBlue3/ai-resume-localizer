---
phase: 04-preview-pdf-generation
plan: 02
subsystem: ui
tags: [react-easy-crop, canvas, zustand, fetch-api, photo-crop, base64]

# Dependency graph
requires:
  - phase: 04-01
    provides: "Jinja2 template rendering, /preview and /download API endpoints"
provides:
  - "getCroppedImg utility for 354x472px JPEG passport photo crop"
  - "blobToBase64 utility for raw base64 conversion"
  - "PhotoCropper modal component with react-easy-crop"
  - "previewDocument() and downloadPdf() API client functions"
  - "Extended Zustand store with preview/photo state fields"
affects: [04-03-preview-step-ui]

# Tech tracking
tech-stack:
  added: [react-easy-crop]
  patterns: [canvas-crop-to-blob, blob-to-base64, api-client-blob-response]

key-files:
  created:
    - frontend/src/utils/cropImage.ts
    - frontend/src/components/preview/PhotoCropper.tsx
  modified:
    - frontend/src/api/client.ts
    - frontend/src/stores/useResumeStore.ts
    - frontend/package.json

key-decisions:
  - "Raw base64 (no data URI prefix) sent to backend -- backend adds prefix in Jinja2 templates"
  - "354x472px target dimensions (30mm x 40mm at 300 DPI) for Japanese passport photo standard"
  - "JPEG quality 0.85 balances file size and photo clarity"

patterns-established:
  - "Canvas crop-to-blob: draw source region onto fixed-size canvas, toBlob with JPEG quality"
  - "Modal overlay pattern: fixed inset-0 z-50 with bg-black/50 backdrop"

# Metrics
duration: 4min
completed: 2026-02-18
---

# Phase 4 Plan 2: Frontend Data Layer & Photo Cropping Summary

**react-easy-crop PhotoCropper modal with canvas-based 354x472px JPEG crop, previewDocument/downloadPdf API functions, and Zustand store extended with preview state**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-18T14:14:50Z
- **Completed:** 2026-02-18T14:19:01Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Installed react-easy-crop and created PhotoCropper modal with 3:4 aspect ratio, zoom slider, confirm/cancel
- Created getCroppedImg (canvas crop to 354x472 JPEG blob) and blobToBase64 (raw base64 without data URI prefix)
- Extended API client with previewDocument() returning HTML string and downloadPdf() returning Blob
- Extended Zustand store with croppedPhotoBase64, previewHtml, activeDocTab, isPreviewLoading, isDownloading -- all cleared on resetUpload

## Task Commits

Each task was committed atomically:

1. **Task 1: Install react-easy-crop, extend store and API client** - `0df463a` (feat)
2. **Task 2: Create cropImage utility and PhotoCropper component** - `cf783bf` (feat)

## Files Created/Modified
- `frontend/src/utils/cropImage.ts` - getCroppedImg (canvas crop) and blobToBase64 (Blob to raw base64) utilities
- `frontend/src/components/preview/PhotoCropper.tsx` - Modal with react-easy-crop Cropper, zoom slider, confirm/cancel buttons
- `frontend/src/api/client.ts` - Added previewDocument() and downloadPdf() API functions
- `frontend/src/stores/useResumeStore.ts` - Added 5 preview/photo state fields with setters
- `frontend/package.json` - Added react-easy-crop dependency
- `frontend/package-lock.json` - Lock file updated

## Decisions Made
- Raw base64 string (no data URI prefix) sent to backend -- backend adds `data:image/jpeg;base64,` in Jinja2 templates
- 354x472px target (30mm x 40mm at 300 DPI) for Japanese passport photo standard
- JPEG quality 0.85 for good balance of file size and clarity
- `crossOrigin = 'anonymous'` on Image element to avoid canvas taint when cropping

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All frontend foundation pieces ready for Plan 03 (PreviewStep UI integration)
- PhotoCropper, API client functions, and store state are importable and TypeScript-clean
- i18n translation keys referenced with fallback strings -- actual keys to be added in Plan 03

## Self-Check: PASSED

- All 5 key files verified present on disk
- Commit `0df463a` verified in git log
- Commit `cf783bf` verified in git log
- TypeScript compilation: zero errors

---
*Phase: 04-preview-pdf-generation*
*Completed: 2026-02-18*
