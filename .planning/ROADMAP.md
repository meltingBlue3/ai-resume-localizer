# Roadmap: AI Resume Localizer

## Milestones

- ✅ **v1.0 MVP** — Phases 1–5 (shipped 2026-02-20)
- 🚧 **v1.1 Quality & OCR** — Phases 6–8 (in progress)

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

### 🚧 v1.1 Quality & OCR (In Progress)

**Milestone Goal:** Clean up tech debt, improve AI workflow output quality, and add OCR support for scanned PDFs so the system handles image-based resumes with no change to the downstream flow.

- [ ] **Phase 6: Tech Debt Cleanup** - Remove dead PhotoDropzone code and fix the dangling preview 完了 button
- [ ] **Phase 7: Workflow Quality** - Strip CoT tokens from Dify output and improve extraction/translation prompts
- [ ] **Phase 8: OCR Support** - Detect image-based PDFs and preprocess them via OCR before passing text to Dify

## Phase Details

### Phase 6: Tech Debt Cleanup
**Goal**: Dead code is eliminated and the preview step UI behaves correctly
**Depends on**: Nothing (standalone frontend cleanup)
**Requirements**: TECH-01, TECH-02
**Success Criteria** (what must be TRUE):
  1. `PhotoDropzone.tsx` no longer exists in the codebase and `photoFile` field is absent from the Zustand store
  2. The preview step 完了 button either routes the user to a meaningful next destination or is not rendered — it never appears as a non-functional element
  3. The application builds and all existing flows work without errors after the removal
**Plans:** 1 plan
- [ ] 06-01-PLAN.md — Remove dead PhotoDropzone code, photoFile store field, and fix non-functional finish button on preview step

### Phase 7: Workflow Quality
**Goal**: The Dify extraction and translation workflows produce clean, complete output that the backend can reliably parse
**Depends on**: Phase 6 (clean codebase baseline)
**Requirements**: WKFL-01, WKFL-02, WKFL-03, WKFL-04
**Success Criteria** (what must be TRUE):
  1. The backend never encounters raw `<think>...</think>` blocks in the Dify response — extraction workflow strips them before output
  2. As a backend safety net, any residual CoT tags in API responses are stripped before JSON parsing, and parsing does not fail on clean-format resumes
  3. Extraction results for a complete Chinese resume show fewer null fields than before (measurably better field coverage)
  4. Translated Japanese output reads as natural business Japanese — keigo usage is appropriate, phrasing does not feel machine-literal
**Plans:** 2 plans
Plans:
- [ ] 07-01-PLAN.md — Rewrite Dify extraction and translation workflow YMLs with CoT stripping, constrained prompts, sorting code node, and merged single-LLM translation
- [ ] 07-02-PLAN.md — Add backend CoT stripping safety net to DifyClient with unit tests

### Phase 8: OCR Support
**Goal**: Users with scanned or image-based PDF resumes can complete the full conversion flow with no special steps
**Depends on**: Phase 7 (clean Dify input contract established)
**Requirements**: OCRR-01, OCRR-02, OCRR-03
**Success Criteria** (what must be TRUE):
  1. When a user uploads a PDF, the backend correctly classifies it as text-based or image-based before sending to Dify
  2. A user who uploads a scanned PDF sees their resume content successfully extracted — the upload does not fail or return empty fields
  3. OCR-extracted text flows into the Dify extraction workflow identically to text extracted from a native PDF — no separate code path or UI change is required
**Plans**: TBD

## Progress

**Execution Order:** 6 → 7 → 8

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation & Risk Mitigation | v1.0 | 3/3 | Complete | 2026-02-18 |
| 2. Upload & Extraction | v1.0 | 3/3 | Complete | 2026-02-18 |
| 3. Translation & Data Processing | v1.0 | 3/3 | Complete | 2026-02-18 |
| 4. Preview & PDF Generation | v1.0 | 3/3 | Complete | 2026-02-19 |
| 5. Polish & Production Readiness | v1.0 | 2/2 | Complete | 2026-02-19 |
| 6. Tech Debt Cleanup | v1.1 | 0/1 | Not started | - |
| 7. Workflow Quality | v1.1 | 0/2 | Not started | - |
| 8. OCR Support | v1.1 | 0/TBD | Not started | - |
