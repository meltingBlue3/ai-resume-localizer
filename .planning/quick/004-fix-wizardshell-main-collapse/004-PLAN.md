---
phase: quick-004
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - frontend/src/components/wizard/WizardShell.tsx
autonomous: true
must_haves:
  truths:
    - "WizardShell main element fills full container width regardless of child content size"
    - "Empty-state steps no longer cause the wizard to collapse to narrow width"
  artifacts:
    - path: "frontend/src/components/wizard/WizardShell.tsx"
      provides: "Fixed main element layout"
      contains: "w-full max-w-[90rem]"
  key_links: []
---

<objective>
Fix WizardShell main element collapsing to content width when a step renders narrow content (e.g., empty-state guard).

Purpose: The `mx-auto` on a flex child overrides `align-self: stretch`, causing the main element to shrink-wrap its content. Adding `w-full` forces `width: 100%` so main always fills the container.
Output: One-line class string fix in WizardShell.tsx.
</objective>

<execution_context>
@C:/Users/zhang/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/zhang/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@frontend/src/components/wizard/WizardShell.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add w-full to WizardShell main element</name>
  <files>frontend/src/components/wizard/WizardShell.tsx</files>
  <action>
On line 34 of WizardShell.tsx, add `w-full` to the wide-step branch of the ternary class string on the `<main>` element.

Change:
```
'max-w-[90rem] px-4 py-4 flex-1 flex flex-col overflow-hidden'
```
To:
```
'w-full max-w-[90rem] px-4 py-4 flex-1 flex flex-col overflow-hidden'
```

This is the ONLY change. Do not modify any other classes or elements.
  </action>
  <verify>
1. `grep "w-full max-w-\[90rem\]" frontend/src/components/wizard/WizardShell.tsx` returns a match.
2. `npx tsc --noEmit` passes (no type errors introduced).
  </verify>
  <done>The main element class string includes `w-full` before `max-w-[90rem]` in the wide-step branch, ensuring it always stretches to full container width.</done>
</task>

</tasks>

<verification>
- Grep confirms `w-full max-w-[90rem]` exists in WizardShell.tsx
- TypeScript compilation passes
</verification>

<success_criteria>
- WizardShell main element has `w-full` class in wide-step mode
- No other changes to the file
</success_criteria>

<output>
After completion, create `.planning/quick/004-fix-wizardshell-main-collapse/004-01-SUMMARY.md`
</output>
