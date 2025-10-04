import { useRef } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
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
  const frameRef = useRef<number | null>(null);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);

  const updateTransform = () => {
    const element = cardRef.current;
    const pointer = pointerRef.current;
    if (!element || !pointer) {
      frameRef.current = null;
      return;
    }

    const rect = element.getBoundingClientRect();
    const inputX = pointer.x - rect.left;
    const inputY = pointer.y - rect.top;

    const rotateX = ((inputY - rect.height / 2) / (rect.height / 2)) * -10;
    const rotateY = ((inputX - rect.width / 2) / (rect.width / 2)) * 10;

    element.style.setProperty("--rx", `${rotateX.toFixed(2)}deg`);
    element.style.setProperty("--ry", `${rotateY.toFixed(2)}deg`);
    element.style.setProperty("--tz", "24px");
    element.style.setProperty(
      "--glow-opacity",
      `${Math.min(0.85, 0.34 + Math.abs(rotateX + rotateY) * 0.012)}`,
    );

    frameRef.current = null;
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointerRef.current = { x: event.clientX, y: event.clientY };
    if (frameRef.current === null) {
      frameRef.current = requestAnimationFrame(updateTransform);
    }
  };

  const resetTransform = () => {
    const element = cardRef.current;
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    pointerRef.current = null;
    if (!element) return;

    element.style.setProperty("--rx", "0deg");
    element.style.setProperty("--ry", "0deg");
    element.style.setProperty("--tz", "0px");
    element.style.setProperty("--glow-opacity", "0.28");
  };

  return (
    <div className="group relative" onPointerLeave={resetTransform}>
      <div
        ref={cardRef}
        onPointerMove={handlePointerMove}
        onPointerEnter={(event) => handlePointerMove(event)}
        className={cn(
          "relative h-full overflow-hidden rounded-3xl border border-white/12 bg-gradient-to-br from-white/14 via-white/8 to-white/4 px-7 py-9 text-left",
          "shadow-sm shadow-brand-500/10 transition-[transform,box-shadow] duration-100 ease-out will-change-transform backdrop-blur-[18px]",
          "hover:shadow-md hover:shadow-brand-500/15",
          "dark:border-white/10 dark:from-white/8 dark:via-white/4 dark:to-white/10",
        )}
        style={
          {
            transform:
              "perspective(1100px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) translateZ(var(--tz, 0px))",
            "--glow-opacity": 0.34,
          } as CSSProperties
        }
      >
        <div className="absolute inset-0">
          <div className="absolute inset-px rounded-[calc(1.5rem-1px)] bg-gradient-to-br from-brand-500/16 via-transparent to-brand-200/10 opacity-[var(--glow-opacity)] transition-opacity duration-150" />
          <div className="absolute -left-14 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-brand-400/18 blur-3xl transition-transform duration-150 group-hover:translate-x-2 dark:bg-brand-500/18" />
        </div>
        <div className="relative z-10 flex h-full flex-col">
          {feature.eyebrow ? (
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-r from-brand-500/45 via-brand-400/40 to-amber-300/45 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-white drop-shadow-[0_0_14px_rgba(73,60,210,0.65)]">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              {feature.eyebrow}
            </span>
          ) : null}
          <h3 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
            {feature.title}
          </h3>
          <p className="mt-4 text-sm leading-relaxed text-foreground/90 font-medium">
            {feature.description}
          </p>
          <div className="mt-8 h-px w-20 bg-gradient-to-r from-brand-400/85 via-brand-300/40 to-transparent" />
        </div>
        <div className="pointer-events-none absolute inset-x-5 -bottom-4 h-14 rounded-full bg-brand-500/30 blur-2xl opacity-90 transition-all duration-150 group-hover:-bottom-2 group-hover:opacity-100 dark:bg-brand-400/24" />
      </div>
    </div>
  );
}

export default FeatureGrid;
