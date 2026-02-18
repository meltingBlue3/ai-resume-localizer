import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';

interface PhotoDropzoneProps {
  onPhotoAccepted: (file: File) => void;
  currentPhoto: File | null;
  disabled?: boolean;
}

const ACCEPT = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
};
const MAX_SIZE = 5 * 1024 * 1024;

export default function PhotoDropzone({ onPhotoAccepted, currentPhoto, disabled }: PhotoDropzoneProps) {
  const { t } = useTranslation('wizard');
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!currentPhoto) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(currentPhoto);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [currentPhoto]);

  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length > 0) onPhotoAccepted(accepted[0]);
    },
    [onPhotoAccepted],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPT,
    maxFiles: 1,
    maxSize: MAX_SIZE,
    disabled,
  });

  const borderColor = isDragActive
    ? 'border-blue-400 bg-blue-50'
    : currentPhoto
      ? 'border-green-300'
      : 'border-slate-300 hover:border-slate-400';

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-slate-700">{t('steps.upload.photoLabel')}</p>
      <div
        {...getRootProps()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors ${borderColor} ${disabled ? 'pointer-events-none opacity-50' : ''}`}
      >
        <input {...getInputProps()} />

        {preview ? (
          <div className="space-y-2">
            <img
              src={preview}
              alt="Photo preview"
              className="mx-auto h-28 w-22 rounded-md object-cover shadow-sm"
            />
            <button
              type="button"
              className="text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              {t('steps.upload.changeFile')}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <svg className="mx-auto h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
            </svg>
            <p className="text-xs text-slate-500">{t('steps.upload.photoDropzone')}</p>
            <p className="text-xs text-slate-400">{t('steps.upload.photoFormats')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
