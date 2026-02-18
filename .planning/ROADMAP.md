# Roadmap: AI Resume Localizer

## Overview

Transform a Chinese resume into two production-quality Japanese PDF documents (履歴書 + 職務経歴書) through a guided 5-step wizard with AI extraction, translation, and human review. The roadmap de-risks the hardest problem first (JIS grid layout in WeasyPrint), builds the pipeline linearly mirroring the user flow (upload → extract → translate → preview → download), and polishes cross-cutting UX concerns last when the full pipeline is functional.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation & Risk Mitigation** - Project scaffolding, data schema, wizard shell, i18n, and JIS template validation in WeasyPrint
- [x] **Phase 2: Upload & Extraction** - Resume file upload, Dify AI extraction, and side-by-side review/edit
- [ ] **Phase 3: Translation & Data Processing** - Dify AI translation, Japanese-specific data processing, and side-by-side review/edit
- [ ] **Phase 4: Preview & PDF Generation** - Dynamic template rendering, HTML preview, photo crop, and PDF download
- [ ] **Phase 5: Polish & Production Readiness** - Loading states, error handling, completeness indicator, and end-to-end hardening

## Phase Details

### Phase 1: Foundation & Risk Mitigation
**Goal**: Users can navigate a bilingual step-by-step wizard shell, and the JIS 履歴書/職務経歴書 HTML templates are validated as A4 PDFs via WeasyPrint with bundled CJK fonts
**Depends on**: Nothing (first phase)
**Requirements**: UXUI-01, UXUI-02, UXUI-03, UXUI-04, UXUI-05
**Success Criteria** (what must be TRUE):
  1. User can navigate through a 5-step wizard (Upload → Review Extraction → Review Translation → Preview → Download) with placeholder content at each step
  2. User can navigate back to any previous step without losing data entered in other steps
  3. User can view the entire UI in Chinese (primary) or Japanese (secondary) and switch languages at any time
  4. A static 履歴書 HTML template renders correctly as an A4 PDF via WeasyPrint with JIS-standard grid layout and all CJK characters displaying properly (no tofu glyphs)
  5. A static 職務経歴書 HTML template renders correctly as an A4 PDF via WeasyPrint with proper formatting
**Plans**: 3 plans

Plans:
- [x] 01-01-PLAN.md — Frontend wizard shell with i18n (Vite + React + Tailwind + Zustand + react-i18next)
- [x] 01-02-PLAN.md — Backend scaffold & 履歴書 HTML template (FastAPI + CJK fonts + MHLW-format grid)
- [x] 01-03-PLAN.md — 職務経歴書 template & PDF validation (WeasyPrint service + pytest + human verify)

### Phase 2: Upload & Extraction
**Goal**: Users can upload a Chinese resume (PDF/DOCX) with optional photo and review AI-extracted structured data in a side-by-side editor
**Depends on**: Phase 1 (wizard shell, data schema)
**Requirements**: UPLD-01, UPLD-02, UPLD-03, EXTR-01, EXTR-02, EXTR-03, EXTR-04, EXTR-05
**Success Criteria** (what must be TRUE):
  1. User can upload a Chinese resume in PDF or DOCX format and optionally attach a photo
  2. System extracts structured Chinese JSON from the uploaded resume via Dify workflow, normalizing varying formats into the canonical schema with missing fields marked as null
  3. User can review extracted data in a side-by-side view (original resume on left, structured fields on right) and edit any field before proceeding to translation
**Plans**: 3 plans

Plans:
- [x] 02-01-PLAN.md — Backend pipeline: Pydantic data models, text extraction (PyMuPDF + python-docx), Dify client, POST /api/upload-and-extract endpoint
- [x] 02-02-PLAN.md — Upload UI: typed Zustand store, API client, react-dropzone file/photo upload, UploadStep replacement
- [x] 02-03-PLAN.md — Review UI: DocumentViewer (react-pdf + docx-preview), ResumeFieldEditor, side-by-side ReviewExtractionStep + human verify

### Phase 3: Translation & Data Processing
**Goal**: Users can review and edit AI-translated Japanese resume data with furigana, credential mapping, keigo, era dates, and culture tips applied
**Depends on**: Phase 2 (extraction output as translation input)
**Requirements**: TRAN-01, TRAN-02, TRAN-03, TRAN-04, TRAN-05, TRAN-06, TRAN-07, TRAN-08, DOCG-06
**Success Criteria** (what must be TRUE):
  1. System translates Chinese resume fields to natural Japanese business language via Dify workflow with appropriate honorific/keigo levels applied
  2. User can review translation in a side-by-side view (Chinese fields on left, editable Japanese fields on right) and edit any field before proceeding
  3. Chinese names have katakana furigana auto-generated, and Chinese education credentials are mapped to Japanese equivalents (本科→学士, 硕士→修士, etc.)
  4. All dates in the translated data are converted to Japanese era format (和暦) with correct era boundaries and 元年 handling
  5. System provides contextual Japanese resume culture tips at relevant fields via tooltips
**Plans**: 3 plans

Plans:
- [ ] 03-01-PLAN.md — Backend translation pipeline (JpResumeData schema, DifyClient.translate_resume(), POST /api/translate)
- [ ] 03-02-PLAN.md — Frontend data layer (JpResumeData TS types, wareki.ts, credentials.ts, store expansion, translateResume API client)
- [ ] 03-03-PLAN.md — ReviewTranslationStep UI (JpResumeFieldEditor, FieldTooltip culture tips, side-by-side layout, human verify)

### Phase 4: Preview & PDF Generation
**Goal**: Users can preview and download production-quality 履歴書 and 職務経歴書 as A4 PDFs with photo, correct fonts, and proper null-field handling
**Depends on**: Phase 3 (translated Japanese data), Phase 1 (validated HTML templates)
**Requirements**: DOCG-01, DOCG-02, DOCG-03, DOCG-04, DOCG-05, DOCG-07, DOCG-08, DOCG-09, DOCG-10, DOCG-11
**Success Criteria** (what must be TRUE):
  1. User can preview both 履歴書 (JIS standard) and 職務経歴書 rendered with their actual translated resume data in the browser
  2. User can upload and crop a photo to 3:4 ratio for the 履歴書, or see an appropriate placeholder when no photo is provided
  3. User can edit fields directly in the preview stage and see changes reflected immediately
  4. User can download both documents as properly formatted A4 PDFs with bundled CJK fonts (Noto Sans JP) and null/missing fields displayed as "未記入" or appropriate empty formatting
**Plans**: TBD

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD
- [ ] 04-03: TBD

### Phase 5: Polish & Production Readiness
**Goal**: The application handles all edge cases gracefully with informative feedback, production-quality error states, and data completeness visibility
**Depends on**: Phase 4 (full pipeline functional end-to-end)
**Requirements**: UXUI-06, UXUI-07, UXUI-08
**Success Criteria** (what must be TRUE):
  1. User sees descriptive loading states with stage-specific progress messages during AI extraction and translation processing
  2. System displays clear, actionable error messages when Dify API calls or other operations fail, without crashing or losing user data
  3. User can see a completeness indicator showing what percentage of resume fields are filled at any point in the workflow
**Plans**: TBD

Plans:
- [ ] 05-01: TBD
- [ ] 05-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Risk Mitigation | 3/3 | ✓ Complete | 2026-02-18 |
| 2. Upload & Extraction | 3/3 | ✓ Complete | 2026-02-18 |
| 3. Translation & Data Processing | 0/3 | Not started | - |
| 4. Preview & PDF Generation | 0/TBD | Not started | - |
| 5. Polish & Production Readiness | 0/TBD | Not started | - |
