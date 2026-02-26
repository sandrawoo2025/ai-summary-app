import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { documentId } = body;

    if (!documentId) {
      return NextResponse.json({ success: false, error: 'Document ID is required' }, { status: 400 });
    }

    const { data: document, error: fetchError } = await supabaseServer
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (fetchError || !document) {
      return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 });
    }

    const { data: fileData, error: storageError } = await supabaseServer.storage
      .from('documents')
      .download(document.storage_path);

    if (storageError || !fileData) {
      return NextResponse.json({ success: false, error: 'Failed to download file' }, { status: 500 });
    }

    let extractedText = '';

    if (document.file_type === 'text/plain') {
      extractedText = await fileData.text();
    } else if (document.file_type === 'application/pdf') {
      const arrayBuffer = await fileData.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // pdf-parse v2 class-based API
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { PDFParse } = require('pdf-parse') as { PDFParse: new (opts: { data: Buffer }) => { getText: () => Promise<{ text: string }> } };
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      extractedText = result.text;
    } else {
      return NextResponse.json({ success: false, error: 'Unsupported file type' }, { status: 400 });
    }

    return NextResponse.json({ success: true, text: extractedText });
  } catch (error) {
    console.error('Extract text error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
