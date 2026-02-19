import { useTranslation } from 'react-i18next';
import { useWizardStore } from '../stores/useWizardStore.ts';
import { useResumeStore } from '../stores/useResumeStore.ts';
import DocumentViewer from '../components/review/DocumentViewer.tsx';
import ResumeFieldEditor from '../components/review/ResumeFieldEditor.tsx';
import { computeCompleteness } from '../utils/completeness';
import { CompletenessIndicator } from '../components/ui/CompletenessIndicator';

export default function ReviewExtractionStep() {
  const { t } = useTranslation('wizard');
  const setStep = useWizardStore((s) => s.setStep);

  const resumeFile = useResumeStore((s) => s.resumeFile);
  const cnResumeData = useResumeStore((s) => s.cnResumeData);
  const setCnResumeData = useResumeStore((s) => s.setCnResumeData);

  const completeness = cnResumeData ? computeCompleteness(cnResumeData) : null;

  if (!resumeFile || !cnResumeData) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <p className="mt-4 text-sm text-slate-500">{t('steps.reviewExtraction.noData')}</p>
        <button
          type="button"
          onClick={() => setStep(0)}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          {t('steps.reviewExtraction.goBack')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Step header */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
          <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-800">{t('steps.reviewExtraction.title')}</h2>
          <p className="mt-1 text-sm text-slate-500">{t('steps.reviewExtraction.description')}</p>
        </div>
      </div>

      {/* Side-by-side panels */}
      <div className="grid h-[calc(100vh-14rem)] grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Left: Original document */}
        <div className="flex flex-col overflow-hidden rounded-lg border border-slate-200">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5">
            <h3 className="text-sm font-semibold text-slate-700">{t('steps.reviewExtraction.originalDoc')}</h3>
          </div>
          <div className="flex-1 overflow-y-auto bg-slate-100">
            <DocumentViewer file={resumeFile} />
          </div>
        </div>

        {/* Right: Extracted data editor */}
        <div className="flex flex-col overflow-hidden rounded-lg border border-slate-200">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">{t('steps.reviewExtraction.extractedData')}</h3>
              {completeness && (
                <div className="w-48">
                  <CompletenessIndicator {...completeness} />
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <ResumeFieldEditor data={cnResumeData} onChange={setCnResumeData} />
          </div>
        </div>
      </div>
    </div>
  );
}
