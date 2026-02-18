import { create } from 'zustand';

interface WizardState {
  currentStep: number;
  totalSteps: number;
  stepData: Record<number, unknown>;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setStepData: (step: number, data: unknown) => void;
}

export const useWizardStore = create<WizardState>((set, get) => ({
  currentStep: 0,
  totalSteps: 5,
  stepData: {},
  setStep: (step) => {
    if (step >= 0 && step < get().totalSteps) {
      set({ currentStep: step });
    }
  },
  nextStep: () => {
    const { currentStep, totalSteps } = get();
    if (currentStep < totalSteps - 1) {
      set({ currentStep: currentStep + 1 });
    }
  },
  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1 });
    }
  },
  setStepData: (step, data) =>
    set((state) => ({
      stepData: { ...state.stepData, [step]: data },
    })),
}));
