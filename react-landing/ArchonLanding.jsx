import React from "react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay },
  }),
};

const pains = [
  {
    title: "Manual work everywhere",
    body: "Orders, approvals, reports, follow-ups and customer ops still depend on someone remembering the next step.",
  },
  {
    title: "Fragmented tools",
    body: "Your stack knows pieces of the truth, but no system owns the whole operation end-to-end.",
  },
  {
    title: "Human dependency",
    body: "When one operator disappears, the business slows down. That is not a team problem. It is an architecture problem.",
  },
  {
    title: "Slow decisions",
    body: "Data arrives late, context is scattered, and leadership reacts after the damage is already visible.",
  },
];

const benefits = [
  "Automates repetitive operations without adding headcount",
  "Centralizes operational data into one decision layer",
  "Cuts hidden cost from rework, delay and management drag",
  "Scales delivery without building a bigger admin team",
];

const systemNodes = [
  "Sales channels",
  "Payments",
  "Operations",
  "AI agents",
  "Reporting",
  "Founder dashboard",
];

const testimonials = [
  {
    quote:
      "Archon turned our messy operator stack into a system that actually thinks before people have to.",
    name: "Founder, ecommerce brand",
  },
  {
    quote:
      "We stopped hiring for admin drag and started scaling through infrastructure.",
    name: "CEO, service business",
  },
  {
    quote:
      "The team did not get busier. The company got sharper.",
    name: "COO, multi-store operator",
  },
];

function SectionLabel({ children }) {
  return (
    <div className="mb-5 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300/80">
      {children}
    </div>
  );
}

function Card({ children, className = "" }) {
  return (
    <div
      className={
        "rounded-[28px] border border-white/10 bg-white/[0.03] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur " +
        className
      }
    >
      {children}
    </div>
  );
}

function ArrowUpRight() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M7 17 17 7" />
      <path d="M9 7h8v8" />
    </svg>
  );
}

export default function ArchonLanding() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(8,145,178,0.18),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.14),transparent_24%),linear-gradient(180deg,#050505_0%,#0b0b0b_48%,#050505_100%)]" />

      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0">
          <img
            src="/assets/hero-brain.png"
            alt="Archon Digital Brain hero"
            className="h-full w-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,0.45),rgba(5,5,5,0.86)_62%,#050505)]" />
        </div>

        <div className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 py-28 sm:px-8 lg:px-10">
          <motion.div initial="hidden" animate="show" variants={fadeUp}>
            <SectionLabel>Archon Consultancies</SectionLabel>
          </motion.div>

          <div className="grid items-end gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <motion.h1
                initial="hidden"
                animate="show"
                custom={0.08}
                variants={fadeUp}
                className="max-w-4xl text-5xl font-semibold leading-[0.92] tracking-[-0.05em] sm:text-6xl lg:text-8xl"
              >
                Your business is not broken.
                <span className="mt-2 block text-emerald-300">Your system is.</span>
              </motion.h1>

              <motion.p
                initial="hidden"
                animate="show"
                custom={0.18}
                variants={fadeUp}
                className="mt-8 max-w-2xl text-base leading-8 text-white/72 sm:text-lg"
              >
                Archon builds Digital Brain infrastructure for SMEs that are done
                running on memory, heroics and operator dependency. We turn your
                workflows, data and decisions into a system that runs 24/7.
              </motion.p>

              <motion.div
                initial="hidden"
                animate="show"
                custom={0.28}
                variants={fadeUp}
                className="mt-10 flex flex-col gap-4 sm:flex-row"
              >
                <a
                  href="#cta"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-semibold uppercase tracking-[0.24em] text-black transition hover:scale-[1.02]"
                >
                  Book a 15-min demo
                  <ArrowUpRight />
                </a>
                <a
                  href="#solution"
                  className="inline-flex items-center justify-center rounded-full border border-white/20 px-7 py-4 text-sm font-semibold uppercase tracking-[0.24em] text-white/82 transition hover:border-white/40 hover:bg-white/[0.04]"
                >
                  See the Digital Brain
                </a>
              </motion.div>
            </div>

            <motion.div
              initial="hidden"
              animate="show"
              custom={0.34}
              variants={fadeUp}
            >
              <Card className="rounded-[32px] border-emerald-300/15 bg-black/35 p-7">
                <div className="mb-8 flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/45">
                  <span>Digital Brain 24/7</span>
                  <span className="rounded-full border border-emerald-300/20 px-3 py-1 text-emerald-300">
                    Live architecture
                  </span>
                </div>
                <div className="space-y-4">
                  {[
                    ["Ops requests", "Routed automatically"],
                    ["Approvals", "Triggered by rules"],
                    ["Data flow", "Centralized in one layer"],
                    ["Founder visibility", "Always on"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between border-b border-white/8 pb-4 last:border-b-0">
                      <span className="text-sm uppercase tracking-[0.24em] text-white/44">{label}</span>
                      <span className="text-sm font-medium text-white">{value}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 sm:px-8 lg:px-10">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}>
          <SectionLabel>The problem</SectionLabel>
          <h2 className="max-w-4xl text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">
            Growth gets punished when the business still runs on manual glue.
          </h2>
        </motion.div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {pains.map((item, index) => (
            <motion.div
              key={item.title}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              custom={index * 0.06}
              variants={fadeUp}
            >
              <Card className="h-full">
                <div className="mb-6 text-xs uppercase tracking-[0.3em] text-emerald-300/85">
                  0{index + 1}
                </div>
                <h3 className="text-2xl font-semibold tracking-[-0.03em]">{item.title}</h3>
                <p className="mt-4 text-sm leading-7 text-white/68">{item.body}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:px-8 lg:px-10">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}>
            <SectionLabel>Reframe</SectionLabel>
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <h2 className="text-4xl font-semibold leading-tight tracking-[-0.045em] sm:text-6xl">
                You do not need more people.
                <span className="block text-emerald-300">You need a system.</span>
              </h2>
              <p className="max-w-xl text-base leading-8 text-white/70">
                Hiring on top of operational chaos does not create leverage. It
                creates payroll wrapped around inefficiency. The win is not adding
                more hands. The win is installing an operating brain that routes,
                decides and executes faster than a tired team ever could.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="solution" className="mx-auto max-w-7xl px-6 py-24 sm:px-8 lg:px-10">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}>
          <SectionLabel>The solution</SectionLabel>
          <h2 className="max-w-4xl text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">
            Archon installs a Digital Brain that connects your operation, data and decisions in one always-on layer.
          </h2>
        </motion.div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} custom={0.08} variants={fadeUp}>
            <Card className="h-full overflow-hidden p-0">
              <img
                src="/assets/system-diagram.png"
                alt="Digital Brain system diagram"
                className="h-full min-h-[440px] w-full object-cover"
              />
            </Card>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} custom={0.16} variants={fadeUp}>
            <Card className="h-full">
              <div className="grid gap-4 sm:grid-cols-2">
                {systemNodes.map((node) => (
                  <div
                    key={node}
                    className="rounded-2xl border border-white/10 bg-black/40 p-4 text-sm font-medium text-white/88"
                  >
                    {node}
                  </div>
                ))}
              </div>
              <div className="mt-8 rounded-3xl border border-emerald-300/15 bg-emerald-300/[0.06] p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">Archon layer</p>
                <p className="mt-4 text-lg leading-8 text-white/82">
                  AI workflows, automation rails, logic triggers and operator dashboards
                  built to remove delay, ambiguity and dependence on tribal knowledge.
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:px-8 lg:px-10">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}>
            <SectionLabel>Benefits</SectionLabel>
            <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
              <h2 className="text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">
                The result is not just efficiency.
                <span className="block text-emerald-300">It is control at scale.</span>
              </h2>
              <div className="grid gap-4">
                {benefits.map((item) => (
                  <Card key={item} className="flex items-start gap-4">
                    <div className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-300" />
                    <p className="text-base leading-8 text-white/78">{item}</p>
                  </Card>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 sm:px-8 lg:px-10">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}>
          <SectionLabel>Before / After</SectionLabel>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-red-400/10 bg-red-400/[0.03]">
              <p className="text-xs uppercase tracking-[0.28em] text-red-200/75">Before</p>
              <h3 className="mt-4 text-3xl font-semibold tracking-[-0.03em]">Chaos disguised as operations</h3>
              <ul className="mt-6 space-y-4 text-sm leading-7 text-white/68">
                <li>Manual follow-up loops</li>
                <li>Data split across tools and inboxes</li>
                <li>Decisions delayed by missing context</li>
                <li>Founders trapped inside the machine</li>
              </ul>
            </Card>

            <Card className="border-emerald-300/15 bg-emerald-300/[0.05]">
              <p className="text-xs uppercase tracking-[0.28em] text-emerald-300">After</p>
              <h3 className="mt-4 text-3xl font-semibold tracking-[-0.03em]">A business that runs like a system</h3>
              <ul className="mt-6 space-y-4 text-sm leading-7 text-white/78">
                <li>Automated execution across critical workflows</li>
                <li>One source of operational truth</li>
                <li>Faster decisions with real-time visibility</li>
                <li>Growth without proportional headcount pain</li>
              </ul>
            </Card>
          </div>
        </motion.div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:px-8 lg:px-10">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}>
            <SectionLabel>Social proof</SectionLabel>
            <div className="grid gap-5 lg:grid-cols-3">
              {testimonials.map((item, index) => (
                <Card key={item.name} className="h-full">
                  <div className="text-4xl leading-none text-emerald-300/80">"</div>
                  <p className="mt-4 text-base leading-8 text-white/76">{item.quote}</p>
                  <p className="mt-8 text-xs uppercase tracking-[0.24em] text-white/46">
                    {item.name}
                  </p>
                </Card>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section id="cta" className="mx-auto max-w-7xl px-6 py-24 sm:px-8 lg:px-10">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}>
          <Card className="overflow-hidden rounded-[36px] border-emerald-300/20 bg-[linear-gradient(135deg,rgba(16,185,129,0.16),rgba(255,255,255,0.02))] p-8 sm:p-12">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <div>
                <SectionLabel>Final CTA</SectionLabel>
                <h2 className="max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.045em] sm:text-6xl">
                  If the business still needs constant human rescue, the system is still unfinished.
                </h2>
                <p className="mt-6 max-w-2xl text-base leading-8 text-white/74">
                  Book a 15-minute demo and we will show you where your current
                  operation is leaking speed, control and margin.
                </p>
              </div>

              <div className="flex flex-col gap-4 lg:items-end">
                <a
                  href="mailto:hello@archonconsultancies.com?subject=Book%20a%2015-min%20demo"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-semibold uppercase tracking-[0.24em] text-black transition hover:scale-[1.02]"
                >
                  Book a 15-min demo
                  <ArrowUpRight />
                </a>
                <p className="text-xs uppercase tracking-[0.24em] text-white/46">
                  For founders and operators doing 500k to 10M EUR a year
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </section>
    </main>
  );
}
