import { useTranslation } from 'react-i18next';
import { useWizardStore } from '../../stores/useWizardStore.ts';

const stepKeys = [
  'upload',
  'reviewExtraction',
  'reviewTranslation',
  'preview',
] as const;

export default function StepIndicator() {
  const { t } = useTranslation('wizard');
  const { currentStep, setStep } = useWizardStore();

  return (
    <nav className="flex items-center justify-between">
      {stepKeys.map((key, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;
        const isClickable = index <= currentStep;

        return (
          <div key={key} className="flex flex-1 items-center">
            <button
              type="button"
              onClick={() => isClickable && setStep(index)}
              disabled={!isClickable}
              className={`flex flex-col items-center gap-1.5 ${
                isClickable ? 'cursor-pointer' : 'cursor-default'
              }`}
            >
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors ${
                  isCompleted
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : isActive
                      ? 'border-indigo-600 bg-white text-indigo-600'
                      : 'border-gray-300 bg-white text-gray-400'
                }`}
              >
                {isCompleted ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={`text-xs font-medium whitespace-nowrap ${
                  isActive
                    ? 'text-indigo-600'
                    : isCompleted
                      ? 'text-indigo-600'
                      : 'text-gray-400'
                }`}
              >
                {t(`steps.${key}.title`)}
              </span>
            </button>
            {index < stepKeys.length - 1 && (
              <div
                className={`mx-2 h-0.5 flex-1 transition-colors ${
                  index < currentStep ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
