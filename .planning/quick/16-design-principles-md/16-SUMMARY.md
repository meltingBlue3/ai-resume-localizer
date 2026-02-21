---
phase: 16-design-principles-md
plan: 01
type: execute
tags: [documentation, design-principles, learning]
files_modified:
  - workflow/DESIGN_PRINCIPLES.md
key_decisions:
  - LLM can optimize expression for clarity while maintaining semantic consistency
  - CoT tag cleanup requires code nodes in workflow, not prompt fixes
---

# Quick Task 16: Update Design Principles

## One-liner

Updated DESIGN_PRINCIPLES.md with two clarifications learned from v1.1 development.

## Changes Made

### 1. Rule 1 - Expression Optimization Allowed

**Before:**
```
- LLM extracts only what is explicitly present in the source text
- No inference, no completion, no "reasonable" expansion
- If information is missing from the source, output null — never fabricate
```

**After:**
```
- LLM extracts only what is explicitly present in the source text
- LLM MAY optimize expression for clarity and readability, but MUST maintain semantic consistency with the original
- No inference, no completion, no "reasonable" expansion of facts
- If information is missing from the source, output null — never fabricate
```

**Rationale:** LLMs naturally clean up expressions (e.g., fixing grammar, improving readability). This is acceptable as long as the semantic meaning remains unchanged. The previous wording was too restrictive.

### 2. Rule 3 - CoT Stripping via Code Nodes Only

**Before (Rule 3 bullet):**
```
- CoT tag stripping → both Dify prompt fix AND backend safety net
```

**After:**
```
- CoT tag stripping → code node in workflow (prompts cannot reliably fix this issue)
```

**Before (table row):**
```
| Strip CoT tags | Both | Dify prompt + backend safety net |
```

**After:**
```
| Strip CoT tags | Code | Prompts cannot reliably fix; use code node |
```

**Rationale:** Prompt-based CoT suppression is unreliable. LLMs may still emit think tags regardless of instructions. Code nodes (with regex stripping) are the reliable solution.

## Verification

- [x] Rule 1 includes the new bullet about expression optimization
- [x] Rule 3 CoT line changed to code node only
- [x] Table updated for CoT stripping

## Deviations from Plan

None - executed exactly as planned.

## Note

**No git commit made** — user requested to review changes before committing.
