# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-22)

**Core value:** 用户上传一份中文简历，经过结构化提取、日文翻译、人工审核修正后，得到两份符合日本企業招聘标准的PDF简历（履歴書 + 職務経歴書）
**Current focus:** v1.2 Phase 11 — Template Polish

## Current Position

```
Milestone : v1.2 PDF Quality & Workflow Fixes
Phase     : 11 of 11 (Template Polish) — COMPLETE
Plan      : 2 of 2 complete
Status    : Complete
Progress  : [██████████] 100%
```

Last activity: 2026-02-23 - Completed quick task 18: Fix PDF display issues (contact info, project dates, personal projects UI)

## Performance Metrics

| Metric | v1.0 | v1.1 | v1.2 |
|--------|------|------|------|
| Phases complete | 5/5 | 3/3 | 3/3 |
| Plans complete | 14/14 | 5/5 | 5/5 |
| Requirements mapped | 17/17 | 9/9 | 13/13 |

**Phase 10 metrics:**
| Plan | Duration | Tasks | Files |
|------|----------|-------|-------|
| P01 | 21min | 3 | 3 |
| P02 | 3min | 3 | 1 |

**Phase 11 metrics:**
| Plan | Duration | Tasks | Files |
|------|----------|-------|-------|
| P01 | 13min | 4 | 3 |
| P02 | 4min | 2 | 1 |

## Accumulated Context

### Decisions

All major decisions logged in PROJECT.md Key Decisions table.

**v1.1 specific:**
- CoT stripping: dual defense (Dify workflow + backend safety net)
- OCR: local Tesseract only, 100-char threshold, 30s timeout
- OCR errors use generic user-facing messages

**v1.2 specific:**
- hobbies renamed to other across entire stack (broader catch-all for misc resume info)
- languages field: spoken ability only; language certs (JLPT, HSK, TOEIC, etc.) go to certifications
- Plan 09-02 required no code changes: all frontend work was completed in 09-01 auto-fix deviations
- JpProjectEntry model added for project data; projects field added to JpWorkEntry (embedded) and JpResumeData (top-level)
- Translation workflow updated with project classification rules (会社内プロジェクト vs 個人プロジェクト)
- Shokumukeirekisho template renders company-internal projects within work blocks (参画プロジェクト) and personal projects as separate section (個人プロジェクト)
- postal_code field added to JpPersonalInfo; Dify workflow extracts from address field
- Name formatting with U+3000 (full-width space) separator for Japanese resume display
- end_date normalization: "none"/"null" strings converted to None in prepare_context() for proper 現在 display
- Rirekisho template: removed commute/dependents/spouse section entirely (not needed for modern resumes)
- Rirekisho template: position/title displayed after company name in work history entries

### Pending Todos

None.

### Blockers/Concerns

- Dify Cloud free tier limited to 200 message credits
- DESIGN_PRINCIPLES.md must be followed for all Dify prompt changes in v1.2

### Quick Tasks Completed

| # | Description | Date | Commit |
|---|-------------|------|--------|
| 18 | Fix PDF display issues (contact info, project dates, personal projects UI) | 2026-02-23 | e2f760b |
| 17 | 更新dify工作流提示词和中文日文输出json字段 | 2026-02-23 | 08a56ca |
| 16 | Update DESIGN_PRINCIPLES.md | 2026-02-21 | 4169a78 |
| 15 | Fix OCR error classification | 2026-02-21 | 6fc36fe |

## Session Continuity

Last session: 2026-02-23
Stopped At: Completed quick task 18 (Fix PDF display issues)
Resume: Continue with v1.2 maintenance or v1.3 planning
