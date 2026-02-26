# DocSummarizer – AI Document Summarization App

A Next.js document summarization app built with **Tailwind CSS**, **Supabase**, and **OpenAI**.

## Features

- **Upload** PDF and TXT files (drag-and-drop or browse)
- **File List** showing all uploaded documents with metadata
- **Generate Summary** – uses OpenAI GPT-3.5 to summarize a document and stores the result in Supabase
- **Delete** – removes file from Supabase Storage and the database
- **Viewer Panel** (collapsible, right-hand side) with 3 tabs:
  - **PDF Viewer** – renders PDF inline, or displays TXT content
  - **Extracted Text** – extracts all text from the file (server-side via `pdf-parse`)
  - **Summary** – shows stored summary in an editable textarea; save changes back to Supabase

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Storage | Supabase Storage |
| AI | OpenAI GPT-3.5-turbo |
| PDF extraction | pdf-parse (server-side) |

## Getting Started

### 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. In the **SQL Editor**, run the contents of `supabase-schema.sql` to create the `documents` table and storage bucket

### 2. Configure environment variables

Edit `.env.local` and fill in your real values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=sk-...
```

### 3. Install & run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
my-app-ex2/
├── app/
│   ├── page.tsx                    # Main page
│   ├── layout.tsx
│   └── api/
│       ├── upload/route.ts         # POST: upload file
│       ├── files/route.ts          # GET: list documents
│       ├── files/[id]/route.ts     # DELETE / PATCH: delete or update doc
│       ├── extract-text/route.ts   # POST: extract text from file
│       ├── generate-summary/route.ts  # POST: AI summary via OpenAI
│       └── file-proxy/route.ts     # GET: stream file from Supabase storage
├── components/
│   ├── FileUpload.tsx
│   ├── FileList.tsx
│   ├── ViewerPanel.tsx
│   └── tabs/
│       ├── PDFViewerTab.tsx
│       ├── ExtractedTextTab.tsx
│       └── SummaryTab.tsx
├── lib/
│   ├── supabase.ts                 # Client-side Supabase client
│   └── supabaseServer.ts           # Server-side (service role) client
├── types/index.ts
└── supabase-schema.sql
```


## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
