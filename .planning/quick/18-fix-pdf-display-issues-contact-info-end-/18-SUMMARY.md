---
phase: 18-fix-pdf-display-issues
plan: 01
subsystem: pdf-rendering, frontend-ui
tags: [bugfix, ui, i18n]
dependency_graph:
  requires: []
  provides: [PDF-DISPLAY-01, PDF-DISPLAY-02, PDF-DISPLAY-03, PDF-DISPLAY-04]
  affects: [rirekisho.html, shokumukeirekisho.html, template_renderer.py, JpResumeFieldEditor.tsx]
tech-stack:
  added: []
  patterns: [Jinja2 conditionals, React form components, i18n translation keys]
key-files:
  created: []
  modified:
    - backend/app/templates/rirekisho.html
    - backend/app/services/template_renderer.py
    - frontend/src/components/review/JpResumeFieldEditor.tsx
    - frontend/src/i18n/locales/zh/wizard.json
    - frontend/src/i18n/locales/ja/wizard.json
decisions:
  - Keep JpCertificationEntry type with issuer/score for backward compatibility
metrics:
  duration: 5min
  tasks: 3
  files: 5
  completed_date: 2026-02-23
---

# Quick Task 18: Fix PDF Display Issues Summary

## One-liner

Fixed contact info display, project end_date normalization for PDF rendering, added personal projects UI section, and simplified certification form.

## Changes Made

### Task 1: Fix contact info and end date display in PDF templates

**Files modified:**
- `backend/app/templates/rirekisho.html`
- `backend/app/services/template_renderer.py`

**Changes:**
- Updated 連絡先 (contact info) row in rirekisho.html to show `emergency_contact_address` when populated, otherwise display placeholder hint
- Added project end_date normalization in `prepare_context()`:
  - Normalizes embedded projects within work_history entries
  - Normalizes top-level personal_projects entries
  - Converts "none"/"null"/empty strings to `None` for proper "現在" display

### Task 2: Add personal projects section to Japanese review UI

**Files modified:**
- `frontend/src/components/review/JpResumeFieldEditor.tsx`
- `frontend/src/i18n/locales/zh/wizard.json`
- `frontend/src/i18n/locales/ja/wizard.json`

**Changes:**
- Added new CollapsibleSection for personal projects with full CRUD operations
- Fields included: name, role, start_date, end_date, description, technologies
- Added translation keys for all new labels in both zh and ja locales

### Task 3: Remove issuer and score fields from certification form

**Files modified:**
- `frontend/src/components/review/JpResumeFieldEditor.tsx`

**Changes:**
- Removed issuer and score FieldInput fields from certifications section
- Updated emptyCert constant to only include name and date
- TypeScript type (JpCertificationEntry) unchanged for backward compatibility

## Deviations from Plan

None - plan executed exactly as written.

## Verification

- [x] Project end_date normalization verified with Python unit test
- [x] Frontend build passes without TypeScript errors
- [x] All i18n translations added for new UI labels

## Commits

| Hash | Message |
|------|---------|
| 90ffbee | refactor(18-01): simplify certification form to name and date only |
| faa09dc | feat(18-01): add personal projects section to Japanese review UI |
| 3802256 | fix(18-01): fix contact info display and project date normalization |

## Self-Check: PASSED

All files and commits verified.
