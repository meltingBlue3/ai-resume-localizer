import { useTranslation } from 'react-i18next';

export default function ReviewTranslationStep() {
  const { t } = useTranslation('wizard');

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-violet-100">
          <svg className="h-6 w-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-800">{t('steps.reviewTranslation.title')}</h2>
          <p className="mt-1 text-sm text-slate-500">{t('steps.reviewTranslation.description')}</p>
        </div>
      </div>

      <div className="rounded-lg border-2 border-dashed border-violet-200 bg-violet-50 p-8 text-center">
        <p className="text-sm text-slate-400">{t('placeholder')}</p>
      </div>
    </div>
  );
}
