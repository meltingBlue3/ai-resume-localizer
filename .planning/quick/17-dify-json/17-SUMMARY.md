---
phase: quick
plan: "17"
subsystem: data-models
tags: [dify, json-schema, i18n, types]
requires: []
provides: [updated-data-models-for-dify-json]
affects: [backend, frontend, templates]
tech-stack:
  added:
    - portfolio_links field (string[])
    - personal_projects field (JpProjectEntry[])
    - desired_conditions field (string)
  patterns:
    - Field additions to Pydantic models
    - TypeScript interface synchronization
    - i18n translation updates
key-files:
  created: []
  modified:
    - backend/app/models/resume.py
    - frontend/src/types/resume.ts
    - backend/app/services/template_renderer.py
    - backend/app/templates/rirekisho.html
    - backend/app/templates/shokumukeirekisho.html
    - frontend/src/components/review/ResumeFieldEditor.tsx
    - frontend/src/components/review/JpResumeFieldEditor.tsx
    - frontend/src/utils/completeness.ts
    - frontend/src/i18n/locales/zh/wizard.json
    - frontend/src/i18n/locales/ja/wizard.json
decisions:
  - Use personal_projects instead of projects for JpResumeData to distinguish from company-internal projects
  - Use desired_conditions for rirekisho 本人希望記入欄 with fallback to other
  - Remove deprecated fields (awards, career_objective) from CnResumeData
metrics:
  duration: 15min
  tasks: 5
  files: 10
  completed: 2026-02-23
---

# Quick Task 17: 更新dify工作流提示词和中文日文输出json字段

## One-liner

Updated backend and frontend data models to match new Dify JSON schema with additional fields for personal info, portfolio links, and desired conditions.

## Changes Summary

### Backend Changes
- **CnResumeData**: Added 7 new fields (age, emergency_contact_address, commute_time, marital_status, dependents_count, expected_salary, portfolio_links); removed 2 deprecated fields (awards, career_objective)
- **JpPersonalInfo**: Added 5 new fields (age, emergency_contact_address, marital_status, dependents_count, commute_time)
- **JpResumeData**: Replaced `projects` with `personal_projects`, added `desired_conditions` and `portfolio_links`
- **template_renderer.py**: Added normalization for `personal_projects` and `portfolio_links`
- **rirekisho.html**: Updated 本人希望記入欄 to use `desired_conditions` with fallback to `other`
- **shokumukeirekisho.html**: Changed `data.projects` to `data.personal_projects`

### Frontend Changes
- **resume.ts**: Synchronized TypeScript interfaces with backend Pydantic models
- **ResumeFieldEditor.tsx**: Added new field editors, removed deprecated sections
- **JpResumeFieldEditor.tsx**: Added new personal_info fields and desired_conditions
- **completeness.ts**: Updated field count logic (CnResumeData: 15→16 fields, JpResumeData: 15→17 fields)
- **i18n (zh/ja)**: Added translations for all new fields

## Task Completion

| Task | Description | Status | Commit |
|------|-------------|--------|--------|
| 1 | Update backend data models | ✅ | b1b8dc3 |
| 2 | Update frontend type definitions | ✅ | cb7f965 |
| 3 | Update template renderer and HTML templates | ✅ | 32e5d48 |
| 4 | Update frontend editor components | ✅ | 43ecc81 |
| 5 | Update i18n translation files | ✅ | 4cc8572 |

## Deviations from Plan

None - plan executed exactly as written.

## Testing

- Backend Python syntax verified via `py_compile`
- Frontend TypeScript compilation verified via `tsc --noEmit`
- All 5 tasks completed successfully

## Commits

```
4cc8572 feat(17-dify-json): update i18n translations for new fields
43ecc81 feat(17-dify-json): update frontend editor components for new fields
32e5d48 feat(17-dify-json): update template renderer and HTML templates
cb7f965 feat(17-dify-json): update frontend type definitions for new Dify JSON schema
b1b8dc3 feat(17-dify-json): update backend data models for new Dify JSON schema
```

## Self-Check: PASSED

- All 10 modified files verified to exist
- All 5 commits verified in git history
