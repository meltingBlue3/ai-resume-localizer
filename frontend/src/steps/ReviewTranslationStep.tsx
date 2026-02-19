import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWizardStore } from '../stores/useWizardStore';
import { useResumeStore } from '../stores/useResumeStore';
import { translateResume } from '../api/client';
import ResumeFieldEditor from '../components/review/ResumeFieldEditor';
import JpResumeFieldEditor from '../components/review/JpResumeFieldEditor';
import { classifyError, type ClassifiedError } from '../utils/errorClassifier';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { computeCompleteness } from '../utils/completeness';
import { CompletenessIndicator } from '../components/ui/CompletenessIndicator';
import { useProgressStages, type ProgressStage } from '../hooks/useProgressStages';

const TRANSLATION_STAGES: readonly ProgressStage[] = [
  { delay: 0, key: 'progress.translating' },
  { delay: 2000, key: 'progress.aiTranslating' },
  { delay: 8000, key: 'progress.localizing' },
  { delay: 20000, key: 'progress.translationAlmostDone' },
];

export default function ReviewTranslationStep() {
  const { t } = useTranslation('wizard');
  const setStep = useWizardStore((s) => s.setStep);

  const cnResumeData = useResumeStore((s) => s.cnResumeData);
  const jpResumeData = useResumeStore((s) => s.jpResumeData);
  const setJpResumeData = useResumeStore((s) => s.setJpResumeData);
  const isTranslating = useResumeStore((s) => s.isTranslating);
  const setIsTranslating = useResumeStore((s) => s.setIsTranslating);
  const setTranslationError = useResumeStore((s) => s.setTranslationError);

  const [classifiedError, setClassifiedError] = useState<ClassifiedError | null>(null);

  const currentStage = useProgressStages(isTranslating, TRANSLATION_STAGES);
  const completeness = jpResumeData ? computeCompleteness(jpResumeData) : null;

  if (!cnResumeData) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <p className="mt-4 text-sm text-slate-500">{t('reviewTranslation.noData')}</p>
        <button
          type="button"
          onClick={() => setStep(0)}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          {t('reviewTranslation.goBack')}
        </button>
      </div>
    );
  }

  const handleTranslate = async () => {
    if (!cnResumeData) return;
    setIsTranslating(true);
    setTranslationError(null);
    setClassifiedError(null);
    try {
      const result = await translateResume(cnResumeData);
      setJpResumeData(result);
    } catch (err) {
      setTranslationError(err instanceof Error ? err.message : 'Translation failed');
      setClassifiedError(classifyError(err));
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-13rem)]">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-violet-100">
            <svg className="h-6 w-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-800">{t('reviewTranslation.title')}</h2>
            {jpResumeData && (
              <p className="mt-1 text-sm text-slate-500">{t('reviewTranslation.editHint')}</p>
            )}
            {completeness && (
              <div className="mt-2 w-64">
                <CompletenessIndicator {...completeness} />
              </div>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={handleTranslate}
          disabled={isTranslating}
          className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isTranslating && (
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {isTranslating
            ? t(currentStage ?? 'reviewTranslation.translating')
            : jpResumeData
              ? t('reviewTranslation.retranslateButton')
              : t('reviewTranslation.translateButton')}
        </button>
      </div>

      {/* Error banner */}
      {classifiedError && (
        <div className="mb-4">
          <ErrorBanner
            error={classifiedError}
            onRetry={handleTranslate}
            onDismiss={() => { setClassifiedError(null); setTranslationError(null); }}
          />
        </div>
      )}

      {/* Two-panel grid */}
      <div className="grid grid-cols-1 gap-4 flex-1 overflow-hidden lg:grid-cols-2">
        {/* Left: Chinese read-only */}
        <div className="flex flex-col overflow-hidden rounded-lg border border-slate-200">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5">
            <h3 className="text-sm font-semibold text-slate-700">{t('reviewTranslation.chinesePanel')}</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <ResumeFieldEditor data={cnResumeData} onChange={() => {}} readOnly />
          </div>
        </div>

        {/* Right: Japanese editable */}
        <div className="flex flex-col overflow-hidden rounded-lg border border-slate-200">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5">
            <h3 className="text-sm font-semibold text-slate-700">{t('reviewTranslation.japanesePanel')}</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {jpResumeData ? (
              <JpResumeFieldEditor data={jpResumeData} onChange={setJpResumeData} />
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-slate-400">
                  {isTranslating
                    ? t(currentStage ?? 'reviewTranslation.translating')
                    : t('reviewTranslation.translateButton')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
