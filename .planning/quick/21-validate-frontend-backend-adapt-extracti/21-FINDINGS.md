# Frontend/Backend/Dify Schema Validation Report

**Date:** 2026-02-25
**Task:** 21 - Validate Frontend/Backend Adaptation of Dify Extraction Workflow

## Executive Summary

A **critical mismatch** exists between the Dify extraction workflow output schema and the `CnResumeData.project_experience` field. The Dify workflow outputs project-specific fields (`project_name`, `associated_company`, `role`), but the backend and frontend models use `WorkEntry` which has different fields (`company`, `position`, `department`).

**Impact:** Project experience data extracted by Dify will be silently dropped due to Pydantic's `extra="ignore"` default behavior, causing data loss.

---

## Detailed Field-by-Field Comparison

### 1. project_experience Field (CRITICAL MISMATCH)

| Dify Workflow Output | Backend WorkEntry | Frontend WorkEntry | Status |
|---------------------|-------------------|-------------------|--------|
| `project_name` | ❌ Not in model | ❌ Not in model | **LOST** |
| `associated_company` | ❌ Not in model | ❌ Not in model | **LOST** |
| `role` | ❌ Not in model | ❌ Not in model | **LOST** |
| `start_date` | ✅ `start_date` | ✅ `start_date` | OK |
| `end_date` | ✅ `end_date` | ✅ `end_date` | OK |
| `description` | ✅ `description` | ✅ `description` | OK |
| - | `company` | `company` | **UNUSED** |
| - | `position` | `position` | **UNUSED** |
| - | `department` | `department` | **UNUSED** |

**Dify Output Schema (from `workflow/resume_extraction.yml` lines 184-189):**
```json
{
  "project_name": "项目名称",
  "associated_company": "所属公司/组织（无法推断填 null）",
  "role": "担任角色",
  "start_date": "YYYY-MM",
  "end_date": "YYYY-MM",
  "description": "经专业润色后的项目背景、使用的技术/工具及最终成果"
}
```

**Current Model (WorkEntry):**
```python
class WorkEntry(BaseModel):
    company: str | None = None
    position: str | None = None
    department: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    description: str | None = None
```

### 2. work_experience Field (MATCH)

| Dify Workflow Output | Backend WorkEntry | Frontend WorkEntry | Status |
|---------------------|-------------------|-------------------|--------|
| `company` | ✅ `company` | ✅ `company` | OK |
| `position` | ✅ `position` | ✅ `position` | OK |
| `department` | ✅ `department` | ✅ `department` | OK |
| `start_date` | ✅ `start_date` | ✅ `start_date` | OK |
| `end_date` | ✅ `end_date` | ✅ `end_date` | OK |
| `description` | ✅ `description` | ✅ `description` | OK |

**Status:** Fully aligned. No action needed.

### 3. education Field (MATCH)

| Dify Workflow Output | Backend EducationEntry | Frontend EducationEntry | Status |
|---------------------|------------------------|-------------------------|--------|
| `school` | ✅ `school` | ✅ `school` | OK |
| `major` | ✅ `major` | ✅ `major` | OK |
| `degree` | ✅ `degree` | ✅ `degree` | OK |
| `start_date` | ✅ `start_date` | ✅ `start_date` | OK |
| `end_date` | ✅ `end_date` | ✅ `end_date` | OK |

**Status:** Fully aligned. No action needed.

### 4. skills Field (MATCH)

| Dify Workflow Output | Backend SkillEntry | Frontend SkillEntry | Status |
|---------------------|--------------------|--------------------|--------|
| `name` | ✅ `name` | ✅ `name` | OK |
| `level` | ✅ `level` | ✅ `level` | OK |

**Status:** Fully aligned. No action needed.

### 5. certifications Field (MATCH)

| Dify Workflow Output | Backend CertificationEntry | Frontend CertificationEntry | Status |
|---------------------|---------------------------|-----------------------------|--------|
| `name` | ✅ `name` | ✅ `name` | OK |
| `date` | ✅ `date` | ✅ `date` | OK |

**Status:** Fully aligned. No action needed.

### 6. Top-Level Fields (MATCH)

All top-level fields in `CnResumeData` match the Dify workflow output:
- `name`, `phone`, `email`, `date_of_birth`, `age`, `address`, `nationality`, `gender`
- `emergency_contact_address`, `commute_time`, `marital_status`, `dependents_count`
- `expected_salary`, `languages`, `self_introduction`, `portfolio_links`, `other`

**Status:** Fully aligned. No action needed.

---

## Impact Assessment

### Data Loss Analysis

When the Dify workflow returns project experience data:

```json
{
  "project_experience": [
    {
      "project_name": "电商平台重构",
      "associated_company": "ABC科技有限公司",
      "role": "技术负责人",
      "start_date": "2022-03",
      "end_date": "2023-06",
      "description": "负责核心交易系统的微服务化改造..."
    }
  ]
}
```

**Current behavior with Pydantic (extra="ignore" default):**
1. `project_name` → **DROPPED** (not in WorkEntry)
2. `associated_company` → **DROPPED** (not in WorkEntry)
3. `role` → **DROPPED** (not in WorkEntry)
4. `start_date` → Preserved
5. `end_date` → Preserved
6. `description` → Preserved

**Result:** Only dates and description survive. The project's identity and role information are completely lost.

### User Impact

- Users uploading resumes with project experience will see incomplete data in the review step
- Project names will not appear, making it hard to identify which project is being described
- Associated company information is lost
- Role/position information is lost

---

## Recommended Fix

### Option 1: Create Dedicated ProjectEntry Model (RECOMMENDED)

Create a new `ProjectEntry` model that matches the Dify workflow output schema.

**Backend (`backend/app/models/resume.py`):**
```python
class ProjectEntry(BaseModel):
    project_name: str | None = None
    associated_company: str | None = None
    role: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    description: str | None = None
```

**Frontend (`frontend/src/types/resume.ts`):**
```typescript
export interface ProjectEntry {
  project_name: string | null;
  associated_company: string | null;
  role: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
}
```

**Update CnResumeData:**
- Backend: `project_experience: list[ProjectEntry] | None = None`
- Frontend: `project_experience: ProjectEntry[] | null;`

**Pros:**
- Minimal change, surgical fix
- No impact on existing `WorkEntry` usage
- Aligns with Dify output schema exactly
- Follows same pattern as existing `JpProjectEntry`

**Cons:**
- Introduces a new model

### Option 2: Update Dify Workflow Schema

Change the Dify workflow to output `company`, `position`, `department` instead of project-specific fields.

**Pros:**
- No code changes needed

**Cons:**
- Changes AI prompt behavior (risky)
- Project experience is semantically different from work experience
- Less expressive (no `associated_company`, no `project_name` vs `company` distinction)

---

## Conclusion

**Recommended Action:** Implement Option 1 - Create dedicated `ProjectEntry` model.

This is a low-risk, high-impact fix that preserves all data from the Dify extraction workflow and maintains semantic clarity between work experience and project experience.
