import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

async function generateWithGitHubModels(text: string, token: string): Promise<string> {
  const response = await fetch('https://models.github.ai/inference/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that creates concise, accurate summaries of documents. Provide a clear, well-structured summary that captures the main points and key information.',
        },
        {
          role: 'user',
          content: `Please summarize the following document:\n\n${text}`,
        },
      ],
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`GitHub Models API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? '';
}

/** Simple extractive fallback: first ~5 sentences + word count */
function extractiveSummary(text: string): string {
  const sentences = text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);

  const excerpt = sentences.slice(0, 5).join(' ');
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return `[Auto-extracted summary – ${wordCount} words total]\n\n${excerpt}`;
}

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

    let textContent = '';

    if (document.file_type === 'text/plain') {
      textContent = await fileData.text();
    } else if (document.file_type === 'application/pdf') {
      const arrayBuffer = await fileData.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      // pdf-parse v2 class-based API
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { PDFParse } = require('pdf-parse') as { PDFParse: new (opts: { data: Buffer }) => { getText: () => Promise<{ text: string }> } };
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      textContent = result.text;
    }

    if (!textContent.trim()) {
      return NextResponse.json({ success: false, error: 'No text content found in document' }, { status: 400 });
    }

    const truncatedText = textContent.length > 12000 ? textContent.substring(0, 12000) + '...' : textContent;

    const githubToken = process.env.GITHUB_TOKEN;
    let summary = '';

    if (!githubToken) {
      return NextResponse.json({ success: false, error: 'GITHUB_TOKEN is not set in environment variables' }, { status: 500 });
    }

    try {
      summary = await generateWithGitHubModels(truncatedText, githubToken);
      if (!summary) summary = extractiveSummary(textContent);
    } catch (aiError: unknown) {
      const msg = aiError instanceof Error ? aiError.message : String(aiError);
      console.error('GitHub Models error:', msg);
      return NextResponse.json({ success: false, error: `GitHub Models error: ${msg}` }, { status: 500 });
    }

    const { data: updatedDocument, error: updateError } = await supabaseServer
      .from('documents')
      .update({ summary, updated_at: new Date().toISOString() })
      .eq('id', documentId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, summary, document: updatedDocument });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Generate summary error:', msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

