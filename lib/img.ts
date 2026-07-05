const MARKETING_HOST = 'https://www.devya.dev';

/**
 * Resolve a stored image URL for preview in the admin UI.
 * Legacy /images/... paths come from the original marketing repo's
 * `public/` folder and are served from www.devya.dev.
 */
export function resolveImg(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return `${MARKETING_HOST}${url}`;
  return url;
}

/**
 * Hosts allow-listed under `images.remotePatterns` in next.config.mjs:
 * - www.devya.dev — legacy /images/... assets from the marketing repo
 * - imagedelivery.net — Cloudflare Images (backend /api/admin/uploads)
 */
const OPTIMIZED_IMG_HOSTS = new Set(['www.devya.dev', 'imagedelivery.net']);

/**
 * True when the resolved URL points at a host we can safely render through
 * next/image. CMS values may be arbitrary user-pasted URLs (or garbage mid
 * typing); those must fall back to a plain <img> so an unknown host or an
 * unparsable src can never crash the page render.
 */
export function canOptimizeImg(url: string | null | undefined): boolean {
  const resolved = resolveImg(url);
  if (!resolved) return false;
  try {
    return OPTIMIZED_IMG_HOSTS.has(new URL(resolved).hostname);
  } catch {
    return false;
  }
}
