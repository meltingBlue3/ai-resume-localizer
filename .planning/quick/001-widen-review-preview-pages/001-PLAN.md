---
phase: quick
plan: 001
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
    - "Side-by-side pages (ReviewExtraction, ReviewTranslation, Preview) use near-full viewport width"
    - "Side-by-side pages use near-full viewport height for the comparison panels"
    - "Non-side-by-side pages (Upload, Download) retain the original narrower max-w-4xl layout"
    - "Header, step indicator, and step navigation remain visually aligned with content"
  artifacts:
    - path: "frontend/src/components/wizard/WizardShell.tsx"
      provides: "Dynamic max-width based on current step"
    - path: "frontend/src/steps/ReviewExtractionStep.tsx"
      provides: "Adjusted height calc for wider layout"
    - path: "frontend/src/steps/ReviewTranslationStep.tsx"
      provides: "Adjusted height calc for wider layout"
    - path: "frontend/src/steps/PreviewStep.tsx"
      provides: "Adjusted height calc for wider layout"
  key_links:
    - from: "WizardShell.tsx"
      to: "useWizardStore"
      via: "currentStep to determine wide vs narrow layout"
      pattern: "currentStep"
---

<objective>
Widen the container for the three side-by-side comparison steps (ReviewExtraction, ReviewTranslation, Preview) so they use near-full viewport width and height, while keeping Upload and Download steps at the original narrower width.

Purpose: The current max-w-4xl (896px) container is too narrow for side-by-side layouts, cramping the document viewer, field editors, and preview panels.
Output: Updated WizardShell with dynamic width and updated step components with better height utilization.
</objective>

<execution_context>
@C:/Users/zhang/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/zhang/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@frontend/src/components/wizard/WizardShell.tsx
@frontend/src/steps/ReviewExtractionStep.tsx
@frontend/src/steps/ReviewTranslationStep.tsx
@frontend/src/steps/PreviewStep.tsx
@frontend/src/stores/useWizardStore.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Make WizardShell container width dynamic based on current step</name>
  <files>frontend/src/components/wizard/WizardShell.tsx</files>
  <action>
In WizardShell.tsx, make the layout responsive to which step is active:

1. Define which steps need the wide layout. Steps at index 1 (ReviewExtraction), 2 (ReviewTranslation), and 3 (Preview) are "wide steps". Steps at index 0 (Upload) and 4 (Download) stay narrow.

2. Read `currentStep` from `useWizardStore` (already imported).

3. Compute a boolean: `const isWideStep = currentStep >= 1 && currentStep <= 3;`

4. Change the header inner div from `max-w-4xl` to a dynamic class:
   - Wide steps: `max-w-[90rem]` (1440px) — gives ample room on large monitors while still having some margin
   - Narrow steps: `max-w-4xl` (unchanged)

5. Change the `<main>` element similarly:
   - Wide steps: `max-w-[90rem]` and reduce horizontal padding to `px-4` and vertical padding to `py-4` (to reclaim space)
   - Narrow steps: `max-w-4xl px-6 py-8` (unchanged)

6. For the white content card div (`rounded-xl border...`):
   - Wide steps: reduce padding from `p-8` to `p-4` to maximize usable area inside the card
   - Narrow steps: keep `p-8`

7. Add `transition-all duration-300` to the main and header inner div for smooth width transitions between steps. This is optional but nice.

Example pattern for the main tag:
```tsx
<main className={`mx-auto ${isWideStep ? 'max-w-[90rem] px-4 py-4' : 'max-w-4xl px-6 py-8'}`}>
```
  </action>
  <verify>Run `cd C:/Users/zhang/Desktop/Projects/FullStack/ai-resume-localizer/frontend && npx tsc --noEmit` to confirm no TypeScript errors.</verify>
  <done>WizardShell dynamically applies wide layout (max-w-[90rem], reduced padding) for steps 1-3 and narrow layout (max-w-4xl) for steps 0 and 4.</done>
</task>

<task type="auto">
  <name>Task 2: Optimize height usage in the three side-by-side step components</name>
  <files>frontend/src/steps/ReviewExtractionStep.tsx, frontend/src/steps/ReviewTranslationStep.tsx, frontend/src/steps/PreviewStep.tsx</files>
  <action>
Adjust the viewport height calculations in all three step components to account for reduced padding and maximize panel height:

**ReviewExtractionStep.tsx:**
- Line 58: Change `h-[calc(100vh-20rem)]` to `h-[calc(100vh-14rem)]` on the side-by-side grid. The reduced WizardShell padding means less vertical space is consumed by chrome, so we can claim more height. The 14rem accounts for: header (~4rem) + step indicator (~4rem) + step header (~3rem) + nav (~3rem).

**ReviewTranslationStep.tsx:**
- Line 77: Change `h-[calc(100vh-16rem)]` to `h-[calc(100vh-13rem)]` on the outer flex container. Same rationale — less shell padding means more room.

**PreviewStep.tsx:**
- Line 170: Change `h-[calc(100vh-16rem)]` to `h-[calc(100vh-13rem)]` on the outer flex container.

These are conservative adjustments. The key width improvement comes from Task 1 (WizardShell). These height tweaks ensure the panels also grow taller to fill the freed vertical space.
  </action>
  <verify>Run `cd C:/Users/zhang/Desktop/Projects/FullStack/ai-resume-localizer/frontend && npx tsc --noEmit` to confirm no TypeScript errors. Then run `npm run build` to confirm the build succeeds.</verify>
  <done>All three side-by-side step components use taller viewport height calculations, maximizing the panel area for document viewing and editing.</done>
</task>

</tasks>

<verification>
1. `cd frontend && npx tsc --noEmit` passes with no errors
2. `cd frontend && npm run build` succeeds
3. Visual check: On steps 1-3, the content area spans near-full viewport width (~1440px max) with minimal padding. On steps 0 and 4, the content area remains at the familiar narrower width (896px max).
</verification>

<success_criteria>
- ReviewExtractionStep, ReviewTranslationStep, and PreviewStep render at near-full viewport width (up to 1440px)
- Side-by-side panels are visibly taller due to reduced padding and adjusted height calculations
- UploadStep and DownloadStep are unaffected, retaining max-w-4xl
- No TypeScript or build errors
</success_criteria>

<output>
After completion, create `.planning/quick/001-widen-review-preview-pages/001-SUMMARY.md`
</output>
