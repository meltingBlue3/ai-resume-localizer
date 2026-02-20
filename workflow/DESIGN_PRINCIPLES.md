# Workflow Design Principles

**Created:** 2026-02-20
**Core Principle:** 事実確定性優先于表達品質 — Fact certainty takes priority over expression quality.

## Guiding Rules

### 1. LLM as Constrained Parser, Not Intelligent Enhancer
- LLM extracts only what is explicitly present in the source text
- No inference, no completion, no "reasonable" expansion
- If information is missing from the source, output null — never fabricate

### 2. No Content Addition in Translation
- Translation may restructure for target language conventions
- Translation must NEVER add facts, numbers, achievements, or claims not in the source
- No marketing-style enhancement ("贡献", "成長", "チームワーク" additions)
- Numbers may only be inferred from existing data (e.g., years from date ranges), never fabricated

### 3. Deterministic Logic Belongs in Code
- Sorting (chronological ordering) → code node, not LLM
- Null normalization (至今/在职 → null) → LLM does this during extraction
- Date format validation → code layer
- JSON schema validation → code layer
- CoT tag stripping → both Dify prompt fix AND backend safety net

### 4. Minimize LLM Passes
- Each additional LLM pass increases semantic drift risk
- Translation uses single LLM node (not pipeline of translation + localization)
- Extraction uses single LLM node (current design, keep)

### 5. Structural Stability
- JSON output structure must be fully predictable
- All fields must have predictable types (string | null, string[], etc.)
- Code validates structure after every LLM output
- Lenient validation: accept nulls gracefully, but reject structural violations

### 6. Fail Fast, Don't Guess
- Malformed JSON after CoT stripping → immediate error, no retry
- Missing fields → warn user, proceed with blanks
- Never silently "fix" LLM output by guessing intent

## What LLM Does vs What Code Does

| Responsibility | Owner | Why |
|---|---|---|
| Extract text fields from resume | LLM | Requires language understanding |
| Format dates to YYYY-MM | LLM | Part of extraction understanding |
| Sort entries by date | Code | Deterministic, predictable |
| Translate Chinese → Japanese | LLM | Requires language understanding |
| Degree mapping (本科→学士) | LLM | Part of translation context |
| Katakana generation | LLM | Requires phonetic knowledge |
| Strip CoT tags | Both | Dify prompt + backend safety net |
| Validate JSON structure | Code | Deterministic |
| Convert null end_date → 現在 | Code | Deterministic downstream |

## Anti-Patterns (Forbidden)

1. **"Generate a summary"** — LLM translates existing self_introduction, does not generate new text
2. **"Add specific episodes and numbers"** — if source has no numbers, output has no numbers
3. **"Include 貢献/成長/チームワーク"** — adding cultural concepts not in source
4. **"Replace vague expressions with concrete business terms"** — this is content addition disguised as improvement
5. **"Complete the date"** — if source says "2020年", output "2020", not "2020-01"

---

*This document governs all changes to workflow YML files in the `workflow/` directory.*
