---
phase: 06-tech-debt-cleanup
plan: 01
subsystem: ui
tags: [react, zustand, i18n, dead-code-removal]

# Dependency graph
requires: []
provides:
  - "Clean resume store without dead photoFile state"
  - "Correct wizard navigation (no non-functional finish button)"
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns: []

key-files:
  created: []
  modified:
    - frontend/src/stores/useResumeStore.ts
    - frontend/src/components/wizard/StepNavigation.tsx
    - frontend/src/i18n/locales/zh/wizard.json
    - frontend/src/i18n/locales/ja/wizard.json

key-decisions:
  - "Hide forward button entirely on last step rather than disabling it -- no meaningful next destination exists"

patterns-established: []

requirements-completed: [TECH-01, TECH-02]

# Metrics
duration: 1min
completed: 2026-02-20
---

# Phase 6 Plan 1: Dead Code & UI Cleanup Summary

**Removed dead PhotoDropzone component and photoFile store field; hid non-functional finish button on preview step**

## Performance

- **Duration:** 1 min
- **Started:** 2026-02-20T05:46:49Z
- **Completed:** 2026-02-20T05:48:12Z
- **Tasks:** 2
- **Files modified:** 5 (1 deleted, 4 edited)

## Accomplishments
- Deleted PhotoDropzone.tsx (88 lines of dead code superseded by PhotoCropper in PreviewStep)
- Removed photoFile/setPhotoFile from Zustand resume store
- Removed 3 orphaned i18n keys from both zh and ja locale files
- Fixed preview step to no longer render a non-functional finish button

## Task Commits

Each task was committed atomically:

1. **Task 1: Remove dead PhotoDropzone code and photoFile store field** - `e434ab9` (chore)
2. **Task 2: Fix non-functional finish button on preview step** - `e69b655` (fix)

## Files Created/Modified
- `frontend/src/components/upload/PhotoDropzone.tsx` - Deleted (dead code)
- `frontend/src/stores/useResumeStore.ts` - Removed photoFile and setPhotoFile
- `frontend/src/i18n/locales/zh/wizard.json` - Removed photoLabel, photoDropzone, photoFormats keys
- `frontend/src/i18n/locales/ja/wizard.json` - Removed photoLabel, photoDropzone, photoFormats keys
- `frontend/src/components/wizard/StepNavigation.tsx` - Conditionally render forward button only on non-last steps

## Decisions Made
- Hide forward button entirely on last step rather than disabling it -- the preview step has no meaningful "next" destination and users interact with PreviewToolbar download buttons instead

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Codebase is cleaner with no dead photo upload code
- Ready for remaining tech debt plans in phase 6

## Self-Check: PASSED

All files verified, all commits confirmed.

---
*Phase: 06-tech-debt-cleanup*
*Completed: 2026-02-20*
