import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWizardStore } from '../stores/useWizardStore.ts';
import { useResumeStore } from '../stores/useResumeStore.ts';
import { uploadAndExtract } from '../api/client.ts';
import FileDropzone from '../components/upload/FileDropzone.tsx';
import { classifyError, type ClassifiedError } from '../utils/errorClassifier';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { useProgressStages, type ProgressStage } from '../hooks/useProgressStages';

const EXTRACTION_STAGES: readonly ProgressStage[] = [
  { delay: 0, key: 'progress.uploading' },
  { delay: 2000, key: 'progress.extractingText' },
  { delay: 5000, key: 'progress.aiAnalyzing' },
  { delay: 15000, key: 'progress.almostDone' },
];

export default function UploadStep() {
  const { t } = useTranslation('wizard');
  const nextStep = useWizardStore((s) => s.nextStep);

  const resumeFile = useResumeStore((s) => s.resumeFile);
  const isExtracting = useResumeStore((s) => s.isExtracting);

  const setResumeFile = useResumeStore((s) => s.setResumeFile);
  const setExtracting = useResumeStore((s) => s.setExtracting);
  const setExtractionResult = useResumeStore((s) => s.setExtractionResult);
  const setExtractionError = useResumeStore((s) => s.setExtractionError);
  const clearExtractionAndTranslation = useResumeStore((s) => s.clearExtractionAndTranslation);

  const [classifiedError, setClassifiedError] = useState<ClassifiedError | null>(null);

  const currentStage = useProgressStages(isExtracting, EXTRACTION_STAGES);

  const handleExtract = async () => {
    if (!resumeFile) return;

    clearExtractionAndTranslation();
    setExtracting(true);
    setExtractionError(null);
    setClassifiedError(null);

    try {
      const response = await uploadAndExtract(resumeFile);
      setExtractionResult(response.raw_text, response.cn_resume_data);
      nextStep();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setExtractionError(message);
      setClassifiedError(classifyError(err));
      setExtracting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Step header */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-100">
          <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-800">{t('steps.upload.title')}</h2>
          <p className="mt-1 text-sm text-slate-500">{t('steps.upload.description')}</p>
        </div>
      </div>

      <FileDropzone
        onFileAccepted={setResumeFile}
        currentFile={resumeFile}
        disabled={isExtracting}
      />

      {/* Error banner */}
      {classifiedError && (
        <ErrorBanner
          error={classifiedError}
          onRetry={handleExtract}
          onDismiss={() => { setClassifiedError(null); setExtractionError(null); }}
        />
      )}

      {/* Extract button */}
      <div className="flex justify-center">
        <button
          type="button"
          disabled={!resumeFile || isExtracting}
          onClick={handleExtract}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isExtracting ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {t(currentStage ?? 'steps.upload.extracting')}
            </>
          ) : (
            t('steps.upload.extractButton')
          )}
        </button>
      </div>
    </div>
  );
}
