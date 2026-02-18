import { useTranslation } from 'react-i18next';
import { useWizardStore } from '../../stores/useWizardStore.ts';
import StepIndicator from './StepIndicator.tsx';
import StepNavigation from './StepNavigation.tsx';
import LanguageSwitcher from './LanguageSwitcher.tsx';
import UploadStep from '../../steps/UploadStep.tsx';
import ReviewExtractionStep from '../../steps/ReviewExtractionStep.tsx';
import ReviewTranslationStep from '../../steps/ReviewTranslationStep.tsx';
import PreviewStep from '../../steps/PreviewStep.tsx';
import DownloadStep from '../../steps/DownloadStep.tsx';

const steps = [
  UploadStep,
  ReviewExtractionStep,
  ReviewTranslationStep,
  PreviewStep,
  DownloadStep,
];

export default function WizardShell() {
  const { t } = useTranslation();
  const currentStep = useWizardStore((s) => s.currentStep);
  const StepComponent = steps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <h1 className="text-lg font-bold text-slate-800">
            {t('appTitle')}
          </h1>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-8">
          <StepIndicator />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <StepComponent />
        </div>

        <StepNavigation />
      </main>
    </div>
  );
}
