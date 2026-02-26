'use client';

import { useEffect, useState } from 'react';
import { Document } from '@/types';

interface ExtractedTextTabProps {
  document: Document | null;
}

export default function ExtractedTextTab({ document }: ExtractedTextTabProps) {
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastDocId, setLastDocId] = useState<string | null>(null);

  useEffect(() => {
    if (!document) {
      setExtractedText(null);
      setError(null);
      return;
    }
    if (document.id === lastDocId) return;

    setIsLoading(true);
    setError(null);
    setExtractedText(null);

    fetch('/api/extract-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId: document.id }),
    })
      .then((r) => r.json())
      .then((result) => {
        if (result.success) {
          setExtractedText(result.text);
          setLastDocId(document.id);
        } else {
          setError(result.error || 'Failed to extract text');
        }
      })
      .catch(() => setError('Failed to extract text'))
      .finally(() => setIsLoading(false));
  }, [document, lastDocId]);

  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-sm">Select a document to extract text</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-500">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">Extracting text...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
          <p className="text-sm text-red-600 font-medium">Extraction failed</p>
          <p className="text-xs text-red-500 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {extractedText ? `${extractedText.length.toLocaleString()} characters` : ''}
        </span>
        {extractedText && (
          <button
            onClick={() => navigator.clipboard.writeText(extractedText)}
            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy
          </button>
        )}
      </div>
      <div className="flex-1 overflow-auto p-4">
        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
          {extractedText || 'No text content found.'}
        </pre>
      </div>
    </div>
  );
}
