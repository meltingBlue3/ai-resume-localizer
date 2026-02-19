---
phase: quick
plan: 002
type: execute
wave: 1
depends_on: []
files_modified:
  - frontend/src/components/wizard/WizardShell.tsx
  - frontend/src/steps/ReviewExtractionStep.tsx
  - frontend/src/steps/ReviewTranslationStep.tsx
  - frontend/src/steps/PreviewStep.tsx
autonomous: true
must_haves:
  truths:
    - "Navigation buttons (Previous/Next) are always visible without scrolling on steps 1-3"
    - "Panel content scrolls internally when it overflows"
    - "Layout does not exceed viewport height"
  artifacts:
    - path: "frontend/src/components/wizard/WizardShell.tsx"
      provides: "Flex column layout constrained to viewport height"
    - path: "frontend/src/steps/ReviewExtractionStep.tsx"
      provides: "Panels using flex-1 instead of fixed calc height"
    - path: "frontend/src/steps/ReviewTranslationStep.tsx"
      provides: "Panels using flex-1 instead of fixed calc height"
    - path: "frontend/src/steps/PreviewStep.tsx"
      provides: "Panels using flex-1 instead of fixed calc height"
  key_links:
    - from: "WizardShell.tsx"
      to: "Step components"
      via: "flex column height constraint flows down"
      pattern: "h-screen.*flex.*flex-col"
---

<objective>
Fix panel height overflow so that Previous/Next navigation buttons are always visible without scrolling when PDF content is loaded in the review and preview steps.

Purpose: Currently the step panels use `h-[calc(100vh-Xrem)]` but the parent WizardShell uses `min-h-screen` with no height constraint, allowing the page to grow beyond the viewport and pushing nav buttons off-screen.

Output: All four files updated so the layout is viewport-constrained with internal scrolling.
</objective>

<execution_context>
@C:/Users/zhang/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/zhang/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@frontend/src/components/wizard/WizardShell.tsx
@frontend/src/components/wizard/StepNavigation.tsx
@frontend/src/components/wizard/StepIndicator.tsx
@frontend/src/steps/ReviewExtractionStep.tsx
@frontend/src/steps/ReviewTranslationStep.tsx
@frontend/src/steps/PreviewStep.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Constrain WizardShell to viewport height with flex layout</name>
  <files>frontend/src/components/wizard/WizardShell.tsx</files>
  <action>
Change WizardShell's outer div from `min-h-screen` to `h-screen overflow-hidden` and make it a flex column layout so the main content area fills remaining space.

Specifically:
1. Outer div: change `min-h-screen` to `h-screen flex flex-col overflow-hidden` (keep bg gradient)
2. Header: add `shrink-0` so it never compresses
3. Main: add `flex-1 flex flex-col overflow-hidden` (remove py-8/py-4 top padding, keep bottom padding minimal or remove -- the step content and nav must fit in remaining space)
4. The StepIndicator wrapper div (with `mb-8`): add `shrink-0`, reduce `mb-8` to `mb-4` for the wide steps to save vertical space
5. The step content card div (rounded-xl border): add `flex-1 overflow-hidden flex flex-col min-h-0` so it fills available space and allows children to scroll internally. The step component inside needs the flex to flow through.
6. StepNavigation wrapper: add `shrink-0` -- it is already outside the card, just ensure it never gets pushed off. It has `pt-6` which is fine.

The key insight: by making the entire shell a fixed-height flex column (`h-screen`), the step content area gets a constrained height, and the nav buttons always sit at the bottom of the viewport.

IMPORTANT: Only apply `h-screen` layout for wide steps (steps 1-3, `isWideStep`). For non-wide steps (upload, download), keep the current `min-h-screen` scrollable behavior since those steps don't have tall panels.

Implementation approach: Use conditional classes based on `isWideStep`:
- When `isWideStep`: outer = `h-screen flex flex-col overflow-hidden`, main = `flex-1 flex flex-col overflow-hidden`
- When NOT `isWideStep`: outer = `min-h-screen` (current behavior preserved)
  </action>
  <verify>Run `cd C:/Users/zhang/Desktop/Projects/FullStack/ai-resume-localizer/frontend && npx tsc --noEmit` -- no type errors.</verify>
  <done>WizardShell conditionally constrains layout to viewport height for wide steps, keeping nav buttons always visible.</done>
</task>

<task type="auto">
  <name>Task 2: Replace fixed calc heights with flex-1 in step components</name>
  <files>
    frontend/src/steps/ReviewExtractionStep.tsx
    frontend/src/steps/ReviewTranslationStep.tsx
    frontend/src/steps/PreviewStep.tsx
  </files>
  <action>
Now that WizardShell provides a constrained flex container, the step components should use `flex-1 min-h-0 overflow-hidden` instead of hardcoded `h-[calc(100vh-Xrem)]`.

**ReviewExtractionStep.tsx (line 58):**
- The outer div `space-y-4` needs to become `flex flex-col h-full` (to participate in the flex chain from WizardShell)
- The header section (lines 45-55): add `shrink-0`
- The grid div: change `h-[calc(100vh-14rem)]` to `flex-1 min-h-0` (keep `grid grid-cols-1 gap-4 lg:grid-cols-2`)
- Both panel children already have `flex flex-col overflow-hidden` and inner `overflow-y-auto` -- those are correct.

**ReviewTranslationStep.tsx (line 77):**
- Outer div already has `flex flex-col`. Change `h-[calc(100vh-13rem)]` to `h-full`
- The top bar (line 79): already has `mb-4`, add `shrink-0`
- Error banner section: add `shrink-0`
- The grid div (line 130): already has `flex-1 overflow-hidden` -- keep as-is. Good.

**PreviewStep.tsx (line 170):**
- Outer div already has `flex flex-col`. Change `h-[calc(100vh-13rem)]` to `h-full`
- Header section (line 172): add `shrink-0`
- Error banners: add `shrink-0`
- PreviewToolbar: add `shrink-0`
- The two-panel div (line 221): already has `flex-1 ... overflow-hidden` -- keep as-is. Good.

The key: remove all `h-[calc(100vh-*)]` values. Replace with `h-full` or `flex-1 min-h-0`. The height constraint now flows from WizardShell's `h-screen` through the flex chain.
  </action>
  <verify>
1. Run `cd C:/Users/zhang/Desktop/Projects/FullStack/ai-resume-localizer/frontend && npx tsc --noEmit` -- no type errors.
2. Run `cd C:/Users/zhang/Desktop/Projects/FullStack/ai-resume-localizer/frontend && npm run build` -- builds successfully.
3. Grep to confirm no remaining `calc(100vh` in these three files: `grep -r "calc(100vh" frontend/src/steps/ReviewExtractionStep.tsx frontend/src/steps/ReviewTranslationStep.tsx frontend/src/steps/PreviewStep.tsx` should return nothing.
  </verify>
  <done>All three step components use flex-based height from parent instead of hardcoded viewport calc. Panel content scrolls internally. Navigation buttons stay visible.</done>
</task>

</tasks>

<verification>
1. `npm run build` succeeds with no errors
2. No remaining `h-[calc(100vh` in the three step files
3. Visual check: on steps 1-3, Previous/Next buttons visible without scrolling even with tall PDF content loaded
</verification>

<success_criteria>
- Navigation buttons always visible on screen for ReviewExtractionStep, ReviewTranslationStep, and PreviewStep
- Panel content scrolls internally (overflow-y-auto) when it exceeds available space
- Upload and Download steps (non-wide) retain their current scrollable behavior unchanged
- Build passes with no errors
</success_criteria>

<output>
After completion, create `.planning/quick/002-fix-panel-height-overflow/002-SUMMARY.md`
</output>
