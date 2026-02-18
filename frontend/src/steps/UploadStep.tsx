import { useTranslation } from 'react-i18next';
import { useWizardStore } from '../stores/useWizardStore.ts';

export default function UploadStep() {
  const { t } = useTranslation('wizard');
  const stepData = useWizardStore((s) => s.stepData[0] as { notes?: string } | undefined);
  const setStepData = useWizardStore((s) => s.setStepData);

  return (
    <div className="space-y-6">
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

      <div className="rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center">
        <p className="text-sm text-slate-400">{t('placeholder')}</p>
      </div>

      <div>
        <label htmlFor="upload-notes" className="mb-1.5 block text-sm font-medium text-slate-700">
          {t('inputLabel')}
        </label>
        <input
          id="upload-notes"
          type="text"
          value={stepData?.notes ?? ''}
          onChange={(e) => setStepData(0, { ...stepData, notes: e.target.value })}
          placeholder={t('inputPlaceholder')}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
        />
      </div>
    </div>
  );
}
