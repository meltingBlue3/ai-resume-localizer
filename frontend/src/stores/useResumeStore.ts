import { create } from 'zustand';
import type { CnResumeData, JpResumeData } from '../types/resume';

interface ResumeState {
  resumeFile: File | null;
  photoFile: File | null;

  rawText: string | null;
  cnResumeData: CnResumeData | null;

  isExtracting: boolean;
  extractionError: string | null;

  jpResumeData: JpResumeData | null;
  isTranslating: boolean;
  translationError: string | null;

  setResumeFile: (file: File | null) => void;
  setPhotoFile: (file: File | null) => void;
  setExtractionResult: (rawText: string, data: CnResumeData) => void;
  setCnResumeData: (data: CnResumeData) => void;
  setExtracting: (loading: boolean) => void;
  setExtractionError: (error: string | null) => void;
  setJpResumeData: (data: JpResumeData) => void;
  setIsTranslating: (loading: boolean) => void;
  setTranslationError: (error: string | null) => void;
  resetUpload: () => void;
}

const initialState = {
  resumeFile: null,
  photoFile: null,
  rawText: null,
  cnResumeData: null,
  isExtracting: false,
  extractionError: null,
  jpResumeData: null,
  isTranslating: false,
  translationError: null,
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
  setJpResumeData: (data) => set({ jpResumeData: data }),
  setIsTranslating: (loading) => set({ isTranslating: loading }),
  setTranslationError: (error) => set({ translationError: error }),
  resetUpload: () => set(initialState),
}));
