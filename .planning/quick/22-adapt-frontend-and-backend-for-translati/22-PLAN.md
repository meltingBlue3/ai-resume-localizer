---
phase: quick
plan: 22
type: execute
wave: 1
depends_on: []
files_modified:
  - backend/app/models/resume.py
  - frontend/src/types/resume.ts
autonomous: true
requirements: []
must_haves:
  truths:
    - "JpWorkEntry model matches translation workflow output (no unused location field)"
    - "JpCertificationEntry model matches translation workflow output (no unused issuer/score fields)"
    - "Frontend types mirror backend models exactly"
  artifacts:
    - path: "backend/app/models/resume.py"
      provides: "Pydantic models for Japanese resume data"
      contains: "class JpWorkEntry"
    - path: "frontend/src/types/resume.ts"
      provides: "TypeScript types for Japanese resume data"
      contains: "interface JpWorkEntry"
  key_links:
    - from: "frontend/src/types/resume.ts"
      to: "backend/app/models/resume.py"
      via: "type alignment"
      pattern: "interface JpWorkEntry"
---

<objective>
Remove unused fields from Japanese resume models to align with translation workflow JSON output.

Purpose: Clean up models by removing fields that are never populated by the translation workflow and not used elsewhere in the codebase.
Output: Aligned backend and frontend models matching translation workflow output structure.
</objective>

<execution_context>
@C:/Users/zhang/.config/opencode/get-shit-done/workflows/execute-plan.md
@C:/Users/zhang/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md

Translation workflow output structure (from task):
- JpPersonalInfo: name, name_katakana, birth_date, age, gender, nationality, address, emergency_contact_address, phone, email, marital_status, dependents_count, commute_time
- JpWorkEntry: company, title, start_date, end_date, responsibilities[], achievements[], projects[]
- JpCertificationEntry: name, date

Fields to REMOVE (not in translation output, not used in codebase):
- JpWorkEntry.location
- JpCertificationEntry.issuer
- JpCertificationEntry.score

Fields to KEEP:
- JpPersonalInfo.postal_code - used in rirekisho.html template (line 202), documented in STATE.md as "Dify workflow extracts from address field"
</context>

<tasks>

<task type="auto">
  <name>Task 1: Remove unused fields from backend Pydantic models</name>
  <files>backend/app/models/resume.py</files>
  <action>
    In `backend/app/models/resume.py`, remove the following unused fields that are not in the translation workflow output:
    
    1. In `JpWorkEntry` class (around line 109-117):
       - Remove `location: str | None = None` (line ~114)
    
    2. In `JpCertificationEntry` class (around line 125-129):
       - Remove `issuer: str | None = None` (line ~127)
       - Remove `score: str | None = None` (line ~129)
    
    DO NOT remove `postal_code` from `JpPersonalInfo` - it is used in the rirekisho.html template and was deliberately added per STATE.md.
  </action>
  <verify>
    ```bash
    cd backend && python -c "from app.models.resume import JpWorkEntry, JpCertificationEntry; print('Models import OK')"
    ```
  </verify>
  <done>
    - JpWorkEntry has no `location` field
    - JpCertificationEntry has no `issuer` or `score` fields
    - Models import without errors
  </done>
</task>

<task type="auto">
  <name>Task 2: Remove unused fields from frontend TypeScript types</name>
  <files>frontend/src/types/resume.ts</files>
  <action>
    In `frontend/src/types/resume.ts`, remove the following unused fields to match the backend models:
    
    1. In `JpWorkEntry` interface (around line 103-112):
       - Remove `location?: string | null;` (line ~108)
    
    2. In `JpCertificationEntry` interface (around line 119-124):
       - Remove `issuer?: string | null;` (line ~121)
       - Remove `score?: string | null;` (line ~122)
    
    DO NOT remove `postal_code` from `JpPersonalInfo` - it is used in the rirekisho.html template.
  </action>
  <verify>
    ```bash
    cd frontend && npm run build
    ```
  </verify>
  <done>
    - JpWorkEntry interface has no `location` field
    - JpCertificationEntry interface has no `issuer` or `score` fields
    - TypeScript compilation passes without errors
  </done>
</task>

</tasks>

<verification>
- Backend models import successfully
- Frontend TypeScript compiles without errors
- No code references the removed fields (verified via grep)
</verification>

<success_criteria>
- JpWorkEntry and JpCertificationEntry models in both backend and frontend match translation workflow JSON output
- `postal_code` retained in JpPersonalInfo (used in templates)
- All imports and builds succeed
</success_criteria>

<output>
After completion, create `.planning/quick/22-adapt-frontend-and-backend-for-translati/22-SUMMARY.md`
</output>
