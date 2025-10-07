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
            <h1 className="text-3xl font-black tracking-tight md:text-4xl">
              Shop
            </h1>
            <p className="mx-auto mt-2 max-w-2xl text-foreground/70">
              Choose a searches package to increase your remaining searches
              instantly after purchase.
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

    const rotateX = ((inputY - rect.height / 2) / (rect.height / 2)) * -8;
    const rotateY = ((inputX - rect.width / 2) / (rect.width / 2)) * 8;

    element.style.setProperty("--rx", `${rotateX.toFixed(2)}deg`);
    element.style.setProperty("--ry", `${rotateY.toFixed(2)}deg`);
    element.style.setProperty("--tz", "20px");
    element.style.setProperty("--px", `${inputX}px`);
    element.style.setProperty("--py", `${inputY}px`);
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
        className="relative h-full transform-gpu transition-transform duration-100 ease-out"
        style={{
          transform:
            "perspective(1100px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) translateZ(var(--tz, 0px))",
        }}
      >
        <div className="pointer-events-none absolute inset-x-6 -bottom-4 h-12 translate-y-3 rounded-full bg-slate-900/25 blur-lg transition-all duration-200 group-hover:translate-y-0.5 dark:bg-black/40" />
        <Card className="relative h-full overflow-hidden rounded-2xl border border-white/12 bg-white/10 px-2 pb-6 pt-4 shadow-[0_18px_36px_-24px_rgba(15,23,42,0.6)] backdrop-blur-2xl transition-[box-shadow,transform] duration-150 group-hover:-translate-y-0.5 hover:shadow-[0_22px_48px_-28px_rgba(15,23,42,0.72)] dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_40px_-28px_rgba(0,0,0,0.82)] dark:hover:shadow-[0_24px_50px_-32px_rgba(0,0,0,0.88)]">
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-150 group-hover:opacity-100"
            style={{
              background:
                "radial-gradient(100px 70px at var(--px, -100px) var(--py, -100px), rgba(6, 182, 212, 0.18), rgba(6, 182, 212, 0) 60%)",
              mixBlendMode: "screen",
            }}
          />
          <CardHeader className="relative text-center">
            <CardTitle className="text-2xl">
              <span className="text-4xl font-extrabold text-foreground">
                {plan.searches}
              </span>{" "}
              <span className="align-super text-xs font-semibold uppercase tracking-[0.5em] text-amber-400">
                searches
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="grid gap-2 text-center text-foreground">
              <div className="text-lg">
                <span className="font-semibold text-foreground">
                  {plan.prices.inr}
                </span>{" "}
                <span className="text-foreground/60">/ INR</span>
              </div>
              <div className="text-lg">
                <span className="font-semibold text-foreground">
                  {plan.prices.pkr}
                </span>{" "}
                <span className="text-foreground/60">/ PKR</span>
              </div>
              <div className="text-lg">
                <span className="font-semibold text-foreground">
                  {plan.prices.usd}
                </span>{" "}
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
