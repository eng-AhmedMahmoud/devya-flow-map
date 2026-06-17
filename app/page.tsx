import { CredentialsCard } from '@/components/credentials-card';
import { SystemMap, MarketingFlow, BookingFlow } from '@/components/system-map';
import { Globe, Lock, Database, Image as ImageIcon, ExternalLink } from 'lucide-react';

export const dynamic = 'force-static';

const APPS = [
  {
    name: 'Marketing Site',
    url: 'https://www.devya.dev',
    desc: 'Public website. ISR 60s. Reads from /api/public/*.',
    repo: 'eng-AhmedMahmoud/devya-solutions',
  },
  {
    name: 'Admin Dashboard',
    url: 'https://admin.devya-solutions.com',
    desc: 'CMS + bookings management. JWT cookie auth. Uploads to Cloudflare Images.',
    repo: 'eng-AhmedMahmoud/devya-admin-app',
  },
  {
    name: 'Booking App',
    url: 'https://booking.devya-solutions.com',
    desc: 'Public 30-min slot picker for marketing / dev / business calls.',
    repo: 'eng-AhmedMahmoud/devya-booking-app',
  },
  {
    name: 'Backend API',
    url: 'https://api.devya-solutions.com/api/health',
    desc: 'NestJS + Prisma. Docker on Hostinger VPS 72.61.81.59 behind nginx + certbot.',
    repo: 'eng-AhmedMahmoud/devya-backend',
  },
];

const ROLES = [
  {
    icon: Globe,
    title: 'Marketing Team',
    duties: [
      'Sign in to admin dashboard',
      'Edit Hero, Services, Reasons, Testimonials, Partners, Achievements, Awards',
      'Add / publish Projects & Industries',
      'Write Blog posts',
      'Upload images (auto-pushed to Cloudflare Images)',
    ],
  },
  {
    icon: Lock,
    title: 'Ops Admin',
    duties: [
      'Same login as marketing team (role ADMIN)',
      'Review incoming bookings on /bookings',
      'Confirm / cancel / annotate booking entries',
      'Monitor contact-form submissions',
      'Rotate credentials via SEED_ADMIN_PASSWORD on VPS',
    ],
  },
];

export default function FlowMapPage() {
  return (
    <main className="min-h-screen px-6 py-12 md:py-20">
      <div className="mx-auto max-w-6xl space-y-16">
        {/* Header */}
        <header className="space-y-4">
          <span className="chip">Internal · Flow Map</span>
          <h1 className="text-4xl md:text-5xl font-semibold text-white tracking-tight">
            Devya Solutions — System of Apps
          </h1>
          <p className="text-lg text-ink-300 max-w-3xl">
            How the marketing site, admin dashboard, booking app, and backend API fit together. Who logs in
            where, what each app does, and where the data lives.
          </p>
        </header>

        {/* Credentials */}
        <section>
          <CredentialsCard />
        </section>

        {/* App grid */}
        <section className="space-y-5">
          <h2 className="text-2xl font-semibold text-white">The four apps</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {APPS.map((a) => (
              <a
                key={a.name}
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="surface-strong p-5 hover:border-white/25 transition-colors group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{a.name}</h3>
                    <p className="mt-1 text-xs text-ink-400 font-mono break-all">{a.url}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-ink-400 group-hover:text-white shrink-0 mt-1" />
                </div>
                <p className="mt-3 text-sm text-ink-300">{a.desc}</p>
                <p className="mt-3 text-[11px] text-ink-500 font-mono">github.com/{a.repo}</p>
              </a>
            ))}
          </div>
        </section>

        {/* System map */}
        <section className="space-y-5">
          <div>
            <h2 className="text-2xl font-semibold text-white">System map</h2>
            <p className="mt-1 text-sm text-ink-300">
              Users → apps → platform → storage. Solid arrows are real-time requests, dashed are cached.
            </p>
          </div>
          <div className="surface-strong p-6 overflow-x-auto">
            <SystemMap />
          </div>
        </section>

        {/* Roles */}
        <section className="space-y-5">
          <h2 className="text-2xl font-semibold text-white">Who does what</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ROLES.map((r) => {
              const Icon = r.icon;
              return (
                <div key={r.title} className="surface-strong p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="rounded-md bg-white/[0.04] p-2 border border-white/10">
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">{r.title}</h3>
                  </div>
                  <ul className="space-y-1.5 text-sm text-ink-300">
                    {r.duties.map((d) => (
                      <li key={d} className="flex gap-2">
                        <span className="text-ink-500 shrink-0">→</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* Marketing flow */}
        <section className="space-y-5">
          <div>
            <h2 className="text-2xl font-semibold text-white">Marketing flow — publishing content</h2>
            <p className="mt-1 text-sm text-ink-300">
              From sign-in to a new project appearing on www.devya.dev (typically &lt; 60s via ISR).
            </p>
          </div>
          <div className="surface-strong p-6 overflow-x-auto">
            <MarketingFlow />
          </div>
        </section>

        {/* Booking flow */}
        <section className="space-y-5">
          <div>
            <h2 className="text-2xl font-semibold text-white">Booking flow — customer to admin</h2>
            <p className="mt-1 text-sm text-ink-300">
              Customer books on the public booking app; admin reviews and confirms inside the dashboard.
            </p>
          </div>
          <div className="surface-strong p-6 overflow-x-auto">
            <BookingFlow />
          </div>
        </section>

        {/* Storage breakdown */}
        <section className="space-y-5">
          <h2 className="text-2xl font-semibold text-white">Where the data lives</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="surface-strong p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-md bg-emerald-500/10 p-2 border border-emerald-500/30">
                  <Database className="h-4 w-4 text-emerald-300" />
                </div>
                <h3 className="text-lg font-semibold text-white">Postgres (VPS)</h3>
              </div>
              <p className="text-sm text-ink-300">
                Volume <code className="font-mono text-ink-100">devya-postgres-data</code> on the Hostinger VPS.
                Holds Users, Bookings, and all CMS entities (Projects, Industries, BlogPost, Services, Hero,
                etc.).
              </p>
              <p className="mt-3 text-[11px] text-ink-500 font-mono">prisma schema lives in backend repo</p>
            </div>
            <div className="surface-strong p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-md bg-purple-500/10 p-2 border border-purple-500/30">
                  <ImageIcon className="h-4 w-4 text-purple-300" />
                </div>
                <h3 className="text-lg font-semibold text-white">Cloudflare Images</h3>
              </div>
              <p className="text-sm text-ink-300">
                All uploads from the admin dashboard go to the Cloudflare account; URLs are stored as plain
                strings in Postgres. Delivery via{' '}
                <code className="font-mono text-ink-100">imagedelivery.net/&lt;hash&gt;/&lt;id&gt;/public</code>.
              </p>
              <p className="mt-3 text-[11px] text-ink-500 font-mono">
                env: CLOUDFLARE_ACCOUNT_ID · CLOUDFLARE_API_TOKEN · CLOUDFLARE_IMAGES_ACCOUNT_HASH
              </p>
            </div>
          </div>
        </section>

        <footer className="pt-12 border-t border-white/10 text-xs text-ink-500">
          Internal document · not indexed · {' '}
          <span className="font-mono">noindex,nofollow</span>
        </footer>
      </div>
    </main>
  );
}
