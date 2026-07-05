import { CredentialsCard } from '@/components/credentials-card';
import { Shell } from '@/components/ui/shell';
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
import { getLocale } from '@/lib/i18n/server';
import { getDictionary, t, type Dictionary } from '@/lib/i18n/dictionary';

export const dynamic = 'force-dynamic';

type AppKey =
  | 'marketing'
  | 'booking'
  | 'tasks'
  | 'sales'
  | 'quote'
  | 'contracts'
  | 'feedback'
  | 'mailer'
  | 'admin';

const APP_ORDER: Array<{
  key: AppKey;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { key: 'marketing', url: 'https://www.devya.dev', icon: Globe },
  { key: 'booking', url: 'https://booking.devya-solutions.com', icon: Calendar },
  { key: 'tasks', url: 'https://tasks.devya-solutions.com', icon: CheckSquare },
  { key: 'sales', url: 'https://sales.devya-solutions.com', icon: BarChart3 },
  { key: 'quote', url: 'https://quote.devya-solutions.com', icon: Calculator },
  { key: 'contracts', url: 'https://contracts.devya-solutions.com', icon: FileSignature },
  { key: 'feedback', url: 'https://feedback.devya-solutions.com', icon: Star },
  { key: 'mailer', url: 'https://mailer.devya-solutions.com', icon: Send },
  { key: 'admin', url: 'https://admin.devya-solutions.com', icon: Lock },
];

type RoleKey = 'marketing' | 'sales' | 'legal' | 'delivery';

const ROLE_ORDER: Array<{
  key: RoleKey;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}> = [
  { key: 'marketing', icon: Globe, color: 'text-sky-300 bg-sky-500/10 border-sky-500/30' },
  {
    key: 'sales',
    icon: Calendar,
    color: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30',
  },
  {
    key: 'legal',
    icon: FileSignature,
    color: 'text-purple-300 bg-purple-500/10 border-purple-500/30',
  },
  { key: 'delivery', icon: Users, color: 'text-amber-300 bg-amber-500/10 border-amber-500/30' },
];

const STATUS_ORDER: Array<{ key: string; cls: string }> = [
  { key: 'pending', cls: 'status-pending' },
  { key: 'active', cls: 'status-active' },
  { key: 'client', cls: 'status-client' },
  { key: 'admin', cls: 'status-admin' },
  { key: 'stuck', cls: 'status-danger' },
];

type RelationKey =
  | 'bookingToTasks'
  | 'tasksToAdmin'
  | 'contractsToAdmin'
  | 'quoteToContracts'
  | 'wonToFeedback'
  | 'mailerToMailbox';

const RELATION_ORDER: Array<{
  key: RelationKey;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { key: 'bookingToTasks', icon: CheckSquare },
  { key: 'tasksToAdmin', icon: Lock },
  { key: 'contractsToAdmin', icon: FileSignature },
  { key: 'quoteToContracts', icon: Calculator },
  { key: 'wonToFeedback', icon: Star },
  { key: 'mailerToMailbox', icon: Send },
];

export default async function FlowMapPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <Shell>
      <div className="mx-auto max-w-6xl space-y-20 py-4 md:py-8">
        {/* Header */}
        <header className="space-y-5">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="chip">{t(dict, 'shell.internalFlowMap')}</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-semibold text-white tracking-tight leading-[1.05]">
            {t(dict, 'home.title')}
          </h1>
          <p className="text-xl text-zinc-300 max-w-3xl">
            {renderIntro(dict)}
          </p>
        </header>

        {/* Status legend */}
        <section className="surface-strong p-6 card-anchor">
          <h2 className="text-lg font-semibold text-white mb-4">
            {t(dict, 'home.legendTitle')}
          </h2>
          <div className="flex flex-wrap gap-3">
            {STATUS_ORDER.map((s) => (
              <div key={s.key} className={`status-pill ${s.cls}`}>
                <span className="dot" />
                <span className="font-semibold">{t(dict, `statuses.${s.key}Label`)}</span>
                <span className="opacity-80 text-sm">— {t(dict, `statuses.${s.key}Desc`)}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-zinc-400">{t(dict, 'home.legendCaption')}</p>
        </section>

        {/* Credentials */}
        <section>
          <CredentialsCard />
        </section>

        {/* Big picture diagram */}
        <section className="space-y-5">
          <div>
            <h2 className="text-3xl font-semibold text-white">
              {t(dict, 'home.bigPictureTitle')}
            </h2>
            <p className="mt-2 text-lg text-zinc-300">{t(dict, 'home.bigPictureIntro')}</p>
          </div>
          <div className="surface-strong p-6 md:p-10 overflow-x-auto">
            <SystemMap />
          </div>
        </section>

        {/* The apps */}
        <section className="space-y-5">
          <h2 className="text-3xl font-semibold text-white">{t(dict, 'home.appsTitle')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {APP_ORDER.map((a) => {
              const Icon = a.icon;
              return (
                <a
                  key={a.key}
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
                        <h3 className="text-xl font-semibold text-white">
                          {t(dict, `apps.${a.key}.name`)}
                        </h3>
                        <ExternalLink className="h-4 w-4 text-zinc-500 group-hover:text-white shrink-0" />
                      </div>
                      <p className="mt-1 text-sm text-zinc-400">
                        {t(dict, `apps.${a.key}.role`)}
                      </p>
                      <p className="mt-3 text-base text-zinc-200">
                        {t(dict, `apps.${a.key}.desc`)}
                      </p>
                      <p
                        className="mt-3 text-xs text-zinc-500 font-mono break-all"
                        dir="ltr"
                        style={{ textAlign: locale === 'ar' ? 'right' : 'left' }}
                      >
                        {a.url}
                      </p>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        {/* Who does what */}
        <section className="space-y-5">
          <h2 className="text-3xl font-semibold text-white">{t(dict, 'home.rolesTitle')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {ROLE_ORDER.map((r) => {
              const Icon = r.icon;
              return (
                <div key={r.key} className="surface-strong p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`rounded-xl p-2.5 border ${r.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">
                      {t(dict, `roles.${r.key}.title`)}
                    </h3>
                  </div>
                  <ul className="space-y-2.5 text-base text-zinc-200">
                    {[1, 2, 3, 4].map((n) => (
                      <li key={n} className="flex gap-3">
                        <span className="text-emerald-400 shrink-0 font-semibold">✓</span>
                        <span>{t(dict, `roles.${r.key}.duty${n}`)}</span>
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
            <h2 className="text-3xl font-semibold text-white">
              {t(dict, 'home.journeyTitle')}
            </h2>
            <p className="mt-2 text-lg text-zinc-300">
              {t(dict, 'home.journeyIntro')}{' '}
              <span className="text-sky-300 font-semibold">
                {t(dict, 'home.journeyIntroClient')}
              </span>{' '}
              {t(dict, 'home.journeyIntroAndUs')}{' '}
              <span className="text-emerald-300 font-semibold">
                {t(dict, 'home.journeyIntroUs')}
              </span>{' '}
              {t(dict, 'home.journeyIntroBottom')}
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
            <h2 className="text-3xl font-semibold text-white">
              {t(dict, 'home.bookingFlowTitle')}
            </h2>
          </div>
          <p className="text-lg text-zinc-300">{t(dict, 'home.bookingFlowIntro')}</p>
          <div className="surface-strong p-6 md:p-10 overflow-x-auto">
            <BookingFlow />
          </div>
        </section>

        {/* Sales flow */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-7 w-7 text-emerald-300" />
            <h2 className="text-3xl font-semibold text-white">
              {t(dict, 'home.salesFlowTitle')}
            </h2>
          </div>
          <p className="text-lg text-zinc-300">{t(dict, 'home.salesFlowIntro')}</p>
          <div className="surface-strong p-6 md:p-10 overflow-x-auto">
            <SalesFlow />
          </div>
        </section>

        {/* Feedback flow */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <Star className="h-7 w-7 text-amber-300" />
            <h2 className="text-3xl font-semibold text-white">
              {t(dict, 'home.feedbackFlowTitle')}
            </h2>
          </div>
          <p className="text-lg text-zinc-300">{t(dict, 'home.feedbackFlowIntro')}</p>
          <div className="surface-strong p-6 md:p-10 overflow-x-auto">
            <FeedbackFlow />
          </div>
        </section>

        {/* Contracts flow */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <FileSignature className="h-7 w-7 text-purple-300" />
            <h2 className="text-3xl font-semibold text-white">
              {t(dict, 'home.contractFlowTitle')}
            </h2>
          </div>
          <p className="text-lg text-zinc-300">
            {t(dict, 'home.contractFlowIntro')}{' '}
            <strong className="text-zinc-100">
              {t(dict, 'home.contractFlowStatusDraft')}
            </strong>{' '}
            →{' '}
            <strong className="text-zinc-100">
              {t(dict, 'home.contractFlowStatusSent')}
            </strong>{' '}
            →{' '}
            <strong className="text-zinc-100">
              {t(dict, 'home.contractFlowStatusViewed')}
            </strong>{' '}
            →{' '}
            <strong className="text-emerald-300">
              {t(dict, 'home.contractFlowStatusSigned')}
            </strong>{' '}
            {t(dict, 'home.contractFlowInsideAdmin')}
          </p>
          <div className="surface-strong p-6 md:p-10 overflow-x-auto card-anchor">
            <ContractsFlow />
          </div>
          <div className="surface p-6">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Mail className="h-4 w-4" /> {t(dict, 'home.clientSeesTitle')}
            </h3>
            <ol className="space-y-3 text-base text-zinc-200 list-decimal list-inside">
              <li>
                {t(dict, 'home.clientSees1a')}{' '}
                <strong>{t(dict, 'home.clientSees1b')}</strong>{' '}
                {t(dict, 'home.clientSees1c')}{' '}
                <em>{t(dict, 'home.clientSees1d')}</em> {t(dict, 'home.clientSees1e')}
              </li>
              <li>
                {t(dict, 'home.clientSees2a')}{' '}
                <span className="status-pill status-client">
                  <span className="dot" />
                  {t(dict, 'home.contractFlowStatusViewed')}
                </span>
                .
              </li>
              <li>
                {t(dict, 'home.clientSees3a')}{' '}
                <span className="status-pill status-active">
                  <span className="dot" />
                  {t(dict, 'home.contractFlowStatusSigned')}
                </span>
                .
              </li>
              <li>{t(dict, 'home.clientSees4a')}</li>
            </ol>
          </div>
        </section>

        {/* How the apps relate */}
        <section className="space-y-5">
          <h2 className="text-3xl font-semibold text-white">{t(dict, 'home.relateTitle')}</h2>
          <p className="text-lg text-zinc-300">{t(dict, 'home.relateIntro')}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {RELATION_ORDER.map((r) => (
              <Relation
                key={r.key}
                from={t(dict, `relations.${r.key}.from`)}
                to={t(dict, `relations.${r.key}.to`)}
                note={t(dict, `relations.${r.key}.note`)}
                icon={r.icon}
              />
            ))}
          </div>
        </section>

        {/* Marketing flow */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <Globe className="h-7 w-7 text-sky-300" />
            <h2 className="text-3xl font-semibold text-white">
              {t(dict, 'home.marketingFlowTitle')}
            </h2>
          </div>
          <p className="text-lg text-zinc-300">{t(dict, 'home.marketingFlowIntro')}</p>
          <div className="surface-strong p-6 md:p-10 overflow-x-auto">
            <MarketingFlow />
          </div>
        </section>

        {/* Where data lives */}
        <section className="space-y-5">
          <h2 className="text-3xl font-semibold text-white">{t(dict, 'home.dataTitle')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="surface-strong p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-md bg-emerald-500/10 p-2 border border-emerald-500/30">
                  <Database className="h-5 w-5 text-emerald-300" />
                </div>
                <h3 className="text-xl font-semibold text-white">{t(dict, 'data.dbTitle')}</h3>
              </div>
              <p className="text-base text-zinc-200">{t(dict, 'data.dbBody')}</p>
            </div>
            <div className="surface-strong p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-md bg-purple-500/10 p-2 border border-purple-500/30">
                  <ImageIcon className="h-5 w-5 text-purple-300" />
                </div>
                <h3 className="text-xl font-semibold text-white">
                  {t(dict, 'data.imagesTitle')}
                </h3>
              </div>
              <p className="text-base text-zinc-200">
                {t(dict, 'data.imagesBody')}{' '}
                <code className="font-mono text-zinc-100">imagedelivery.net</code>.
              </p>
            </div>
          </div>
        </section>

        <footer className="pt-12 border-t border-white/10 text-sm text-zinc-500">
          {t(dict, 'shell.notIndexedFooter')}{' '}
          <span className="font-mono">noindex,nofollow</span>
        </footer>
      </div>
    </Shell>
  );
}

function renderIntro(dict: Dictionary) {
  const intro = t(dict, 'home.intro');
  const bookA = t(dict, 'home.introBookingA');
  const contractA = t(dict, 'home.introContractA');
  // Try to split the sentence around both phrases so we can emphasise them
  // without losing translation flexibility.
  const bookIdx = intro.indexOf(bookA);
  const contractIdx = intro.indexOf(contractA);
  if (bookIdx === -1 || contractIdx === -1 || bookIdx > contractIdx) {
    return intro;
  }
  const head = intro.slice(0, bookIdx);
  const mid = intro.slice(bookIdx + bookA.length, contractIdx);
  const tail = intro.slice(contractIdx + contractA.length);
  return (
    <>
      {head}
      <em>{bookA}</em>
      {mid}
      <em>{contractA}</em>
      {tail}
    </>
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
