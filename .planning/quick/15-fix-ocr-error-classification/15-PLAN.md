---
phase: quick-15
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - frontend/src/utils/errorClassifier.ts
autonomous: true
requirements: []
must_haves:
  truths:
    - "OCR 'not available' error is classified as 'ocr' type"
    - "Users see OCR-specific error message when OCR service unavailable"
  artifacts:
    - path: frontend/src/utils/errorClassifier.ts
      provides: Error classification logic
      contains: "Scanned document"
  key_links:
    - from: frontend/src/utils/errorClassifier.ts
      to: i18n error messages
      via: titleKey/messageKey
      pattern: "errors\.ocr\.(title|message)"
---

<objective>
Fix OCR error classification bug — "Scanned document processing is not available" errors are misclassified as 'unknown' instead of 'ocr'.

Purpose: Ensure users see proper OCR-specific error messages when the OCR service is unavailable.
Output: Updated errorClassifier.ts with correct pattern matching.
</objective>

<execution_context>
@C:/Users/zhang/.config/opencode/get-shit-done/workflows/execute-plan.md
@C:/Users/zhang/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/v1.1-MILESTONE-AUDIT.md

**Bug Details (from audit):**
- Location: `frontend/src/utils/errorClassifier.ts:48`
- Current check: `if (rawMessage.includes('OCR') || rawMessage.includes('503'))`
- Backend message: `"Scanned document processing is not available."`
- Problem: Backend message contains neither "OCR" nor "503"

**i18n already has OCR error messages:**
- zh: `"ocr": { "title": "处理错误", "message": "文件处理失败。如果是扫描件PDF，请尝试使用更清晰的图像" }`
- ja: Similar structure exists
</context>

<tasks>

<task type="auto">
  <name>Fix OCR error pattern matching</name>
  <files>frontend/src/utils/errorClassifier.ts</files>
  <action>
    Update the OCR error check on line 48 to include "Scanned document" pattern.

    Change:
    ```typescript
    if (rawMessage.includes('OCR') || rawMessage.includes('503')) {
    ```

    To:
    ```typescript
    if (rawMessage.includes('OCR') || rawMessage.includes('503') || rawMessage.includes('Scanned document')) {
    ```

    This ensures the backend's "Scanned document processing is not available." message is correctly classified as an OCR error.
  </action>
  <verify>
    1. Run `npm run build` in frontend directory — must pass
    2. Grep confirms pattern change: `grep -n "Scanned document" frontend/src/utils/errorClassifier.ts`
  </verify>
  <done>
    OCR "not available" errors (with "Scanned document processing is not available" message) are classified as type 'ocr' instead of 'unknown'.
  </done>
</task>

</tasks>

<verification>
- `npm run build` in frontend succeeds
- errorClassifier.ts contains "Scanned document" in the OCR error check
</verification>

<success_criteria>
The errorClassifier.ts correctly identifies OCR service unavailable errors and returns `type: 'ocr'` with appropriate i18n keys.
</success_criteria>

<output>
After completion, create `.planning/quick/15-fix-ocr-error-classification/15-SUMMARY.md`
</output>
