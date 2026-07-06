import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { marked } from 'marked';
import { Shell } from '@/components/ui/shell';
import { PageHeader } from '@/components/ui/page-header';
import { DOCS, getDoc } from '@/lib/docs';

export const dynamicParams = false;

export function generateStaticParams() {
  return DOCS.map((d) => ({ slug: d.slug }));
}

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getDoc(slug);
  if (!doc) notFound();

  // Content is our own markdown, checked into the repo — safe to inject.
  const html = marked.parse(doc.content, { async: false });

  return (
    <Shell>
      <PageHeader
        title={doc.title}
        subtitle={doc.subtitle}
        actions={
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-ink-200 hover:bg-white/5 hover:border-white/20 transition-colors ring-focus"
          >
            <ArrowLeft className="h-4 w-4 rtl-flip" />
            All docs
          </Link>
        }
      />
      {/* Docs are authored in English — pin LTR even under the Arabic locale. */}
      <article dir="ltr" className="surface p-6 lg:p-10 doc-prose" dangerouslySetInnerHTML={{ __html: html }} />
    </Shell>
  );
}
