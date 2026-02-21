---
phase: 16-design-principles-md
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: [workflow/DESIGN_PRINCIPLES.md]
autonomous: true
requirements: []
must_haves:
  truths:
    - "Rule 1 allows expression optimization while maintaining semantic consistency"
    - "Rule 3 clarifies CoT cleanup requires code nodes, not prompt fixes"
  artifacts:
    - path: "workflow/DESIGN_PRINCIPLES.md"
      provides: "Updated design principles for workflow development"
  key_links: []
---

<objective>
Update DESIGN_PRINCIPLES.md with two clarifications:
1. LLM can optimize expression (not just extract verbatim) while maintaining semantic consistency
2. CoT tag cleanup cannot be fixed via prompts — use code nodes in workflow

Purpose: Reflect learnings from v1.1 development about LLM behavior and CoT handling
Output: Updated DESIGN_PRINCIPLES.md with clearer guidance
</objective>

<execution_context>
@C:/Users/zhang/.config/opencode/get-shit-done/workflows/execute-plan.md
@C:/Users/zhang/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@AGENTS.md
</context>

<tasks>

<task type="auto">
  <name>Update DESIGN_PRINCIPLES.md with two clarifications</name>
  <files>workflow/DESIGN_PRINCIPLES.md</files>
  <action>
Update the DESIGN_PRINCIPLES.md file with these two changes:

**Change 1 - Rule 1 (LLM as Constrained Parser):**
Replace current rule text:
```
### 1. LLM as Constrained Parser, Not Intelligent Enhancer
- LLM extracts only what is explicitly present in the source text
- No inference, no completion, no "reasonable" expansion
- If information is missing from the source, output null — never fabricate
```

With:
```
### 1. LLM as Constrained Parser, Not Intelligent Enhancer
- LLM extracts only what is explicitly present in the source text
- LLM MAY optimize expression for clarity and readability, but MUST maintain semantic consistency with the original
- No inference, no completion, no "reasonable" expansion of facts
- If information is missing from the source, output null — never fabricate
```

**Change 2 - Rule 3 (Deterministic Logic):**
Update the CoT-related line from:
```
- CoT tag stripping → both Dify prompt fix AND backend safety net
```

To:
```
- CoT tag stripping → code node in workflow (prompts cannot reliably fix this issue)
```

Also update the table "What LLM Does vs What Code Does" row for CoT stripping from:
```
| Strip CoT tags | Both | Dify prompt + backend safety net |
```

To:
```
| Strip CoT tags | Code | Prompts cannot reliably fix; use code node |
```
  </action>
  <verify>
  Read updated file and confirm:
  1. Rule 1 includes the new bullet about expression optimization
  2. Rule 3 CoT line changed to code node only
  3. Table updated for CoT stripping
  </verify>
  <done>
  - Rule 1 allows expression optimization while maintaining semantic consistency
  - Rule 3 and table clarify CoT cleanup requires code nodes, not prompt fixes
  </done>
</task>

</tasks>

<verification>
Manual review by user to confirm changes match intent.
</verification>

<success_criteria>
- DESIGN_PRINCIPLES.md updated with both changes
- No git commit (user wants to review first)
</success_criteria>

<output>
After completion, create `.planning/quick/16-design-principles-md/16-SUMMARY.md`
</output>
