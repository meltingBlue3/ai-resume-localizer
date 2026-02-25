---
phase: quick
plan: 24
type: execute
wave: 1
depends_on: []
files_modified:
  - frontend/src/components/review/ResumeFieldEditor.tsx
autonomous: true
must_haves:
  truths:
    - "User can see project experience section between work experience and skills"
    - "Project experience is no longer nested inside Other section"
  artifacts:
    - path: frontend/src/components/review/ResumeFieldEditor.tsx
      provides: "Section reordering for Chinese resume editor"
  key_links:
    - from: ResumeFieldEditor.tsx
      to: "CollapsibleSection components"
      via: "JSX structure"
---

<objective>
Move project experience section from inside "Other" to between "Work Experience" and "Skills" in the Chinese resume editor.

Purpose: Improve UX by giving project experience proper visibility, matching the logical order of the Japanese resume editor and PDF template.

Output: ResumeFieldEditor.tsx with reordered sections.
</objective>

<execution_context>
@C:/Users/zhang/.config/opencode/get-shit-done/workflows/execute-plan.md
@C:/Users/zhang/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@AGENTS.md

Current section order in ResumeFieldEditor.tsx:
1. Personal Info
2. Education
3. Work Experience
4. Skills
5. Certifications
6. Languages
7. Other (contains project_experience + portfolio_links + self_introduction)

Target order:
1. Personal Info
2. Education
3. Work Experience
4. Project Experience  ← NEW POSITION
5. Skills
6. Certifications
7. Languages
8. Other (self_introduction, other only)

Reference: JpResumeFieldEditor.tsx already has the correct order (Work History → Personal Projects → Skills).
</context>

<tasks>

<task type="auto">
  <name>Task 1: Reorder sections in ResumeFieldEditor.tsx</name>
  <files>frontend/src/components/review/ResumeFieldEditor.tsx</files>
  <action>
    Restructure the JSX in ResumeFieldEditor.tsx to:
    
    1. Extract the Project Experience block (currently inside "Other" section, lines 284-307) into its own CollapsibleSection titled `{s('projectExperience')}` (using existing translation key).
    
    2. Place this new section between "Work Experience" (ends ~line 216) and "Skills" (starts ~line 218).
    
    3. Keep Portfolio Links inside "Other" section OR extract to its own section (follow same pattern as JpResumeFieldEditor which has portfolio_links as separate section).
    
    4. "Other" section should contain only self_introduction and other fields after this change.
    
    The existing translation key `s('projectExperience')` maps to "项目经历" in zh and should already exist in wizard.json.
  </action>
  <verify>
    grep -A5 "Work Experience" frontend/src/components/review/ResumeFieldEditor.tsx | grep -c "projectExperience" && grep -B5 "Skills" frontend/src/components/review/ResumeFieldEditor.tsx | grep -c "projectExperience"
  </verify>
  <done>
    - Project Experience section appears as its own CollapsibleSection
    - Project Experience is positioned between Work Experience and Skills
    - "Other" section no longer contains project_experience editing UI
  </done>
</task>

</tasks>

<verification>
1. `npm run build` in frontend/ completes without TypeScript errors
2. Visual check: Project Experience section visible between Work Experience and Skills
</verification>

<success_criteria>
- Project Experience is a standalone section in Chinese resume editor
- Section order: Work Experience → Project Experience → Skills
- No TypeScript or build errors
</success_criteria>

<output>
After completion, create `.planning/quick/24-项目经历位置调整/24-SUMMARY.md`
</output>
