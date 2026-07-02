import { CredentialsCard } from '@/components/credentials-card';
import {
  SystemMap,
  MarketingFlow,
  BookingFlow,
  ContractsFlow,
  EndToEndFlow,
  SalesFlow,
  FeedbackFlow,
} from '@/components/system-map';
import {
  Globe,
  Lock,
  Database,
  Image as ImageIcon,
  ExternalLink,
  FileSignature,
  Calendar,
  CheckSquare,
  Mail,
  Users,
  BarChart3,
  Star,
  Send,
  Calculator,
} from 'lucide-react';

export const dynamic = 'force-static';

const APPS = [
  {
    name: 'Marketing Site',
    url: 'https://www.devya.dev',
    desc: 'The public-facing devya.dev — homepage, services, projects, blog.',
    role: 'Where prospects land',
    icon: Globe,
  },
  {
    name: 'Booking App',
    url: 'https://booking.devya-solutions.com',
    desc: 'Clients pick a free slot. Requests land in our Tasks app as Meeting Requests.',
    role: 'Where clients book a call',
    icon: Calendar,
  },
  {
    name: 'Tasks App',
    url: 'https://tasks.devya-solutions.com',
    desc: 'Where Muhammed & Moaz live every day. Meeting requests appear as a bar at the top.',
    role: 'Where the team triages work',
    icon: CheckSquare,
  },
  {
    name: 'Sales App',
    url: 'https://sales.devya-solutions.com',
    desc: 'Arabic-first pipeline. Reps run leads, log activity, schedule meetings, close deals.',
    role: 'Where sales reps work leads',
    icon: BarChart3,
  },
  {
    name: 'Quote App',
    url: 'https://quote.devya-solutions.com',
    desc: 'Clients build a quote from services and see a live invoice, then convert it into a contract.',
    role: 'Where quotes become contracts',
    icon: Calculator,
  },
  {
    name: 'Contracts App',
    url: 'https://contracts.devya-solutions.com',
    desc: 'Generate a contract from a template, send by email, client signs in browser.',
    role: 'Where contracts are drafted & signed',
    icon: FileSignature,
  },
  {
    name: 'Feedback App',
    url: 'https://feedback.devya-solutions.com',
    desc: 'After delivery, sends a review request. Happy clients go to Google/Clutch; unhappy ones leave private feedback first.',
    role: 'Where reviews are collected',
    icon: Star,
  },
  {
    name: 'Mailer App',
    url: 'https://mailer.devya-solutions.com',
    desc: 'Internal outbound-email composer that sends branded messages from the company mailbox. Its own login and SMTP — standalone.',
    role: 'Where the team sends email',
    icon: Send,
  },
  {
    name: 'Admin Dashboard',
    url: 'https://admin.devya-solutions.com',
    desc: 'Edit the marketing site, watch every booking + contract, and manage users, roles & access.',
    role: 'Where ops oversees everything',
    icon: Lock,
  },
];

const ROLES = [
  {
    icon: Globe,
    title: 'Marketing',
    color: 'text-sky-300 bg-sky-500/10 border-sky-500/30',
    duties: [
      'Sign in to Admin dashboard',
      'Edit homepage, services, projects, testimonials, blog',
      'Upload images (auto-pushed to Cloudflare)',
      'Publish — site refreshes within 60 seconds',
    ],
  },
  {
    icon: Calendar,
    title: 'Sales / Front desk',
    color: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30',
    duties: [
      'Watch the Meeting Requests bar in the Tasks app',
      'Accept a slot OR propose 1–10 alternatives',
      'Confirmation emails go out automatically',
      'After meeting, draft a contract from a template',
    ],
  },
  {
    icon: FileSignature,
    title: 'Legal / Contracts',
    color: 'text-purple-300 bg-purple-500/10 border-purple-500/30',
    duties: [
      'Open Contracts app from the Admin sidebar',
      'Pick NDA, Project, Consultancy or Retainer template',
      'Fill client + scope + price, click Send',
      'Track status from the Admin dashboard',
    ],
  },
  {
    icon: Users,
    title: 'Delivery / Team',
    color: 'text-amber-300 bg-amber-500/10 border-amber-500/30',
    duties: [
      'Confirmed meeting auto-creates a Meeting task',
      'Important + urgency by deadline (CR-1 rules)',
      'Email reminders 8h and 3h before the meeting',
      'Mark complete with proof from the Tasks app',
    ],
  },
];

const STATUSES = [
  { label: 'Pending', cls: 'status-pending', desc: 'Waiting for someone to act' },
  { label: 'Active', cls: 'status-active', desc: 'Currently moving' },
  { label: 'Client', cls: 'status-client', desc: 'In the client’s hands' },
  { label: 'Admin', cls: 'status-admin', desc: 'Internal review / oversight' },
  { label: 'Stuck', cls: 'status-danger', desc: 'Declined / blocked' },
];

export default function FlowMapPage() {
  return (
    <main className="min-h-screen px-6 py-12 md:py-20">
      <div className="mx-auto max-w-6xl space-y-20">
        {/* Header */}
        <header className="space-y-5">
          <span className="chip">Internal · Flow Map</span>
          <h1 className="text-5xl md:text-6xl font-semibold text-white tracking-tight leading-[1.05]">
            How Devya Solutions Works
          </h1>
          <p className="text-xl text-zinc-300 max-w-3xl">
            A plain-English map of who does what, which app each team lives in, and how a
            client goes from <em>booking a call</em> to <em>signing a contract</em> — without any
            technical jargon.
          </p>
        </header>

        {/* Status legend */}
        <section className="surface-strong p-6 card-anchor">
          <h2 className="text-lg font-semibold text-white mb-4">Reading the colours</h2>
          <div className="flex flex-wrap gap-3">
            {STATUSES.map((s) => (
              <div key={s.label} className={`status-pill ${s.cls}`}>
                <span className="dot" />
                <span className="font-semibold">{s.label}</span>
                <span className="opacity-80 text-sm">— {s.desc}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-zinc-400">
            These colours repeat across every diagram, so once you learn them here, the rest scans
            instantly.
          </p>
        </section>

        {/* Credentials */}
        <section>
          <CredentialsCard />
        </section>

        {/* Big picture diagram */}
        <section className="space-y-5">
          <div>
            <h2 className="text-3xl font-semibold text-white">The big picture</h2>
            <p className="mt-2 text-lg text-zinc-300">
              Four teams. Nine apps — marketing, booking, sales, quote, tasks, contracts,
              feedback, mailer, and the admin dashboard. One shared database keeps every screen
              on the same truth in real time (the mailer is the one standalone tool).
            </p>
          </div>
          <div className="surface-strong p-6 md:p-10 overflow-x-auto">
            <SystemMap />
          </div>
        </section>

        {/* The apps */}
        <section className="space-y-5">
          <h2 className="text-3xl font-semibold text-white">Each app, in one line</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {APPS.map((a) => {
              const Icon = a.icon;
              return (
                <a
                  key={a.name}
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="surface-strong p-6 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-white/5 border border-white/10 p-3 shrink-0 group-hover:bg-white/10 transition">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-xl font-semibold text-white">{a.name}</h3>
                        <ExternalLink className="h-4 w-4 text-zinc-500 group-hover:text-white shrink-0" />
                      </div>
                      <p className="mt-1 text-sm text-zinc-400">{a.role}</p>
                      <p className="mt-3 text-base text-zinc-200">{a.desc}</p>
                      <p className="mt-3 text-xs text-zinc-500 font-mono break-all">{a.url}</p>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        {/* Who does what */}
        <section className="space-y-5">
          <h2 className="text-3xl font-semibold text-white">Who does what</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {ROLES.map((r) => {
              const Icon = r.icon;
              return (
                <div key={r.title} className="surface-strong p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`rounded-xl p-2.5 border ${r.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">{r.title}</h3>
                  </div>
                  <ul className="space-y-2.5 text-base text-zinc-200">
                    {r.duties.map((d) => (
                      <li key={d} className="flex gap-3">
                        <span className="text-emerald-400 shrink-0 font-semibold">✓</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* End-to-end journey */}
        <section className="space-y-5">
          <div>
            <h2 className="text-3xl font-semibold text-white">A client journey, end to end</h2>
            <p className="mt-2 text-lg text-zinc-300">
              From the very first website visit to a signed contract — one slide, no jargon.
              The diagram has two lanes: the <span className="text-sky-300 font-semibold">client</span>{' '}
              on top, <span className="text-emerald-300 font-semibold">us</span> on the bottom.
            </p>
          </div>
          <div className="surface-strong p-6 md:p-10 overflow-x-auto card-anchor">
            <EndToEndFlow />
          </div>
        </section>

        {/* Booking flow */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <Calendar className="h-7 w-7 text-emerald-300" />
            <h2 className="text-3xl font-semibold text-white">Booking flow</h2>
          </div>
          <p className="text-lg text-zinc-300">
            Client books a slot → the team accepts or proposes alternatives → confirmation auto-creates
            a Meeting task with reminders.
          </p>
          <div className="surface-strong p-6 md:p-10 overflow-x-auto">
            <BookingFlow />
          </div>
        </section>

        {/* Sales flow */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-7 w-7 text-emerald-300" />
            <h2 className="text-3xl font-semibold text-white">Sales pipeline flow</h2>
          </div>
          <p className="text-lg text-zinc-300">
            Reps track leads through stages, log every touch (WhatsApp / call / meeting), schedule
            meetings straight into the booking calendar, close won leads with a one-click contract
            prefill, and lose the rest with a reason.
          </p>
          <div className="surface-strong p-6 md:p-10 overflow-x-auto">
            <SalesFlow />
          </div>
        </section>

        {/* Feedback flow */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <Star className="h-7 w-7 text-amber-300" />
            <h2 className="text-3xl font-semibold text-white">Feedback & reviews flow</h2>
          </div>
          <p className="text-lg text-zinc-300">
            After a project ships, the Feedback app emails the client a one-tap rating. Happy
            clients (4–5★) are sent straight to a public platform (Google / Clutch); unhappy ones
            (1–3★) leave a private comment the team reads first — so public reviews stay strong and
            problems get caught early.
          </p>
          <div className="surface-strong p-6 md:p-10 overflow-x-auto">
            <FeedbackFlow />
          </div>
        </section>

        {/* Contracts flow */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <FileSignature className="h-7 w-7 text-purple-300" />
            <h2 className="text-3xl font-semibold text-white">Contract & e-sign flow</h2>
          </div>
          <p className="text-lg text-zinc-300">
            Sales drafts a contract from a template, sends an email with a sign link, and watches
            the status move from <strong className="text-zinc-100">DRAFT</strong> →{' '}
            <strong className="text-zinc-100">SENT</strong> →{' '}
            <strong className="text-zinc-100">VIEWED</strong> →{' '}
            <strong className="text-emerald-300">SIGNED</strong> right inside the Admin dashboard.
          </p>
          <div className="surface-strong p-6 md:p-10 overflow-x-auto card-anchor">
            <ContractsFlow />
          </div>
          <div className="surface p-6">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Mail className="h-4 w-4" /> What the client sees
            </h3>
            <ol className="space-y-3 text-base text-zinc-200 list-decimal list-inside">
              <li>
                Receives an email titled{' '}
                <strong>“Please review &amp; sign your contract”</strong> with a single big{' '}
                <em>Open contract</em> button.
              </li>
              <li>
                Lands on the contract page (no login — the email link is the credential). Status flips
                to <span className="status-pill status-client"><span className="dot" />VIEWED</span>.
              </li>
              <li>
                Types their name, draws a signature, ticks &ldquo;I agree&rdquo;, hits sign. Status
                flips to <span className="status-pill status-active"><span className="dot" />SIGNED</span>.
              </li>
              <li>
                Gets the signed copy back by email (PDF + secure HTML link).
              </li>
            </ol>
          </div>
        </section>

        {/* How the apps relate */}
        <section className="space-y-5">
          <h2 className="text-3xl font-semibold text-white">How the apps relate</h2>
          <p className="text-lg text-zinc-300">
            One booking can trigger one Meeting task, one quote, and one contract. All of them stay
            linked so the team can jump between screens without losing context.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Relation
              from="Booking app"
              to="Tasks app"
              note='Each confirmed slot auto-creates a "Meeting" task — important by default, urgency follows the date.'
              icon={CheckSquare}
            />
            <Relation
              from="Tasks app"
              to="Admin dashboard"
              note="Every booking + meeting task is also visible in Admin under /bookings."
              icon={Lock}
            />
            <Relation
              from="Contracts app"
              to="Admin dashboard"
              note="Every contract appears in /contracts with live status (DRAFT → SIGNED) and a signed-PDF download."
              icon={FileSignature}
            />
            <Relation
              from="Quote app"
              to="Contracts app"
              note="A finished quote converts into a prefilled contract — services, scope and price carry straight over."
              icon={Calculator}
            />
            <Relation
              from="Won deal"
              to="Feedback app"
              note="After delivery, a review request goes out; the rating and any private comment land back with the team."
              icon={Star}
            />
            <Relation
              from="Mailer app"
              to="Company mailbox"
              note="Standalone tool with its own login + SMTP — the team composes and sends branded outbound email; it does not touch the shared database."
              icon={Send}
            />
          </div>
        </section>

        {/* Marketing flow */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <Globe className="h-7 w-7 text-sky-300" />
            <h2 className="text-3xl font-semibold text-white">Marketing flow</h2>
          </div>
          <p className="text-lg text-zinc-300">
            Edit in Admin → save → public site refreshes within 60s. No deploys, no redeploys.
          </p>
          <div className="surface-strong p-6 md:p-10 overflow-x-auto">
            <MarketingFlow />
          </div>
        </section>

        {/* Where data lives */}
        <section className="space-y-5">
          <h2 className="text-3xl font-semibold text-white">Where the data lives</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="surface-strong p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-md bg-emerald-500/10 p-2 border border-emerald-500/30">
                  <Database className="h-5 w-5 text-emerald-300" />
                </div>
                <h3 className="text-xl font-semibold text-white">One database</h3>
              </div>
              <p className="text-base text-zinc-200">
                Postgres on the Hostinger VPS holds users &amp; roles, bookings, sales leads,
                contracts, tasks, feedback, and every CMS entity. Every app (except the standalone
                mailer) reads from this single source of truth, so screens never disagree.
              </p>
            </div>
            <div className="surface-strong p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-md bg-purple-500/10 p-2 border border-purple-500/30">
                  <ImageIcon className="h-5 w-5 text-purple-300" />
                </div>
                <h3 className="text-xl font-semibold text-white">Images on Cloudflare</h3>
              </div>
              <p className="text-base text-zinc-200">
                Uploads from the Admin dashboard go straight to Cloudflare Images. The marketing site
                pulls them via <code className="font-mono text-zinc-100">imagedelivery.net</code> for
                fast worldwide delivery.
              </p>
            </div>
          </div>
        </section>

        <footer className="pt-12 border-t border-white/10 text-sm text-zinc-500">
          Internal document · not indexed · <span className="font-mono">noindex,nofollow</span>
        </footer>
      </div>
    </main>
  );
}

function Relation({
  from,
  to,
  note,
  icon: Icon,
}: {
  from: string;
  to: string;
  note: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="surface-strong p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2 text-sm text-zinc-300">
        <span className="font-semibold text-white">{from}</span>
        <span className="text-emerald-400">→</span>
        <span className="font-semibold text-white">{to}</span>
      </div>
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 text-zinc-400 shrink-0 mt-0.5" />
        <p className="text-base text-zinc-200">{note}</p>
      </div>
    </div>
  );
}
