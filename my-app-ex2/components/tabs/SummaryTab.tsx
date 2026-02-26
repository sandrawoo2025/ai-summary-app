'use client';

import { useEffect, useState } from 'react';
import { Document } from '@/types';

interface SummaryTabProps {
  document: Document | null;
  onSummaryUpdated: (docId: string, summary: string) => void;
}

export default function SummaryTab({ document, onSummaryUpdated }: SummaryTabProps) {
  const [summaryText, setSummaryText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');

  useEffect(() => {
    if (document) {
      setSummaryText(document.summary || '');
      setSaveStatus('idle');
    } else {
      setSummaryText('');
    }
  }, [document]);

  const handleSave = async () => {
    if (!document) return;

    setIsSaving(true);
    setSaveStatus('idle');

    try {
      const response = await fetch(`/api/files/${document.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary: summaryText }),
      });

      const result = await response.json();

      if (result.success) {
        setSaveStatus('saved');
        onSummaryUpdated(document.id, summaryText);
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        <p className="text-sm">Select a document to view its summary</p>
      </div>
    );
  }

  const hasChanges = summaryText !== (document.summary || '');

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600">Edit Summary</span>
          {!document.summary && (
            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              No summary yet — use &quot;Generate Summary&quot; or write one below
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {saveStatus === 'saved' && (
            <span className="text-xs text-green-600 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Saved
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-xs text-red-600">Save failed</span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-1.5"
          >
            {isSaving ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Save
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 p-4">
        <textarea
          value={summaryText}
          onChange={(e) => setSummaryText(e.target.value)}
          placeholder="No summary available. Click 'Generate Summary' on the document, or type a summary here manually..."
          className="w-full h-full resize-none text-sm text-gray-700 leading-relaxed outline-none border border-gray-200 rounded-lg p-3 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
        />
      </div>
    </div>
  );
}
