import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('id');

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

    const arrayBuffer = await fileData.arrayBuffer();
    const isDownload = searchParams.get('download') === 'true';

    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': document.file_type,
        'Content-Disposition': `${isDownload ? 'attachment' : 'inline'}; filename="${document.file_name}"`,
      },
    });
  } catch (error) {
    console.error('File proxy error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
