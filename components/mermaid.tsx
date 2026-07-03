'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  chart: string;
  id: string;
  /** Pixel font-size applied to every label. Default 18. */
  fontSize?: number;
}

const NODE_ID_RE = /^flowchart-(.+)-\d+$/;
// Mermaid 11 edge id: `L_<src>_<dst>_<n>`. Names may contain '_' (e.g. SALES_APP),
// so we can't parse by regex alone — we split against a known set of node names.
const EDGE_ID_RE = /^L_(.+)_(\d+)$/;

function getNodeName(el: Element): string {
  const m = el.id.match(NODE_ID_RE);
  if (m) return m[1];
  const dataId = (el as SVGElement).getAttribute('data-id');
  return dataId ?? '';
}

function parseEdgeId(raw: string, names: Set<string>): { src: string; dst: string } {
  const m = raw.match(EDGE_ID_RE);
  if (!m) return { src: '', dst: '' };
  const body = m[1];
  // Find the split point where both halves are valid node names.
  for (let i = 1; i < body.length - 1; i++) {
    if (body[i] !== '_') continue;
    const left = body.slice(0, i);
    const right = body.slice(i + 1);
    if (names.has(left) && names.has(right)) return { src: left, dst: right };
  }
  // Fallback: longest left match against known names.
  let bestSrc = '';
  let bestDst = '';
  for (const n of names) {
    if (body.startsWith(n + '_') && n.length > bestSrc.length) {
      const rest = body.slice(n.length + 1);
      bestSrc = n;
      bestDst = rest;
    }
  }
  return { src: bestSrc, dst: bestDst };
}

function extractEdgeId(el: Element): string {
  const dataId = el.getAttribute('data-id');
  if (dataId) return dataId;
  const rawId = el.id || '';
  const lastL = rawId.lastIndexOf('L_');
  return lastL >= 0 ? rawId.slice(lastL) : '';
}

function getEdgeEndpoints(el: Element, names: Set<string>): { src: string; dst: string } {
  let src = '';
  let dst = '';
  el.classList.forEach((c) => {
    if (c.startsWith('LS-')) src = c.slice(3);
    else if (c.startsWith('LE-')) dst = c.slice(3);
  });
  if (src && dst) return { src, dst };
  const raw = extractEdgeId(el);
  if (raw) return parseEdgeId(raw, names);
  return {
    src: el.getAttribute('data-edge-source') || el.getAttribute('data-source') || '',
    dst: el.getAttribute('data-edge-target') || el.getAttribute('data-target') || '',
  };
}

function getLabelEndpoints(el: Element, names: Set<string>): { src: string; dst: string } {
  const direct = getEdgeEndpoints(el, names);
  if (direct.src && direct.dst) return direct;
  const inner = el.querySelector('[data-id]');
  if (inner) {
    const dataId = inner.getAttribute('data-id') ?? '';
    return parseEdgeId(dataId, names);
  }
  return { src: '', dst: '' };
}

export function Mermaid({ chart, id, fontSize = 18 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          fontFamily: 'Sora, system-ui, sans-serif',
          flowchart: { htmlLabels: true, useMaxWidth: true, curve: 'basis' },
          sequence: {
            actorFontSize: fontSize,
            noteFontSize: fontSize - 2,
            messageFontSize: fontSize - 2,
            wrap: true,
            mirrorActors: false,
          },
          themeVariables: {
            background: '#0a0a0a',
            primaryColor: '#161616',
            primaryTextColor: '#f5f5f5',
            primaryBorderColor: '#3a3a3a',
            lineColor: '#9a9a9a',
            secondaryColor: '#121212',
            tertiaryColor: '#161616',
            mainBkg: '#161616',
            nodeBorder: '#3a3a3a',
            clusterBkg: 'rgba(255,255,255,0.03)',
            clusterBorder: 'rgba(255,255,255,0.18)',
            edgeLabelBackground: '#0a0a0a',
            fontSize: `${fontSize}px`,
            labelFontSize: `${fontSize}px`,
            actorFontSize: `${fontSize}px`,
            noteFontSize: `${fontSize}px`,
            messageFontSize: `${fontSize}px`,
          },
        });
        const { svg } = await mermaid.render(`m-${id}`, chart);
        if (!cancelled) setSvg(svg);
      } catch (e) {
        if (!cancelled) setErr((e as Error).message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [chart, id, fontSize]);

  // Hover highlight: when a node is hovered, dim every edge that isn't
  // incident to it. Uses Mermaid's LS-<src> / LE-<dst> classes stamped on
  // .flowchart-link paths — no chart-code changes needed.
  useEffect(() => {
    const root = ref.current;
    if (!root || !svg) return;
    const svgEl = root.querySelector('svg');
    if (!svgEl) return;

    const nodes = Array.from(svgEl.querySelectorAll<SVGGElement>('g.node'));
    const nodeNames = new Set<string>();
    for (const n of nodes) {
      const name = getNodeName(n);
      if (name) nodeNames.add(name);
    }

    let edges = Array.from(svgEl.querySelectorAll<SVGPathElement>('path.flowchart-link'));
    if (edges.length === 0) {
      edges = Array.from(
        svgEl.querySelectorAll<SVGPathElement>('g.edgePaths path, g.edgePath path'),
      );
    }
    const edgeLabels = Array.from(svgEl.querySelectorAll<SVGGElement>('g.edgeLabel'));

    const edgeMeta = edges.map((e) => ({ el: e, ...getEdgeEndpoints(e, nodeNames) }));
    const labelMeta = edgeLabels.map((l) => ({ el: l, ...getLabelEndpoints(l, nodeNames) }));

    // Neighbours per node (union of all edges' endpoints touching this node).
    const neighbours = new Map<string, Set<string>>();
    for (const { src, dst } of edgeMeta) {
      if (!src || !dst) continue;
      if (!neighbours.has(src)) neighbours.set(src, new Set());
      if (!neighbours.has(dst)) neighbours.set(dst, new Set());
      neighbours.get(src)!.add(dst);
      neighbours.get(dst)!.add(src);
    }

    const clear = () => {
      root.classList.remove('has-hover');
      for (const e of edges) e.classList.remove('edge-hi');
      for (const n of nodes) n.classList.remove('node-hi', 'node-dim');
      for (const l of edgeLabels) l.classList.remove('edge-hi');
    };

    const highlight = (name: string) => {
      if (!name) return;
      root.classList.add('has-hover');
      const nbrs = neighbours.get(name) ?? new Set<string>();
      for (const { el, src, dst } of edgeMeta) {
        const hit = src === name || dst === name;
        el.classList.toggle('edge-hi', hit);
      }
      for (const { el, src, dst } of labelMeta) {
        el.classList.toggle('edge-hi', src === name || dst === name);
      }
      for (const n of nodes) {
        const nName = getNodeName(n);
        if (nName === name) {
          n.classList.add('node-hi');
          n.classList.remove('node-dim');
        } else if (nbrs.has(nName)) {
          n.classList.remove('node-hi', 'node-dim');
        } else {
          n.classList.add('node-dim');
          n.classList.remove('node-hi');
        }
      }
    };

    const bindings: Array<() => void> = [];
    for (const n of nodes) {
      const name = getNodeName(n);
      if (!name) continue;
      const enter = () => highlight(name);
      const leave = () => clear();
      n.addEventListener('mouseenter', enter);
      n.addEventListener('mouseleave', leave);
      (n as unknown as HTMLElement).style.cursor = 'pointer';
      bindings.push(() => {
        n.removeEventListener('mouseenter', enter);
        n.removeEventListener('mouseleave', leave);
      });
    }

    return () => {
      for (const off of bindings) off();
      clear();
    };
  }, [svg]);

  if (err) {
    return <pre className="text-rose-300 text-xs whitespace-pre-wrap p-4">{err}</pre>;
  }

  return (
    <div
      ref={ref}
      className="mermaid w-full"
      style={{ fontSize: `${fontSize}px` }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
