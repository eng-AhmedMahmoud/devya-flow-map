import fs from 'node:fs';
import path from 'node:path';

// Copies of the canonical process docs that live at the monorepo root
// (devya-solutions/docs/). Copy-per-app per ADR-0007 — when the process
// changes, update the root doc first, then re-copy here.
export interface DocMeta {
  slug: string;
  title: string;
  subtitle: string;
  file: string;
}

export const DOCS: DocMeta[] = [
  {
    slug: 'delivery-process',
    title: 'Delivery Process',
    subtitle: 'Sprint cadence, ceremonies, Definition of Done, and delivery metrics.',
    file: 'DELIVERY-PROCESS.md',
  },
  {
    slug: 'requirement-spec-template',
    title: 'Requirement Spec Template',
    subtitle: 'ISO 29148-aligned drafting template mirroring the pm-app requirement model.',
    file: 'REQUIREMENT-SPEC-TEMPLATE.md',
  },
  {
    slug: 'tech-debt',
    title: 'Technical Debt Register',
    subtitle: 'Prioritised register of known debt, reviewed at each retrospective.',
    file: 'TECH-DEBT.md',
  },
];

export function getDoc(slug: string): (DocMeta & { content: string }) | null {
  const meta = DOCS.find((d) => d.slug === slug);
  if (!meta) return null;
  const content = fs.readFileSync(path.join(process.cwd(), 'content', 'docs', meta.file), 'utf8');
  return { ...meta, content };
}
