import { useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const PLANS = [
  { searches: 30, prices: { inr: "₹132", pkr: "₨432", usd: "$2" } },
  { searches: 50, prices: { inr: "₹224", pkr: "₨734", usd: "$3" } },
  { searches: 100, prices: { inr: "₹449", pkr: "₨1,454", usd: "$5" } },
  { searches: 150, prices: { inr: "₹674", pkr: "₨2,174", usd: "$8" } },
  { searches: 200, prices: { inr: "₹899", pkr: "₨2,894", usd: "$10" } },
  { searches: 300, prices: { inr: "₹1,349", pkr: "₨4,349", usd: "$16" } },
];

type Plan = (typeof PLANS)[number];

export default function Shop() {
  const navigate = useNavigate();

  return (
    <Layout>
      <section className="relative py-16 md:py-24">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,theme(colors.brand.500/12),transparent_55%)]" />
        <div className="container mx-auto">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-black tracking-tight md:text-4xl">Shop</h1>
            <p className="mx-auto mt-2 max-w-2xl text-foreground/70">
              Choose a searches package to increase your remaining searches instantly after purchase.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PLANS.map((plan) => (
              <PlanCard
                key={plan.searches}
                plan={plan}
                onEmail={() => navigate(`/purchase?searches=${plan.searches}`)}
              />
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}

type PlanCardProps = {
  plan: Plan;
  onEmail: () => void;
};

function PlanCard({ plan, onEmail }: PlanCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const element = cardRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const inputX = event.clientX - rect.left;
    const inputY = event.clientY - rect.top;

    const rotateX = ((inputY - rect.height / 2) / (rect.height / 2)) * -4;
    const rotateY = ((inputX - rect.width / 2) / (rect.width / 2)) * 4;

    element.style.setProperty("--rx", `${rotateX.toFixed(2)}deg`);
    element.style.setProperty("--ry", `${rotateY.toFixed(2)}deg`);
    element.style.setProperty("--tz", "12px");
  };

  const resetTilt = () => {
    const element = cardRef.current;
    if (!element) return;
    element.style.setProperty("--rx", "0deg");
    element.style.setProperty("--ry", "0deg");
    element.style.setProperty("--tz", "0px");
  };

  return (
    <div className="group relative" onPointerLeave={resetTilt}>
      <div
        ref={cardRef}
        onPointerMove={handlePointerMove}
        onPointerEnter={(event) => handlePointerMove(event)}
        className="relative h-full transform-gpu transition-transform duration-200 ease-out"
        style={{
          transform:
            "perspective(1100px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) translateZ(var(--tz, 0px))",
        }}
      >
        <div className="pointer-events-none absolute inset-x-4 -bottom-5 h-16 translate-y-4 rounded-full bg-amber-500/22 blur-2xl transition-all duration-300 group-hover:translate-y-1 dark:bg-amber-400/18" />
        <Card className="relative h-full rounded-2xl border border-white/10 bg-white/12 px-2 pb-6 pt-4 shadow-[0_18px_32px_-18px_rgba(72,54,218,0.45)] backdrop-blur-xl transition-colors duration-300 dark:border-white/10 dark:bg-white/8">
          <div className="absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-400/25 via-transparent to-brand-500/10" />
          </div>
          <CardHeader className="relative text-center">
            <CardTitle className="text-2xl">
              <span className="text-4xl font-extrabold text-foreground">{plan.searches}</span>{" "}
              <span className="align-super text-xs font-semibold uppercase tracking-[0.5em] text-amber-400">
                searches
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="grid gap-2 text-center text-foreground/80">
              <div className="text-lg">
                <span className="font-semibold text-foreground">{plan.prices.inr}</span>{" "}
                <span className="text-foreground/60">/ INR</span>
              </div>
              <div className="text-lg">
                <span className="font-semibold text-foreground">{plan.prices.pkr}</span>{" "}
                <span className="text-foreground/60">/ PKR</span>
              </div>
              <div className="text-lg">
                <span className="font-semibold text-foreground">{plan.prices.usd}</span>{" "}
                <span className="text-foreground/60">/ USD</span>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Button
                className="w-full"
                onClick={() =>
                  window.open(
                    "https://t.me/Osint_Info_supportbot",
                    "_blank",
                    "noopener,noreferrer",
                  )
                }
              >
                Buy via Telegram
              </Button>
              <Button variant="secondary" className="w-full" onClick={onEmail}>
                Buy via Email
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
