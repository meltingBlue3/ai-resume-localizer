---
phase: quick-011
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - frontend/src/components/preview/PreviewPanel.tsx
autonomous: true
must_haves:
  truths:
    - "No 'Blocked script execution in about:srcdoc' console error when previewing resumes"
  artifacts:
    - path: "frontend/src/components/preview/PreviewPanel.tsx"
      provides: "Sandboxed iframe with allow-scripts permission"
      contains: "allow-scripts"
  key_links: []
---

<objective>
Fix "Blocked script execution in 'about:srcdoc'" console error in the PDF preview iframe.

Purpose: Eliminate sandbox-related console errors in the PreviewPanel iframe.
Output: Updated PreviewPanel.tsx with corrected sandbox attribute.
</objective>

<execution_context>
@C:/Users/zhang/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/zhang/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@frontend/src/components/preview/PreviewPanel.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add allow-scripts to iframe sandbox attribute</name>
  <files>frontend/src/components/preview/PreviewPanel.tsx</files>
  <action>
    In PreviewPanel.tsx line 65, change:
      sandbox="allow-same-origin"
    to:
      sandbox="allow-same-origin allow-scripts"

    This is safe because:
    - The iframe has pointer-events:none so users cannot interact with it
    - The srcdoc content is server-generated HTML from our own Jinja2 templates (no user-supplied scripts)
    - allow-same-origin is already present; adding allow-scripts simply stops the browser from logging sandbox violation errors

    Do NOT add any other sandbox permissions (allow-popups, allow-forms, etc.) -- they are unnecessary.
  </action>
  <verify>
    Run: cd frontend && npx tsc --noEmit
    Confirm no TypeScript errors.
    Grep the file for the updated sandbox value.
  </verify>
  <done>PreviewPanel iframe sandbox attribute is "allow-same-origin allow-scripts" and project compiles without errors.</done>
</task>

</tasks>

<verification>
- PreviewPanel.tsx contains sandbox="allow-same-origin allow-scripts"
- TypeScript compilation passes
</verification>

<success_criteria>
The iframe sandbox attribute includes both allow-same-origin and allow-scripts, eliminating the console error.
</success_criteria>

<output>
After completion, create `.planning/quick/11-blocked-script-execution-in-about-srcdoc/11-SUMMARY.md`
</output>
