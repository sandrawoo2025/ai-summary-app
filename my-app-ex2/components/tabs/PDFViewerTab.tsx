'use client';

import { useEffect, useRef, useState } from 'react';
import { Document } from '@/types';

interface PDFViewerTabProps {
  document: Document | null;
}

export default function PDFViewerTab({ document }: PDFViewerTabProps) {
  const [textContent, setTextContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!document) {
      setTextContent(null);
      return;
    }

    if (document.file_type === 'text/plain') {
      setIsLoading(true);
      fetch(`/api/file-proxy?id=${document.id}`)
        .then((r) => r.text())
        .then((text) => {
          setTextContent(text);
          setIsLoading(false);
        })
        .catch(() => {
          setTextContent('Failed to load file.');
          setIsLoading(false);
        });
    } else {
      setTextContent(null);
    }
  }, [document]);

  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <p className="text-sm">Select a document to preview</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full gap-3 text-gray-500">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">Loading file...</span>
      </div>
    );
  }

  if (document.file_type === 'text/plain') {
    return (
      <div className="h-full overflow-auto p-4">
        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
          {textContent}
        </pre>
      </div>
    );
  }

  // PDF viewer using iframe
  const pdfUrl = `/api/file-proxy?id=${document.id}`;
  return (
    <div className="h-full flex flex-col">
      <iframe
        ref={iframeRef}
        src={pdfUrl}
        className="flex-1 w-full border-0"
        title={document.file_name}
      />
    </div>
  );
}
