# Phase 7: Workflow Quality - Context

**Gathered:** 2026-02-20
**Status:** Ready for planning

<domain>
## Phase Boundary

The Dify extraction and translation workflows produce clean, predictable, fact-faithful output. Core principle: **事実確定性優先于表達品質** — fact certainty takes priority over expression quality. This includes: stripping CoT tokens, constraining LLM to minimum responsibility, tightening prompts to prevent content fabrication, moving deterministic logic to code, and merging translation LLM nodes to reduce semantic drift.

</domain>

<decisions>
## Implementation Decisions

### LLM vs Code boundary
- **Date formatting stays in LLM** — LLM converts dates to YYYY-MM during extraction (keep current behavior)
- **Sorting moves to code** — LLM outputs work_experience/education entries in whatever order found; a code node sorts by start_date deterministically after extraction
- **Degree mapping and katakana stay in LLM** — both kept in LLM prompts (not moved to code lookup tables)
- **Translation merges to 1 LLM node** — current 2-node pipeline (core translation + localization) merges into a single LLM pass to reduce semantic drift from double rewriting

### Extraction constraints
- **Dates: exact only** — if resume says "2020年" (year only), output "2020" as-is. Never add month. Code/frontend handles incomplete dates
- **Section classification: LLM judges content** — LLM decides whether something is work_experience vs project_experience based on content, not just section labels
- **Ongoing jobs: all normalize to null** — any indication of current/ongoing ("至今", "在职", blank) becomes null end_date. Downstream code converts null to "現在" for Japanese output
- **Cross-section extraction allowed** — LLM can recognize well-known certifications (e.g., CET-6) even if mentioned casually in text, not under a labeled section
- **No inference beyond source** — LLM must not add facts, dates, or details not explicitly present in the resume text

### Translation constraints
- **Restructuring allowed, content addition forbidden** — LLM can restructure sentences for Japanese conventions but cannot add facts, numbers, or claims not in the original
- **No marketing additions** — remove all prompt instructions that add "貢献", "成長", "チームワーク" or similar concepts not in source. Translation must only contain concepts from the original
- **Numbers: allow inference from context** — LLM can infer numbers from context (e.g., "3 years" calculated from date ranges) but cannot fabricate quantitative data
- **Keigo: standard business** — です/ます体 throughout, light 謙譲語 for motivation section. Not overly stiff or formal

### Verification strategy
- **Lenient schema validation** — code node checks basic JSON structure but accepts nulls and missing fields gracefully
- **Two-layer CoT stripping** — fix Dify workflow prompts to not output `<think>` tags, PLUS backend regex as safety net. Log when safety net activates
- **No drift detection** — trust constrained prompts. No input-vs-output comparison logic (avoid over-engineering)
- **Fail immediately on malformed JSON** — no retries. Return clear error to user about extraction/translation failure

### Claude's Discretion
- Exact prompt wording for constrained extraction and translation
- How to structure the merged single-LLM translation node
- Code node implementation for sorting logic
- CoT stripping regex patterns

</decisions>

<specifics>
## Specific Ideas

- Current extraction prompt is too permissive: "准确提取所有关键信息" — needs to be reframed as "extract only what is explicitly written"
- Current translation localization prompt explicitly asks LLM to "generate" summary/motivation/strengths — these generation instructions must be replaced with translation-only instructions
- The localization prompt's "曖昧な表現は具体的なビジネス用語に置き換える" encourages content addition — remove
- The localization prompt's "具体的なエピソードや数値を含む自己PRにする" asks LLM to add episodes/numbers — replace with "translate existing content"
- Reference PDFs in project root: `text.pdf` (input), `履歴書.pdf` and `職務経歴書.pdf` (current output with known issues)
- Known current issues: "None" literals in dates, phantom job entries from project experience, mechanical keigo repetition, missing CET-6 in certifications

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 07-workflow-quality*
*Context gathered: 2026-02-20*
