import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ClassifiedError } from '../../utils/errorClassifier';

interface ErrorBannerProps {
  error: ClassifiedError;
  onRetry?: () => void;
  onDismiss?: () => void;
}

const typeStyles: Record<
  ClassifiedError['type'],
  { border: string; bg: string; text: string }
> = {
  network: {
    border: 'border-orange-300',
    bg: 'bg-orange-50',
    text: 'text-orange-800',
  },
  timeout: {
    border: 'border-amber-300',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
  },
  server: {
    border: 'border-red-300',
    bg: 'bg-red-50',
    text: 'text-red-800',
  },
  validation: {
    border: 'border-red-300',
    bg: 'bg-red-50',
    text: 'text-red-800',
  },
  config: {
    border: 'border-purple-300',
    bg: 'bg-purple-50',
    text: 'text-purple-800',
  },
  ocr: {
    border: 'border-slate-300',
    bg: 'bg-slate-50',
    text: 'text-slate-800',
  },
};

export function ErrorBanner({ error, onRetry, onDismiss }: ErrorBannerProps) {
  const { t } = useTranslation('wizard');
  const [showDetails, setShowDetails] = useState(false);

  const styles = typeStyles[error.type];

  return (
    <div
      className={`rounded-lg border ${styles.border} ${styles.bg} p-4`}
      role="alert"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className={`text-sm font-semibold ${styles.text}`}>
            {t(error.titleKey)}
          </h4>
          <p className={`mt-1 text-sm ${styles.text} opacity-80`}>
            {t(error.messageKey)}
          </p>
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`ml-3 text-sm ${styles.text} opacity-60 hover:opacity-100`}
            type="button"
          >
            {t('errors.dismiss')}
          </button>
        )}
      </div>

      <div className="mt-3 flex items-center gap-3">
        {error.retryable && onRetry && (
          <button
            onClick={onRetry}
            className={`text-sm font-medium ${styles.text} underline hover:no-underline`}
            type="button"
          >
            {t('errors.retry')}
          </button>
        )}

        <button
          onClick={() => setShowDetails((prev) => !prev)}
          className={`text-sm ${styles.text} opacity-60 hover:opacity-100`}
          type="button"
        >
          {showDetails
            ? t('errors.hideDetails')
            : t('errors.showDetails')}
        </button>
      </div>

      {showDetails && (
        <pre className="mt-3 rounded bg-white/60 p-2 text-xs font-mono text-slate-700 whitespace-pre-wrap break-all">
          {error.rawMessage}
        </pre>
      )}
    </div>
  );
}
