---
phase: 23-add-missing-projects-and-portfolio-links
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: [frontend/src/components/review/JpResumeFieldEditor.tsx]
autonomous: true
requirements: []
must_haves:
  truths:
    - "User can edit company-internal projects within each work history entry"
    - "User can add/remove projects to work entries"
    - "User can edit portfolio links"
    - "New work entries include empty projects array"
  artifacts:
    - path: "frontend/src/components/review/JpResumeFieldEditor.tsx"
      provides: "Full editing support for JpResumeData"
      contains: "projects.*JpProjectEntry"
      contains: "portfolio_links"
  key_links:
    - from: "JpResumeFieldEditor.tsx"
      to: "JpWorkEntry.projects"
      via: "nested project editing UI"
    - from: "JpResumeFieldEditor.tsx"
      to: "JpResumeData.portfolio_links"
      via: "portfolio section"
---

<objective>
Add missing editing support for company-internal projects and portfolio links in JpResumeFieldEditor.

Purpose: The Japanese resume field editor lacks UI to edit `projects` within work entries and `portfolio_links` at the resume level.
Output: Complete editing capability for all JpResumeData fields.
</objective>

<execution_context>
@C:/Users/zhang/.config/opencode/get-shit-done/workflows/execute-plan.md
@C:/Users/zhang/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md

# Source file to modify
@frontend/src/components/review/JpResumeFieldEditor.tsx

# Reference for portfolio_links UI pattern
@frontend/src/components/review/ResumeFieldEditor.tsx (lines 309-332)

# Types
@frontend/src/types/resume.ts (JpWorkEntry, JpProjectEntry, JpResumeData)
</context>

<tasks>

<task type="auto">
  <name>Add projects editing within Work History entries</name>
  <files>frontend/src/components/review/JpResumeFieldEditor.tsx</files>
  <action>
    1. Fix `emptyWork` on line 147: add `projects: []` field
       ```typescript
       const emptyWork: JpWorkEntry = { company: null, title: null, start_date: null, end_date: null, responsibilities: [], achievements: [], projects: [] };
       ```

    2. Add a nested projects editing section inside each work history entry (after the achievements textarea, before the closing `</div>` of the entry).
       - Use a collapsible nested div with a "参画プロジェクト" (Participating Projects) label
       - Follow the pattern from Personal Projects section (lines 291-310) but:
         - Projects are nested within `entry.projects` not `data.personal_projects`
         - Use `updateAt(workHistory, i, { projects: ... })` for updates
       - JpProjectEntry fields: name, role, start_date, end_date, description, technologies
       - Add "Add Project" button within each work entry

    3. Import `JpProjectEntry` type at the top (line 9) if not already present.
  </action>
  <verify>
    `npm run build` passes without TypeScript errors
    grep -c "entry.projects" frontend/src/components/review/JpResumeFieldEditor.tsx should be >= 3
  </verify>
  <done>
    - emptyWork includes `projects: []`
    - Each work entry has nested UI to add/edit/remove projects
    - TypeScript compiles without errors
  </done>
</task>

<task type="auto">
  <name>Add portfolio_links editing section</name>
  <files>frontend/src/components/review/JpResumeFieldEditor.tsx</files>
  <action>
    Add a portfolio_links section before the "Other" section (before line 357).

    Pattern to follow (from ResumeFieldEditor.tsx lines 309-332):
    - CollapsibleSection with title using `s('portfolioLinks')` or inline "ポートフォリオリンク"
    - Simple array of strings with flex layout
    - Each link has FieldInput + RemoveButton
    - AddButton at bottom to add new empty string
    - Use `data.portfolio_links ?? []` for the array
    - Update via `setData({ portfolio_links: updated })`

    i18n keys already exist:
    - zh: `reviewTranslation.fields.portfolioLinks` = "作品集链接"
    - ja: `reviewTranslation.fields.portfolioLinks` = "ポートフォリオリンク"
  </action>
  <verify>
    `npm run build` passes without TypeScript errors
    grep -c "portfolio_links" frontend/src/components/review/JpResumeFieldEditor.tsx should be >= 3
  </verify>
  <done>
    - Portfolio links section appears before "Other" section
    - User can add/edit/remove portfolio links
    - TypeScript compiles without errors
  </done>
</task>

</tasks>

<verification>
- Run `npm run build` in frontend directory - must pass
- Verify emptyWork has projects field
- Verify work history entries have nested project editing
- Verify portfolio_links section exists
</verification>

<success_criteria>
- TypeScript build passes with no errors
- All three missing features implemented:
  1. `emptyWork.projects: []`
  2. Nested project editing within work entries
  3. Portfolio links editing section
</success_criteria>

<output>
After completion, create `.planning/quick/23-add-missing-projects-and-portfolio-links/23-SUMMARY.md`
</output>
