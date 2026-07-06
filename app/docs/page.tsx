import Link from 'next/link';
import { ClipboardList, Recycle, Workflow, type LucideIcon } from 'lucide-react';
import { Shell } from '@/components/ui/shell';
import { PageHeader } from '@/components/ui/page-header';
import { DOCS } from '@/lib/docs';

const ICONS: Record<string, LucideIcon> = {
  'delivery-process': Workflow,
  'requirement-spec-template': ClipboardList,
  'tech-debt': Recycle,
};

export default function DocsPage() {
  return (
    <Shell>
      <PageHeader
        title="Process Docs"
        subtitle="How Devya plans, builds, and ships — the process behind pm-app's gates."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {DOCS.map((doc) => {
          const Icon = ICONS[doc.slug] ?? Workflow;
          return (
            <Link key={doc.slug} href={`/docs/${doc.slug}`} className="surface p-6 block ring-focus">
              <Icon className="h-5 w-5 text-ink-300 mb-4" />
              <div className="text-white font-medium">{doc.title}</div>
              <p className="text-sm text-ink-400 mt-1.5">{doc.subtitle}</p>
            </Link>
          );
        })}
      </div>
    </Shell>
  );
}
