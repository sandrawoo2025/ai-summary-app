'use client';

import { useState } from 'react';
import { Document } from '@/types';

interface FileListProps {
  documents: Document[];
  selectedDocument: Document | null;
  onSelectDocument: (doc: Document) => void;
  onDelete: (id: string) => void;
  onGenerateSummary: (id: string) => void;
  loadingStates: Record<string, 'deleting' | 'summarizing' | null>;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString();
}

function FileTypeIcon({ type }: { type: string }) {
  if (type === 'application/pdf') {
    return (
      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-bold text-red-600">PDF</span>
      </div>
    );
  }
  return (
    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
      <span className="text-xs font-bold text-blue-600">TXT</span>
    </div>
  );
}

export default function FileList({
  documents,
  selectedDocument,
  onSelectDocument,
  onDelete,
  onGenerateSummary,
  loadingStates,
}: FileListProps) {
  const [confirmDocId, setConfirmDocId] = useState<string | null>(null);

  const handleGenerateClick = (doc: Document) => {
    if (doc.summary) {
      setConfirmDocId(doc.id);
    } else {
      onGenerateSummary(doc.id);
    }
  };

  const handleConfirmRegenerate = () => {
    if (confirmDocId) {
      onGenerateSummary(confirmDocId);
      setConfirmDocId(null);
    }
  };
  if (documents.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-gray-500 text-sm">No documents uploaded yet.</p>
        <p className="text-gray-400 text-xs mt-1">Upload a PDF or TXT file to get started.</p>
      </div>
    );
  }

  return (
    <>
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-3 sm:px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800">
          Uploaded Documents
          <span className="ml-2 text-sm font-normal text-gray-500">({documents.length})</span>
        </h2>
      </div>
      <ul className="divide-y divide-gray-100">
        {documents.map((doc) => {
          const isSelected = selectedDocument?.id === doc.id;
          const state = loadingStates[doc.id];

          return (
            <li
              key={doc.id}
              onClick={() => onSelectDocument(doc)}
              className={`px-3 sm:px-6 py-4 cursor-pointer transition-colors ${
                isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <FileTypeIcon type={doc.file_type} />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{doc.file_name}</p>
                  <div className="flex items-center flex-wrap gap-2 mt-1">
                    <span className="text-xs text-gray-500">{formatFileSize(doc.file_size)}</span>
                    <span className="text-gray-300 text-xs">•</span>
                    <span className="text-xs text-gray-500">{formatDate(doc.created_at)}</span>
                    {doc.summary && (
                      <>
                        <span className="text-gray-300 text-xs">•</span>
                        <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Summary ready
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleGenerateClick(doc)}
                    disabled={state === 'summarizing' || state === 'deleting'}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    {state === 'summarizing' ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        Generate Summary
                      </>
                    )}
                  </button>

                  <a
                    href={`/api/file-proxy?id=${doc.id}&download=true`}
                    download={doc.file_name}
                    onClick={(e) => e.stopPropagation()}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </a>

                  <button
                    onClick={() => onDelete(doc.id)}
                    disabled={state === 'deleting' || state === 'summarizing'}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-red-500 hover:bg-red-600 disabled:bg-red-300 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    {state === 'deleting' ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>

      {/* Regenerate Confirmation Modal */}
      {confirmDocId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setConfirmDocId(null)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative bg-white rounded-xl shadow-xl border border-gray-200 p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-900">Regenerate Summary?</h3>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              A summary already exists for this document. Regenerating will overwrite the current summary. Do you want to continue?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDocId(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRegenerate}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Regenerate
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
