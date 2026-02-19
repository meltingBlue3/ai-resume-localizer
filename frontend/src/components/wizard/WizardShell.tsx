import { useTranslation } from 'react-i18next';
import { useWizardStore } from '../../stores/useWizardStore.ts';
import StepIndicator from './StepIndicator.tsx';
import StepNavigation from './StepNavigation.tsx';
import LanguageSwitcher from './LanguageSwitcher.tsx';
import UploadStep from '../../steps/UploadStep.tsx';
import ReviewExtractionStep from '../../steps/ReviewExtractionStep.tsx';
import ReviewTranslationStep from '../../steps/ReviewTranslationStep.tsx';
import PreviewStep from '../../steps/PreviewStep.tsx';
const steps = [
  UploadStep,
  ReviewExtractionStep,
  ReviewTranslationStep,
  PreviewStep,
];

export default function WizardShell() {
  const { t } = useTranslation();
  const currentStep = useWizardStore((s) => s.currentStep);
  const StepComponent = steps[currentStep];
  const isWideStep = currentStep >= 1 && currentStep <= 3;

  return (
    <div className={`bg-gradient-to-b from-slate-50 to-slate-100 ${isWideStep ? 'h-screen flex flex-col overflow-hidden' : 'min-h-screen'}`}>
      <header className="shrink-0 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className={`mx-auto flex items-center justify-between px-6 py-4 transition-all duration-300 ${isWideStep ? 'max-w-[90rem]' : 'max-w-4xl'}`}>
          <h1 className="text-lg font-bold text-slate-800">
            {t('appTitle')}
          </h1>
          <LanguageSwitcher />
        </div>
      </header>

      <main className={`mx-auto transition-all duration-300 ${isWideStep ? 'max-w-[90rem] px-4 py-4 flex-1 flex flex-col overflow-hidden' : 'max-w-4xl px-6 py-8'}`}>
        <div className={`shrink-0 ${isWideStep ? 'mb-4' : 'mb-8'}`}>
          <StepIndicator />
        </div>

        <div className={`rounded-xl border border-slate-200 bg-white shadow-sm ${isWideStep ? 'p-4 flex-1 overflow-hidden flex flex-col min-h-0' : 'p-8'}`}>
          <StepComponent />
        </div>

        <div className="shrink-0">
          <StepNavigation />
        </div>
      </main>
    </div>
  );
}
