import { useRef, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface PreviewPanelProps {
  html: string | null;
  isLoading: boolean;
}

const A4_WIDTH_PX = 794; // 210mm at 96dpi

export default function PreviewPanel({ html, isLoading }: PreviewPanelProps) {
  const { t } = useTranslation('wizard');
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [iframeHeight, setIframeHeight] = useState('297mm');

  const handleIframeLoad = useCallback((e: React.SyntheticEvent<HTMLIFrameElement>) => {
    const iframe = e.currentTarget;
    try {
      const doc = iframe.contentDocument;
      if (doc) {
        const height = doc.documentElement.scrollHeight;
        setIframeHeight(`${height}px`);
      }
    } catch {
      // Cross-origin fallback — keep default min-height
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        setScale(width / A4_WIDTH_PX);
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-slate-200 bg-white">
        <div className="flex flex-col items-center gap-3">
          <svg className="h-8 w-8 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-slate-500">{t('preview.rendering', 'Rendering...')}</p>
        </div>
      </div>
    );
  }

  if (!html) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50">
        <p className="text-sm text-slate-400">{t('preview.rendering', 'Generating preview...')}</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-full overflow-auto rounded-lg border border-slate-200 bg-slate-100 p-4">
      <div
        className="mx-auto origin-top bg-white shadow-lg"
        style={{
          width: `${A4_WIDTH_PX}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
        }}
      >
        <iframe
          srcDoc={html}
          sandbox="allow-same-origin allow-scripts"
          title="Resume Preview"
          onLoad={handleIframeLoad}
          style={{
            width: '210mm',
            height: iframeHeight,
            border: 'none',
            display: 'block',
            pointerEvents: 'none',
            overflow: 'hidden',
          }}
        />
      </div>
    </div>
  );
}
