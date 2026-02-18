import * as Tooltip from '@radix-ui/react-tooltip';

interface FieldTooltipProps {
  content: string;
  children: React.ReactNode;
}

export function FieldTooltip({ content, children }: FieldTooltipProps) {
  if (!content) return <>{children}</>;

  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <span className="inline-flex items-center gap-1 cursor-help">
          {children}
          <span className="text-blue-400 text-xs">ⓘ</span>
        </span>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          className="z-50 max-w-xs rounded-md bg-gray-900 px-3 py-2 text-xs text-white shadow-lg"
          sideOffset={4}
        >
          {content}
          <Tooltip.Arrow className="fill-gray-900" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
