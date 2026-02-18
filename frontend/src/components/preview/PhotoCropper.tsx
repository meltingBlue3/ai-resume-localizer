import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { useTranslation } from 'react-i18next';
import { getCroppedImg, blobToBase64 } from '../../utils/cropImage';

interface PhotoCropperProps {
  imageSrc: string;
  onCropComplete: (base64: string) => void;
  onCancel: () => void;
}

export default function PhotoCropper({ imageSrc, onCropComplete, onCancel }: PhotoCropperProps) {
  const { t } = useTranslation('wizard');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedPixels, setCroppedPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedPixels(croppedAreaPixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedPixels) return;
    setIsProcessing(true);
    try {
      const blob = await getCroppedImg(imageSrc, croppedPixels);
      const base64 = await blobToBase64(blob);
      onCropComplete(base64);
    } catch (err) {
      console.error('Photo crop failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <h3 className="mb-4 text-lg font-semibold text-slate-800">
          {t('preview.photoCropper.title', 'Crop Photo')}
        </h3>

        <div className="relative h-[400px] w-full overflow-hidden rounded-lg bg-slate-100">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={3 / 4}
            onCropChange={setCrop}
            onCropComplete={handleCropComplete}
            onZoomChange={setZoom}
          />
        </div>

        <div className="mt-4 flex items-center gap-3">
          <label className="text-sm text-slate-600">
            {t('preview.photoCropper.zoom', 'Zoom')}
          </label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-slate-200 accent-blue-600"
          />
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            {t('common.cancel', 'Cancel')}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isProcessing || !croppedPixels}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {isProcessing
              ? t('preview.photoCropper.processing', 'Processing...')
              : t('preview.photoCropper.confirm', 'Confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
