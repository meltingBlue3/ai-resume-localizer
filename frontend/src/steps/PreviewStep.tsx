import { useTranslation } from 'react-i18next';
import { useWizardStore } from '../stores/useWizardStore.ts';

export default function PreviewStep() {
  const { t } = useTranslation('wizard');
  const stepData = useWizardStore((s) => s.stepData[3] as { feedback?: string } | undefined);
  const setStepData = useWizardStore((s) => s.setStepData);

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-amber-100">
          <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-800">{t('steps.preview.title')}</h2>
          <p className="mt-1 text-sm text-slate-500">{t('steps.preview.description')}</p>
        </div>
      </div>

      <div className="rounded-lg border-2 border-dashed border-amber-200 bg-amber-50 p-8 text-center">
        <p className="text-sm text-slate-400">{t('placeholder')}</p>
      </div>

      <div>
        <label htmlFor="preview-feedback" className="mb-1.5 block text-sm font-medium text-slate-700">
          {t('inputLabel')}
        </label>
        <input
          id="preview-feedback"
          type="text"
          value={stepData?.feedback ?? ''}
          onChange={(e) => setStepData(3, { ...stepData, feedback: e.target.value })}
          placeholder={t('inputPlaceholder')}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
        />
      </div>
    </div>
  );
}
