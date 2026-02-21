import { create } from 'zustand';
import type { CnResumeData, JpResumeData } from '../types/resume';

interface ResumeState {
  resumeFile: File | null;

  rawText: string | null;
  cnResumeData: CnResumeData | null;

  isExtracting: boolean;
  extractionError: string | null;

  jpResumeData: JpResumeData | null;
  isTranslating: boolean;
  translationError: string | null;

  croppedPhotoBase64: string | null;
  previewHtml: string | null;
  activeDocTab: 'rirekisho' | 'shokumukeirekisho';
  isPreviewLoading: boolean;
  isDownloading: boolean;

  setResumeFile: (file: File | null) => void;
  setExtractionResult: (rawText: string, data: CnResumeData) => void;
  setCnResumeData: (data: CnResumeData) => void;
  setExtracting: (loading: boolean) => void;
  setExtractionError: (error: string | null) => void;
  setJpResumeData: (data: JpResumeData) => void;
  setIsTranslating: (loading: boolean) => void;
  setTranslationError: (error: string | null) => void;
  setCroppedPhotoBase64: (base64: string | null) => void;
  setPreviewHtml: (html: string | null) => void;
  setActiveDocTab: (tab: 'rirekisho' | 'shokumukeirekisho') => void;
  setIsPreviewLoading: (loading: boolean) => void;
  setIsDownloading: (loading: boolean) => void;
  resetUpload: () => void;
  clearExtractionAndTranslation: () => void;
  clearTranslationOnly: () => void;
}

const initialState = {
  resumeFile: null,
  rawText: null,
  cnResumeData: null,
  isExtracting: false,
  extractionError: null,
  jpResumeData: null,
  isTranslating: false,
  translationError: null,
  croppedPhotoBase64: null,
  previewHtml: null,
  activeDocTab: 'rirekisho' as const,
  isPreviewLoading: false,
  isDownloading: false,
};

export const useResumeStore = create<ResumeState>((set) => ({
  ...initialState,

  setResumeFile: (file) => set({ resumeFile: file }),

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
  setCroppedPhotoBase64: (base64) => set({ croppedPhotoBase64: base64 }),
  setPreviewHtml: (html) => set({ previewHtml: html }),
  setActiveDocTab: (tab) => set({ activeDocTab: tab }),
  setIsPreviewLoading: (loading) => set({ isPreviewLoading: loading }),
  setIsDownloading: (loading) => set({ isDownloading: loading }),
  resetUpload: () => set(initialState),
  clearExtractionAndTranslation: () =>
    set({
      rawText: null,
      cnResumeData: null,
      jpResumeData: null,
      translationError: null,
      croppedPhotoBase64: null,
      previewHtml: null,
    }),
  clearTranslationOnly: () =>
    set({
      jpResumeData: null,
      translationError: null,
      croppedPhotoBase64: null,
      previewHtml: null,
    }),
}));
