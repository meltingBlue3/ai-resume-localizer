# Pitfalls Research

**Domain:** Chinese-to-Japanese resume conversion (履歴書/職務経歴書 generation)
**Researched:** 2026-02-18
**Confidence:** MEDIUM-HIGH (multi-source verification for most findings; some CJK-specific edge cases based on domain expertise)

## Critical Pitfalls

### Pitfall 1: Chinese Name Reading (ふりがな) Omission or Fabrication

**What goes wrong:**
The JIS 履歴書 requires furigana (ふりがな) above the name field — the phonetic reading in hiragana or katakana. Chinese names written in kanji have ambiguous Japanese readings. The system either omits furigana entirely (making the resume incomplete) or the LLM hallucinates an incorrect reading. A name like 張偉 could be read as ちょう・い (on'yomi Japanese reading) or transliterated as ジャン・ウェイ (Mandarin katakana). Using the wrong convention makes the resume look unprofessional.

**Why it happens:**
Chinese names follow two competing conventions in Japanese: (1) Japanese on'yomi reading of the kanji (e.g., 習近平 → しゅう・きんぺい), which is the traditional standard per the 1972 Japan-China normalization treaty, and (2) Mandarin pronunciation in katakana (e.g., シー・ジンピン), increasingly used in media since ~2002. LLMs may not consistently apply either convention, or may mix them.

**How to avoid:**
- Default to on'yomi (音読み) Japanese reading for kanji names, as this is the convention expected by Japanese HR departments on 履歴書.
- Provide katakana Mandarin reading as a secondary field in parentheses where helpful.
- Include a lookup table or dictionary for common Chinese surnames → Japanese on'yomi (e.g., 王→おう, 李→り, 張→ちょう, 劉→りゅう, 陳→ちん).
- Explicitly instruct the Dify extraction node to output both the kanji name AND the furigana reading as separate structured fields.
- Flag names with ambiguous or uncommon kanji for human review.

**Warning signs:**
- Furigana field is empty in test outputs.
- Furigana contains romaji instead of kana.
- Inconsistent convention across test resumes (some on'yomi, some katakana).
- Simplified Chinese characters appear in the kanji name field instead of Japanese kanji equivalents.

**Phase to address:**
Phase 1 (Dify extraction workflow design) — furigana must be a first-class output field from day one.

---

### Pitfall 2: Simplified Chinese → Japanese Kanji Character Mismatch

**What goes wrong:**
Chinese resumes use simplified characters (简体字), but Japanese kanji (漢字) are a distinct character set. Some characters are identical (雪), some match traditional Chinese but not simplified (愛 vs 爱), some match simplified but not traditional (国), and some are unique to Japanese (kokuji like 込, 畑). Passing simplified Chinese characters directly into the Japanese resume produces a document with visibly wrong characters that any Japanese reader will immediately notice.

**Why it happens:**
Research from Kyoto University identifies 7 distinct mapping categories between simplified Chinese, traditional Chinese, and Japanese kanji. The relationship is many-to-many: one simplified character may map to multiple traditional characters, and the correct Japanese kanji may differ from both. LLMs may output the Chinese form rather than the Japanese form, especially for less common characters.

**How to avoid:**
- Never pass raw Chinese text into Japanese resume fields. All text must go through the translation/localization LLM node.
- Validate output character ranges: Japanese resume text should only contain characters from JIS X 0208/0213 character sets. Flag any characters outside this range.
- Build a post-processing validation step that checks for common simplified Chinese characters that should have been converted (e.g., 学 is the same, but 电→電, 车→車, 头→頭).
- Test with names and terms containing characters that differ across all three systems (simplified, traditional, Japanese).

**Warning signs:**
- PDF output contains characters that render differently in Chinese vs Japanese fonts.
- Japanese spell-checkers or IME tools flag characters as non-standard.
- Character encoding issues in the HTML template (mixing UTF-8 CJK ranges).

**Phase to address:**
Phase 1-2 (Translation workflow) — character validation must be part of the translation pipeline, not a late-stage fix.

---

### Pitfall 3: Date Format Conversion Failure (Western → 和暦/Wareki)

**What goes wrong:**
Chinese resumes use Western calendar dates (2019年6月). Japanese 履歴書 requires Japanese era dates (令和元年6月). The system either leaves dates in Western format (which 87% of traditional Japanese companies view as culturally inappropriate per japanconvert.com research) or incorrectly converts them. Particularly tricky: era transitions (Heisei→Reiwa on 2019-05-01) and the convention of using 元年 (gannen) for year 1 of a new era instead of "1年".

**Why it happens:**
Date conversion requires knowing exact era boundaries: 昭和 (Showa, 1926-01-25 to 1989-01-07), 平成 (Heisei, 1989-01-08 to 2019-04-30), 令和 (Reiwa, 2019-05-01 to present). A resume spanning 20+ years of career history may cross multiple eras. LLMs frequently get edge cases wrong (e.g., January 1989 is Showa 64 for the first 7 days, then Heisei 1 from Jan 8).

**How to avoid:**
- Do NOT rely on the LLM for date conversion. Implement deterministic date conversion logic in the Python backend using exact era boundary dates.
- Extract dates as structured data (year, month) from the Dify extraction node, then convert programmatically.
- Use 元年 (gannen) for the first year of each era, not "1年".
- Ensure consistency: if the resume uses 和暦, ALL dates must use 和暦 throughout. Mixing formats is a serious error.
- Handle partial dates (year + month only, which is standard for employment history).

**Warning signs:**
- Test output shows "2019年" anywhere in the Japanese resume.
- Dates near era boundaries (Jan 1989, Apr-May 2019) produce incorrect era assignments.
- Mixed era and Western dates in the same document.
- "令和1年" appears instead of "令和元年".

**Phase to address:**
Phase 2 (Backend data processing) — deterministic conversion, never LLM-based.

---

### Pitfall 4: JIS 履歴書 Table Layout Breaking in PDF Generation

**What goes wrong:**
The JIS 履歴書 is a rigid tabular form with precise cell dimensions, border weights, and text alignment requirements. HTML-to-PDF conversion produces tables that overflow cells, misalign borders, break across pages incorrectly, or render at wrong dimensions. The result looks nothing like a proper 履歴書 and is immediately rejected by Japanese employers.

**Why it happens:**
HTML table rendering in PDF engines (Puppeteer, WeasyPrint, wkhtmltopdf) differs from browser rendering. Key issues: (1) CSS mm/cm units don't always translate precisely to print dimensions, (2) CJK text wrapping rules differ from Latin text, (3) table cell heights expand unpredictably with content, (4) page breaks can split table rows, (5) the photo placement area requires absolute positioning. The 履歴書 B4 (or A3 folded to B5) format has non-standard dimensions that don't match A4 defaults.

**How to avoid:**
- Use Puppeteer (headless Chrome) for PDF generation — it has the most faithful CSS rendering for print layouts. WeasyPrint is acceptable but has more CJK quirks. Avoid wkhtmltopdf entirely (archived project, poor CJK Extension B-E support).
- Design the HTML template at exact mm dimensions using CSS `@page` rules with explicit size declarations.
- Use `page-break-inside: avoid` on all table rows to prevent mid-row splits.
- Set fixed heights on all table cells with `overflow: hidden` and truncation logic in the backend.
- Test with maximum-length content in every field to identify overflow.
- Generate at A4 size (the modern standard for printed 履歴書), not B4/B5.
- Use `table-layout: fixed` to prevent column width recalculation.

**Warning signs:**
- Table borders don't align when printed on paper.
- Content overflows cell boundaries in generated PDFs.
- Photo area overlaps with text fields.
- Page 2 starts at wrong position relative to the form layout.
- PDF file size is unexpectedly large (font embedding issue).

**Phase to address:**
Phase 2-3 (PDF template development) — build the HTML template first and validate it with extreme-length test data before integrating with the backend.

---

### Pitfall 5: CJK Font Rendering Failures in PDF Output

**What goes wrong:**
Japanese characters render as empty rectangles (tofu □), question marks, or wrong glyphs in the generated PDF. This happens silently — the PDF generates without errors, but the text is unreadable. Particularly dangerous because automated tests may pass (the text is "there" as unicode) while visual output is broken.

**Why it happens:**
PDF generation environments (especially Docker containers and cloud deployments) lack CJK fonts by default. WeasyPrint requires Pango ≥ 1.44.0 with proper fontconfig. Puppeteer on serverless platforms (Vercel, AWS Lambda) has no system fonts at all. Even when fonts are installed, font fallback chains may select the wrong font for mixed Japanese/Latin text. Common failure: Noto Sans CJK is installed but the regular weight is missing (only bold available), producing all-bold output.

**How to avoid:**
- Bundle specific fonts with the application: use Noto Sans JP (for Gothic/ゴシック) and Noto Serif JP (for Mincho/明朝) — both are Google fonts with free licenses.
- Use `@font-face` declarations with absolute file paths in the HTML template, never rely on system fonts or CDN-loaded fonts.
- For Puppeteer: use `--font-render-hinting=none` flag and explicitly load fonts via `page.evaluateOnNewDocument`.
- Test the PDF pipeline in the exact deployment environment (Docker image, cloud instance) — fonts that work locally may not exist in production.
- Validate font rendering with a test document containing: hiragana, katakana, kanji (including rare kanji from names), Latin alphabet, numbers, and special symbols (〒, 〇, ×).

**Warning signs:**
- Rectangles (□) or ? characters in PDF output.
- All text appears bold or in a single weight.
- Latin characters look different from Japanese characters (font mismatch).
- PDF file size is very small (fonts not embedded) or very large (entire CJK font embedded instead of subset).

**Phase to address:**
Phase 2 (Infrastructure/Docker setup) — font bundling must be done when setting up the PDF generation environment, not as an afterthought.

---

### Pitfall 6: LLM Hallucination of Resume Data That Doesn't Exist

**What goes wrong:**
The Dify extraction workflow invents plausible-sounding data that wasn't in the original Chinese resume. Examples: fabricating a university name, adding a job title that sounds reasonable but wasn't listed, generating a phone number, or filling in skills that weren't mentioned. This is catastrophic for a resume — submitting fabricated credentials to a Japanese employer.

**Why it happens:**
LLMs are completion engines that predict likely next tokens. When a resume has gaps (no phone number, no graduation date, missing job title), the LLM fills them in because that's statistically likely in the training data. ExtractBench research shows that even frontier models have 0% valid output on complex extraction schemas, and distinguishing "omission" from "hallucination" is a fundamental challenge in structured extraction.

**How to avoid:**
- Explicitly instruct the Dify extraction prompt: "If a field is not present in the source document, return null. NEVER invent or infer data that is not explicitly stated."
- Implement a two-pass verification: extract once, then run a second LLM call that compares extracted fields against the original text and flags any field that cannot be traced to specific source text.
- Design the output schema with required vs optional fields. Mark truly required fields (name, at least one work experience) and allow null for everything else.
- In the frontend, display null fields as "未記入" (not entered) rather than hiding them — this makes gaps visible to the user for manual completion.
- Log the original text alongside extracted JSON for audit/debugging.

**Warning signs:**
- Test extraction produces complete data from deliberately incomplete test resumes.
- Phone numbers or email addresses appear that weren't in the source.
- University names are slightly different from the original (e.g., "北京大学" extracted as "北京科技大学").
- Dates are suspiciously round (all April starts, all March graduations) when the original had different dates.

**Phase to address:**
Phase 1 (Dify workflow design) — anti-hallucination prompting and null-handling must be designed into the extraction schema from the start.

---

### Pitfall 7: Dify Workflow Single-Node Failure Cascading

**What goes wrong:**
The two-node Dify pipeline (extraction → translation) has no error handling. When the extraction node fails (malformed input, token limit exceeded, timeout), the translation node receives garbage or empty input and produces garbage output. The system returns a broken resume with no indication of what went wrong.

**Why it happens:**
Dify Cloud has a 10,000 token limit per document in RAG mode. Long Chinese resumes (especially with detailed project descriptions) can exceed this, causing silent truncation. The HTTP request node has default timeouts that may be too short for complex extraction tasks. Parallel execution in Dify means nodes cannot reference each other's outputs, leading to race conditions if the workflow isn't strictly sequential.

**How to avoid:**
- Implement error handling on both Dify nodes: use default values for failures and workflow redirection for alternate paths (Dify v0.14.0+ supports this).
- Add input validation before sending to Dify: check document size, estimate token count, and chunk if necessary.
- Set appropriate timeouts: extraction of a complex resume may take 30-60 seconds with a large LLM.
- Return structured error responses to the frontend: distinguish between "extraction failed" (retry with different format), "partial extraction" (some fields missing), and "translation failed" (extraction was fine, translation had issues).
- Monitor Dify API usage against plan limits (Free tier: only 200 message credits total, 5,000 API calls/month).

**Warning signs:**
- Some test resumes produce empty or truncated output with no error message.
- Long resumes consistently produce incomplete results.
- API calls intermittently fail during peak usage.
- Dify dashboard shows high error rates on one node.

**Phase to address:**
Phase 1 (Dify workflow design) — error handling is architecture, not polish. Design it into the workflow from the start.

---

### Pitfall 8: Chinese Resume Format Diversity Exceeding Parsing Assumptions

**What goes wrong:**
The system is designed around a few common Chinese resume templates, but real-world Chinese resumes come in extreme variety: table-based forms (like a 简历表), free-form Word documents, creative PDF designs, exported from job platforms (51job, 智联招聘, BOSS直聘, 猎聘) each with different structures, or even image scans. The 80%+ format coverage target fails because the long tail of formats is enormous.

**Why it happens:**
Chinese resume culture has no standardized format equivalent to the Japanese 履歴書. Templates range from structured application forms with checkboxes to creative portfolios. Job platform exports have platform-specific HTML/CSS that changes frequently. Many Chinese professionals maintain resumes in WeChat-optimized formats or as images.

**How to avoid:**
- Prioritize the top 5 Chinese resume sources by market share: 智联招聘 (Zhaopin), 前程无忧 (51job), BOSS直聘, 猎聘 (Liepin), and generic Word/PDF templates.
- Accept only PDF and DOCX as input formats for MVP. Do not attempt image/scan OCR in the initial release.
- Use the Dify Document Extractor node for text extraction (supports PDF, DOCX, CSV, Excel, and more), then pass extracted text to the LLM extraction node.
- Design the extraction prompt to be format-agnostic: instruct the LLM to find information by semantics (e.g., "find any education history regardless of section heading or layout") rather than by structure.
- Build a test corpus of 20+ real Chinese resumes from different sources before claiming coverage numbers.

**Warning signs:**
- Extraction accuracy drops significantly with non-standard templates.
- Specific job platform exports consistently fail.
- Text extraction produces garbled output (encoding issues with some PDF generators).
- Table-based resumes lose structural relationships in text extraction.

**Phase to address:**
Phase 1 (Input processing) — format handling is the first thing users encounter. Build robust extraction before building translation.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hardcoding date conversion instead of using a library | Quick implementation | Breaks on era changes (next emperor), edge cases accumulate | Never — use a well-tested conversion utility from the start |
| Relying on LLM for date format conversion | No backend code needed | Inconsistent results, era boundary errors, mixing formats | Never — deterministic logic only |
| Using system fonts instead of bundling | Works locally | Fails in Docker/cloud deployment, different rendering per environment | Never for production |
| Single Dify workflow for all resume types | Simpler architecture | Can't optimize extraction prompts per format, one failure mode fits all | MVP only — plan to split workflows by input complexity |
| Storing generated PDFs as the source of truth | No database needed | Can't re-render with updated templates, can't fix translation errors without full re-run | Never — store structured JSON, generate PDF on demand |
| Skipping furigana generation | Faster to market | Resume is incomplete for Japanese HR, must retrofit later | Never — furigana is table-stakes for 履歴書 |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Dify Cloud API | Treating it as unlimited — Free tier has 200 message credits total and 5,000 API calls/month | Monitor usage from day 1. Budget ~2 API calls per resume (extract + translate). Free tier supports ~100 resumes total. Plan Professional tier ($59/mo) for production. |
| Dify Document Extractor | Assuming it preserves document structure (tables, columns) | It extracts text only. Table relationships are lost. Send the raw text to the LLM with instructions to infer structure from context. |
| Dify parallel nodes | Referencing outputs from parallel branches (not allowed — they execute simultaneously) | Design strictly sequential extraction → translation pipeline. Only use parallel for independent sub-tasks within a single stage. |
| Puppeteer PDF generation | Using default Chromium without CJK fonts | Build a custom Docker image with Noto Sans JP / Noto Serif JP installed, or load via @font-face in the HTML template |
| WeasyPrint | Using relative font paths | Use absolute file paths for @font-face src. WeasyPrint resolves paths relative to the HTML base URI, which may differ in API vs CLI contexts. |
| Frontend file upload | Accepting any file type and size | Restrict to PDF/DOCX, max 10MB. Validate MIME type server-side (not just extension). Chinese resume PDFs from job platforms can contain embedded images that bloat file size. |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Synchronous Dify API calls blocking the FastAPI event loop | API responses take 30-60s, server becomes unresponsive with 3+ concurrent users | Use async HTTP client (httpx) for Dify API calls. Implement job queue pattern: accept upload → return job ID → poll for completion. | >3 concurrent users |
| Full CJK font embedding in every PDF | Each PDF is 5-15MB instead of 200-500KB | Use font subsetting — only embed glyphs actually used in the document. Puppeteer does this automatically; WeasyPrint requires explicit configuration. | Always (wastes bandwidth and storage) |
| Re-running entire Dify pipeline on minor edits | User fixes one field → full extraction + translation re-run (30-60s wait) | Store extracted/translated data as editable JSON. Allow field-level edits in frontend. Only re-run PDF generation (fast) on edits, not the full pipeline. | Immediately on first user edit |
| No caching of Dify extraction results | Same resume uploaded twice → double API cost and wait time | Hash input files, cache extraction results keyed by hash. Return cached result for duplicate uploads. | >50 resumes/day |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Storing uploaded Chinese resumes with PII (ID numbers, phone, address) without encryption | Data breach exposes sensitive personal information of Chinese nationals | Encrypt at rest. Delete source files after extraction. Store only the structured JSON needed for resume generation. Comply with China's PIPL (Personal Information Protection Law). |
| Passing full resume text to Dify Cloud without redaction | PII transits to Dify's servers (third-party processing) | Inform users that data is processed via Dify Cloud API. Add consent checkbox. Consider Dify self-hosted for sensitive deployments. Review Dify's data retention policy. |
| Not sanitizing HTML template inputs | XSS or injection via crafted resume content that reaches the HTML template | Escape all user-derived content before inserting into the HTML template. Never use `innerHTML` or Jinja2 `|safe` with user data. |
| Exposing Dify API keys in frontend code | API key theft, unauthorized usage consuming credits | Keep Dify API keys server-side only. Frontend calls your FastAPI backend, which proxies to Dify. Never expose API keys in client-side JavaScript. |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No progress feedback during 30-60s processing | User thinks the app is broken, refreshes/re-uploads, creating duplicate jobs | Show processing stages: "Extracting text..." → "Analyzing resume..." → "Translating..." → "Generating PDF..." with estimated time remaining |
| Showing the PDF immediately without a review step | User downloads PDF with errors, submits to employer, gets rejected | Show structured preview of all extracted/translated fields before PDF generation. Let user edit any field. Generate PDF only after user confirms. |
| Hiding null/missing fields in the output | User doesn't realize the 履歴書 is incomplete — missing fields look intentional | Mark missing fields with yellow highlight and "要入力" (needs input) label. Show a completeness percentage. List missing fields in a sidebar checklist. |
| One-shot conversion with no iterability | User must re-upload and redo everything to fix one field | Save conversion state. Allow editing individual fields. Re-generate PDF instantly from edited data. |
| No explanation of Japanese resume conventions | Chinese users don't understand why fields like 志望動機 (application motivation) or 通勤時間 (commute time) exist and leave them blank | Add tooltips explaining each 履歴書 section's purpose in Chinese. Provide example content. Mark which fields are critical vs optional for each job type. |

## "Looks Done But Isn't" Checklist

- [ ] **Furigana (ふりがな):** Often missing above name and address fields — verify both name furigana AND address furigana are populated
- [ ] **Date consistency:** All dates must use the same format (all 和暦 or all 西暦) — verify no mixed formats exist in the output
- [ ] **Era year 元年:** First year of Reiwa (2019 May+) must show 令和元年, not 令和1年 — verify with a test date of 2019-06-15
- [ ] **学歴/職歴 separator:** Academic history (学歴) and work history (職歴) must be in separate sections with labels, ending with 以上 right-justified — verify structure exists
- [ ] **Photo placeholder:** The 履歴書 photo area (3cm × 4cm) must be properly positioned even when no photo is provided — verify empty photo area shows "写真貼付" guideline
- [ ] **Simplified → Japanese kanji:** Verify no simplified Chinese characters leak through (spot-check: 电话→電話, 学历→学歴, 简历→none/omit)
- [ ] **Address format:** Japanese addresses must follow 都道府県 → 市区町村 → 番地 hierarchy — verify Chinese addresses are marked as foreign addresses or translated to the correct format
- [ ] **職務経歴書 generation:** The second document type is often forgotten — verify both 履歴書 AND 職務経歴書 are generated
- [ ] **PDF print dimensions:** Output PDF must be exactly A4 (210mm × 297mm) — verify by printing to paper and measuring
- [ ] **Font embedding:** PDF must render correctly when opened on a machine without CJK fonts — verify by opening on a fresh Windows/Mac system

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Simplified Chinese characters in output | LOW | Add post-processing character validation step. Build a mapping table for the ~500 most common divergent characters. Re-process existing outputs through the validator. |
| Wrong date format (Western instead of 和暦) | LOW | Implement deterministic date conversion utility. Re-process all stored dates. Purely mechanical fix. |
| Missing furigana | MEDIUM | Add furigana generation to the Dify translation prompt or as a separate backend step with a kanji→reading dictionary. Requires re-processing all stored resumes. |
| PDF layout broken | HIGH | Requires rebuilding the HTML template from scratch with proper CSS print rules. Involves iterative testing with a real printer. All previously generated PDFs are invalid. |
| LLM hallucinated resume data already delivered to users | CRITICAL | Cannot un-ring the bell. Must notify affected users. Implement verification pipeline. Regenerate all affected resumes with new anti-hallucination measures. Reputation damage. |
| Dify token limit truncating long resumes | MEDIUM | Implement pre-processing text chunking. Split resume into sections, process each separately, merge results. Requires workflow redesign but existing short-resume outputs remain valid. |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Chinese name furigana omission | Phase 1 (Dify extraction schema) | Test with 10 common Chinese surnames: 王李张刘陈杨黄赵吴周 — all must produce correct on'yomi furigana |
| Simplified → Japanese kanji mismatch | Phase 1-2 (Translation pipeline) | Run output through JIS X 0208 character validator. Zero simplified-only characters should pass. |
| Date format conversion errors | Phase 2 (Backend utilities) | Test with dates spanning all 3 modern eras: 1985-04 (Showa), 1995-04 (Heisei), 2020-04 (Reiwa), plus era boundaries: 1989-01-07 (Showa 64), 1989-01-08 (Heisei 1/元年), 2019-04-30 (Heisei 31), 2019-05-01 (Reiwa 元年) |
| JIS 履歴書 table layout breaking | Phase 2-3 (PDF template) | Print generated PDF on A4 paper. Measure cell dimensions with ruler. Compare against reference 履歴書 template. |
| CJK font rendering failures | Phase 2 (Docker/infrastructure) | Generate test PDF in production-identical Docker container. Open on Windows, Mac, and Linux without CJK fonts installed. All text must render. |
| LLM hallucination | Phase 1 (Dify extraction prompts) | Create 5 intentionally incomplete test resumes (missing phone, missing education dates, missing job titles). Verify extraction returns null for missing fields, not fabricated data. |
| Dify workflow cascade failures | Phase 1 (Dify workflow) | Test with: empty file, corrupted PDF, 50-page resume, non-resume document, image-only PDF. All must produce meaningful error messages, not silent failures. |
| Chinese resume format diversity | Phase 1 (Input processing) | Build test corpus from top 5 Chinese job platforms. Achieve ≥80% successful extraction across corpus before proceeding to translation phase. |
| Synchronous API blocking | Phase 3 (Backend optimization) | Load test with 10 concurrent uploads. Response time for accepting upload must be <2s even when previous jobs are processing. |
| Missing 職務経歴書 | Phase 2-3 (Template development) | Every conversion must produce exactly 2 documents: 履歴書 (1-2 pages) and 職務経歴書 (1-3 pages). Verify both exist in output. |

## Sources

- Kyoto University CJK character mapping research (ACL Anthology, LREC 2012) — 7-category classification of simplified Chinese / traditional Chinese / Japanese kanji relationships
- Babel Street (2023) — Japanese transliteration of foreign names, 1972 Japan-China treaty conventions
- japanconvert.com (2025) — Japanese business date formats guide, 87% traditional company wareki preference statistic
- Dify official documentation (docs.dify.ai) — workflow design, Document Extractor node, error handling (v0.14.0+), HTTP request timeout configuration
- Dify GitHub Issue #20604 — 10,000 token limit per document in RAG mode, no configuration override
- Dify pricing page (dify.ai/pricing) — Free tier: 200 message credits, 5,000 API calls/month
- wkhtmltopdf GitHub Issue #4210 — CJK Extension B-E characters rendering as "AA", project archived Jan 2023
- Stack Overflow (2024-2025) — Puppeteer Japanese font rendering on Vercel, WeasyPrint CJK font configuration
- WeasyPrint GitHub Issue #2577 — @font-face inline CSS workaround for cloud deployments
- ResumeBench (EMNLP 2025) — multilingual resume parsing benchmark, 50 templates, 5 languages
- ExtractBench (2025) — LLM structured extraction evaluation, 0% valid output on complex schemas
- rirekishobuilder.com — JIS 履歴書 template specifications, Japanese era date converter
- livinginjapan.net — 学歴/職歴 writing conventions, 以上 (END) formatting rules
- daijob.com — 職務経歴書 format requirements and section structure
- MEXT (Japan Ministry of Education) — foreign credential assessment framework for Chinese degrees

---
*Pitfalls research for: Chinese-to-Japanese resume conversion (AI Resume Localizer)*
*Researched: 2026-02-18*
