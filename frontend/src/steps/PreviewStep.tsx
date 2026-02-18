import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useWizardStore } from '../stores/useWizardStore';
import { useResumeStore } from '../stores/useResumeStore';
import { previewDocument, downloadPdf } from '../api/client';
import PreviewPanel from '../components/preview/PreviewPanel';
import PreviewToolbar from '../components/preview/PreviewToolbar';
import PhotoCropper from '../components/preview/PhotoCropper';
import JpResumeFieldEditor from '../components/review/JpResumeFieldEditor';

export default function PreviewStep() {
  const { t } = useTranslation('wizard');
  const setStep = useWizardStore((s) => s.setStep);

  const jpResumeData = useResumeStore((s) => s.jpResumeData);
  const setJpResumeData = useResumeStore((s) => s.setJpResumeData);
  const croppedPhotoBase64 = useResumeStore((s) => s.croppedPhotoBase64);
  const setCroppedPhotoBase64 = useResumeStore((s) => s.setCroppedPhotoBase64);
  const previewHtml = useResumeStore((s) => s.previewHtml);
  const setPreviewHtml = useResumeStore((s) => s.setPreviewHtml);
  const activeDocTab = useResumeStore((s) => s.activeDocTab);
  const setActiveDocTab = useResumeStore((s) => s.setActiveDocTab);
  const isPreviewLoading = useResumeStore((s) => s.isPreviewLoading);
  const setIsPreviewLoading = useResumeStore((s) => s.setIsPreviewLoading);
  const isDownloading = useResumeStore((s) => s.isDownloading);
  const setIsDownloading = useResumeStore((s) => s.setIsDownloading);

  const [previewError, setPreviewError] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // Photo upload state
  const [showCropper, setShowCropper] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Track initial mount to skip debounce on first render
  const initialFetchDone = useRef(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch preview function
  const fetchPreview = useCallback(async (
    docTab: 'rirekisho' | 'shokumukeirekisho',
    data: typeof jpResumeData,
    photo: string | null,
  ) => {
    if (!data) return;
    setIsPreviewLoading(true);
    setPreviewError(null);
    try {
      const html = await previewDocument(docTab, data, photo);
      setPreviewHtml(html);
    } catch (err) {
      setPreviewError(err instanceof Error ? err.message : 'Preview failed');
      setPreviewHtml(null);
    } finally {
      setIsPreviewLoading(false);
    }
  }, [setIsPreviewLoading, setPreviewHtml]);

  // Debounced preview fetch on data changes
  useEffect(() => {
    if (!jpResumeData) return;

    // First render: fetch immediately
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchPreview(activeDocTab, jpResumeData, croppedPhotoBase64);
      return;
    }

    // Subsequent changes: debounce 500ms
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchPreview(activeDocTab, jpResumeData, croppedPhotoBase64);
    }, 500);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [jpResumeData, croppedPhotoBase64, activeDocTab, fetchPreview]);

  // Photo upload handlers
  const handleUploadPhoto = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCropImageSrc(url);
    setShowCropper(true);
    // Reset input so the same file can be re-selected
    e.target.value = '';
  };

  const handleCropComplete = (base64: string) => {
    setCroppedPhotoBase64(base64);
    setShowCropper(false);
    if (cropImageSrc) {
      URL.revokeObjectURL(cropImageSrc);
      setCropImageSrc(null);
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    if (cropImageSrc) {
      URL.revokeObjectURL(cropImageSrc);
      setCropImageSrc(null);
    }
  };

  // Download handler
  const handleDownload = async (docType: 'rirekisho' | 'shokumukeirekisho') => {
    if (!jpResumeData) return;
    setIsDownloading(true);
    setDownloadError(null);
    try {
      const blob = await downloadPdf(docType, jpResumeData, croppedPhotoBase64);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = docType === 'rirekisho' ? '\u5C65\u6B74\u66F8.pdf' : '\u8077\u52D9\u7D4C\u6B74\u66F8.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setDownloadError(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setIsDownloading(false);
    }
  };

  // No data guard
  if (!jpResumeData) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <p className="mt-4 text-sm text-slate-500">{t('preview.noData', 'No translation data available')}</p>
        <button
          type="button"
          onClick={() => setStep(2)}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          {t('reviewTranslation.goBack', 'Go back')}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-16rem)]">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
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

      {/* Error banners */}
      {previewError && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {t('preview.previewError', 'Preview generation failed')}: {previewError}
        </div>
      )}
      {downloadError && (
        <div className="mb-3 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
          {t('preview.downloadError', 'Download failed')}: {downloadError}
        </div>
      )}

      {/* Toolbar */}
      <PreviewToolbar
        activeTab={activeDocTab}
        onTabChange={setActiveDocTab}
        onDownload={handleDownload}
        onUploadPhoto={handleUploadPhoto}
        hasPhoto={!!croppedPhotoBase64}
        isDownloading={isDownloading}
      />

      {/* Two-panel layout */}
      <div className="mt-4 flex flex-1 gap-6 overflow-hidden">
        {/* Left: Field editor */}
        <div className="w-2/5 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-4">
          <JpResumeFieldEditor data={jpResumeData} onChange={setJpResumeData} />
        </div>

        {/* Right: Preview panel */}
        <div className="w-3/5">
          <PreviewPanel html={previewHtml} isLoading={isPreviewLoading} />
        </div>
      </div>

      {/* Hidden file input for photo upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelected}
        className="hidden"
      />

      {/* Photo cropper modal */}
      {showCropper && cropImageSrc && (
        <PhotoCropper
          imageSrc={cropImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
}
