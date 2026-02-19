import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useResumeStore } from '../stores/useResumeStore';
import { downloadPdf } from '../api/client';
import { classifyError, type ClassifiedError } from '../utils/errorClassifier';
import { ErrorBanner } from '../components/ui/ErrorBanner';

export default function DownloadStep() {
  const { t } = useTranslation('wizard');
  const jpResumeData = useResumeStore((s) => s.jpResumeData);
  const croppedPhotoBase64 = useResumeStore((s) => s.croppedPhotoBase64);
  const [downloadingType, setDownloadingType] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<ClassifiedError | null>(null);
  const lastDocTypeRef = useRef<'rirekisho' | 'shokumukeirekisho'>('rirekisho');

  const handleDownload = async (docType: 'rirekisho' | 'shokumukeirekisho') => {
    if (!jpResumeData) return;
    lastDocTypeRef.current = docType;
    setDownloadingType(docType);
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
      setDownloadError(classifyError(err));
    } finally {
      setDownloadingType(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-green-100">
          <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-800">{t('steps.download.ready', 'Documents Ready')}</h2>
          <p className="mt-1 text-sm text-slate-500">{t('steps.download.readyDescription', 'Your Japanese resumes have been generated. Click the buttons below to download PDFs.')}</p>
        </div>
      </div>

      {/* Error banner */}
      {downloadError && (
        <ErrorBanner
          error={downloadError}
          onRetry={() => handleDownload(lastDocTypeRef.current)}
          onDismiss={() => setDownloadError(null)}
        />
      )}

      {/* Download cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Rirekisho card */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
            <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-slate-800">
            {t('preview.tabs.rirekisho', '\u5C65\u6B74\u66F8')}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {t('steps.download.rirekishoCard', 'JIS standard format resume')}
          </p>
          <button
            type="button"
            onClick={() => handleDownload('rirekisho')}
            disabled={!jpResumeData || downloadingType !== null}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloadingType === 'rirekisho' ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {t('preview.downloading', 'Generating PDF...')}
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                {t('preview.downloadRirekisho', '\u5C65\u6B74\u66F8 PDF')}
              </>
            )}
          </button>
        </div>

        {/* Shokumukeirekisho card */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100">
            <svg className="h-5 w-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-slate-800">
            {t('preview.tabs.shokumukeirekisho', '\u8077\u52D9\u7D4C\u6B74\u66F8')}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {t('steps.download.shokumukeirekishoCard', 'Reverse-chronological career history')}
          </p>
          <button
            type="button"
            onClick={() => handleDownload('shokumukeirekisho')}
            disabled={!jpResumeData || downloadingType !== null}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloadingType === 'shokumukeirekisho' ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {t('preview.downloading', 'Generating PDF...')}
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                {t('preview.downloadShokumukeirekisho', '\u8077\u52D9\u7D4C\u6B74\u66F8 PDF')}
              </>
            )}
          </button>
        </div>
      </div>

      {/* No data warning */}
      {!jpResumeData && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-700">
          {t('preview.noData', 'Please complete the translation review step first')}
        </div>
      )}
    </div>
  );
}
