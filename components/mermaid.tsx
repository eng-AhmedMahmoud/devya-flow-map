'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  chart: string;
  id: string;
}

export function Mermaid({ chart, id }: Props) {
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
          themeVariables: {
            background: '#0a0a0a',
            primaryColor: '#1c1c1c',
            primaryTextColor: '#e5e5e5',
            primaryBorderColor: '#3a3a3a',
            lineColor: '#6b6b6b',
            secondaryColor: '#121212',
            tertiaryColor: '#1c1c1c',
            mainBkg: '#1c1c1c',
            nodeBorder: '#3a3a3a',
            clusterBkg: 'rgba(255,255,255,0.02)',
            clusterBorder: 'rgba(255,255,255,0.10)',
            edgeLabelBackground: '#121212',
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
  }, [chart, id]);

  if (err) {
    return <pre className="text-rose-300 text-xs whitespace-pre-wrap p-4">{err}</pre>;
  }

  return <div ref={ref} className="mermaid w-full" dangerouslySetInnerHTML={{ __html: svg }} />;
}
