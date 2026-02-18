import { create } from 'zustand';
import type { CnResumeData } from '../types/resume';

interface ResumeState {
  resumeFile: File | null;
  photoFile: File | null;

  rawText: string | null;
  cnResumeData: CnResumeData | null;

  isExtracting: boolean;
  extractionError: string | null;

  setResumeFile: (file: File | null) => void;
  setPhotoFile: (file: File | null) => void;
  setExtractionResult: (rawText: string, data: CnResumeData) => void;
  setCnResumeData: (data: CnResumeData) => void;
  setExtracting: (loading: boolean) => void;
  setExtractionError: (error: string | null) => void;
  resetUpload: () => void;
}

const initialState = {
  resumeFile: null,
  photoFile: null,
  rawText: null,
  cnResumeData: null,
  isExtracting: false,
  extractionError: null,
};

export const useResumeStore = create<ResumeState>((set) => ({
  ...initialState,

  setResumeFile: (file) => set({ resumeFile: file }),
  setPhotoFile: (file) => set({ photoFile: file }),

  setExtractionResult: (rawText, data) =>
    set({
      rawText,
      cnResumeData: data,
      extractionError: null,
      isExtracting: false,
    }),

  setCnResumeData: (data) => set({ cnResumeData: data }),
  setExtracting: (loading) => set({ isExtracting: loading }),
  setExtractionError: (error) => set({ extractionError: error }),
  resetUpload: () => set(initialState),
}));
