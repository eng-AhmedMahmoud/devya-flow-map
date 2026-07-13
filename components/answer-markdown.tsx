import { Fragment, type ReactNode } from 'react';

/**
 * Minimal, dependency-free renderer for the small markdown subset the
 * assistant emits — headings, bold, inline code, and bullet lists. Keeps the
 * chat answer clean instead of dumping raw ### / ** / `backtick` characters.
 */

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  // Split on **bold** and `code`, keeping the delimiters' captured content.
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  parts.forEach((part, i) => {
    if (!part) return;
    if (part.startsWith('**') && part.endsWith('**')) {
      nodes.push(
        <strong key={i} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>,
      );
    } else if (part.startsWith('`') && part.endsWith('`')) {
      nodes.push(
        <code
          key={i}
          className="rounded bg-white/[0.07] px-1.5 py-0.5 font-mono text-[0.85em] text-ink-100"
        >
          {part.slice(1, -1)}
        </code>,
      );
    } else {
      nodes.push(<Fragment key={i}>{part}</Fragment>);
    }
  });
  return nodes;
}

export function AnswerMarkdown({ content }: { content: string }) {
  const lines = content.replace(/\r/g, '').split('\n');
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  let key = 0;

  const flushList = () => {
    if (list.length === 0) return;
    const items = list;
    list = [];
    blocks.push(
      <ul key={key++} className="my-2 space-y-1.5 ps-1">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2.5">
            <span className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-ink-400" />
            <span>{renderInline(item)}</span>
          </li>
        ))}
      </ul>,
    );
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flushList();
      continue;
    }
    const heading = line.match(/^#{1,6}\s+(.*)$/);
    const bullet = line.match(/^\s*[*-]\s+(.*)$/);
    if (heading) {
      flushList();
      blocks.push(
        <h3 key={key++} className="mt-4 mb-1.5 text-[15px] font-semibold text-white first:mt-0">
          {renderInline(heading[1])}
        </h3>,
      );
    } else if (bullet) {
      list.push(bullet[1]);
    } else {
      flushList();
      blocks.push(
        <p key={key++} className="my-2 first:mt-0 last:mb-0">
          {renderInline(line)}
        </p>,
      );
    }
  }
  flushList();

  return <div className="text-[14px] leading-relaxed">{blocks}</div>;
}
