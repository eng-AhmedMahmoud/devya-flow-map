'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  chart: string;
  id: string;
  /** Pixel font-size applied to every label. Default 18. */
  fontSize?: number;
}

// Mermaid 11 node id: `${diagramId}-flowchart-<name>-<counter>` (e.g. `m-system-flowchart-SITE-5`).
const NODE_ID_RE = /flowchart-(.+)-\d+$/;
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

/** "Maximize" glyph for the fullscreen trigger. */
function ExpandIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="15 3 21 3 21 9" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  );
}

/**
 * Wire hover-highlight onto the rendered mermaid svg inside `root`: hovering a
 * node dims every node/edge not incident to it. Root-scoped so it can be bound
 * to both the inline diagram and its fullscreen copy. Returns a cleanup fn.
 */
function attachHoverHighlight(root: HTMLElement): (() => void) | undefined {
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

  // Delegated hover: node groups can miss mouseenter if their child shapes
  // don't fully cover the bounding box. Track pointer against the SVG root
  // and highlight whichever node is under the cursor.
  let currentName = '';
  const onMove = (e: MouseEvent) => {
    const target = e.target as Element | null;
    const nodeEl = target?.closest?.('g.node') as SVGGElement | null;
    const name = nodeEl ? getNodeName(nodeEl) : '';
    if (name === currentName) return;
    currentName = name;
    if (name) highlight(name);
    else clear();
  };
  const onLeave = () => {
    currentName = '';
    clear();
  };

  svgEl.addEventListener('mousemove', onMove);
  svgEl.addEventListener('mouseleave', onLeave);

  return () => {
    svgEl.removeEventListener('mousemove', onMove);
    svgEl.removeEventListener('mouseleave', onLeave);
    clear();
  };
}

export function Mermaid({ chart, id, fontSize = 18 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [err, setErr] = useState<string | null>(null);

  // Fullscreen viewer state: open flag + pan/zoom transform.
  const [fs, setFs] = useState(false);
  const [view, setView] = useState({ s: 1, x: 0, y: 0 });
  const [nat, setNat] = useState({ w: 0, h: 0 });
  const stageRef = useRef<HTMLDivElement>(null);
  const fsContentRef = useRef<HTMLDivElement>(null);

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

  // Hover highlight on the inline diagram.
  useEffect(() => {
    const root = ref.current;
    if (!root || !svg) return;
    return attachHoverHighlight(root);
  }, [svg]);

  // Same hover highlight, re-bound to the enlarged copy while fullscreen.
  useEffect(() => {
    if (!fs) return;
    const root = fsContentRef.current;
    if (!root) return;
    return attachHoverHighlight(root);
  }, [fs, svg]);

  // Fullscreen: Escape closes, and lock page scroll while open.
  useEffect(() => {
    if (!fs) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFs(false);
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [fs]);

  // Fullscreen: wheel-zoom toward the cursor + drag-to-pan.
  useEffect(() => {
    if (!fs) return;
    const stage = stageRef.current;
    if (!stage) return;
    const clamp = (v: number) => Math.min(8, Math.max(0.2, v));
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = stage.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      setView((v) => {
        const ns = clamp(v.s * factor);
        const k = ns / v.s;
        return { s: ns, x: px - (px - v.x) * k, y: py - (py - v.y) * k };
      });
    };
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    const onDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      stage.style.cursor = 'grabbing';
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      setView((v) => ({ ...v, x: v.x + dx, y: v.y + dy }));
    };
    const onUp = () => {
      dragging = false;
      stage.style.cursor = 'grab';
    };
    stage.addEventListener('wheel', onWheel, { passive: false });
    stage.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      stage.removeEventListener('wheel', onWheel);
      stage.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [fs]);

  // Fullscreen: fit the diagram to the stage on open (centered).
  useEffect(() => {
    if (!fs) return;
    const stage = stageRef.current;
    const content = fsContentRef.current;
    if (!stage || !content) return;
    const svgEl = content.querySelector('svg') as SVGSVGElement | null;
    if (!svgEl) return;
    let w = 0;
    let h = 0;
    try {
      const bb = svgEl.getBBox();
      w = bb.width;
      h = bb.height;
    } catch {
      /* getBBox can throw if not yet laid out */
    }
    if (!w || !h) {
      w = svgEl.clientWidth || 1;
      h = svgEl.clientHeight || 1;
    }
    setNat({ w, h });
    const sr = stage.getBoundingClientRect();
    const fit = Math.min((sr.width * 0.92) / w, (sr.height * 0.92) / h);
    const s = Math.min(8, Math.max(0.2, fit));
    setView({ s, x: (sr.width - w * s) / 2, y: (sr.height - h * s) / 2 });
  }, [fs, svg]);

  if (err) {
    return <pre className="text-rose-300 text-xs whitespace-pre-wrap p-4">{err}</pre>;
  }

  const zoomBy = (factor: number) =>
    setView((v) => {
      const stage = stageRef.current;
      const rect = stage?.getBoundingClientRect();
      const px = rect ? rect.width / 2 : 0;
      const py = rect ? rect.height / 2 : 0;
      const ns = Math.min(8, Math.max(0.2, v.s * factor));
      const k = ns / v.s;
      return { s: ns, x: px - (px - v.x) * k, y: py - (py - v.y) * k };
    });
  const reset = () => setView({ s: 1, x: 0, y: 0 });
  const openFs = () => {
    reset();
    setFs(true);
  };
  const fsBtn =
    'inline-flex items-center justify-center rounded-md border border-white/15 bg-white/5 px-2 py-1.5 text-sm text-white/80 transition hover:bg-white/15 hover:text-white min-w-[36px]';

  return (
    <div className="relative w-full">
      <div
        ref={ref}
        className="mermaid w-full"
        style={{ fontSize: `${fontSize}px` }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      {svg && (
        <button
          type="button"
          onClick={openFs}
          aria-label="Open diagram fullscreen"
          title="Fullscreen"
          className="absolute right-2 top-2 z-10 inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-black/60 px-2.5 py-1.5 text-xs font-medium text-white/70 backdrop-blur transition hover:bg-black/80 hover:text-white opacity-70 hover:opacity-100 focus:opacity-100"
        >
          <ExpandIcon /> Fullscreen
        </button>
      )}

      {fs && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2.5">
            <span className="text-sm font-medium text-white/60">
              Scroll to zoom · drag to pan · double-click to reset
            </span>
            <div className="flex items-center gap-1.5">
              <button type="button" onClick={() => zoomBy(1 / 1.2)} className={fsBtn} aria-label="Zoom out">
                −
              </button>
              <span className="w-12 text-center text-xs tabular-nums text-white/60">
                {Math.round(view.s * 100)}%
              </span>
              <button type="button" onClick={() => zoomBy(1.2)} className={fsBtn} aria-label="Zoom in">
                +
              </button>
              <button type="button" onClick={reset} className={`${fsBtn} px-3`}>
                Reset
              </button>
              <button
                type="button"
                onClick={() => setFs(false)}
                className={`${fsBtn} px-3`}
                aria-label="Close fullscreen"
              >
                ✕ Close
              </button>
            </div>
          </div>
          <div
            ref={stageRef}
            className="relative flex-1 touch-none overflow-hidden"
            style={{ cursor: 'grab' }}
            onDoubleClick={reset}
          >
            <div
              ref={fsContentRef}
              className="mermaid mermaid-fs absolute left-0 top-0 origin-top-left will-change-transform"
              style={{
                fontSize: `${fontSize}px`,
                width: nat.w ? `${nat.w}px` : undefined,
                height: nat.h ? `${nat.h}px` : undefined,
                transform: `translate(${view.x}px, ${view.y}px) scale(${view.s})`,
              }}
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
