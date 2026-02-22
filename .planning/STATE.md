# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-22)

**Core value:** 用户上传一份中文简历，经过结构化提取、日文翻译、人工审核修正后，得到两份符合日本企業招聘标准的PDF简历（履歴書 + 職務経歴書）
**Current focus:** v1.2 Phase 10 — Work-Project Separation

## Current Position

```
Milestone : v1.2 PDF Quality & Workflow Fixes
Phase     : 10 of 11 (Work-Project Separation) — COMPLETE
Plan      : 2 of 2 complete
Status    : Complete
Progress  : [████████░░] 83%
```

Last activity: 2026-02-22 — Completed 10-02 (template rendering for projects)

## Performance Metrics

| Metric | v1.0 | v1.1 | v1.2 |
|--------|------|------|------|
| Phases complete | 5/5 | 3/3 | 1/3 |
| Plans complete | 14/14 | 5/5 | 3/? |
| Requirements mapped | 17/17 | 9/9 | 13/13 |

**Phase 10 metrics:**
| Plan | Duration | Tasks | Files |
|------|----------|-------|-------|
| P01 | 21min | 3 | 3 |
| P02 | 3min | 3 | 1 |

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

### Pending Todos

None.

### Blockers/Concerns

- Dify Cloud free tier limited to 200 message credits
- DESIGN_PRINCIPLES.md must be followed for all Dify prompt changes in v1.2

### Quick Tasks Completed

| # | Description | Date | Commit |
|---|-------------|------|--------|
| 16 | Update DESIGN_PRINCIPLES.md | 2026-02-21 | 4169a78 |
| 15 | Fix OCR error classification | 2026-02-21 | 6fc36fe |

## Session Continuity

Last session: 2026-02-22
Stopped At: Completed 10-02-PLAN.md (Phase 10 complete)
Resume: Phase 11 or milestone completion
