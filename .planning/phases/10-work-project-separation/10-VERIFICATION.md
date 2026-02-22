---
phase: 10-work-project-separation
verified: 2026-02-22T16:00:00Z
status: passed
score: 7/7 must-haves verified
---

# Phase 10: Work-Project Separation Verification Report

**Phase Goal:** Work history and project experience are clearly separated in data extraction, translation, and both PDF templates
**Verified:** 2026-02-22T16:00:00Z
**Status:** PASSED
**Re-verification:** No - initial verification

## Goal Achievement

### Observable Truths

| #   | Truth | Status | Evidence |
| --- | ----- | ------ | -------- |
| 1 | JpResumeData has a top-level projects field for personal/side projects | ✓ VERIFIED | `backend/app/models/resume.py:120` - `projects: list[JpProjectEntry] \| None = None` |
| 2 | JpWorkEntry has an optional projects field for company-internal projects | ✓ VERIFIED | `backend/app/models/resume.py:95` - `projects: list[JpProjectEntry] \| None = None` |
| 3 | Translation workflow routes personal projects to projects[] and company-internal projects to work_history[].projects | ✓ VERIFIED | `workflow/resume_translation.yml:247-260` - プロジェクト分類ルール section with company/personal classification |
| 4 | work_history contains ONLY employment entries (no merged project_experience) | ✓ VERIFIED | Translation workflow replaces old merge rule with classification rules |
| 5 | Shokumukeirekisho renders company-internal projects within each company block | ✓ VERIFIED | `shokumukeirekisho.html:219-246` - `{% if job.projects %}` with 参画プロジェクト section |
| 6 | Shokumukeirekisho has a separate section for personal/side projects | ✓ VERIFIED | `shokumukeirekisho.html:249-277` - `{% if data.projects %}` with 個人プロジェクト section |
| 7 | Rirekisho shows only company names and dates in work history (no project details) | ✓ VERIFIED | `rirekisho.html:294-310` - Uses `work_history_processed`, 0 references to "projects" |

**Score:** 7/7 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
| -------- | -------- | ------ | ------- |
| `backend/app/models/resume.py` | JpProjectEntry model, projects fields | ✓ VERIFIED | Lines 78-84: JpProjectEntry class; Line 95: JpWorkEntry.projects; Line 120: JpResumeData.projects |
| `frontend/src/types/resume.ts` | TypeScript types matching Pydantic | ✓ VERIFIED | Lines 74-81: JpProjectEntry interface; Line 91: JpWorkEntry.projects; Line 116: JpResumeData.projects |
| `workflow/resume_translation.yml` | Project classification rules | ✓ VERIFIED | Lines 247-260: プロジェクト分類ルール with 会社内/個人 project routing |
| `backend/app/templates/shokumukeirekisho.html` | Project rendering sections | ✓ VERIFIED | Lines 219-246: 参画プロジェクト; Lines 249-277: 個人プロジェクト |
| `backend/app/templates/rirekisho.html` | No project details | ✓ VERIFIED | Work history uses work_history_processed, no project references |

### Key Link Verification

| From | To | Via | Status | Details |
| ---- | -- | --- | ------ | ------- |
| resume_translation.yml | JpResumeData | LLM output schema | ✓ WIRED | Output JSON schema includes `projects[]` and `work_history[].projects[]` |
| JpWorkEntry.projects | JpProjectEntry | embedded array | ✓ WIRED | Pydantic: `list[JpProjectEntry]`; TypeScript: `JpProjectEntry[]` |
| shokumukeirekisho.html | job.projects | Jinja2 loop | ✓ WIRED | Line 219: `{% if job.projects %}`; Line 225: `{% for project in job.projects %}` |
| shokumukeirekisho.html | data.projects | Jinja2 section | ✓ WIRED | Line 250: `{% if data.projects %}`; Line 256: `{% for project in data.projects %}` |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| ----------- | ---------- | ----------- | ------ | -------- |
| RKTPL-04 | 10-01, 10-02 | 履歴書の職歴からプロジェクト経歴を分離する | ✓ SATISFIED | rirekisho.html shows company/date only; separate projects field in data model |
| SKTPL-01 | 10-01, 10-02 | 職務経歴書の職務経歴にプロジェクト経歴を含める | ✓ SATISFIED | shokumukeirekisho.html has 参画プロジェクト (company-internal) and 個人プロジェクト (personal) sections |
| EXTR-03 | 10-01 | PDF出力の問題修正に対応するフィールドマッピングを更新する | ✓ SATISFIED | JpProjectEntry model with proper fields; translation workflow classification |
| TRAN-02 | 10-01 | PDF出力の問題修正に対応するフィールド変換ロジックを修正する | ✓ SATISFIED | Translation workflow has project classification rules (lines 247-260) |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| None | - | - | - | No anti-patterns detected |

### Commits Verified

| Commit | Message | Status |
| ------ | ------- | ------ |
| `46f72ad` | feat(10-01): add JpProjectEntry model and projects fields | ✓ EXISTS |
| `6b433a7` | feat(10-01): add project classification rules to translation workflow | ✓ EXISTS |
| `283ed3f` | feat(10-02): add company-internal projects rendering to work history blocks | ✓ EXISTS |
| `bdb92d5` | feat(10-02): add personal projects section to shokumukeirekisho | ✓ EXISTS |

### Human Verification Required

None - all verification items are programmatically verifiable.

### Summary

**All 4 success criteria from the phase goal are satisfied:**

1. ✅ **Extraction workflow distinguishes company employment from personal/side projects**
   - Data models have separate `JpWorkEntry.projects` (company-internal) and `JpResumeData.projects` (personal)

2. ✅ **Translation workflow preserves work/project separation**
   - Translation prompt has プロジェクト分類ルール section with explicit routing rules for both project types

3. ✅ **Rirekisho shows only company names, positions, and dates**
   - Template uses `work_history_processed` with no project details (0 references to "projects")

4. ✅ **Shokumukeirekisho includes company-internal projects under employment entries and personal projects separately**
   - Template has 参画プロジェクト section within work history blocks AND 個人プロジェクト section as separate section

**All 4 requirement IDs (RKTPL-04, SKTPL-01, EXTR-03, TRAN-02) are satisfied.**

---

_Verified: 2026-02-22T16:00:00Z_
_Verifier: Claude (gsd-verifier)_
