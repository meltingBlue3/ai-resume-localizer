---
phase: quick-003
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - frontend/src/stores/useWizardStore.ts
  - frontend/src/components/wizard/WizardShell.tsx
  - frontend/src/components/wizard/StepIndicator.tsx
  - frontend/src/i18n/locales/zh/wizard.json
  - frontend/src/i18n/locales/ja/wizard.json
  - frontend/src/steps/DownloadStep.tsx
autonomous: true
must_haves:
  truths:
    - "Wizard has exactly 4 steps: Upload, ReviewExtraction, ReviewTranslation, Preview"
    - "PreviewStep is the final step and shows finish button"
    - "Step indicator shows 4 dots with correct labels"
    - "DownloadStep component no longer exists"
  artifacts:
    - path: "frontend/src/stores/useWizardStore.ts"
      provides: "totalSteps set to 4"
      contains: "totalSteps: 4"
    - path: "frontend/src/components/wizard/WizardShell.tsx"
      provides: "4-step array without DownloadStep"
    - path: "frontend/src/components/wizard/StepIndicator.tsx"
      provides: "4 step keys without download"
  key_links:
    - from: "useWizardStore.ts"
      to: "StepNavigation.tsx"
      via: "totalSteps drives isLast logic"
      pattern: "currentStep === totalSteps - 1"
---

<objective>
Remove the redundant DownloadStep from the wizard, simplifying from 5 steps to 4.

Purpose: PreviewStep already has full download functionality in its toolbar, making DownloadStep redundant. Removing it streamlines the user flow.
Output: A clean 4-step wizard (Upload -> ReviewExtraction -> ReviewTranslation -> Preview) with PreviewStep as the final step.
</objective>

<execution_context>
@C:/Users/zhang/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/zhang/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@frontend/src/stores/useWizardStore.ts
@frontend/src/components/wizard/WizardShell.tsx
@frontend/src/components/wizard/StepIndicator.tsx
@frontend/src/components/wizard/StepNavigation.tsx
@frontend/src/i18n/locales/zh/wizard.json
@frontend/src/i18n/locales/ja/wizard.json
@frontend/src/steps/DownloadStep.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Remove DownloadStep from wizard flow and update step count</name>
  <files>
    frontend/src/stores/useWizardStore.ts
    frontend/src/components/wizard/WizardShell.tsx
    frontend/src/components/wizard/StepIndicator.tsx
  </files>
  <action>
1. In `useWizardStore.ts`: Change `totalSteps: 5` to `totalSteps: 4`.

2. In `WizardShell.tsx`:
   - Remove the import line: `import DownloadStep from '../../steps/DownloadStep.tsx';`
   - Remove `DownloadStep` from the `steps` array so it becomes: `[UploadStep, ReviewExtractionStep, ReviewTranslationStep, PreviewStep]`
   - Leave `isWideStep` logic unchanged (`currentStep >= 1 && currentStep <= 3`) — this is still correct since steps 1-3 are all wide steps.

3. In `StepIndicator.tsx`:
   - Remove `'download'` from the `stepKeys` array so it becomes: `['upload', 'reviewExtraction', 'reviewTranslation', 'preview']`

No changes needed to StepNavigation.tsx — it already uses `currentStep === totalSteps - 1` to determine the last step, so with totalSteps=4, step 3 (PreviewStep) will automatically show the finish button.

No changes needed to PreviewStep.tsx — the `setStep(2)` call in its no-data guard still correctly refers to ReviewTranslationStep (step index 2).
  </action>
  <verify>
Run `npx tsc --noEmit` from the frontend directory to confirm no TypeScript errors. Verify no remaining imports or references to DownloadStep in the modified files.
  </verify>
  <done>
Wizard store reports 4 total steps. WizardShell renders 4 steps without DownloadStep. StepIndicator shows 4 step labels.
  </done>
</task>

<task type="auto">
  <name>Task 2: Update i18n labels and delete DownloadStep file</name>
  <files>
    frontend/src/i18n/locales/zh/wizard.json
    frontend/src/i18n/locales/ja/wizard.json
    frontend/src/steps/DownloadStep.tsx
  </files>
  <action>
1. In `zh/wizard.json`:
   - Change `steps.preview.title` from `"预览简历"` to `"预览与下载"`
   - Change `steps.preview.description` from `"预览生成的日文履歴書和職務経歴書"` to `"预览并下载生成的日文履歴書和職務経歴書"`
   - Remove the entire `steps.download` object (keys: title, description, ready, readyDescription, rirekishoCard, shokumukeirekishoCard)

2. In `ja/wizard.json`:
   - Change `steps.preview.title` from `"プレビュー"` to `"プレビュー・ダウンロード"`
   - Change `steps.preview.description` from `"生成された日本語の履歴書と職務経歴書をプレビューします"` to `"生成された日本語の履歴書と職務経歴書をプレビュー・ダウンロードします"`
   - Remove the entire `steps.download` object (keys: title, description, ready, readyDescription, rirekishoCard, shokumukeirekishoCard)

3. Delete the file `frontend/src/steps/DownloadStep.tsx`.
  </action>
  <verify>
Confirm DownloadStep.tsx no longer exists: `ls frontend/src/steps/DownloadStep.tsx` should fail. Validate JSON syntax: `node -e "require('./frontend/src/i18n/locales/zh/wizard.json')"` and same for ja. Run `npx tsc --noEmit` from frontend to confirm no broken imports.
  </verify>
  <done>
DownloadStep.tsx is deleted. Both zh and ja wizard.json have updated preview step titles reflecting download capability, and no longer contain the steps.download section. No TypeScript or JSON parse errors.
  </done>
</task>

</tasks>

<verification>
1. `cd frontend && npx tsc --noEmit` — no TypeScript errors
2. `cd frontend && npm run build` — builds successfully
3. Manual check: grep for "DownloadStep" across frontend/src — should return zero results
4. JSON validity: both wizard.json files parse without errors
</verification>

<success_criteria>
- Wizard has exactly 4 steps (0-3)
- PreviewStep is the final step (index 3) and shows finish/complete button
- Step indicator displays 4 steps with labels: Upload, ReviewExtraction, ReviewTranslation, Preview
- DownloadStep.tsx file no longer exists in the codebase
- No broken imports or TypeScript errors
- i18n labels for the preview step reflect that it now includes download functionality
</success_criteria>

<output>
After completion, create `.planning/quick/003-remove-download-step/003-SUMMARY.md`
</output>
