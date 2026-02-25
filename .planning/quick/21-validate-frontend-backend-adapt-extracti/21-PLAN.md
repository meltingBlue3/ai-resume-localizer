---
phase: 21-validate-frontend-backend-adapt-extracti
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: []
autonomous: false
requirements: []
must_haves:
  truths:
    - "Dify workflow extraction JSON schema matches CnResumeData Pydantic model"
    - "Frontend TypeScript types match backend Pydantic models"
    - "project_experience field structure is consistent across all layers"
  artifacts:
    - path: "backend/app/models/resume.py"
      provides: "CnResumeData Pydantic model"
      contains: "class CnResumeData"
    - path: "frontend/src/types/resume.ts"
      provides: "CnResumeData TypeScript interface"
      contains: "export interface CnResumeData"
    - path: "workflow/resume_extraction.yml"
      provides: "Dify extraction workflow output schema"
      contains: "project_experience"
  key_links:
    - from: "workflow/resume_extraction.yml"
      to: "backend/app/models/resume.py"
      via: "CnResumeData.model_validate(structured)"
      pattern: "project_experience field structure"
---

<objective>
Validate that frontend TypeScript types and backend Pydantic models correctly adapt the Dify extraction workflow JSON response structure.

Purpose: Identify mismatches between the Dify workflow output schema and the CnResumeData model that could cause data loss or validation errors.

Output: Documentation of findings and recommended fixes.
</objective>

<execution_context>
@C:/Users/zhang/.config/opencode/get-shit-done/workflows/execute-plan.md
@C:/Users/zhang/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md

# Key files to compare
@backend/app/models/resume.py
@frontend/src/types/resume.ts
@workflow/resume_extraction.yml
</context>

<tasks>

<task type="auto">
  <name>Task 1: Compare Dify workflow schema with CnResumeData model</name>
  <files></files>
  <action>
Analyze and document the comparison between:
1. Dify extraction workflow output_schema (in `workflow/resume_extraction.yml` lines 172-193)
2. Backend CnResumeData Pydantic model (in `backend/app/models/resume.py`)
3. Frontend CnResumeData TypeScript interface (in `frontend/src/types/resume.ts`)

**CRITICAL MISMATCH FOUND (pre-analyzed):**
The `project_experience` field has different structures:

- **Dify workflow outputs:**
  - `project_name` (not in model)
  - `associated_company` (not in model)
  - `role` (not in model)
  - `start_date`, `end_date`, `description`

- **Backend/Frontend model (WorkEntry):**
  - `company` (not output by Dify)
  - `position` (not output by Dify)
  - `department` (not output by Dify)
  - `start_date`, `end_date`, `description`

**Analysis required:**
1. Document all field-by-field comparisons
2. Identify which fields will be silently dropped due to Pydantic's default behavior (extra="ignore")
3. Assess impact: data loss vs. validation errors
4. Recommend fix: Either update Dify workflow schema OR create a separate ProjectEntry model

Create a markdown report documenting all findings.
  </action>
  <verify>
Review the comparison report for completeness and accuracy. Confirm the project_experience mismatch is documented with specific field names.
  </verify>
  <done>
A comparison report exists at `.planning/quick/21-validate-frontend-backend-adapt-extracti/21-FINDINGS.md` documenting:
1. All field comparisons between Dify schema and models
2. The project_experience field mismatch with specific field names
3. Impact assessment and recommended fix
  </done>
</task>

<task type="auto">
  <name>Task 2: Create ProjectEntry model for project_experience</name>
  <files>
backend/app/models/resume.py
frontend/src/types/resume.ts
  </files>
  <action>
Fix the project_experience mismatch by creating a dedicated ProjectEntry model that matches the Dify workflow output.

**Backend (backend/app/models/resume.py):**
1. Add new `ProjectEntry` model with fields matching Dify output:
   - `project_name: str | None = None`
   - `associated_company: str | None = None`
   - `role: str | None = None`
   - `start_date: str | None = None`
   - `end_date: str | None = None`
   - `description: str | None = None`

2. Update `CnResumeData.project_experience` type from `list[WorkEntry]` to `list[ProjectEntry]`

**Frontend (frontend/src/types/resume.ts):**
1. Add new `ProjectEntry` interface with matching fields
2. Update `CnResumeData.project_experience` type from `WorkEntry[]` to `ProjectEntry[]`

This aligns the models with the actual Dify workflow output, preventing data loss.
  </action>
  <verify>
```bash
cd backend && python -c "from app.models.resume import CnResumeData, ProjectEntry; print('Backend models OK')"
cd frontend && npm run build
```
  </verify>
  <done>
- Backend has `ProjectEntry` model with fields: project_name, associated_company, role, start_date, end_date, description
- Frontend has `ProjectEntry` interface with matching fields
- `CnResumeData.project_experience` uses `ProjectEntry` (not `WorkEntry`) in both backend and frontend
- TypeScript build passes
- Python import succeeds
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 3: Verify ProjectEntry model correctness</name>
  <files></files>
  <action>Created ProjectEntry model for project_experience field to match Dify workflow output schema</action>
  <verify>
1. Review the comparison report at `.planning/quick/21-validate-frontend-backend-adapt-extracti/21-FINDINGS.md`
2. Verify the new ProjectEntry model has correct fields:
   - `project_name` (not `company`)
   - `associated_company` (new field)
   - `role` (not `position`)
   - No `department` field
3. Test extraction with a sample resume to confirm project_experience data is captured correctly
  </verify>
  <done>User approves the ProjectEntry model changes</done>
</task>

</tasks>

<verification>
- [ ] Comparison report documents all field mismatches
- [ ] ProjectEntry model created in backend with correct fields
- [ ] ProjectEntry interface created in frontend with matching fields
- [ ] CnResumeData.project_experience uses ProjectEntry in both layers
- [ ] TypeScript build passes
- [ ] Python imports succeed
</verification>

<success_criteria>
The frontend TypeScript types and backend Pydantic models correctly represent the Dify extraction workflow JSON response. The project_experience field uses a dedicated ProjectEntry model that matches the Dify output schema, preventing data loss.
</success_criteria>

<output>
After completion, create `.planning/quick/21-validate-frontend-backend-adapt-extracti/21-SUMMARY.md`
</output>
