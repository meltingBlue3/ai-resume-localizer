import { useState, useEffect, useRef, useMemo } from 'react';
import { Document, Page } from 'react-pdf';
import { renderAsync } from 'docx-preview';

interface DocumentViewerProps {
  file: File;
}

function PdfViewer({ file }: DocumentViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const url = useMemo(() => URL.createObjectURL(file), [file]);

  useEffect(() => {
    return () => URL.revokeObjectURL(url);
  }, [url]);

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {loading && <LoadingSpinner />}
      <Document
        file={url}
        onLoadSuccess={({ numPages: n }) => {
          setNumPages(n);
          setLoading(false);
        }}
        onLoadError={() => setLoading(false)}
        loading=""
      >
        {Array.from({ length: numPages }, (_, i) => (
          <Page
            key={i}
            pageNumber={i + 1}
            width={560}
            className="mb-4 shadow-md"
          />
        ))}
      </Document>
    </div>
  );
}

function DocxViewer({ file }: DocumentViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let cancelled = false;
    setLoading(true);
    el.innerHTML = '';

    file.arrayBuffer().then((buf) => {
      if (cancelled) return;
      return renderAsync(buf, el);
    }).then(() => {
      if (!cancelled) setLoading(false);
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
      el.innerHTML = '';
    };
  }, [file]);

  return (
    <div className="p-4">
      {loading && <LoadingSpinner />}
      <div ref={containerRef} />
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-8">
      <svg className="h-8 w-8 animate-spin text-slate-400" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  );
}

export default function DocumentViewer({ file }: DocumentViewerProps) {
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

  if (isPdf) return <PdfViewer file={file} />;
  return <DocxViewer file={file} />;
}
