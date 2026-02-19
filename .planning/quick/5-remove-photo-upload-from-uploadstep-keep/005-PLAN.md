---
phase: quick-005
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - frontend/src/steps/UploadStep.tsx
autonomous: true
must_haves:
  truths:
    - "UploadStep renders only the FileDropzone, no photo dropzone"
    - "PreviewStep upload photo flow is untouched and still functional"
  artifacts:
    - path: "frontend/src/steps/UploadStep.tsx"
      provides: "Resume file upload only"
      contains: "FileDropzone"
  key_links:
    - from: "frontend/src/steps/UploadStep.tsx"
      to: "frontend/src/components/upload/PhotoDropzone.tsx"
      via: "import removed"
      pattern: "PhotoDropzone"
---

<objective>
Remove PhotoDropzone from UploadStep so photo upload is only accessible from PreviewStep.

Purpose: Simplify the upload step to focus solely on resume file upload; photo upload belongs in the preview/finalization flow.
Output: UploadStep with only FileDropzone, PreviewStep photo flow untouched.
</objective>

<execution_context>
@C:/Users/zhang/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/zhang/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@frontend/src/steps/UploadStep.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Remove PhotoDropzone from UploadStep</name>
  <files>frontend/src/steps/UploadStep.tsx</files>
  <action>
    Edit `frontend/src/steps/UploadStep.tsx`:

    1. Remove the import line: `import PhotoDropzone from '../components/upload/PhotoDropzone.tsx';`

    2. Remove the two store reads that are only used by PhotoDropzone:
       - `const photoFile = useResumeStore((s) => s.photoFile);`
       - `const setPhotoFile = useResumeStore((s) => s.setPhotoFile);`

    3. Replace the two-column dropzone grid with a plain single FileDropzone. Change:
       ```tsx
       {/* Dropzones: two columns on lg, stacked on mobile */}
       <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
         <FileDropzone
           onFileAccepted={setResumeFile}
           currentFile={resumeFile}
           disabled={isExtracting}
         />
         <div className="lg:w-48">
           <PhotoDropzone
             onPhotoAccepted={setPhotoFile}
             currentPhoto={photoFile}
             disabled={isExtracting}
           />
         </div>
       </div>
       ```
       To:
       ```tsx
       <FileDropzone
         onFileAccepted={setResumeFile}
         currentFile={resumeFile}
         disabled={isExtracting}
       />
       ```

    Do NOT touch the comment above — remove it along with the wrapper div. Do NOT modify any other section of the file. The PhotoDropzone component file itself is NOT deleted (PreviewStep may still reference it indirectly; the component remains available).
  </action>
  <verify>
    Run `cd C:/Users/zhang/Desktop/Projects/FullStack/ai-resume-localizer/frontend && npx tsc --noEmit 2>&1` and confirm zero TypeScript errors related to UploadStep.tsx. Also confirm no `PhotoDropzone` or `photoFile` references remain in UploadStep.tsx.
  </verify>
  <done>
    UploadStep.tsx compiles cleanly, contains no PhotoDropzone import or usage, and renders only FileDropzone. PreviewStep.tsx is unmodified.
  </done>
</task>

</tasks>

<verification>
- `grep -n "PhotoDropzone\|photoFile\|setPhotoFile" frontend/src/steps/UploadStep.tsx` returns no matches.
- `grep -n "PhotoDropzone\|handleUploadPhoto\|fileInputRef" frontend/src/steps/PreviewStep.tsx` still returns matches (untouched).
- TypeScript build passes with no errors in UploadStep.tsx.
</verification>

<success_criteria>
UploadStep shows only the resume file dropzone. The photo upload entry point exists exclusively in PreviewStep via the toolbar button and PhotoCropper modal.
</success_criteria>

<output>
After completion, create `.planning/quick/5-remove-photo-upload-from-uploadstep-keep/005-SUMMARY.md`
</output>
