# Feature Research

**Domain:** Chinese-to-Japanese resume conversion web application
**Researched:** 2026-02-18
**Confidence:** MEDIUM — based on competitor analysis, Japanese resume standards documentation, and AI resume tool ecosystem research. No direct CN→JP conversion competitor with identical scope found, so table stakes derived from adjacent products.

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Resume upload (PDF + Word)** | Users have existing resumes in these formats; no one will retype from scratch | MEDIUM | PDF parsing more complex than DOCX; Chinese PDFs may use embedded fonts or scanned images. Support `.pdf` and `.docx` at minimum. |
| **Structured data extraction** | The whole value prop depends on understanding resume content, not just translating raw text | HIGH | Must extract: name, contact info, education history, work history, skills, certifications. Chinese resumes vary wildly in format—no single standard. Dify workflow handles this. |
| **Chinese → Japanese translation** | Core product purpose | HIGH | Not generic translation—must produce natural Japanese business language. Job titles, degree names, and company descriptions need domain-aware translation. Dify workflow handles this. |
| **履歴書 (rirekisho) generation** | The primary output format every Japanese employer requires | HIGH | Must follow post-2021 JIS standard (gender optional, removed commute time/dependents). Fields: date, photo, name + furigana, DOB, address, education history, work history, licenses/qualifications, motivation, hobbies/skills, special requests. A4 PDF output. |
| **職務経歴書 (shokumukeirekisho) generation** | Required alongside 履歴書 for mid-career applications; users applying to Japanese jobs need both | HIGH | 2-3 page A4 document. Sections: career summary (職歴要約), employment history per company (with details, achievements), qualifications, self-PR. More flexible layout than 履歴書 but still follows conventions. |
| **Side-by-side extraction review** | Users must verify AI didn't hallucinate or misparse their data; trust requires transparency | MEDIUM | Show original resume alongside extracted structured fields. Users correct extraction errors before translation begins. |
| **Side-by-side translation review (editable)** | Translation quality varies; users who know both languages need to fix nuances, especially for job titles and achievements | MEDIUM | Chinese original on left, Japanese translation on right. Each field independently editable. This is where users build trust in the output. |
| **PDF download** | Final deliverable must be a downloadable PDF for job applications | MEDIUM | Both 履歴書 and 職務経歴書 as separate PDFs. Must render Japanese text correctly with proper fonts (Gothic/Mincho). |
| **Bilingual UI (Chinese + Japanese)** | Target users are Chinese speakers applying to Japanese jobs; they need UI in their language | MEDIUM | Chinese as primary UI language, Japanese as secondary. Not just translated labels—help text and guidance should be culturally appropriate for Chinese users navigating Japanese job customs. |
| **Japanese era date conversion** | 履歴書 requires dates in Japanese era format (令和/平成/昭和); Chinese users won't know the conversion | LOW | Auto-convert Western/Chinese dates to Japanese era years. Current: 令和 (Reiwa, 2019–). Historical: 平成 (1989–2019), 昭和 (1926–1989). First year = 元年 not 1年. |
| **Photo upload + crop** | 履歴書 requires a 3cm×4cm ID photo; this is a mandatory field Japanese employers expect | MEDIUM | Must support upload, crop to 3:4 ratio, position face correctly. Requirements: plain background, frontal view, formal attire, taken within 3 months. Provide guidance text for Chinese users unfamiliar with Japanese photo standards. |
| **HTML preview before download** | Users need to see exactly what the final PDF looks like before committing | LOW | Render 履歴書 and 職務経歴書 in browser with accurate layout. What-you-see-is-what-you-get. |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Chinese name → katakana furigana** | 履歴書 requires furigana (reading aid) above the name. Chinese users can't produce this themselves—auto-generating katakana from pinyin is a unique value-add that no generic translation tool handles | MEDIUM | Convert Chinese name → pinyin → katakana using standard phonetic mapping tables. Must handle edge cases (multi-reading characters, rare surnames). Show result for user confirmation. |
| **Step-by-step wizard flow** | Competitors are either "fill a form" (rirekishobuilder) or "translate a document" (OpenL). A guided upload→extract→translate→review→download wizard combines both paradigms and reduces cognitive load for users unfamiliar with Japanese resume customs | MEDIUM | Linear flow with clear progress indicator. Each step completable independently. Back navigation without data loss. |
| **Education credential mapping** | Chinese degree types (本科/专科/硕士/博士) don't map 1:1 to Japanese categories. Auto-mapping with explanation helps users present credentials correctly | LOW | Map: 本科 → 大学卒業(学士), 专科 → 短期大学卒業, 硕士 → 大学院修了(修士), 博士 → 大学院修了(博士). Include Chinese university name in kanji (shared characters) + katakana reading. |
| **Japanese resume culture guidance** | Inline tips explaining WHY each field exists and WHAT Japanese employers expect (e.g., "志望動機 is taken very seriously—be specific about why this company") | LOW | Contextual help tooltips at each field. Chinese users often don't know Japanese resume conventions (handwriting preferences, photo etiquette, humble language requirements). This is guidance, not a feature to build—just well-written microcopy. |
| **Field-level editing throughout** | Allow editing at extraction stage AND translation stage AND preview stage. Most tools lock you in after a step | MEDIUM | Changes at any stage propagate forward. Edit Japanese text directly in preview if something looks wrong. Reduces round-trips. |
| **Smart field mapping (CN → JP)** | Automatically map Chinese resume sections to correct 履歴書/職務経歴書 fields even when source format varies wildly | HIGH | Chinese resumes have no standard—some have "自我评价", some have "项目经验", some mix education and work. The extraction AI must normalize to a canonical schema. This is the core AI challenge. |
| **Honorific/keigo language adjustment** | Japanese business documents require appropriate politeness levels (敬語). Auto-applying correct keigo to translated content shows domain expertise | MEDIUM | 職務経歴書 self-PR section needs です/ます form. Company descriptions need neutral tone. Motivation section needs humble form (謙譲語). Dify prompt engineering handles this. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **User accounts / auth** | "Save my resume for later" | Adds massive complexity (auth, data storage, GDPR/個人情報保護法 compliance, session management) for a v1 product. Chinese users are privacy-sensitive about resume data. | Session-based temporary storage. Users download their PDF and re-upload if they want to edit later. Consider accounts in v2 only if retention data justifies it. |
| **Batch resume processing** | "Convert 10 resumes at once" | Different UX paradigm, complicates the step-by-step review flow (can't review 10 side-by-side translations simultaneously), increases API costs unpredictably | Single resume flow in v1. Batch as explicit v2 feature with different UI. |
| **Cover letter generation** | "I also need a cover letter (送付状)" | Scope creep—cover letters are a separate document type with different content requirements. Dilutes focus on the core 履歴書 + 職務経歴書 pair. | Add "Tips for writing 送付状" as a static guide page. Build cover letter generation as a separate feature in v2+. |
| **Direct job board submission** | "Submit directly to リクナビ/マイナビ" | Job board APIs are fragile, change without notice, require partnerships. Each board has different requirements. Massive integration surface. | Export clean PDFs that users upload manually. Job boards accept standard PDFs. |
| **Real-time collaborative editing** | "My Japanese friend can help me edit" | WebSocket complexity, conflict resolution, cursor sync—all for a use case that's better served by "download PDF and send to friend for review" | Share preview link (read-only) or export and collaborate externally. |
| **ATS optimization scoring** | "Tell me if my resume will pass ATS" | Japanese hiring still heavily favors the standardized 履歴書 format over ATS-parsed free-form resumes. ATS optimization is a Western resume concern that doesn't apply to JIS-format documents. | The 履歴書 format IS the optimization—it's what Japanese employers expect. Focus on format correctness instead. |
| **Template gallery / custom designs** | "Let me pick a creative template" | 履歴書 has ONE correct format (JIS standard). Creative templates signal ignorance of Japanese business culture and hurt the applicant. 職務経歴書 has slightly more flexibility but still follows strict conventions. | Offer the standard JIS format and 2-3 職務経歴書 layout variants (chronological, functional, career-based). No "creative" templates. |
| **Handwriting font simulation** | "Japanese resumes should be handwritten" | While traditionally true, digital submission is now standard. Simulating handwriting looks unprofessional in digital contexts. Companies that want handwritten resumes want actual handwriting. | Note in guidance that some traditional companies prefer handwritten. Output clean digital format which is now the norm. |

## Feature Dependencies

```
[Resume Upload (PDF/Word)]
    └──requires──> [Structured Data Extraction]
                       ├──requires──> [CN→JP Translation]
                       │                  ├──requires──> [履歴書 Generation]
                       │                  └──requires──> [職務経歴書 Generation]
                       └──enhances──> [Side-by-Side Extraction Review]

[CN→JP Translation]
    └──enhances──> [Side-by-Side Translation Review (Editable)]

[履歴書 Generation] ──requires──> [Japanese Era Date Conversion]
[履歴書 Generation] ──requires──> [Photo Upload + Crop]
[履歴書 Generation] ──enhances──> [HTML Preview]
[職務経歴書 Generation] ──enhances──> [HTML Preview]

[HTML Preview] ──requires──> [PDF Download]

[Structured Data Extraction] ──enhances──> [Chinese Name → Katakana Furigana]
[Structured Data Extraction] ──enhances──> [Education Credential Mapping]

[Bilingual UI] ──independent── (parallel concern, needed from day 1)
[Japanese Resume Culture Guidance] ──enhances──> [Side-by-Side Translation Review]
[Step-by-Step Wizard Flow] ──orchestrates──> [all above features]
```

### Dependency Notes

- **Upload requires Extraction:** Without structured extraction, upload is just file storage with no value.
- **Extraction requires Translation:** Extracted Chinese fields must be translated before any Japanese document can be generated.
- **Translation requires Generation:** Translated fields feed directly into 履歴書 and 職務経歴書 templates.
- **履歴書 requires Era Dates + Photo:** These are mandatory fields in the JIS format; generation fails without them.
- **Preview requires Generation:** Can't preview what hasn't been generated.
- **Preview requires Download:** Preview without download is a dead end.
- **Bilingual UI is independent:** Must be built into the foundation from day 1, not retrofitted.
- **Wizard Flow orchestrates all:** The step-by-step flow is the UX shell containing all functional features.

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate the concept.

- [ ] **Resume upload (PDF + DOCX)** — entry point; without this, no product
- [ ] **Structured data extraction via Dify** — the AI core; extracts name, education, work history, skills from Chinese resume
- [ ] **Chinese → Japanese translation via Dify** — the core transformation; domain-aware business Japanese
- [ ] **Side-by-side extraction review** — trust-building; users verify extracted data before translation
- [ ] **Side-by-side translation review (editable)** — quality control; users fix translation issues per field
- [ ] **履歴書 HTML generation + PDF download** — primary output; the document employers require
- [ ] **職務経歴書 HTML generation + PDF download** — secondary output; required for mid-career applications
- [ ] **Photo upload + crop (3:4 ratio)** — mandatory for 履歴書; can't ship without it
- [ ] **Japanese era date conversion** — mandatory for 履歴書 date fields; low complexity, high impact
- [ ] **Bilingual UI (Chinese primary, Japanese secondary)** — core UX requirement for target users
- [ ] **Step-by-step wizard flow** — the UX paradigm; upload → review extraction → review translation → preview → download

### Add After Validation (v1.x)

Features to add once core is working and users are converting resumes.

- [ ] **Chinese name → katakana furigana auto-generation** — add when extraction pipeline is stable; high user value, medium complexity
- [ ] **Education credential mapping with explanations** — add when translation quality is validated; helps users present degrees correctly
- [ ] **Japanese resume culture guidance (contextual tips)** — add as microcopy improvements; low effort, compounds over time
- [ ] **Field-level editing in preview stage** — add when preview rendering is stable; reduces user friction
- [ ] **Honorific/keigo language tuning** — refine Dify prompts based on user feedback on translation tone

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] **Batch resume processing** — defer until single-resume flow is polished; different UX paradigm
- [ ] **User accounts + resume history** — defer until retention justifies the compliance overhead
- [ ] **Cover letter (送付状) generation** — defer; separate document type, separate feature
- [ ] **Multiple 職務経歴書 layout variants** — defer; one good chronological format is enough for v1
- [ ] **Resume version comparison** — defer; users rarely compare versions in this domain

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Resume upload (PDF + DOCX) | HIGH | MEDIUM | P1 |
| Structured data extraction | HIGH | HIGH | P1 |
| CN→JP translation | HIGH | HIGH | P1 |
| Side-by-side extraction review | HIGH | MEDIUM | P1 |
| Side-by-side translation review (editable) | HIGH | MEDIUM | P1 |
| 履歴書 generation | HIGH | HIGH | P1 |
| 職務経歴書 generation | HIGH | HIGH | P1 |
| Photo upload + crop | HIGH | MEDIUM | P1 |
| Japanese era date conversion | HIGH | LOW | P1 |
| Bilingual UI | HIGH | MEDIUM | P1 |
| Step-by-step wizard flow | HIGH | MEDIUM | P1 |
| PDF download | HIGH | MEDIUM | P1 |
| HTML preview | MEDIUM | LOW | P1 |
| Name → katakana furigana | HIGH | MEDIUM | P2 |
| Education credential mapping | MEDIUM | LOW | P2 |
| Resume culture guidance tips | MEDIUM | LOW | P2 |
| Field editing in preview | MEDIUM | MEDIUM | P2 |
| Keigo language adjustment | MEDIUM | LOW | P2 |
| Batch processing | LOW | HIGH | P3 |
| User accounts | LOW | HIGH | P3 |
| Cover letter generation | LOW | MEDIUM | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | RirekishoBuilder.com | OpenL Doc Translator | yeschat.ai GPT | **Our Approach** |
|---------|---------------------|---------------------|-----------------|------------------|
| Resume upload + parse | No (manual entry only) | Yes (preserves layout, translates text) | No (chat-based input) | Yes — upload PDF/DOCX, AI extracts structured fields |
| CN→JP translation | No | Yes (generic document translation) | Yes (via GPT prompt) | Yes — domain-specific business Japanese via Dify |
| 履歴書 generation | Yes (form-based builder) | No (translates existing docs) | Yes (text output only) | Yes — pixel-perfect JIS-standard PDF |
| 職務経歴書 generation | Yes (form-based builder) | No | Yes (text output only) | Yes — properly formatted A4 PDF |
| Photo handling | Yes (upload + crop) | No | No | Yes — upload, crop, position guidance |
| Era date conversion | Yes (standalone tool) | No | Manual in chat | Yes — automatic, integrated into flow |
| Review/editing flow | No (direct entry) | No (output only) | Iterative chat | Yes — structured side-by-side review at each stage |
| Furigana generation | No (manual entry) | No | Sometimes (inconsistent) | Yes (v1.x) — auto from pinyin |
| Bilingual UI | English + Japanese | Multi-language | English | Chinese + Japanese — purpose-built for target users |
| Education mapping | No | No | Sometimes | Yes (v1.x) — CN→JP degree equivalence |
| Contextual guidance | Section-level tips | No | Chat-based | Yes (v1.x) — inline tips for Japanese resume culture |

**Key competitive insight:** No existing product combines ALL of: Chinese resume upload → structured extraction → domain-aware translation → JIS-format document generation → step-by-step review. Competitors either build resumes from scratch (RirekishoBuilder) or translate documents generically (OpenL). Our product bridges the gap.

## Sources

- RirekishoBuilder.com — primary competitor for Japanese resume building, 40K+ resumes created (rirekishobuilder.com)
- OpenL Doc Translator — generic resume translation service (doc.openl.io/translate/resume)
- yeschat.ai GPT "履歴書&職務経歴書の自動生成" — ChatGPT wrapper for Japanese resume generation
- JIS履歴書 format: kotora.jp, success-job.jp — post-2021 JIS standard field specifications
- 職務経歴書 format: daijob.com, ib-tec.co.jp, japan-dev.com — standard sections and requirements
- Japanese resume photo requirements: rirekishobuilder.com/blogs, livinginjapan.net — 3cm×4cm specifications
- Chinese resume format: ncss.cn, jianli.com — standard Chinese resume sections
- Chinese name katakana conversion: Wikipedia 外来語表記法/中国語, ch-station.org — pinyin→katakana mapping rules
- Chinese education credentials: chsi.jp — CHSI Japan credential authentication
- Japanese era system: Wikipedia Reiwa era, rirekishobuilder.com/tools — conversion rules
- AI resume parsing: mokahr.io, hireparse.com — PDF extraction capabilities (2026)
- Resume UX: arxiv.org (ResumeFlow), uxplanet.org — side-by-side review workflow patterns

---
*Feature research for: Chinese-to-Japanese resume conversion*
*Researched: 2026-02-18*
