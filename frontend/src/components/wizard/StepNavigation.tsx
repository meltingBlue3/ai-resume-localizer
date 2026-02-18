import { useTranslation } from 'react-i18next';
import { useWizardStore } from '../../stores/useWizardStore.ts';

export default function StepNavigation() {
  const { t } = useTranslation();
  const { currentStep, totalSteps, nextStep, prevStep } = useWizardStore();

  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;

  return (
    <div className="flex justify-between pt-6">
      <div>
        {!isFirst && (
          <button
            type="button"
            onClick={prevStep}
            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
          >
            {t('previous')}
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={nextStep}
        className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
      >
        {isLast ? t('finish') : t('next')}
      </button>
    </div>
  );
}
