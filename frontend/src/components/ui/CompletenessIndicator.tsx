import { useTranslation } from 'react-i18next';

interface CompletenessIndicatorProps {
  filled: number;
  total: number;
  percentage: number;
}

export function CompletenessIndicator({
  filled,
  total,
  percentage,
}: CompletenessIndicatorProps) {
  const { t } = useTranslation('wizard');

  const barColor =
    percentage >= 80
      ? 'bg-green-500'
      : percentage >= 50
        ? 'bg-amber-500'
        : 'bg-red-400';

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-slate-600 whitespace-nowrap">
        {t('completeness.label', { filled, total, percentage })}
      </span>
    </div>
  );
}
