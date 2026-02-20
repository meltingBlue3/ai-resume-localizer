# Phase 7: Workflow Quality - Context

**Gathered:** 2026-02-20
**Status:** Ready for planning

<domain>
## Phase Boundary

The Dify extraction and translation workflows produce clean, complete output that the backend can reliably parse. This includes: stripping CoT tokens from Dify output, improving extraction prompts for better field coverage, improving translation prompts for natural business Japanese, and adding a backend safety net for residual CoT tags.

</domain>

<decisions>
## Implementation Decisions

### Translation tone & style
- Standard business keigo (丁寧語 + 謙譲語) — professional but not overly stiff, common in modern 職務経歴書
- Adapt sentence structure to Japanese resume conventions (「XXに従事しました」「担当いたしました」) rather than preserving original Chinese structure
- Technical terms and job titles: Claude's discretion to pick the most natural Japanese equivalent for each term
- Avoid mechanical repetitive endings (「〜しました」「〜を行いました」throughout) — vary sentence patterns

### CoT stripping
- Two-layer approach: fix Dify workflow to never output `<think>` tags as primary fix, plus backend regex stripping as safety net
- Only `<think>...</think>` tags identified as the issue — no other unwanted patterns observed
- If JSON is still malformed after stripping: fail immediately with clear error, no automatic retries
- Log stripped content when backend safety net activates (monitor how often Dify leaks CoT tags)

### Extraction prompt quality (fix via prompts)
- Phantom job entries: project experience (个人项目) must NOT be classified as employment history — prompts must distinguish 项目经验 from 工作经验
- Chronology: 職歴 entries must be in correct chronological order (earliest first for 履歴書)
- "None" literals: end dates for ongoing items must output 「現在」, never raw "None" or null strings
- Missing fields: birth date and other extractable info (CET-6 → 免許・資格) should be captured when present in source
- Intern experience (見知データ 2024.9-2025.1) was placed after full-time job (真蘭 2025.2-2025.12) — chronological ordering must be enforced

### Error & fallback handling
- Incomplete extraction results: warn user about missing fields but proceed — generate output with blanks
- Dify API unreachable: show friendly error with retry button (no auto-retry)
- Error messages follow existing i18n system (system already has internationalization)

### Claude's Discretion
- Extraction field priority beyond the specific issues identified
- Exact regex patterns for CoT stripping
- Compression algorithm and technical implementation details
- How to structure Dify workflow changes internally

</decisions>

<specifics>
## Specific Ideas

- Reference PDFs in project root show concrete issues: `text.pdf` (input), `履歴書.pdf` and `職務経歴書.pdf` (current output)
- 職務経歴書 has 「2026-01〜None」— "None" must become「現在」
- 履歴書 has phantom 「令和8年1月　入社」with no company — project experience leaked into 職歴
- 職務経歴書 sentence endings are mechanical: heavy 「〜しました」「〜を行いました」repetition — needs varied phrasing
- 「仕様開発Spec」mixes JP/EN awkwardly — should localize consistently
- 免許・資格 section is empty but CET-6 was in the source resume
- 見知データ intern chronology is out of order in 履歴書

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 07-workflow-quality*
*Context gathered: 2026-02-20*
