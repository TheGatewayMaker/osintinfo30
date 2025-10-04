import { useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { cn } from "@/lib/utils";

type Feature = {
  title: string;
  description: string;
  eyebrow?: string;
};

const features: Feature[] = [
  {
    title: "Secure",
    eyebrow: "Defense in depth",
    description:
      "Layered encryption, role-based permissions, and continuous hardening keep every search safe from exposure.",
  },
  {
    title: "Accurate",
    eyebrow: "Trusted intelligence",
    description:
      "Curated breach intelligence, cross-source correlation, and confidence scoring deliver answers you can rely on.",
  },
  {
    title: "Fast",
    eyebrow: "Instant insights",
    description:
      "Distributed ingestion and smart caching return actionable results in seconds, even for complex investigations.",
  },
  {
    title: "Real-Time Dark Web Monitoring",
    eyebrow: "Always watching",
    description:
      "Track marketplaces, dumps, and chatter the moment new data surfaces so your team can react without delay.",
  },
  {
    title: "Proactive Alerting",
    eyebrow: "Stay ahead",
    description:
      "Custom alerts, integrations, and workflow hooks notify stakeholders before risks escalate into incidents.",
  },
];

export function FeatureGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {features.map((feature) => (
        <FeatureCard key={feature.title} feature={feature} />
      ))}
    </div>
  );
}

type FeatureCardProps = {
  feature: Feature;
};

function FeatureCard({ feature }: FeatureCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const element = cardRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const inputX = event.clientX - rect.left;
    const inputY = event.clientY - rect.top;

    const rotateX = ((inputY - rect.height / 2) / (rect.height / 2)) * -8;
    const rotateY = ((inputX - rect.width / 2) / (rect.width / 2)) * 8;

    element.style.setProperty("--rx", `${rotateX.toFixed(2)}deg`);
    element.style.setProperty("--ry", `${rotateY.toFixed(2)}deg`);
    element.style.setProperty("--tz", "18px");
  };

  const resetTransform = () => {
    const element = cardRef.current;
    if (!element) return;

    element.style.setProperty("--rx", "0deg");
    element.style.setProperty("--ry", "0deg");
    element.style.setProperty("--tz", "0px");
  };

  return (
    <div className="group relative" onPointerLeave={resetTransform}>
      <div
        ref={cardRef}
        onPointerMove={handlePointerMove}
        onPointerEnter={(event) => handlePointerMove(event)}
        className={cn(
          "relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/10 px-6 py-8 text-left",
          "shadow-[0_25px_45px_-25px_rgba(72,54,218,0.45)] backdrop-blur-2xl transition-transform duration-200 ease-out will-change-transform",
          "dark:border-white/5 dark:bg-white/5"
        )}
        style={{
          transform:
            "perspective(1200px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) translateZ(var(--tz, 0px))",
        }}
      >
        <div className="absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/25 via-brand-400/15 to-transparent" />
          <div className="absolute -left-10 top-1/3 h-36 w-36 rounded-full bg-brand-100/40 blur-3xl dark:bg-brand-500/25" />
        </div>
        <div className="relative z-10 flex h-full flex-col">
          {feature.eyebrow ? (
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-100 drop-shadow-[0_0_8px_rgba(25,18,87,0.5)]">
              {feature.eyebrow}
            </span>
          ) : null}
          <h3 className="mt-3 text-xl font-semibold">{feature.title}</h3>
          <p className="mt-4 text-sm text-foreground/70">{feature.description}</p>
          <div className="mt-6 h-px w-16 bg-gradient-to-r from-brand-400/80 to-transparent" />
        </div>
        <div className="pointer-events-none absolute inset-x-6 -bottom-10 h-24 translate-y-8 rounded-full bg-brand-500/25 blur-3xl transition-all duration-300 group-hover:translate-y-3 dark:bg-brand-400/20" />
      </div>
    </div>
  );
}

export default FeatureGrid;
