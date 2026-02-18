import { useCallback } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { useTranslation } from 'react-i18next';

interface FileDropzoneProps {
  onFileAccepted: (file: File) => void;
  currentFile: File | null;
  disabled?: boolean;
}

const ACCEPT = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
};
const MAX_SIZE = 10 * 1024 * 1024;

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileDropzone({ onFileAccepted, currentFile, disabled }: FileDropzoneProps) {
  const { t } = useTranslation('wizard');

  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length > 0) onFileAccepted(accepted[0]);
    },
    [onFileAccepted],
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: ACCEPT,
    maxFiles: 1,
    maxSize: MAX_SIZE,
    disabled,
  });

  const rejectionMessage = (r: FileRejection) => {
    const code = r.errors[0]?.code;
    if (code === 'file-too-large') return t('steps.upload.fileTooLarge', { max: 10 });
    if (code === 'file-invalid-type') return t('steps.upload.invalidType');
    return r.errors[0]?.message ?? '';
  };

  const borderColor = isDragActive
    ? 'border-blue-400 bg-blue-50'
    : currentFile
      ? 'border-green-300 bg-green-50/50'
      : 'border-slate-300 hover:border-slate-400';

  return (
    <div>
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${borderColor} ${disabled ? 'pointer-events-none opacity-50' : ''}`}
      >
        <input {...getInputProps()} />

        {isDragActive ? (
          <p className="text-sm font-medium text-blue-600">{t('steps.upload.dropzoneActive')}</p>
        ) : currentFile ? (
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-slate-700">{t('steps.upload.fileAccepted')}</span>
            </div>
            <p className="text-sm text-slate-600">
              {currentFile.name}{' '}
              <span className="text-slate-400">({formatSize(currentFile.size)})</span>
            </p>
            <button
              type="button"
              className="text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              {t('steps.upload.changeFile')}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <svg className="mx-auto h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <p className="text-sm text-slate-500">{t('steps.upload.dropzone')}</p>
            <p className="text-xs text-slate-400">{t('steps.upload.supportedFormats')}</p>
          </div>
        )}
      </div>

      {fileRejections.length > 0 && (
        <div className="mt-2 space-y-1">
          {fileRejections.map((r, i) => (
            <p key={i} className="text-xs text-red-500">{rejectionMessage(r)}</p>
          ))}
        </div>
      )}
    </div>
  );
}
