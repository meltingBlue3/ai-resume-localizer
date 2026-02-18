import { useTranslation } from 'react-i18next';

interface PreviewToolbarProps {
  activeTab: 'rirekisho' | 'shokumukeirekisho';
  onTabChange: (tab: 'rirekisho' | 'shokumukeirekisho') => void;
  onDownload: (docType: 'rirekisho' | 'shokumukeirekisho') => void;
  onUploadPhoto: () => void;
  hasPhoto: boolean;
  isDownloading: boolean;
}

export default function PreviewToolbar({
  activeTab,
  onTabChange,
  onDownload,
  onUploadPhoto,
  hasPhoto,
  isDownloading,
}: PreviewToolbarProps) {
  const { t } = useTranslation('wizard');

  const tabBase =
    'rounded-lg px-4 py-2 text-sm font-medium transition-colors';
  const tabActive = `${tabBase} bg-indigo-600 text-white shadow-sm`;
  const tabInactive = `${tabBase} bg-slate-100 text-slate-600 hover:bg-slate-200`;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
      {/* Tab buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onTabChange('rirekisho')}
          className={activeTab === 'rirekisho' ? tabActive : tabInactive}
        >
          {t('preview.tabs.rirekisho', '\u5C65\u6B74\u66F8')}
        </button>
        <button
          type="button"
          onClick={() => onTabChange('shokumukeirekisho')}
          className={activeTab === 'shokumukeirekisho' ? tabActive : tabInactive}
        >
          {t('preview.tabs.shokumukeirekisho', '\u8077\u52D9\u7D4C\u6B74\u66F8')}
        </button>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        {/* Upload Photo */}
        <button
          type="button"
          onClick={onUploadPhoto}
          className="relative inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
          </svg>
          {t('preview.uploadPhoto', 'Upload Photo')}
          {hasPhoto && (
            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
          )}
        </button>

        {/* Download rirekisho */}
        <button
          type="button"
          onClick={() => onDownload('rirekisho')}
          disabled={isDownloading}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDownloading ? (
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
          )}
          {t('preview.downloadRirekisho', '\u5C65\u6B74\u66F8 PDF')}
        </button>

        {/* Download shokumukeirekisho */}
        <button
          type="button"
          onClick={() => onDownload('shokumukeirekisho')}
          disabled={isDownloading}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDownloading ? (
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
          )}
          {t('preview.downloadShokumukeirekisho', '\u8077\u52D9\u7D4C\u6B74\u66F8 PDF')}
        </button>
      </div>
    </div>
  );
}
