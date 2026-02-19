---
phase: 05-polish-production-readiness
plan: 01
subsystem: ui
tags: [error-handling, completeness, i18n, react, tailwind]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: "React + i18next + Tailwind setup, resume type definitions"
  - phase: 03-translation-data-processing
    provides: "JpResumeData and CnResumeData types in resume.ts"
provides:
  - "classifyError utility mapping HTTP/fetch errors to ClassifiedError with i18n keys"
  - "computeCompleteness utility counting filled fields for Jp and Cn resume data"
  - "CompletenessIndicator React component with color-coded progress bar"
  - "ErrorBanner React component with type-specific styling and retry/dismiss"
  - "Full i18n keys for progress stages, error messages, and completeness labels (zh + ja)"
affects: [05-02-integration]

# Tech tracking
tech-stack:
  added: []
  patterns: [error-classification-with-i18n-keys, duck-type-discrimination-for-resume-types]

key-files:
  created:
    - frontend/src/utils/errorClassifier.ts
    - frontend/src/utils/completeness.ts
    - frontend/src/components/ui/CompletenessIndicator.tsx
    - frontend/src/components/ui/ErrorBanner.tsx
  modified:
    - frontend/src/i18n/locales/zh/wizard.json
    - frontend/src/i18n/locales/ja/wizard.json

key-decisions:
  - "Duck-typing via 'personal_info' property to distinguish JpResumeData from CnResumeData"
  - "Error fallback uses 'errors.unknown' i18n keys rather than 'errors.server' for clarity"
  - "Completeness counts array fields as 1 binary (has entries or not) rather than counting sub-fields"

patterns-established:
  - "Error classification pattern: classifyError returns ClassifiedError with i18n key references"
  - "Completeness scoring: flat field counting with isFilled helper for null/empty/undefined checks"

# Metrics
duration: 2min
completed: 2026-02-19
---

# Phase 5 Plan 1: Utility Modules and UI Components Summary

**Error classifier, completeness calculator, and reusable UI components (progress bar + error banner) with full zh/ja i18n keys**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-19T21:20:54Z
- **Completed:** 2026-02-19T21:22:47Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Error classifier maps HTTP status codes and fetch failures to user-friendly i18n keys with retryable flag
- Completeness utility counts 15 fields each for JpResumeData and CnResumeData with null/empty handling
- CompletenessIndicator renders color-coded progress bar (green >= 80%, amber >= 50%, red otherwise)
- ErrorBanner renders type-specific colored banners (network=orange, timeout=amber, server/validation=red, config=purple) with retry/dismiss/show-details
- All new UI text has both zh and ja i18n keys: 8 progress stages, 6 error types, 4 error actions, 1 completeness label

## Task Commits

Each task was committed atomically:

1. **Task 1: Create utility modules and reusable components** - `259148f` (feat)
2. **Task 2: Add all Phase 5 i18n keys to both locale files** - `0d5e427` (feat)

## Files Created/Modified
- `frontend/src/utils/errorClassifier.ts` - classifyError function mapping errors to ClassifiedError with i18n keys
- `frontend/src/utils/completeness.ts` - computeCompleteness function counting filled vs total fields
- `frontend/src/components/ui/CompletenessIndicator.tsx` - Progress bar component with color coding and i18n label
- `frontend/src/components/ui/ErrorBanner.tsx` - Error banner with type-specific styling, retry, dismiss, show details
- `frontend/src/i18n/locales/zh/wizard.json` - Added progress, errors, and completeness key groups
- `frontend/src/i18n/locales/ja/wizard.json` - Added progress, errors, and completeness key groups

## Decisions Made
- Duck-typing via `personal_info` property to distinguish JpResumeData from CnResumeData -- avoids importing a discriminant field
- Error fallback uses `errors.unknown` i18n keys rather than reusing `errors.server` for clarity in user-facing messages
- Array fields (work_history, education, skills, etc.) counted as binary (has entries or not) rather than counting individual sub-fields -- keeps completeness meaningful at 15 total

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 4 utility/component files ready for Plan 02 integration into step components
- i18n keys in place for both locales -- Plan 02 can reference them directly
- No blockers

## Self-Check: PASSED

- All 4 created files verified on disk
- Both commits verified in git log (259148f, 0d5e427)
- TypeScript compilation passes with zero errors
- Both JSON locale files parse successfully

---
*Phase: 05-polish-production-readiness*
*Completed: 2026-02-19*
