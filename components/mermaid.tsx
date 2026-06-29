'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  chart: string;
  id: string;
  /** Pixel font-size applied to every label. Default 18. */
  fontSize?: number;
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
