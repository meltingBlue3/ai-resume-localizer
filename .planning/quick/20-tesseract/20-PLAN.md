---
phase: 20-tesseract
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - backend/app/services/ocr_service.py
  - .planning/PROJECT.md
  - .planning/phases/08-ocr-support/08-USER-SETUP.md
autonomous: true
must_haves:
  truths:
    - "OCR only uses chi_sim, jpn, and eng language packs"
    - "User setup docs no longer mention chi_tra"
  artifacts:
    - path: "backend/app/services/ocr_service.py"
      provides: "OCR language configuration"
      contains: "chi_sim+jpn+eng"
  key_links: []
---

<objective>
Remove Traditional Chinese (chi_tra) support from Tesseract OCR configuration.

Purpose: Simplify OCR to only support languages needed for Chinese resume input (Simplified Chinese only) and Japanese resume output.
Output: Updated OCR config and documentation.
</objective>

<execution_context>
@C:/Users/zhang/.config/opencode/get-shit-done/workflows/execute-plan.md
@C:/Users/zhang/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Update OCR language configuration</name>
  <files>backend/app/services/ocr_service.py</files>
  <action>
    Update the `OCR_LANGUAGES` constant in `OCRService` class:
    
    - Change line 25 from:
      ```python
      OCR_LANGUAGES = "chi_sim+chi_tra+jpn+eng"
      ```
      to:
      ```python
      OCR_LANGUAGES = "chi_sim+jpn+eng"
      ```
    
    - Update the comment on line 24 to remove "Chinese Traditional":
      Change "Languages for OCR: Chinese Simplified, Chinese Traditional, Japanese, English"
      to "Languages for OCR: Chinese Simplified, Japanese, English"
  </action>
  <verify>
    ```bash
    grep -n "OCR_LANGUAGES" backend/app/services/ocr_service.py
    ```
    Should show: `OCR_LANGUAGES = "chi_sim+jpn+eng"`
  </verify>
  <done>
    OCR_LANGUAGES constant no longer includes chi_tra.
  </done>
</task>

<task type="auto">
  <name>Task 2: Update documentation</name>
  <files>.planning/PROJECT.md, .planning/phases/08-ocr-support/08-USER-SETUP.md</files>
  <action>
    Update all documentation references to remove chi_tra:
    
    1. **PROJECT.md** (line 75):
       - Change: `支持chi_sim+chi_tra+jpn+eng`
       - To: `支持chi_sim+jpn+eng`
    
    2. **08-USER-SETUP.md**:
       - Line 40: Remove `chi_tra.traineddata` from files needed list
       - Line 61: Remove `chi_tra` from expected language list
       - Line 76: Remove `chi_tra` from expected language list
       - Line 37: Update "Chinese Simplified, Chinese Traditional, Japanese, English" to "Chinese Simplified, Japanese, English"
  </action>
  <verify>
    ```bash
    grep -r "chi_tra" .planning/PROJECT.md .planning/phases/08-ocr-support/08-USER-SETUP.md
    ```
    Should return no matches.
  </verify>
  <done>
    All documentation updated to remove chi_tra references.
  </done>
</task>

<task type="auto">
  <name>Task 3: Verify tests still pass</name>
  <files>backend/tests/test_ocr_service.py</files>
  <action>
    Run the OCR service tests to ensure the change doesn't break anything.
    The tests only check for `chi_sim` and `jpn` (not `chi_tra`), so they should pass.
  </action>
  <verify>
    ```bash
    cd backend && pytest tests/test_ocr_service.py -v
    ```
    All tests should pass.
  </verify>
  <done>
    All OCR service tests pass after removing chi_tra.
  </done>
</task>

</tasks>

<verification>
- [ ] OCR_LANGUAGES constant is `chi_sim+jpn+eng`
- [ ] No chi_tra references in active documentation (PROJECT.md, USER-SETUP.md)
- [ ] Tests pass
</verification>

<success_criteria>
OCR configuration simplified to three languages (chi_sim, jpn, eng) with all documentation updated accordingly.
</success_criteria>

<output>
After completion, create `.planning/quick/20-tesseract/20-SUMMARY.md`
</output>
