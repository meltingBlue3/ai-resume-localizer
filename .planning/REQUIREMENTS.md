# Requirements: AI Resume Localizer

**Defined:** 2026-02-18
**Core Value:** 用户上传一份中文简历，经过结构化提取、日文翻译、人工审核修正后，得到两份符合日本企业招聘标准的PDF简历（履歴書 + 職務経歴書）

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Upload & Extraction

- [ ] **UPLD-01**: User can upload a Chinese resume file in PDF format
- [ ] **UPLD-02**: User can upload a Chinese resume file in DOCX format
- [ ] **UPLD-03**: User can optionally upload a photo alongside the resume file
- [ ] **EXTR-01**: System extracts structured data from uploaded resume via Dify extraction workflow, outputting standardized Chinese JSON
- [ ] **EXTR-02**: System normalizes varying Chinese resume formats into a canonical data schema (smart field mapping)
- [ ] **EXTR-03**: System marks missing/unrecognized fields as null rather than hallucinating data
- [ ] **EXTR-04**: User can review extracted data in a side-by-side view (original resume on left, structured fields on right)
- [ ] **EXTR-05**: User can edit any extracted field before proceeding to translation

### Translation

- [ ] **TRAN-01**: System translates extracted Chinese data to Japanese via Dify translation workflow (dual-node: core translation + localization)
- [ ] **TRAN-02**: Translation produces natural Japanese business language, not literal translation
- [ ] **TRAN-03**: User can review translation in a side-by-side view (Chinese fields on left, Japanese fields on right)
- [ ] **TRAN-04**: User can edit any Japanese translated field before proceeding to generation
- [ ] **TRAN-05**: System auto-generates katakana furigana from Chinese name (pinyin → katakana mapping)
- [ ] **TRAN-06**: System maps Chinese education credentials to Japanese equivalents (本科→大学卒業/学士, 专科→短期大学卒業, 硕士→大学院修了/修士, 博士→大学院修了/博士)
- [ ] **TRAN-07**: Translation applies appropriate honorific/keigo language levels (です/ます form for 職務経歴書, humble form for motivation sections)
- [ ] **TRAN-08**: System provides contextual Japanese resume culture tips at relevant fields (tooltips explaining what Japanese employers expect)

### Document Generation

- [ ] **DOCG-01**: System generates 履歴書 HTML following JIS standard format (post-2021 revision)
- [ ] **DOCG-02**: System generates 職務経歴書 HTML following standard chronological format
- [ ] **DOCG-03**: User can preview both 履歴書 and 職務経歴書 as rendered HTML in the browser before downloading
- [ ] **DOCG-04**: User can download 履歴書 as a properly formatted A4 PDF
- [ ] **DOCG-05**: User can download 職務経歴書 as a properly formatted A4 PDF
- [ ] **DOCG-06**: System converts dates to Japanese era format (和暦: 令和/平成/昭和) with correct era boundaries and 元年 handling
- [ ] **DOCG-07**: User can upload and crop a photo to 3:4 ratio for the 履歴書
- [ ] **DOCG-08**: System uses a placeholder when no photo is provided
- [ ] **DOCG-09**: User can edit fields directly in the preview stage (changes reflect immediately)
- [ ] **DOCG-10**: PDF renders correctly with bundled CJK fonts (Noto Sans JP), no missing character glyphs
- [ ] **DOCG-11**: Null/missing fields display as "未記入" or appropriate empty formatting in the PDF, not blank space or errors

### User Experience

- [ ] **UXUI-01**: Application follows a step-by-step wizard flow: Upload → Review Extraction → Review Translation → Preview → Download
- [ ] **UXUI-02**: User can navigate back to previous steps without losing data
- [ ] **UXUI-03**: UI is available in Chinese (中文) as primary language
- [ ] **UXUI-04**: UI is available in Japanese (日本語) as secondary language
- [ ] **UXUI-05**: User can switch between Chinese and Japanese UI at any time
- [ ] **UXUI-06**: System shows loading states with descriptive progress during AI processing steps
- [ ] **UXUI-07**: System handles and displays errors gracefully when Dify API calls fail
- [ ] **UXUI-08**: System shows a completeness indicator for the resume data (percentage of fields filled)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Batch Processing

- **BATC-01**: User can upload multiple resume files for batch conversion
- **BATC-02**: System processes multiple resumes with a queue and progress tracking

### User Accounts

- **ACCT-01**: User can create an account and save resume conversion history
- **ACCT-02**: User can re-edit previously converted resumes

### Additional Documents

- **ADOC-01**: System generates 送付状 (cover letter) from resume context
- **ADOC-02**: System supports multiple 職務経歴書 layout variants (functional, career-based)

### OCR Support

- **OCRR-01**: System can extract text from scanned/image-based resume PDFs via OCR

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real-time collaborative editing | WebSocket complexity not justified for single-user use case |
| Direct job board submission | Fragile APIs, partnership requirements, massive integration surface |
| ATS optimization scoring | Irrelevant for JIS-format resumes in Japanese hiring culture |
| Template gallery / custom designs | 履歴書 has ONE correct JIS format; creative templates hurt applicants |
| Handwriting font simulation | Digital submission is now standard; fake handwriting looks unprofessional |
| Mobile app | Web-first approach; mobile can be considered after v1 validation |
| User authentication | Adds auth/data storage/compliance complexity without v1 justification |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| UPLD-01 | — | Pending |
| UPLD-02 | — | Pending |
| UPLD-03 | — | Pending |
| EXTR-01 | — | Pending |
| EXTR-02 | — | Pending |
| EXTR-03 | — | Pending |
| EXTR-04 | — | Pending |
| EXTR-05 | — | Pending |
| TRAN-01 | — | Pending |
| TRAN-02 | — | Pending |
| TRAN-03 | — | Pending |
| TRAN-04 | — | Pending |
| TRAN-05 | — | Pending |
| TRAN-06 | — | Pending |
| TRAN-07 | — | Pending |
| TRAN-08 | — | Pending |
| DOCG-01 | — | Pending |
| DOCG-02 | — | Pending |
| DOCG-03 | — | Pending |
| DOCG-04 | — | Pending |
| DOCG-05 | — | Pending |
| DOCG-06 | — | Pending |
| DOCG-07 | — | Pending |
| DOCG-08 | — | Pending |
| DOCG-09 | — | Pending |
| DOCG-10 | — | Pending |
| DOCG-11 | — | Pending |
| UXUI-01 | — | Pending |
| UXUI-02 | — | Pending |
| UXUI-03 | — | Pending |
| UXUI-04 | — | Pending |
| UXUI-05 | — | Pending |
| UXUI-06 | — | Pending |
| UXUI-07 | — | Pending |
| UXUI-08 | — | Pending |

**Coverage:**
- v1 requirements: 35 total
- Mapped to phases: 0
- Unmapped: 35 ⚠️

---
*Requirements defined: 2026-02-18*
*Last updated: 2026-02-18 after initial definition*
