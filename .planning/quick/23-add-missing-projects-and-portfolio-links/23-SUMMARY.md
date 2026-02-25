---
phase: 23-add-missing-projects-and-portfolio-links
plan: 01
subsystem: frontend
tags: [editing, ui, projects, portfolio]
dependency_graph:
  requires: []
  provides: [full JpResumeData editing support]
  affects: [JpResumeFieldEditor.tsx]
tech_stack:
  added: []
  patterns: [nested array editing, collapsible sections]
key_files:
  created: []
  modified:
    - frontend/src/components/review/JpResumeFieldEditor.tsx
    - frontend/src/i18n/locales/ja/wizard.json
    - frontend/src/i18n/locales/zh/wizard.json
decisions:
  - Nested projects editing inside each work entry (not separate section)
  - Portfolio links section placed before Other section
metrics:
  duration: 5min
  completed_date: 2026-02-25
  tasks: 2
  files: 3
---

# Quick Task 23: Add Missing Projects and Portfolio Links Summary

## One-liner

Added complete editing support for company-internal projects (nested within work entries) and portfolio links in JpResumeFieldEditor.

## What Changed

### 1. Projects Editing Within Work History Entries

- Added `JpProjectEntry` type import
- Updated `emptyWork` to include `projects: []`
- Added nested projects editing UI inside each work entry:
  - Collapsible "参画プロジェクト" (Participating Projects) section
  - Fields: name, role, start_date, end_date, description, technologies
  - Add/Remove buttons for each project within a work entry

### 2. Portfolio Links Editing Section

- Added `CollapsibleSection` for portfolio links before "Other" section
- Supports add/edit/remove portfolio links as string array
- Follows same pattern as ResumeFieldEditor.tsx

### 3. i18n Keys Added

- `participatingProjects`: 参画プロジェクト / 参与项目
- `portfolioLinks`: ポートフォリオリンク / 作品集链接
- `addProject`: プロジェクトを追加 / 添加项目

## Files Modified

| File | Changes |
|------|---------|
| `frontend/src/components/review/JpResumeFieldEditor.tsx` | Added JpProjectEntry import, emptyWork.projects, nested projects UI, portfolio links section |
| `frontend/src/i18n/locales/ja/wizard.json` | Added 3 new i18n keys |
| `frontend/src/i18n/locales/zh/wizard.json` | Added 3 new i18n keys |

## Deviations from Plan

None - plan executed exactly as written.

## Verification

- `npm run build` passes with no TypeScript errors
- `entry.projects` references: 9 (>= 3 required)
- `portfolio_links` references: 5 (>= 3 required)

## Commits

| Hash | Message |
|------|---------|
| `a3d4b61` | feat(23): add projects editing within Work History entries |
| `f164eb3` | feat(23): add portfolio_links editing section |

## Self-Check: PASSED

- [x] Files exist: JpResumeFieldEditor.tsx, wizard.json (ja/zh)
- [x] Commits exist: a3d4b61, f164eb3
- [x] Build passes
