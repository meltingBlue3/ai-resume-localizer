# Requirements: AI Resume Localizer

**Defined:** 2026-02-20
**Core Value:** 用户上传一份中文简历，经过结构化提取、日文翻译、人工审核修正后，得到两份符合日本企业招聘标准的PDF简历（履歴書 + 職務経歴書）

## v1.1 Requirements

Requirements for v1.1 Quality & OCR milestone. Each maps to roadmap phases (starting from Phase 6).

### Tech Debt (TECH)

- [x] **TECH-01**: Dead component `PhotoDropzone.tsx` and `photoFile` store field are removed from the codebase
- [x] **TECH-02**: Preview step 完了 button either navigates to a meaningful destination or is removed if no next step exists

### Workflow Quality (WKFL)

- [ ] **WKFL-01**: Dify extraction workflow strips `<think>...</think>` chain-of-thought tokens before outputting, so backend always receives clean structured JSON
- [ ] **WKFL-02**: Dify extraction prompts improved — better field coverage, fewer null fields for complete resumes
- [ ] **WKFL-03**: Dify translation prompts improved — more natural business Japanese, better keigo usage
- [x] **WKFL-04**: Backend API layer strips any residual CoT tags as a safety net before JSON parsing

### OCR Support (OCRR)

- [ ] **OCRR-01**: System detects whether an uploaded PDF has extractable text or is image/scan-based
- [ ] **OCRR-02**: User can upload a scanned or image-based PDF and have its content successfully extracted via OCR preprocessing
- [ ] **OCRR-03**: OCR output is passed to the Dify extraction workflow as text input — same downstream flow as text-based PDFs

## Future Requirements

Deferred from v1.0 — still pending.

### Batch Processing

- **BATC-01**: User can upload multiple resume files for batch conversion
- **BATC-02**: System processes multiple resumes with a queue and progress tracking

### User Accounts

- **ACCT-01**: User can create an account and save resume conversion history
- **ACCT-02**: User can re-edit previously converted resumes

### Additional Documents

- **ADOC-01**: System generates 送付状 (cover letter) from resume context
- **ADOC-02**: System supports multiple 職務経歴書 layout variants (functional, career-based)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Real-time collaborative editing | WebSocket complexity not justified for single-user use case |
| Direct job board submission | Fragile APIs, partnership requirements, massive integration surface |
| ATS optimization scoring | Irrelevant for JIS-format resumes in Japanese hiring culture |
| Template gallery / custom designs | 履歴書 has ONE correct JIS format; creative templates hurt applicants |
| Handwriting font simulation | Digital submission is now standard; fake handwriting looks unprofessional |
| Mobile app | Web-first approach; mobile can be considered after validation |
| User authentication | Adds auth/data storage/compliance complexity without justification |
| Cloud OCR APIs (Google Vision, Azure) | External dependency and cost; local OCR sufficient for v1.1 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| TECH-01 | Phase 6 | Complete |
| TECH-02 | Phase 6 | Complete |
| WKFL-01 | Phase 7 | Pending |
| WKFL-02 | Phase 7 | Pending |
| WKFL-03 | Phase 7 | Pending |
| WKFL-04 | Phase 7 | Complete |
| OCRR-01 | Phase 8 | Pending |
| OCRR-02 | Phase 8 | Pending |
| OCRR-03 | Phase 8 | Pending |

**Coverage:**
- v1.1 requirements: 9 total
- Mapped to phases: 9 (complete)
- Unmapped: 0

---
*Requirements defined: 2026-02-20*
*Last updated: 2026-02-20 after v1.1 roadmap creation*
