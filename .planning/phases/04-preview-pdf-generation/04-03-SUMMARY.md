---
phase: 04-preview-pdf-generation
plan: 03
subsystem: ui
tags: [react, iframe-srcdoc, resize-observer, debounce, photo-crop, pdf-download, i18n]

# Dependency graph
requires:
  - phase: 04-01
    provides: "Jinja2 template rendering, /preview and /download API endpoints"
  - phase: 04-02
    provides: "PhotoCropper, previewDocument/downloadPdf API functions, Zustand store with preview state"
provides:
  - "PreviewPanel iframe srcdoc viewer with A4 scaling via ResizeObserver"
  - "PreviewToolbar with tab switcher, download buttons, photo upload trigger"
  - "PreviewStep two-panel layout with inline editing and live preview"
  - "DownloadStep with download cards for both document types"
  - "Complete i18n keys for preview and download in zh and ja"
affects: [05-polish]

# Tech tracking
tech-stack:
  added: []
  patterns: [iframe-srcdoc-preview, resize-observer-scaling, debounced-preview-fetch]

key-files:
  created:
    - frontend/src/components/preview/PreviewPanel.tsx
    - frontend/src/components/preview/PreviewToolbar.tsx
  modified:
    - frontend/src/steps/PreviewStep.tsx
    - frontend/src/steps/DownloadStep.tsx
    - frontend/src/i18n/locales/zh/wizard.json
    - frontend/src/i18n/locales/ja/wizard.json

key-decisions:
  - "PreviewPanel uses CSS transform scale with ResizeObserver for responsive A4 preview"
  - "500ms debounce on preview fetching to avoid excessive API calls during editing"
  - "Immediate fetch on initial mount (no debounce for first render)"

patterns-established:
  - "iframe srcdoc with pointer-events:none for non-interactive document preview"
  - "Two-panel layout: editor (w-2/5) + preview (w-3/5) with independent scrolling"

# Metrics
duration: PENDING
completed: PENDING
---

# Phase 4 Plan 03: Preview Step UI and Download Step Summary

**PARTIAL -- Task 1 complete, Task 2 (human verification) pending**

**Two-panel preview UI with iframe srcdoc A4 viewer, tab-based document switching, debounced live preview, photo crop integration, and PDF download flow**

## Performance

- **Duration:** PENDING (awaiting human verification)
- **Started:** 2026-02-19
- **Completed:** PENDING
- **Tasks:** 1/2 complete (Task 2 = human-verify checkpoint)
- **Files modified:** 6

## Accomplishments
- PreviewPanel with iframe srcdoc viewer, A4 aspect ratio scaling via ResizeObserver + CSS transform
- PreviewToolbar with tab switcher (rirekisho/shokumukeirekisho), download buttons, photo upload trigger with green dot indicator
- PreviewStep replaced placeholder with full two-panel layout: JpResumeFieldEditor (left w-2/5) + PreviewPanel (right w-3/5)
- Debounced preview fetching (500ms) with immediate first fetch on mount
- Photo upload flow: hidden file input -> object URL -> PhotoCropper modal -> base64 -> store
- Download flow: blob URL -> programmatic anchor click with Japanese filenames
- DownloadStep with download cards for both document types, loading/error states
- i18n keys added for preview section (tabs, upload, download, rendering, errors, photo cropper) and download step in both zh and ja

## Task Commits

1. **Task 1: Create PreviewPanel, PreviewToolbar, replace PreviewStep and DownloadStep, add i18n** - `2814109` (feat)
2. **Task 2: Human verification of complete preview and PDF flow** - PENDING (checkpoint:human-verify)

## Files Created/Modified
- `frontend/src/components/preview/PreviewPanel.tsx` - iframe srcdoc viewer with A4 scaling via ResizeObserver + CSS transform
- `frontend/src/components/preview/PreviewToolbar.tsx` - Tab switcher, download buttons, photo upload trigger
- `frontend/src/steps/PreviewStep.tsx` - Two-panel layout with JpResumeFieldEditor + PreviewPanel, debounced preview, photo crop, download
- `frontend/src/steps/DownloadStep.tsx` - Download cards for rirekisho and shokumukeirekisho with loading/error states
- `frontend/src/i18n/locales/zh/wizard.json` - Added preview and download step i18n keys (Chinese)
- `frontend/src/i18n/locales/ja/wizard.json` - Added preview and download step i18n keys (Japanese)

## Decisions Made
- PreviewPanel uses CSS transform scale (not zoom) with ResizeObserver for accurate A4 aspect ratio at any container width
- 500ms debounce prevents excessive API calls during rapid field editing; first mount fetches immediately
- Download uses programmatic anchor click with `download` attribute for Japanese filenames (履歴書.pdf / 職務経歴書.pdf)
- PreviewPanel shows i18n "rendering" text for both loading and empty states

## Deviations from Plan

None - plan executed exactly as written. All 6 files were already partially implemented from prior plan work; this plan added i18n keys and updated PreviewPanel to use i18n instead of hardcoded strings.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- BLOCKED: Awaiting human verification (Task 2 checkpoint)
- All UI components built and TypeScript-clean
- Preview, editing, photo crop, and download flows ready for end-to-end testing

---
*Phase: 04-preview-pdf-generation*
*Status: CHECKPOINT -- awaiting human verification*
