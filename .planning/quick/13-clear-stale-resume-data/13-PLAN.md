---
phase: 13-clear-stale-resume-data
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - frontend/src/stores/useResumeStore.ts
  - frontend/src/steps/UploadStep.tsx
  - frontend/src/steps/ReviewTranslationStep.tsx
autonomous: true
requirements: []
must_haves:
  truths:
    - "Clicking extract clears previous extraction data"
    - "Clicking extract clears previous translation data"
    - "Clicking translate clears previous translation data"
    - "Next step never shows stale data from previous sessions"
  artifacts:
    - path: "frontend/src/stores/useResumeStore.ts"
      provides: "New reset actions for partial state clearing"
      contains: "clearExtractionAndTranslation"
    - path: "frontend/src/steps/UploadStep.tsx"
      provides: "Calls clear action before extraction"
      pattern: "clearExtractionAndTranslation"
    - path: "frontend/src/steps/ReviewTranslationStep.tsx"
      provides: "Calls clear action before translation"
      pattern: "clearTranslationOnly"
  key_links:
    - from: "UploadStep.tsx"
      to: "useResumeStore"
      via: "clearExtractionAndTranslation()"
      pattern: "clearExtractionAndTranslation\\(\\)"
    - from: "ReviewTranslationStep.tsx"
      to: "useResumeStore"
      via: "clearTranslationOnly()"
      pattern: "clearTranslationOnly\\(\\)"
---

<objective>
Fix stale data issue where previous resume extraction/translation data persists across new operations.

**Purpose:** When a user starts a new extraction or translation, ensure all previous related data is cleared to prevent showing stale data on subsequent steps.

**Output:** Clean state transitions with no data leakage between operations.
</objective>

<execution_context>
@C:/Users/zhang/.config/opencode/get-shit-done/workflows/execute-plan.md
@C:/Users/zhang/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md

# Key Files
@frontend/src/stores/useResumeStore.ts
@frontend/src/steps/UploadStep.tsx
@frontend/src/steps/ReviewTranslationStep.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add clear actions to ResumeStore</name>
  <files>frontend/src/stores/useResumeStore.ts</files>
  <action>
    Add TWO new store actions to `useResumeStore.ts`:

    **Action 1: `clearExtractionAndTranslation`** - Clears all extraction AND translation data:
    - `rawText: null`
    - `cnResumeData: null`
    - `jpResumeData: null`
    - `translationError: null`
    - `croppedPhotoBase64: null`
    - `previewHtml: null`

    Used when starting a NEW extraction from UploadStep (fresh start).

    **Action 2: `clearTranslationOnly`** - Clears only translation-related data:
    - `jpResumeData: null`
    - `translationError: null`
    - `croppedPhotoBase64: null`
    - `previewHtml: null`

    Used when re-translating from ReviewTranslationStep (keeps extraction data intact).

    For each action:
    1. Add to `ResumeState` interface
    2. Add implementation using `set({ ...fields })`
  </action>
  <verify>
    `grep -c "clearExtractionAndTranslation\|clearTranslationOnly" frontend/src/stores/useResumeStore.ts` returns 4+ (interface + implementation for each)
  </verify>
  <done>Store has both `clearExtractionAndTranslation` and `clearTranslationOnly` actions
  </done>
</task>

<task type="auto">
  <name>Task 2: Clear stale data before extraction in UploadStep</name>
  <files>frontend/src/steps/UploadStep.tsx</files>
  <action>
    Modify `UploadStep.tsx` to call `clearExtractionAndTranslation()` at the start of extraction:

    1. Add `clearExtractionAndTranslation` to the store selectors (add line after `setExtractionError`):
       ```typescript
       const clearExtractionAndTranslation = useResumeStore((s) => s.clearExtractionAndTranslation);
       ```

    2. In `handleExtract`, add as the FIRST line (before `setExtracting(true)`):
       ```typescript
       clearExtractionAndTranslation();
       ```

    This ensures clicking "Extract" gives a completely fresh start.
  </action>
  <verify>
    `grep -A2 "const handleExtract" frontend/src/steps/UploadStep.tsx | grep "clearExtractionAndTranslation"` shows the call
  </verify>
  <done>UploadStep clears all previous data before starting new extraction
  </done>
</task>

<task type="auto">
  <name>Task 3: Clear stale data before translation in ReviewTranslationStep</name>
  <files>frontend/src/steps/ReviewTranslationStep.tsx</files>
  <action>
    Modify `ReviewTranslationStep.tsx` to call `clearTranslationOnly()` at the start of translation:

    1. Add `clearTranslationOnly` to the store selectors (add line after `setTranslationError`):
       ```typescript
       const clearTranslationOnly = useResumeStore((s) => s.clearTranslationOnly);
       ```

    2. In `handleTranslate`, add as the FIRST line (before `setIsTranslating(true)`):
       ```typescript
       clearTranslationOnly();
       ```

    Note: Use `clearTranslationOnly` (not `clearExtractionAndTranslation`) because clearing `cnResumeData` would cause the component to show the "no data" fallback since it checks `if (!cnResumeData)`.
  </action>
  <verify>
    `grep -A2 "const handleTranslate" frontend/src/steps/ReviewTranslationStep.tsx | grep "clearTranslationOnly"` shows the call
  </verify>
  <done>ReviewTranslationStep clears previous translation data before starting new translation
  </done>
</task>

</tasks>

<verification>
1. Build check: `cd frontend && npm run build` succeeds
2. Type check: `cd frontend && npm run typecheck` passes (if available)
3. Manual test flow:
   - Upload resume → Extract → Edit extraction → Translate → Edit translation
   - Go back to Upload → Upload new resume → Extract
   - Verify ReviewExtraction shows NEW data (not old)
   - Verify ReviewTranslation shows "Click translate" (not old translation)
</verification>

<success_criteria>
- Two new store actions exist: `clearExtractionAndTranslation` and `clearTranslationOnly`
- UploadStep clears all previous data before extraction
- ReviewTranslationStep clears translation data before re-translation
- No stale data persists between operations
- Build succeeds
</success_criteria>

<output>
After completion, create `.planning/quick/13-clear-stale-resume-data/13-SUMMARY.md`
</output>
