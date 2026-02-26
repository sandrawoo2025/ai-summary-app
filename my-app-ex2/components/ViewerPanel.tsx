'use client';

import { useState } from 'react';
import { Document } from '@/types';
import PDFViewerTab from './tabs/PDFViewerTab';
import ExtractedTextTab from './tabs/ExtractedTextTab';
import SummaryTab from './tabs/SummaryTab';

type TabId = 'viewer' | 'extracted' | 'summary';

interface ViewerPanelProps {
  document: Document | null;
  onSummaryUpdated: (docId: string, summary: string) => void;
}

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  {
    id: 'viewer',
    label: 'PDF Viewer',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  },
  {
    id: 'extracted',
    label: 'Extracted Text',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: 'summary',
    label: 'Summary',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
];

export default function ViewerPanel({ document, onSummaryUpdated }: ViewerPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>('viewer');

  return (
    <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Tab Header */}
      <div className="border-b border-gray-200 bg-gray-50">
        {document && (
          <div className="px-4 pt-3 pb-0">
            <p className="text-xs text-gray-500 truncate mb-2">
              <span className="font-medium text-gray-700">{document.file_name}</span>
            </p>
          </div>
        )}
        <div className="flex">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'viewer' && <PDFViewerTab document={document} />}
        {activeTab === 'extracted' && <ExtractedTextTab document={document} />}
        {activeTab === 'summary' && (
          <SummaryTab document={document} onSummaryUpdated={onSummaryUpdated} />
        )}
      </div>
    </div>
  );
}
