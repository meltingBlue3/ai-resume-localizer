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
affects: [05-polish-production-readiness]

# Tech tracking
tech-stack:
  added: []
  patterns: [iframe-srcdoc-preview, resize-observer-scaling, debounced-preview-fetch, programmatic-pdf-download]

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
  - "Programmatic anchor click with blob URL for PDF download with Japanese filenames"

patterns-established:
  - "iframe srcdoc with pointer-events:none for non-interactive document preview"
  - "Two-panel layout: editor (w-2/5) + preview (w-3/5) with independent scrolling"
  - "Preview pipeline: store data change -> debounce 500ms -> previewDocument API -> iframe srcdoc update"

# Metrics
duration: ~5min
completed: 2026-02-19
---

# Phase 4 Plan 03: Preview Step UI and Download Step Summary

**Two-panel preview UI with iframe srcdoc A4 viewer, tab-based document switching, debounced live editing, photo crop integration, and PDF download -- all 8 test cases human-verified**

## Performance

- **Duration:** ~5 min (Task 1 auto) + human verification
- **Started:** 2026-02-19
- **Completed:** 2026-02-19
- **Tasks:** 2/2 complete (1 auto + 1 human-verify)
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
- Human verified all 8 end-to-end test cases passing

## Task Commits

1. **Task 1: Create PreviewPanel, PreviewToolbar, replace PreviewStep and DownloadStep, add i18n** - `2814109` (feat)
2. **Task 2: Human verification of complete preview and PDF flow** - verified (checkpoint:human-verify, no code commit)

## Human Verification Results

All 8 test cases passed:

| # | Test Case | Result |
|---|-----------|--------|
| 1 | Preview with data -- actual translated data visible in JIS table format | PASS |
| 2 | Tab switching -- rirekisho/shokumukeirekisho toggle works | PASS |
| 3 | Null-field handling -- missing fields show "未記入" | PASS |
| 4 | Inline editing with debounce -- field changes reflected in preview after ~500ms | PASS |
| 5 | Photo upload + crop modal + preview embed -- 3:4 crop, photo in rirekisho | PASS |
| 6 | PDF download with CJK fonts -- valid PDF, no tofu glyphs | PASS |
| 7 | Download step with both document cards -- dual download working | PASS |
| 8 | No-photo placeholder text -- "写真を貼る位置" shown when no photo | PASS |

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

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Phase 4 fully complete: all 3 plans delivered and human-verified
- Full pipeline functional end-to-end: upload -> extract -> translate -> preview -> download
- Ready for Phase 5 (Polish & Production Readiness): loading states, error handling, completeness indicator

## Self-Check: PASSED

- All 6 key files verified present on disk (PreviewPanel.tsx, PreviewToolbar.tsx, PreviewStep.tsx, DownloadStep.tsx, zh/wizard.json, ja/wizard.json)
- Commit `2814109` verified in git log
- Human verification: all 8 test cases confirmed passing

---
*Phase: 04-preview-pdf-generation*
*Completed: 2026-02-19*
