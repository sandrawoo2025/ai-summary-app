'use client';

import { useCallback, useEffect, useState } from 'react';
import FileUpload from '@/components/FileUpload';
import FileList from '@/components/FileList';
import ViewerPanel from '@/components/ViewerPanel';
import { Document } from '@/types';

export default function Home() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(true);
  const [loadingStates, setLoadingStates] = useState<Record<string, 'deleting' | 'summarizing' | null>>({});
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);

  const fetchDocuments = useCallback(async () => {
    try {
      const response = await fetch('/api/files');
      const result = await response.json();
      if (result.success) {
        setDocuments(result.documents);
        setSelectedDocument((prev) => {
          if (!prev) return prev;
          const updated = result.documents.find((d: Document) => d.id === prev.id);
          return updated || null;
        });
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setIsLoadingFiles(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleDelete = async (id: string) => {
    setLoadingStates((prev) => ({ ...prev, [id]: 'deleting' }));
    try {
      const response = await fetch(`/api/files/${id}`, { method: 'DELETE' });
      const result = await response.json();
      if (result.success) {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
        if (selectedDocument?.id === id) setSelectedDocument(null);
      }
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [id]: null }));
    }
  };

  const handleGenerateSummary = async (id: string) => {
    setLoadingStates((prev) => ({ ...prev, [id]: 'summarizing' }));
    try {
      const response = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: id }),
      });
      const result = await response.json();
      if (result.success && result.document) {
        setDocuments((prev) =>
          prev.map((d) => (d.id === id ? result.document : d))
        );
        if (selectedDocument?.id === id) {
          setSelectedDocument(result.document);
        }
      }
    } catch (error) {
      console.error('Generate summary failed:', error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [id]: null }));
    }
  };

  const handleSummaryUpdated = (docId: string, summary: string) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, summary } : d))
    );
    if (selectedDocument?.id === docId) {
      setSelectedDocument((prev) => (prev ? { ...prev, summary } : prev));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">DocSummarizer</h1>
              <p className="text-xs text-gray-500">AI-powered document summarization</p>
            </div>
          </div>

          <button
            onClick={() => setIsViewerOpen((v) => !v)}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
              isViewerOpen
                ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
            {isViewerOpen ? 'Hide Viewer' : 'Viewer'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-screen-2xl mx-auto w-full px-3 sm:px-6 py-4 sm:py-6">
        <div className="flex flex-col lg:flex-row gap-6 transition-all duration-300" style={{ minHeight: 'calc(100vh - 120px)' }}>
          {/* Left Panel */}
          <div className={`flex flex-col gap-6 transition-all duration-300 ${isViewerOpen ? 'w-full lg:w-1/2' : 'w-full'}`}>
            <FileUpload onUploadSuccess={fetchDocuments} />

            {isLoadingFiles ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 flex items-center justify-center gap-3 text-gray-500">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Loading documents...</span>
              </div>
            ) : (
              <FileList
                documents={documents}
                selectedDocument={selectedDocument}
                onSelectDocument={setSelectedDocument}
                onDelete={handleDelete}
                onGenerateSummary={handleGenerateSummary}
                loadingStates={loadingStates}
              />
            )}
          </div>

          {/* Right Panel – Viewer */}
          {isViewerOpen && (
            <div className="w-full lg:w-1/2" style={{ minHeight: '600px' }}>
              <ViewerPanel
                document={selectedDocument}
                onSummaryUpdated={handleSummaryUpdated}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
