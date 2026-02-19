---
phase: quick
plan: 002
subsystem: ui
tags: [tailwind, flexbox, layout, overflow, viewport-height]

requires:
  - phase: 05-polish-production-readiness
    provides: WizardShell and step components
provides:
  - Viewport-constrained flex layout for wide steps (1-3)
  - Internal scrolling panels with nav buttons always visible
affects: []

tech-stack:
  added: []
  patterns:
    - "h-screen flex-col cascade: WizardShell -> main -> card -> step component"
    - "Conditional layout: isWideStep uses h-screen flex, non-wide keeps min-h-screen"

key-files:
  created: []
  modified:
    - frontend/src/components/wizard/WizardShell.tsx
    - frontend/src/steps/ReviewExtractionStep.tsx
    - frontend/src/steps/ReviewTranslationStep.tsx
    - frontend/src/steps/PreviewStep.tsx

key-decisions:
  - "Conditional h-screen layout only for wide steps (1-3) to preserve upload/download scrollable behavior"
  - "flex-1 min-h-0 replaces all h-[calc(100vh-Xrem)] for responsive height inheritance"

patterns-established:
  - "Viewport-constrained flex chain: h-screen -> flex-1 -> h-full -> flex-1 min-h-0"

duration: 2min
completed: 2026-02-19
---

# Quick Task 002: Fix Panel Height Overflow Summary

**Viewport-constrained flex layout replacing calc-based heights so nav buttons stay visible on review/preview steps**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-19T09:54:22Z
- **Completed:** 2026-02-19T09:56:02Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- WizardShell conditionally uses h-screen flex column for wide steps (1-3), keeping nav buttons always at viewport bottom
- All three step components (ReviewExtraction, ReviewTranslation, Preview) use flex-based height inheritance instead of hardcoded calc values
- Panel content scrolls internally via existing overflow-y-auto while layout never exceeds viewport
- Upload and Download steps retain their original min-h-screen scrollable behavior

## Task Commits

Each task was committed atomically:

1. **Task 1: Constrain WizardShell to viewport height** - `f79bc4d` (fix)
2. **Task 2: Replace fixed calc heights with flex-1 in step components** - `40aadad` (fix)

## Files Created/Modified
- `frontend/src/components/wizard/WizardShell.tsx` - Conditional h-screen flex column layout for wide steps, shrink-0 on header/indicator/nav
- `frontend/src/steps/ReviewExtractionStep.tsx` - flex col h-full outer, flex-1 min-h-0 grid replacing calc height
- `frontend/src/steps/ReviewTranslationStep.tsx` - h-full replacing calc, shrink-0 on header/error sections
- `frontend/src/steps/PreviewStep.tsx` - h-full replacing calc, shrink-0 on header/errors/toolbar, min-h-0 on panel area

## Decisions Made
- Conditional h-screen layout only for wide steps (1-3) to preserve upload/download scrollable behavior
- flex-1 min-h-0 replaces all h-[calc(100vh-Xrem)] for responsive height inheritance from parent flex chain

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

---
*Quick task: 002-fix-panel-height-overflow*
*Completed: 2026-02-19*
