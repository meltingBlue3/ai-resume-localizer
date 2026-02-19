---
phase: quick-004
plan: 01
subsystem: ui
tags: [tailwind, layout, flexbox, wizard]

requires:
  - phase: quick-001
    provides: Wide layout for review/preview steps
provides:
  - Fixed main element width in WizardShell wide-step mode
affects: []

tech-stack:
  added: []
  patterns: []

key-files:
  created: []
  modified:
    - frontend/src/components/wizard/WizardShell.tsx

key-decisions:
  - "w-full added before max-w-[90rem] to override flex child shrink-wrap behavior caused by mx-auto"

duration: <1min
completed: 2026-02-19
---

# Quick Task 004: Fix WizardShell Main Collapse Summary

**Added w-full to WizardShell main element to prevent content-width collapse on narrow/empty steps**

## Performance

- **Duration:** <1 min
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Fixed main element collapsing to content width when a step renders narrow content (e.g., empty-state guard)
- `w-full` forces `width: 100%` so `mx-auto` + `max-w-[90rem]` work correctly on the flex child

## Task Commits

1. **Task 1: Add w-full to WizardShell main element** - `8538f09` (fix)

## Files Created/Modified
- `frontend/src/components/wizard/WizardShell.tsx` - Added `w-full` class to wide-step branch of main element

## Decisions Made
None - followed plan as specified.

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
None.

## Self-Check: PASSED
