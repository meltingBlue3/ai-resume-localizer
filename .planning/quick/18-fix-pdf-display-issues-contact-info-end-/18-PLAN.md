---
phase: 18-fix-pdf-display-issues
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - backend/app/templates/rirekisho.html
  - backend/app/templates/shokumukeirekisho.html
  - backend/app/services/template_renderer.py
  - frontend/src/components/review/JpResumeFieldEditor.tsx
autonomous: true
requirements: [PDF-DISPLAY-01, PDF-DISPLAY-02, PDF-DISPLAY-03, PDF-DISPLAY-04]
user_setup: []

must_haves:
  truths:
    - "連絡先 shows actual data when emergency_contact_address is populated"
    - "Work entries with no end date display 現在 instead of 'none'"
    - "Project entries with no end date display 現在 instead of 'none'"
    - "Personal projects are editable in Japanese translation review"
    - "Certification form only shows name and date fields"
  artifacts:
    - path: "backend/app/templates/rirekisho.html"
      provides: "Rirekisho PDF template with contact info fix"
      contains: "emergency_contact_address"
    - path: "backend/app/templates/shokumukeirekisho.html"
      provides: "Shokumukeirekisho PDF template with project date fix"
      pattern: "end_date.*現在"
    - path: "backend/app/services/template_renderer.py"
      provides: "Context preparation with project date normalization"
      contains: "end_date"
    - path: "frontend/src/components/review/JpResumeFieldEditor.tsx"
      provides: "Japanese translation editor UI"
      contains: "personal_projects"
  key_links:
    - from: "template_renderer.py"
      to: "shokumukeirekisho.html"
      via: "prepare_context()"
      pattern: "work_history.*projects"
---

<objective>
Fix PDF display issues for contact info, end dates, and add personal projects UI.

Purpose: Ensure PDFs render correctly with proper Japanese formatting and UI reflects current data model.
Output: Fixed templates, normalized dates, updated review UI.
</objective>

<execution_context>
@C:/Users/zhang/.config/opencode/get-shit-done/workflows/execute-plan.md
@C:/Users/zhang/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md

@backend/app/templates/rirekisho.html
@backend/app/templates/shokumukeirekisho.html
@backend/app/services/template_renderer.py
@frontend/src/components/review/JpResumeFieldEditor.tsx
@frontend/src/types/resume.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix contact info and end date display in PDF templates</name>
  <files>
    backend/app/templates/rirekisho.html
    backend/app/templates/shokumukeirekisho.html
    backend/app/services/template_renderer.py
  </files>
  <action>
    Fix three PDF display issues:

    1. **rirekisho.html contact info (連絡先):**
       - Find the 連絡先 row (around line 209-211)
       - Change from showing placeholder text to showing `data.personal_info.emergency_contact_address` when present
       - Keep placeholder hint text when field is empty
       - Use Jinja2 conditional: `{% if data.personal_info.emergency_contact_address %}{{ ... }}{% else %}hint text{% endif %}`

    2. **template_renderer.py project date normalization:**
       - Add normalization loop for projects embedded in work_history entries
       - After the existing work_history normalization (around line 125), add:
         ```python
         # Normalize "none"/"null" strings to None for project end_dates
         for entry in data["work_history"]:
             if entry.get("projects"):
                 for project in entry["projects"]:
                     if project.get("end_date"):
                         end_val = project["end_date"]
                         if isinstance(end_val, str) and end_val.lower() in ("none", "null", ""):
                             project["end_date"] = None
         ```
       - Also add same normalization for personal_projects (top-level):
         ```python
         for project in data["personal_projects"]:
             if project.get("end_date"):
                 end_val = project["end_date"]
                 if isinstance(end_val, str) and end_val.lower() in ("none", "null", ""):
                     project["end_date"] = None
         ```

    3. **shokumukeirekisho.html embedded projects (optional verification):**
       - Verify that embedded projects (lines 231, 262) already use correct conditional:
         `{% if project.end_date %}〜{{ project.end_date }}{% else %}〜現在{% endif %}`
       - If they use `default('現在')` filter, change to explicit conditional for consistency
  </action>
  <verify>
    cd backend && python -c "
from app.services.template_renderer import prepare_context
from app.models.resume import JpResumeData, JpWorkEntry, JpProjectEntry, JpPersonalInfo

# Test end_date normalization for projects
data = JpResumeData(
    work_history=[JpWorkEntry(
        company='Test',
        projects=[JpProjectEntry(name='P1', end_date='none')]
    )],
    personal_projects=[JpProjectEntry(name='P2', end_date='null')]
)
ctx = prepare_context(data)
assert ctx['work_history'][0]['projects'][0]['end_date'] is None, 'Project end_date not normalized'
assert ctx['personal_projects'][0]['end_date'] is None, 'Personal project end_date not normalized'
print('✓ Project end_date normalization works')
"
  </verify>
  <done>
    - 連絡先 row in rirekisho.html shows actual data when emergency_contact_address is populated
    - Project end_date "none"/"null" strings are converted to None before rendering
    - PDF templates correctly display 現在 for null end dates
  </done>
</task>

<task type="auto">
  <name>Task 2: Add personal projects section to Japanese review UI</name>
  <files>frontend/src/components/review/JpResumeFieldEditor.tsx</files>
  <action>
    Add personal_projects editing section to JpResumeFieldEditor:

    1. Import JpProjectEntry type (already imported at line 10, verify it's included)

    2. Add after the "Other" section (around line 353, before closing `</div>`):

    ```tsx
    {/* Personal Projects */}
    <CollapsibleSection title={s('personalProjects')}>
      <div className="space-y-3">
        {(data.personal_projects ?? []).map((project, i) => (
          <div key={i} className="space-y-2 rounded-md border border-slate-100 bg-slate-50 p-3">
            <div className="flex justify-end">
              <RemoveButton label={t('reviewTranslation.removeEntry')} onClick={() => setData({ personal_projects: removeAt(data.personal_projects ?? [], i) })} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <FieldInput label={f('projectName')} value={project.name ?? ''} onChange={(v) => setData({ personal_projects: updateAt(data.personal_projects ?? [], i, { name: v || null }) })} />
              <FieldInput label={f('projectRole')} value={project.role ?? ''} onChange={(v) => setData({ personal_projects: updateAt(data.personal_projects ?? [], i, { role: v || null }) })} />
              <FieldInput label={f('startDate')} value={project.start_date ?? ''} onChange={(v) => setData({ personal_projects: updateAt(data.personal_projects ?? [], i, { start_date: v || null }) })} />
              <FieldInput label={f('endDate')} value={project.end_date ?? ''} onChange={(v) => setData({ personal_projects: updateAt(data.personal_projects ?? [], i, { end_date: v || null }) })} />
            </div>
            <FieldInput label={f('projectDescription')} value={project.description ?? ''} onChange={(v) => setData({ personal_projects: updateAt(data.personal_projects ?? [], i, { description: v || null }) })} multiline />
            <FieldInput label={f('projectTechnologies')} value={(project.technologies ?? []).join(', ')} onChange={(v) => setData({ personal_projects: updateAt(data.personal_projects ?? [], i, { technologies: v ? v.split(',').map((s) => s.trim()) : [] }) })} />
          </div>
        ))}
        <AddButton label={t('reviewTranslation.addEntry')} onClick={() => setData({ personal_projects: [...(data.personal_projects ?? []), { name: null, role: null, start_date: null, end_date: null, description: null, technologies: null }] })} />
      </div>
    </CollapsibleSection>
    ```

    3. Add translation keys to i18n files (zh and ja) if not already present:
       - `reviewTranslation.sections.personalProjects` → "个人项目" / "個人プロジェクト"
       - `reviewTranslation.fields.projectName` → "项目名称" / "プロジェクト名"
       - `reviewTranslation.fields.projectRole` → "角色" / "役割"
       - `reviewTranslation.fields.projectDescription` → "描述" / "説明"
       - `reviewTranslation.fields.projectTechnologies` → "使用技术" / "使用技術"
  </action>
  <verify>
    cd frontend && npm run build 2>&1 | head -20
  </verify>
  <done>
    - Personal projects section appears in Japanese translation review
    - Users can add/edit/remove personal projects
    - UI shows all project fields: name, role, dates, description, technologies
    - Build passes without TypeScript errors
  </done>
</task>

<task type="auto">
  <name>Task 3: Remove issuer and score fields from certification form</name>
  <files>frontend/src/components/review/JpResumeFieldEditor.tsx</files>
  <action>
    Remove issuer and score input fields from the certifications section:

    1. In JpResumeFieldEditor.tsx, find the certifications section (around lines 313-335)

    2. Remove the two fields:
       - `<FieldInput label={f('issuer')} .../>` (line 322)
       - `<FieldInput label={f('score')} .../>` (line 329)

    3. Update the grid from 4 fields to 2 fields:
       - Change `<div className="grid grid-cols-2 gap-2">` to remain as-is (still works with 2 fields)
       - Keep only name and date fields

    4. Update the emptyCert constant (line 149) to:
       ```tsx
       const emptyCert: JpCertificationEntry = { name: null, date: null };
       ```

    Note: Keep the issuer and score fields in the TypeScript type (JpCertificationEntry) since they may still be present in existing data, just remove the UI inputs.
  </action>
  <verify>
    cd frontend && npm run build 2>&1 | head -20
  </verify>
  <done>
    - Certification form only shows name and date fields
    - issuer and score inputs removed from UI
    - Build passes without errors
    - Existing data with issuer/score still works (type unchanged)
  </done>
</task>

</tasks>

<verification>
- Generate PDF with emergency_contact_address populated → 連絡先 shows the address
- Generate PDF with work entry having null end_date → shows 現在
- Generate PDF with project having "none" end_date → shows 現在
- Review Japanese translation → personal projects section visible and editable
- Review Japanese translation → certification form has only name and date
</verification>

<success_criteria>
- All 4 display issues resolved
- Templates render correctly
- UI reflects current data model
- No TypeScript errors
- Manual testing confirms fixes work
</success_criteria>

<output>
After completion, create `.planning/quick/18-fix-pdf-display-issues-contact-info-end-/18-SUMMARY.md`
</output>
