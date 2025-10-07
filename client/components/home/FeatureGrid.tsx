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
  };

  return (
    <div className="group relative" onPointerLeave={resetTransform}>
      <div
        ref={cardRef}
        onPointerMove={handlePointerMove}
        onPointerEnter={(event) => handlePointerMove(event)}
        className={cn(
          "relative h-full overflow-hidden rounded-3xl border border-white/15 bg-white/10 px-7 py-8 text-left backdrop-blur-2xl",
          "shadow-[0_18px_36px_-24px_rgba(15,23,42,0.6)] transition-[transform,box-shadow] duration-150 ease-out will-change-transform",
          "before:pointer-events-none before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-br before:from-white/35 before:via-white/10 before:to-transparent before:opacity-70",
          "hover:shadow-[0_22px_48px_-28px_rgba(15,23,42,0.7)] dark:border-white/10 dark:bg-white/5 dark:before:from-white/15",
        )}
        style={
          {
            transform:
              "perspective(1100px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) translateZ(var(--tz, 0px))",
          } as CSSProperties
        }
      >
        <div className="relative z-10 flex h-full flex-col">
          {feature.eyebrow ? (
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-secondary px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-secondary-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-secondary-foreground/80" />
              {feature.eyebrow}
            </span>
          ) : null}
          <h3 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
            {feature.title}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-foreground/90">
            {feature.description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default FeatureGrid;
