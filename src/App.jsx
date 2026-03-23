import { useMemo, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { useTheme } from './lib/theme.jsx';

const SERVICE_TIMES = {
  Haircut: 30,
  'Haircut + Beard Shaping': 50,
  'Haircut + Clipper Over Beard': 40,
  'Skin Fade': 30,
  'Fade + Beard': 40,
  'Standard Cut': 30,
  'Cut + Beard': 50,
  'Beard Trim': 15,
};

const BARBERS = [
  { initials: 'S', name: 'Sam', color: 'bg-emerald-500' },
  { initials: 'M', name: 'Mike', color: 'bg-sky-500' },
  { initials: 'J', name: 'Jay', color: 'bg-violet-500' },
];

const INITIAL_COLUMNS = {
  waiting: [
    {
      id: 'w1',
      name: 'Tom',
      service: 'Fade + Beard',
      barber: 'Sam',
      repeat: true,
      loyalty: '9/10',
      eta: 'Call in ~12m',
      status: 'Remote',
    },
    {
      id: 'w2',
      name: 'Luke',
      service: 'Haircut',
      barber: 'Any',
      repeat: false,
      loyalty: '2/10',
      eta: 'Call in ~22m',
      status: 'Remote',
    },
  ],
  comeInNow: [
    {
      id: 'c1',
      name: 'Chris',
      service: 'Beard Trim',
      barber: 'Mike',
      repeat: true,
      loyalty: '6/10',
      eta: 'Sent 4m ago',
      status: 'On the way',
    },
  ],
  inShop: [
    {
      id: 's1',
      name: 'Jay',
      service: 'Skin Fade',
      barber: 'Sam',
      repeat: true,
      loyalty: '8/10',
      eta: 'Ready now',
      status: 'Checked in',
      selectedBarber: null,
      completed: false,
    },
    {
      id: 's2',
      name: 'Ben',
      service: 'Haircut + Beard Shaping',
      barber: 'Any',
      repeat: true,
      loyalty: '3/10',
      eta: 'Ready now',
      status: 'Checked in',
      selectedBarber: null,
      completed: false,
    },
  ],
  inChair: [
    {
      id: 'i1',
      name: 'Max',
      service: 'Haircut',
      barber: 'Mike',
      repeat: false,
      loyalty: '1/10',
      eta: 'Started 9m ago',
      elapsed: 9,
      status: 'In chair',
      selectedBarber: 'Mike',
      completed: false,
    },
    {
      id: 'i2',
      name: 'Noah',
      service: 'Haircut + Clipper Over Beard',
      barber: 'Sam',
      repeat: true,
      loyalty: '5/10',
      eta: 'Started 14m ago',
      elapsed: 14,
      status: 'In chair',
      selectedBarber: 'Sam',
      completed: false,
    },
  ],
  completed: [],
};

const COLUMN_META = [
  {
    key: 'waiting',
    title: 'Waiting',
    subtitle: 'Remote queue',
    accent: 'border-zinc-300 dark:border-zinc-700',
    headerDot: 'bg-zinc-500',
  },
  {
    key: 'comeInNow',
    title: 'Come In Now',
    subtitle: 'Awaiting Y reply',
    accent: 'border-orange-500/50',
    headerDot: 'bg-orange-400',
  },
  {
    key: 'inShop',
    title: 'In Shop',
    subtitle: 'Ready to serve',
    accent: 'border-emerald-500/50',
    headerDot: 'bg-emerald-400',
  },
  {
    key: 'inChair',
    title: 'In Chair',
    subtitle: 'Active service',
    accent: 'border-sky-500/50',
    headerDot: 'bg-sky-400',
  },
];

function getRemainingMinutes(item) {
  const total = SERVICE_TIMES[item.service] || 30;
  const elapsed = item.elapsed || 0;
  return Math.max(total - elapsed, 5);
}

function getBarberLoads(currentColumns) {
  const workload = Object.fromEntries(BARBERS.map((b) => [b.name, 0]));

  currentColumns.inChair.forEach((item) => {
    if (item.completed) return;
    const assigned = item.selectedBarber || item.barber;
    if (assigned && workload[assigned] !== undefined) {
      workload[assigned] += getRemainingMinutes(item);
    }
  });

  currentColumns.inShop.forEach((item) => {
    const assigned = item.selectedBarber || (item.barber !== 'Any' ? item.barber : null);
    if (assigned && workload[assigned] !== undefined) {
      workload[assigned] += SERVICE_TIMES[item.service] || 30;
    }
  });

  return workload;
}

function getBestBarber(currentColumns) {
  const workload = getBarberLoads(currentColumns);
  return Object.entries(workload).sort((a, b) => a[1] - b[1])[0]?.[0] || 'Sam';
}

function getEtaLabelForAny(currentColumns) {
  const workload = getBarberLoads(currentColumns);
  const [bestBarber, mins] = Object.entries(workload).sort((a, b) => a[1] - b[1])[0] || [
    'Sam',
    0,
  ];
  return `Best fit: ${bestBarber} • ~${mins}m load`;
}

export default function BarberWaitQueueUI() {
  const [columns, setColumns] = useState(INITIAL_COLUMNS);
  const [movingCardId, setMovingCardId] = useState(null);

  const moveToChair = (id) => {
    const card = columns.inShop.find((item) => item.id === id);
    if (!card) return;

    setMovingCardId(id);

    setTimeout(() => {
      setColumns((prev) => {
        const autoAssignedBarber =
          card.barber && card.barber !== 'Any' ? card.barber : getBestBarber(prev);

        return {
          ...prev,
          inShop: prev.inShop.filter((item) => item.id !== id),
          inChair: [
            ...prev.inChair,
            {
              ...card,
              barber: autoAssignedBarber,
              status: 'In chair',
              eta: 'Started now',
              elapsed: 0,
              selectedBarber: autoAssignedBarber,
            },
          ],
        };
      });

      setTimeout(() => setMovingCardId(null), 420);
    }, 140);
  };

  const chooseBarber = (id, barberName) => {
    setColumns((prev) => ({
      ...prev,
      inChair: prev.inChair.map((item) =>
        item.id === id ? { ...item, selectedBarber: barberName, barber: barberName } : item
      ),
    }));
  };

  const markComplete = (id) => {
    const card = columns.inChair.find((item) => item.id === id);
    if (!card) return;

    setColumns((prev) => ({
      ...prev,
      inChair: prev.inChair.map((item) =>
        item.id === id
          ? {
              ...item,
              completed: true,
              status: 'Completed',
              eta: 'Completed',
            }
          : item
      ),
    }));

    setTimeout(() => {
      setColumns((prev) => {
        const target = prev.inChair.find((item) => item.id === id);
        if (!target) return prev;

        return {
          ...prev,
          inChair: prev.inChair.filter((item) => item.id !== id),
          completed: [target, ...prev.completed],
        };
      });
    }, 700);
  };

  const counts = useMemo(
    () => ({
      waiting: columns.waiting.length,
      comeInNow: columns.comeInNow.length,
      inShop: columns.inShop.length,
      inChair: columns.inChair.filter((c) => !c.completed).length,
      completed: columns.completed.length,
    }),
    [columns]
  );

  const barberLoads = useMemo(() => getBarberLoads(columns), [columns]);

  return (
    <motion.div layout className="min-h-screen bg-surface p-6 text-primary">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 rounded-3xl border border-edge bg-panel p-5 shadow-2xl shadow-black/20 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                Brookvale Barbers
              </div>
              <SettingsMenu />
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">QueueCut</h1>
            <p className="mt-1 text-sm text-muted">
              Smart Barber Waitlist — time-based allocation using your service durations.{' '}
              <span className="text-violet-600 dark:text-violet-300">Any barber</span> auto-selects
              the lightest live minute load.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <StatCard label="Waiting" value={String(counts.waiting)} tone="zinc" />
            <StatCard label="Come In Now" value={String(counts.comeInNow)} tone="orange" />
            <StatCard label="In Shop" value={String(counts.inShop)} tone="emerald" />
            <StatCard label="In Chair" value={String(counts.inChair)} tone="sky" />
            <StatCard label="Done" value={String(counts.completed)} tone="green" />
          </div>
        </header>

        <div className="mb-4 grid gap-3 lg:grid-cols-4">
          {BARBERS.map((b) => (
            <MiniBarberStatus
              key={b.name}
              barber={b.name}
              detail={`Projected load • ${barberLoads[b.name] || 0} mins`}
              color={b.color}
            />
          ))}
          <MiniBarberStatus
            barber="Auto-assign"
            detail="Any barber goes to lowest projected minutes"
            color="bg-violet-500"
          />
        </div>

        <div className="mb-4 rounded-2xl border border-violet-500/20 bg-violet-500/10 px-4 py-3 text-sm text-violet-800 dark:text-violet-100">
          <span className="font-semibold">Service timing model:</span> Haircut 30m • Haircut +
          Beard Shaping 50m • Haircut + Clipper Over Beard 40m. In-chair customers use remaining
          minutes. In-shop assigned customers add full queued minutes.
        </div>

        <LayoutGroup>
          <main className="grid gap-4 xl:grid-cols-4">
            {COLUMN_META.map((column) => (
              <section
                key={column.key}
                className={`rounded-3xl border ${column.accent} bg-panel p-4 shadow-xl shadow-black/20 backdrop-blur`}
              >
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${column.headerDot}`} />
                      <h2 className="text-lg font-semibold">{column.title}</h2>
                    </div>
                    <p className="mt-1 text-sm text-muted">{column.subtitle}</p>
                  </div>
                  <div className="rounded-full border border-edge bg-badge px-2.5 py-1 text-xs text-secondary">
                    {columns[column.key].length}
                  </div>
                </div>

                <motion.div
                  layout
                  className="min-h-[420px] space-y-3 rounded-2xl border border-dashed border-edge-subtle bg-inset p-2"
                >
                  <AnimatePresence mode="popLayout">
                    {columns[column.key].map((card, index) => (
                      <QueueCard
                        key={card.id}
                        {...card}
                        moving={movingCardId === card.id}
                        barbers={BARBERS}
                        highlight={column.key === 'inShop' && index === 0}
                        pulse={column.key === 'comeInNow'}
                        showStart={column.key === 'inShop'}
                        showBarberPicker={column.key === 'inChair'}
                        extraMeta={
                          column.key === 'inShop' && card.barber === 'Any'
                            ? getEtaLabelForAny(columns)
                            : undefined
                        }
                        remainingMinutes={
                          column.key === 'inChair' ? getRemainingMinutes(card) : undefined
                        }
                        onStart={() => moveToChair(card.id)}
                        onChooseBarber={(name) => chooseBarber(card.id, name)}
                        onComplete={() => markComplete(card.id)}
                      />
                    ))}
                  </AnimatePresence>

                  {columns[column.key].length === 0 && (
                    <div className="rounded-2xl border border-edge-subtle bg-surface p-4 text-sm text-faint">
                      No customers here.
                    </div>
                  )}
                </motion.div>
              </section>
            ))}
          </main>
        </LayoutGroup>

        <section className="mt-5 rounded-3xl border border-green-500/20 bg-panel p-4 shadow-xl shadow-black/20">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                <h2 className="text-lg font-semibold">Completed Stack</h2>
              </div>
              <p className="mt-1 text-sm text-muted">Recently finished cuts collapse here.</p>
            </div>
            <div className="rounded-full border border-edge bg-badge px-2.5 py-1 text-xs text-secondary">
              {columns.completed.length}
            </div>
          </div>

          <motion.div layout className="grid gap-3 md:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {columns.completed.map((card) => (
                <QueueCard
                  key={card.id}
                  {...card}
                  barbers={BARBERS}
                  completed
                  status="Completed"
                  showBarberPicker={false}
                  showStart={false}
                />
              ))}
            </AnimatePresence>

            {columns.completed.length === 0 && (
              <div className="rounded-2xl border border-edge-subtle bg-surface p-4 text-sm text-faint">
                Completed cuts will appear here.
              </div>
            )}
          </motion.div>
        </section>
      </div>
    </motion.div>
  );
}

function SettingsMenu() {
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <motion.button
        onClick={() => setOpen(!open)}
        whileTap={{ scale: 0.9, rotate: -15 }}
        whileHover={{ scale: 1.08 }}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-edge bg-inset text-muted hover:text-primary transition-colors"
        aria-label="Settings"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ type: 'spring', stiffness: 420, damping: 26 }}
              className="absolute right-0 top-full mt-2 z-50 w-52 rounded-2xl border border-edge bg-card p-3 shadow-xl shadow-black/20"
            >
              <div className="mb-2 text-xs font-medium uppercase tracking-wide text-faint">
                Appearance
              </div>
              <div className="flex gap-2">
                {[
                  {
                    id: 'light',
                    label: 'Light',
                    icon: (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="4" />
                        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                      </svg>
                    ),
                  },
                  {
                    id: 'dark',
                    label: 'Dark',
                    icon: (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                      </svg>
                    ),
                  },
                ].map((opt) => {
                  const active = theme === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => {
                        if (!active) toggleTheme();
                        setOpen(false);
                      }}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                        active
                          ? 'border-violet-500/40 bg-violet-500/10 text-violet-700 dark:text-violet-300'
                          : 'border-edge bg-inset text-muted hover:text-primary'
                      }`}
                    >
                      {opt.icon}
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ label, value, tone = 'zinc' }) {
  const tones = {
    zinc: 'border-edge bg-card text-primary',
    orange: 'border-orange-500/30 bg-orange-500/10 text-orange-800 dark:text-orange-100',
    emerald: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-100',
    sky: 'border-sky-500/30 bg-sky-500/10 text-sky-800 dark:text-sky-100',
    green: 'border-green-500/30 bg-green-500/10 text-green-800 dark:text-green-100',
  };

  return (
    <div className={`rounded-2xl border p-3 ${tones[tone]}`}>
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function MiniBarberStatus({ barber, detail, color = 'bg-zinc-500' }) {
  return (
    <div className="rounded-2xl border border-edge bg-panel p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-primary">
        <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
        {barber}
      </div>
      <div className="mt-1 text-sm text-muted">{detail}</div>
    </div>
  );
}

function QueueCard({
  name,
  service,
  barber,
  loyalty,
  eta,
  status,
  selectedBarber,
  completed,
  moving = false,
  highlight = false,
  pulse = false,
  showStart = false,
  showBarberPicker = false,
  barbers = [],
  extraMeta,
  remainingMinutes,
  onStart,
  onChooseBarber,
  onComplete,
}) {
  const loyaltyHot = loyalty.includes('9/10') || loyalty.includes('10/10');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96, y: 12 }}
      animate={{
        opacity: moving ? 0.82 : 1,
        scale: moving ? 1.03 : 1,
        y: 0,
        x: moving ? 26 : 0,
        boxShadow: moving
          ? '0 0 0 1px rgba(52,211,153,0.25), 0 24px 50px rgba(16,185,129,0.22)'
          : '0 8px 24px rgba(0,0,0,0.12)',
      }}
      exit={{ opacity: 0, scale: 0.9, x: 34, y: -8 }}
      transition={{ type: 'spring', stiffness: 340, damping: 28 }}
      className={[
        'relative rounded-2xl border bg-card p-4 transition-all duration-300',
        highlight
          ? 'border-emerald-400/50 ring-1 ring-emerald-400/20 scale-[1.01]'
          : 'border-edge hover:-translate-y-0.5',
        pulse ? 'animate-pulse' : '',
        loyaltyHot ? 'shadow-yellow-500/10 ring-1 ring-yellow-400/20' : '',
        completed ? 'bg-badge opacity-45 grayscale' : '',
      ].join(' ')}
    >
      {moving && (
        <motion.div
          initial={{ opacity: 0, scaleX: 0.5 }}
          animate={{ opacity: 1, scaleX: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-y-1/2 right-[-20px] h-1.5 w-8 origin-left rounded-full bg-gradient-to-r from-emerald-400/70 to-transparent"
        />
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-xl font-semibold tracking-tight">{name}</div>
          <div className="mt-1 flex items-center gap-2 text-sm text-secondary">
            <span className="block min-w-0 flex-1">{service}</span>
          </div>
        </div>

        <div className="shrink-0">
          {showStart && !completed ? (
            <motion.button
              onClick={onStart}
              whileTap={{ scale: 0.92 }}
              whileHover={{ scale: 1.06 }}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/15 text-xl text-emerald-600 dark:text-emerald-300 shadow-lg shadow-emerald-950/20"
              aria-label="Move to in chair"
            >
              →
            </motion.button>
          ) : (
            <span className="inline-flex rounded-full border border-edge bg-badge px-2.5 py-1 text-xs text-secondary">
              {status}
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <InfoPill label="Barber" value={selectedBarber || barber} />
        <InfoPill
          label="Loyalty"
          value={loyalty}
          valueClassName={loyaltyHot ? 'text-yellow-600 dark:text-yellow-300' : 'text-primary'}
        />
      </div>

      <div className="mt-4 rounded-xl border border-edge-subtle bg-inset px-3 py-2 text-sm text-secondary">
        ⏱ {eta}
      </div>

      {typeof remainingMinutes === 'number' && !completed && (
        <div className="mt-3 rounded-xl border border-sky-500/20 bg-sky-500/10 px-3 py-2 text-sm text-sky-800 dark:text-sky-100">
          Remaining time • ~{remainingMinutes} mins
        </div>
      )}

      {extraMeta && !completed && (
        <div className="mt-3 rounded-xl border border-violet-500/20 bg-violet-500/10 px-3 py-2 text-sm text-violet-800 dark:text-violet-100">
          {extraMeta}
        </div>
      )}

      {showBarberPicker && !completed && (
        <div className="mt-4 rounded-xl border border-edge-subtle bg-inset p-3">
          <div className="mb-2 text-xs uppercase tracking-wide text-faint">Choose barber</div>
          <div className="flex flex-wrap gap-2">
            {barbers.map((b) => {
              const active = selectedBarber === b.name;
              return (
                <motion.button
                  key={b.name}
                  onClick={() => onChooseBarber?.(b.name)}
                  whileTap={{ scale: 0.88 }}
                  animate={
                    active ? { scale: [1, 1.15, 0.98, 1], width: 118 } : { scale: 1, width: 44 }
                  }
                  transition={{ type: 'spring', stiffness: 460, damping: 18 }}
                  className={`group flex items-center overflow-hidden rounded-full border transition-all duration-300 ${
                    active
                      ? `${b.color} border-transparent pr-4 text-white shadow-lg shadow-black/20`
                      : 'border-edge bg-badge pr-0 hover:pr-4'
                  }`}
                >
                  <span
                    className={`m-1 flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white ${
                      active ? 'bg-black/15' : b.color
                    }`}
                  >
                    {b.initials}
                  </span>
                  <motion.span
                    animate={active ? { opacity: 1, width: 'auto' } : { opacity: 0, width: 0 }}
                    transition={{ type: 'spring', stiffness: 340, damping: 22 }}
                    className={`whitespace-nowrap text-sm ${active ? 'text-white' : 'text-primary'}`}
                  >
                    {b.name}
                  </motion.span>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {showBarberPicker && (
        <div className="mt-6">
          <button
            onClick={onComplete}
            disabled={completed}
            className={`w-full rounded-2xl px-4 py-3 text-base font-semibold transition-all ${
              completed
                ? 'bg-green-600 text-white shadow-lg shadow-green-700/20'
                : 'border border-edge bg-btn text-primary hover:bg-btn-hover'
            }`}
          >
            {completed ? 'Completed ✓' : 'Complete'}
          </button>
        </div>
      )}
    </motion.div>
  );
}

function InfoPill({ label, value, valueClassName = 'text-primary' }) {
  return (
    <div className="rounded-xl border border-edge-subtle bg-inset px-3 py-2">
      <div className="text-xs uppercase tracking-wide text-faint">{label}</div>
      <div className={`mt-1 font-medium ${valueClassName}`}>{value}</div>
    </div>
  );
}
