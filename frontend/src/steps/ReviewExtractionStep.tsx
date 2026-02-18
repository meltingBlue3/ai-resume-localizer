import { useTranslation } from 'react-i18next';

export default function ReviewExtractionStep() {
  const { t } = useTranslation('wizard');

  return (
    <div className="space-y-6">
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

      <div className="rounded-lg border-2 border-dashed border-emerald-200 bg-emerald-50 p-8 text-center">
        <p className="text-sm text-slate-400">{t('placeholder')}</p>
      </div>
    </div>
  );
}
