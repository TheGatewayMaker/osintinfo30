import { useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import Layout from "@/components/layout/Layout";

const RECENT_BREACHES = [
  {
    name: "NordCom Telecom",
    scope: "Telecom • EU",
    type: "Customer Database",
    size: "3.7M records",
    description:
      "Email, phone, hashed passwords, partial billing data exposed in recent dump.",
  },
  {
    name: "SkyCourier",
    scope: "Logistics • US",
    type: "User Accounts",
    size: "1.2M records",
    description:
      "Usernames, emails, delivery addresses and order metadata were leaked.",
  },
  {
    name: "PayXchange",
    scope: "Fintech • Global",
    type: "Auth Table",
    size: "680K records",
    description:
      "Credential combos and API keys surfaced from third‑party integrator breach.",
  },
  {
    name: "EduPortal",
    scope: "Education • UK",
    type: "Student Directory",
    size: "950K records",
    description:
      "Names, emails and enrollment info disclosed via misconfigured backup.",
  },
  {
    name: "CityCare",
    scope: "Healthcare • AU",
    type: "Patient Contacts",
    size: "420K records",
    description:
      "Contact details and appointment notes scraped from vendor portal.",
  },
  {
    name: "Shopora",
    scope: "Retail • CA",
    type: "Marketing DB",
    size: "2.3M records",
    description:
      "Email lists and campaign metrics leaked from email automation provider.",
  },
];

export default function Databases() {
  return (
    <Layout>
      <section className="container mx-auto py-10">
        <div className="text-center">
          <h1 className="text-3xl font-black">Databases</h1>
          <p className="mt-2 text-foreground/80">
            Recently breached sources and exposed datasets.
          </p>
          <p className="mt-2 text-sm text-foreground/70 max-w-3xl mx-auto">
            Explore a snapshot of notable, recently discussed breaches. Data
            shown here is illustrative to protect sources.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {RECENT_BREACHES.map((item) => (
            <DatabaseCard key={item.name} item={item} />
          ))}
        </div>
      </section>
    </Layout>
  );
}

type Item = (typeof RECENT_BREACHES)[number];

type CardProps = { item: Item };

function DatabaseCard({ item }: CardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const rx = ((y - r.height / 2) / (r.height / 2)) * -3;
    const ry = ((x - r.width / 2) / (r.width / 2)) * 3;
    el.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
    el.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
    el.style.setProperty("--tz", "10px");
  };

  const reset = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--tz", "0px");
  };

  return (
    <div className="group relative" onPointerLeave={reset}>
      <article
        ref={ref}
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerMove}
        className="interactive-glass relative h-full rounded-3xl border border-white/20 p-5 shadow-[0_36px_80px_-60px_rgba(6,182,212,0.68)] transition-[transform,box-shadow] duration-200 ease-out will-change-transform hover:shadow-[0_30px_72px_-58px_rgba(6,182,212,0.72)] dark:border-white/10"
        style={{
          transform:
            "perspective(1100px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg)) translateZ(var(--tz,0px))",
        }}
      >
        <header className="flex items-center justify-between">
          <h3 className="text-xl font-extrabold tracking-tight text-foreground">
            {item.name}
          </h3>
          <span className="rounded-full bg-secondary px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-secondary-foreground">
            {item.size}
          </span>
        </header>
        <p className="mt-1 text-sm text-foreground/70">{item.scope}</p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="interactive-glass rounded-2xl border border-white/15 p-3 text-sm font-semibold text-foreground dark:border-white/20">
            <span className="block text-[0.65rem] font-semibold uppercase tracking-wide text-foreground/50">
              Database Type
            </span>
            <span className="mt-1 block">{item.type}</span>
          </div>
          <div className="interactive-glass rounded-2xl border border-white/15 p-3 text-sm font-semibold text-foreground dark:border-white/20">
            <span className="block text-[0.65rem] font-semibold uppercase tracking-wide text-foreground/50">
              Size
            </span>
            <span className="mt-1 block">{item.size}</span>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-foreground/85">
          {item.description}
        </p>
      </article>
    </div>
  );
}
