---
phase: quick
plan: 24
subsystem: frontend
tags: [ux, section-reorder, chinese-editor]
dependency_graph:
  requires: []
  provides: [project-experience-visibility]
  affects: [ResumeFieldEditor]
tech_stack:
  added: []
  patterns: [CollapsibleSection extraction]
key_files:
  created: []
  modified:
    - frontend/src/components/review/ResumeFieldEditor.tsx
decisions:
  - Extract Portfolio Links to standalone section (following JpResumeFieldEditor pattern)
metrics:
  duration: 5min
  completed_date: 2026-02-25
---

# Quick Task 24: Project Experience Position Adjustment Summary

## One-liner

Moved project experience section from nested "Other" to standalone section between Work Experience and Skills in Chinese resume editor, with Portfolio Links also extracted to improve section organization.

## Changes Made

### Section Reordering in ResumeFieldEditor.tsx

**Before:**
1. Personal Info
2. Education
3. Work Experience
4. Skills
5. Certifications
6. Languages
7. Other (contains project_experience + portfolio_links + self_introduction + other)

**After:**
1. Personal Info
2. Education
3. Work Experience
4. **Project Experience** ← NEW standalone section
5. Skills
6. Certifications
7. Languages
8. **Portfolio Links** ← Extracted to standalone section
9. Other (only self_introduction + other)

### Technical Details

- Extracted Project Experience block (previously nested inside "Other") into its own `CollapsibleSection` component
- Positioned Project Experience between Work Experience and Skills for better logical flow
- Extracted Portfolio Links to standalone section following JpResumeFieldEditor pattern
- Simplified "Other" section to contain only self_introduction and other fields

## Deviations from Plan

None - plan executed exactly as written.

## Verification

- [x] TypeScript build passes (`npm run build`)
- [x] Project Experience section appears as standalone CollapsibleSection
- [x] Project Experience positioned between Work Experience and Skills
- [x] "Other" section no longer contains project_experience or portfolio_links UI

## Commit

- `c5252f7`: feat(24): move project experience section between work and skills
