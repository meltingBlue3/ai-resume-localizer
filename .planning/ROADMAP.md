# Roadmap: AI Resume Localizer

## Milestones

- ✅ **v1.0 MVP** — Phases 1–5 (shipped 2026-02-20)
- ✅ **v1.1 Quality & OCR** — Phases 6–8 (shipped 2026-02-21)
- 🚧 **v1.2 PDF Quality & Workflow Fixes** — Phases 9–11 (in progress)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1–5) — SHIPPED 2026-02-20</summary>

- [x] Phase 1: Foundation & Risk Mitigation (3/3 plans) — completed 2026-02-18
- [x] Phase 2: Upload & Extraction (3/3 plans) — completed 2026-02-18
- [x] Phase 3: Translation & Data Processing (3/3 plans) — completed 2026-02-18
- [x] Phase 4: Preview & PDF Generation (3/3 plans) — completed 2026-02-19
- [x] Phase 5: Polish & Production Readiness (2/2 plans) — completed 2026-02-19

Full details: `.planning/milestones/v1.0-ROADMAP.md`

</details>

<details>
<summary>✅ v1.1 Quality & OCR (Phases 6–8) — SHIPPED 2026-02-21</summary>

- [x] Phase 6: Tech Debt Cleanup (1/1 plan) — completed 2026-02-20
- [x] Phase 7: Workflow Quality (2/2 plans) — completed 2026-02-20
- [x] Phase 8: OCR Support (2/2 plans) — completed 2026-02-20

Full details: `.planning/milestones/v1.1-ROADMAP.md`

</details>

### 🚧 v1.2 PDF Quality & Workflow Fixes (In Progress)

**Milestone Goal:** Fix PDF output quality issues and update Dify workflow prompts to produce correct field structures for template rendering.

- [ ] **Phase 9: Workflow Data Cleanup** — Add missing fields, consolidate language certs, remove unused fields in Dify prompts
- [ ] **Phase 10: Work-Project Separation** — Separate work history from project experience across both workflows and both templates
- [ ] **Phase 11: Template Polish** — Fix remaining rirekisho layout issues and shokumukeirekisho end-date display

## Phase Details

### Phase 9: Workflow Data Cleanup
**Goal**: Dify extraction and translation workflows produce clean, complete field structures with no unused fields
**Depends on**: Nothing (first phase of v1.2)
**Requirements**: EXTR-01, EXTR-02, TRAN-01
**Success Criteria** (what must be TRUE):
  1. Extraction workflow outputs an `other` field containing miscellaneous resume information (hobbies, self-PR, etc.) that does not fit other structured fields
  2. Language certifications (JLPT, HSK, TOEIC, etc.) appear inside the `certificates` array rather than as standalone entries or in a separate language section
  3. Translation workflow no longer outputs `linkedin`, `website`, `gpa`, or `notes` fields in its JSON response
  4. All Dify prompt changes follow DESIGN_PRINCIPLES.md conventions (constraint-style prompts, no CoT leakage)
**Plans**: TBD

Plans:
- [ ] 09-01: TBD
- [ ] 09-02: TBD

### Phase 10: Work-Project Separation
**Goal**: Work history and project experience are clearly separated in data extraction, translation, and both PDF templates
**Depends on**: Phase 9 (clean field structure required before restructuring)
**Requirements**: RKTPL-04, SKTPL-01, EXTR-03, TRAN-02
**Success Criteria** (what must be TRUE):
  1. Extraction workflow distinguishes company employment entries from personal/side project entries in its output structure
  2. Translation workflow preserves the work/project separation and correctly maps fields for both templates
  3. Rirekisho (履歴書) work history section shows only company names, positions, and dates -- no project details
  4. Shokumukeirekisho (職務経歴書) includes company-internal projects under the relevant employment entry, and personal projects in a separate section
**Plans**: TBD

Plans:
- [ ] 10-01: TBD
- [ ] 10-02: TBD

### Phase 11: Template Polish
**Goal**: Both PDF templates render all fields correctly with proper Japanese formatting conventions
**Depends on**: Phase 10 (field structure must be finalized before cosmetic template fixes)
**Requirements**: RKTPL-01, RKTPL-02, RKTPL-03, RKTPL-05, RKTPL-06, SKTPL-02
**Success Criteria** (what must be TRUE):
  1. Rirekisho displays full name with a full-width space (U+3000) separating family name and given name
  2. Rirekisho address section includes postal code (e.g., 〒123-4567) before the address text
  3. Rirekisho work history entries include the job title/position for each employment period
  4. Rirekisho no longer contains commute time, dependents, or spouse fields -- those rows are removed from the template
  5. Rirekisho personal wishes section defaults to "貴社の規定に従います" when the user has not entered specific preferences
  6. Shokumukeirekisho displays "現在" for ongoing positions instead of "none" or blank when no end date exists

**Plans**: TBD

Plans:
- [ ] 11-01: TBD
- [ ] 11-02: TBD

## Progress

**Execution Order:** Phase 9 → 10 → 11

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation & Risk Mitigation | v1.0 | 3/3 | Complete | 2026-02-18 |
| 2. Upload & Extraction | v1.0 | 3/3 | Complete | 2026-02-18 |
| 3. Translation & Data Processing | v1.0 | 3/3 | Complete | 2026-02-18 |
| 4. Preview & PDF Generation | v1.0 | 3/3 | Complete | 2026-02-19 |
| 5. Polish & Production Readiness | v1.0 | 2/2 | Complete | 2026-02-19 |
| 6. Tech Debt Cleanup | v1.1 | 1/1 | Complete | 2026-02-20 |
| 7. Workflow Quality | v1.1 | 2/2 | Complete | 2026-02-20 |
| 8. OCR Support | v1.1 | 2/2 | Complete | 2026-02-20 |
| 9. Workflow Data Cleanup | v1.2 | 0/? | Not started | - |
| 10. Work-Project Separation | v1.2 | 0/? | Not started | - |
| 11. Template Polish | v1.2 | 0/? | Not started | - |
