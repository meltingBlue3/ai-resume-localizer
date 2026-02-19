---
phase: quick-003
plan: 01
subsystem: ui
tags: [wizard, steps, i18n, react]

requires:
  - phase: 05-polish-production-readiness
    provides: "Complete 5-step wizard with DownloadStep"
provides:
  - "Simplified 4-step wizard without redundant DownloadStep"
  - "PreviewStep as final step with integrated download"
affects: []

tech-stack:
  added: []
  patterns: []

key-files:
  created: []
  modified:
    - frontend/src/stores/useWizardStore.ts
    - frontend/src/components/wizard/WizardShell.tsx
    - frontend/src/components/wizard/StepIndicator.tsx
    - frontend/src/i18n/locales/zh/wizard.json
    - frontend/src/i18n/locales/ja/wizard.json

key-decisions:
  - "No changes needed to StepNavigation.tsx -- it uses totalSteps dynamically"
  - "No changes needed to PreviewStep.tsx -- setStep(2) still correct for ReviewTranslation"

patterns-established: []

duration: ~1min
completed: 2026-02-19
---

# Quick Task 003: Remove DownloadStep Summary

**Simplified wizard from 5 to 4 steps by removing redundant DownloadStep -- PreviewStep already has full download toolbar**

## Performance

- **Duration:** ~1 min
- **Started:** 2026-02-19T15:02:51Z
- **Completed:** 2026-02-19T15:03:55Z
- **Tasks:** 2
- **Files modified:** 5 modified, 1 deleted

## Accomplishments
- Reduced wizard from 5 steps to 4 (Upload -> ReviewExtraction -> ReviewTranslation -> Preview)
- PreviewStep is now the final step, showing finish button automatically
- Updated zh and ja i18n labels to reflect preview step now includes download capability
- Deleted DownloadStep.tsx component (163 lines removed)

## Task Commits

Each task was committed atomically:

1. **Task 1: Remove DownloadStep from wizard flow and update step count** - `2d7dc1f` (feat)
2. **Task 2: Update i18n labels and delete DownloadStep file** - `5a5a1eb` (feat)

## Files Created/Modified
- `frontend/src/stores/useWizardStore.ts` - totalSteps changed from 5 to 4
- `frontend/src/components/wizard/WizardShell.tsx` - Removed DownloadStep import and array entry
- `frontend/src/components/wizard/StepIndicator.tsx` - Removed 'download' from stepKeys array
- `frontend/src/i18n/locales/zh/wizard.json` - Updated preview title/description, removed download section
- `frontend/src/i18n/locales/ja/wizard.json` - Updated preview title/description, removed download section
- `frontend/src/steps/DownloadStep.tsx` - DELETED

## Decisions Made
- No changes needed to StepNavigation.tsx -- it already uses `currentStep === totalSteps - 1` dynamically
- No changes needed to PreviewStep.tsx -- `setStep(2)` still correctly refers to ReviewTranslationStep at index 2

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

---
*Quick Task: 003-remove-download-step*
*Completed: 2026-02-19*
