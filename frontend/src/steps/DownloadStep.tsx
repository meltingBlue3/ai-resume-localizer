import { useTranslation } from 'react-i18next';

export default function DownloadStep() {
  const { t } = useTranslation('wizard');

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-rose-100">
          <svg className="h-6 w-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-800">{t('steps.download.title')}</h2>
          <p className="mt-1 text-sm text-slate-500">{t('steps.download.description')}</p>
        </div>
      </div>

      <div className="rounded-lg border-2 border-dashed border-rose-200 bg-rose-50 p-8 text-center">
        <p className="text-sm text-slate-400">{t('placeholder')}</p>
      </div>
    </div>
  );
}
