---
phase: 07-workflow-quality
verified: 2026-02-20T12:30:00Z
status: passed
score: 10/10 must-haves verified
re_verification: false
---

# Phase 7: Workflow Quality Verification Report

**Phase Goal:** The Dify extraction and translation workflows produce clean, complete output that the backend can reliably parse
**Verified:** 2026-02-20T12:30:00Z
**Status:** passed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Extraction workflow LLM prompt explicitly forbids adding information not in source text | VERIFIED | Prompt contains "绝对不可推测、补充或生成任何原文中不存在的内容" (grep confirmed "推测" and "补充" present) |
| 2 | Extraction workflow has a code node that strips `<think>` tags from LLM output before JSON cleaning | VERIFIED | Node id=1740000000005 type=code contains `re.sub(r'<think>[\s\S]*?</think>', '', llm_text, flags=re.DOTALL)` |
| 3 | Extraction workflow has a code node that sorts work_experience and education by start_date descending | VERIFIED | Node id=1740000000006 type=code contains `sorted(items, key=sort_key, reverse=True)` covering work_experience, education, project_experience |
| 4 | Translation workflow uses a single LLM node instead of two separate translation + localization nodes | VERIFIED | Translation graph has exactly 1 LLM node (id=1740100000002); 5 total nodes confirmed |
| 5 | Translation prompt forbids adding marketing language, fabricated numbers, or content not in original | VERIFIED | Prompt contains "追加してはいけません", "マーケティング的表現を追加しないこと", and explicitly excludes "曖昧な表現は具体的" and "「貢献」「成長」「チームワーク」を織り交ぜた" |
| 6 | Translation prompt specifies です/ます体 with light 謙譲語 for motivation only | VERIFIED | Prompt contains "です/ます体を全体で使用" and "motivation セクションのみ軽い謙譲語を使用（「〜させていただきたい」等）。過度に堅い表現は避ける" |
| 7 | Backend strips `<think>...</think>` tags from Dify response strings before JSON parsing | VERIFIED | `_strip_cot_tags()` called at line 73 and 117 in dify_client.py, both before `json.loads()` at lines 75 and 119 |
| 8 | Backend logs a warning when CoT stripping safety net activates | VERIFIED | `logger.warning("CoT safety net activated: stripped <think> tags from Dify response")` at line 34-36 |
| 9 | Clean JSON strings (no CoT tags) pass through stripping unchanged | VERIFIED | `test_strip_cot_tags_no_think_unchanged` passes; logic compares `result != text` before logging |
| 10 | JSON parsing does not fail on responses that originally contained CoT tags | VERIFIED | All 5 unit tests pass (5/5 green). Stripping occurs before `json.loads()` in both methods |

**Score:** 10/10 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `workflow/resume_extraction.yml` | Rewritten extraction workflow with CoT stripping, constrained prompt, sorting code node | VERIFIED | File exists, valid YAML (UTF-8), 6 nodes, 5 edges: Start→LLM→CoT strip→JSON clean→Sort→End |
| `workflow/resume_translation.yml` | Rewritten translation workflow with merged single LLM node and constrained prompt | VERIFIED | File exists, valid YAML (UTF-8), 5 nodes, 4 edges: Start→LLM→CoT strip→JSON clean→End |
| `backend/app/services/dify_client.py` | CoT stripping safety net in both extract_resume and translate_resume | VERIFIED | `_strip_cot_tags()` defined at line 26, called in extract_resume (line 73) and translate_resume (line 117) |
| `backend/tests/test_dify_cot_stripping.py` | Unit tests for CoT stripping logic containing test_strip* | VERIFIED | 5 tests exist and all pass: single block, multiline, clean passthrough, multiple blocks, warning logging |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `workflow/resume_extraction.yml` LLM node (1740000000002) | CoT strip code node (1740000000005) | Edge in YAML graph | WIRED | Edge `1740000000002-source-1740000000005-target` present; CoT node variable_selector reads `[1740000000002, text]` |
| CoT strip node (1740000000005) | JSON clean node (1740000000003) | Edge in YAML graph | WIRED | Edge `1740000000005-source-1740000000003-target` present; JSON clean variable_selector reads `[1740000000005, result]` |
| JSON clean node (1740000000003) | Sort node (1740000000006) | Edge in YAML graph | WIRED | Edge `1740000000003-source-1740000000006-target` present; sort node reads `[1740000000003, result]` |
| Sort node (1740000000006) | End node (1740000000004) | Edge in YAML graph | WIRED | Edge `1740000000006-source-1740000000004-target` present; End node output `variable: structured_resume` reads `[1740000000006, result]` |
| `workflow/resume_translation.yml` LLM node (1740100000002) | CoT strip code node (17715808726430) | Edge in YAML graph | WIRED | Edge `1740100000002-source-17715808726430-target` present |
| CoT strip node (17715808726430) | JSON clean node (1740100000004) | Edge in YAML graph | WIRED | Edge `17715808726430-source-1740100000004-target` present; JSON clean reads `[17715808726430, result]` |
| JSON clean node (1740100000004) | End node (1740100000005) | Edge in YAML graph | WIRED | Edge `1740100000004-source-1740100000005-target` present; End output `variable: jp_resume_json` reads `[1740100000004, result]` |
| `backend/app/services/dify_client.py` `_strip_cot_tags` | `json.loads` | Called before json.loads in both methods | WIRED | extract_resume: strip at line 73, loads at line 75; translate_resume: strip at line 117, loads at line 119 |
| `backend/app/services/dify_client.py` `extract_resume` | workflow output `structured_resume` | `outputs.get("structured_resume")` | WIRED | Line 65 reads "structured_resume"; matches extraction workflow End node output variable name |
| `backend/app/services/dify_client.py` `translate_resume` | workflow output `jp_resume_json` | `outputs.get("jp_resume_json")` | WIRED | Line 109 reads "jp_resume_json"; matches translation workflow End node output variable name |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| WKFL-01 | 07-01-PLAN.md | Dify extraction workflow strips `<think>...</think>` CoT tokens before outputting, so backend always receives clean structured JSON | SATISFIED | Node 1740000000005 (CoT strip) is wired between LLM and JSON clean in extraction workflow; contains re.sub think regex |
| WKFL-02 | 07-01-PLAN.md | Dify extraction prompts improved — better field coverage, fewer null fields for complete resumes | SATISFIED | Prompt reframed from permissive "准确提取所有关键信息" to constrained; adds cross-section cert extraction (CET/JLPT), section classification by content, exact date rules — all improvements that directly reduce null fields |
| WKFL-03 | 07-01-PLAN.md | Dify translation prompts improved — more natural business Japanese, better keigo usage | SATISFIED | Single merged LLM prompt with です/ます体 throughout, light 謙譲語 for motivation only, removed "過度に堅い表現", removed marketing-language generation instructions |
| WKFL-04 | 07-02-PLAN.md | Backend API layer strips any residual CoT tags as a safety net before JSON parsing | SATISFIED | `_strip_cot_tags()` defined and called before `json.loads()` in both `extract_resume()` and `translate_resume()`; 5 unit tests pass; warning logged on activation |

**Orphaned requirements check:** REQUIREMENTS.md maps WKFL-01, WKFL-02, WKFL-03, WKFL-04 to Phase 7. All four appear in plan frontmatter (`requirements:` fields in 07-01-PLAN.md and 07-02-PLAN.md). No orphaned requirements.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| — | — | None found | — | No TODO, FIXME, placeholder, empty impl, or console.log patterns detected in any modified file |

---

### Human Verification Required

#### 1. Extraction output quality on a real resume

**Test:** Import `workflow/resume_extraction.yml` into Dify Cloud and run against the reference PDF (`text.pdf` in project root). Compare output to known issues: "None" literals in dates, phantom job entries, missing CET-6 in certifications.
**Expected:** Dates output as YYYY-MM or partial year (not "None"), certifications array includes CET-6 even if found outside the certifications section, work_experience does not contain project-only entries.
**Why human:** The LLM prompt changes address the known issues but correctness depends on actual LLM inference behavior on real resume text — cannot verify by static analysis alone.

#### 2. Translation output naturalness on a real resume

**Test:** Import `workflow/resume_translation.yml` into Dify Cloud. Run the extracted JSON through translation. Read the Japanese output for summary, motivation, and strengths fields.
**Expected:** Text reads as natural business Japanese without added marketing phrases ("貢献", "成長", "チームワーク") that were not in the source. Keigo in motivation section feels appropriate but not overly stiff.
**Why human:** Natural language quality and keigo appropriateness cannot be verified by grep or static analysis.

#### 3. Dify Cloud import compatibility

**Test:** Import both YML files into Dify Cloud as new workflow apps.
**Expected:** Import succeeds without schema errors. Workflow graph displays the correct node layout.
**Why human:** YAML parses correctly locally but Dify Cloud may enforce additional constraints (node schema versions, plugin identifier validation) that cannot be verified statically.

---

### Gaps Summary

No gaps. All 10 observable truths verified, all 4 required artifacts pass all three levels (existence, substantive implementation, wiring), all 8 key links wired end-to-end, all 4 requirements (WKFL-01 through WKFL-04) satisfied with implementation evidence, and no blocker anti-patterns found.

Three items are flagged for human verification (extraction quality, translation naturalness, Dify Cloud import). These are quality validation concerns on live infrastructure — they do not indicate missing implementation.

---

### Commit Verification

| Commit | Description | Verified |
|--------|-------------|---------|
| cbe2412 | feat(07-01): rewrite extraction workflow | Present in git log |
| 8ce274f | feat(07-01): rewrite translation workflow | Present in git log |
| 00550f7 | feat(07-02): add CoT stripping safety net to DifyClient | Present in git log |
| aab61dd | test(07-02): add unit tests for CoT stripping | Present in git log |

---

_Verified: 2026-02-20T12:30:00Z_
_Verifier: Claude (gsd-verifier)_
