import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { AnimatedGradientText } from "@/registry/magicui/animated-gradient-text";
import { FeatureGrid } from "@/components/home/FeatureGrid";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { computeRemaining } from "@/lib/user";

export default function Index() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  async function onSearch() {
    const q = query.trim();
    if (!q) return;
    if (!user) {
      toast.error("Please sign in to search.");
      setTimeout(() => navigate("/auth"), 2000);
      return;
    }
    const remaining = computeRemaining(profile);
    if (!Number.isFinite(remaining) || remaining <= 0) {
      toast.error("No searches remaining. Please purchase more.");
      return;
    }

    setLoading(true);
    navigate(
      `/osintinforesults?q=${encodeURIComponent(q)}&refresh=${Date.now()}`,
    );
  }

  return (
    <Layout>
      <section className="relative flex items-center justify-center overflow-hidden py-24 md:py-36">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_top,theme(colors.brand.500/14),transparent_55%)]" />
        <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-500/25 blur-3xl" />
        <div className="pointer-events-none absolute bottom-8 right-10 -z-10 h-64 w-64 rounded-full bg-brand-700/20 blur-[120px]" />
        <div className="pointer-events-none absolute top-16 left-10 -z-10 hidden h-56 w-56 rounded-full bg-brand-300/25 blur-3xl sm:block" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-600/20 via-background/0 to-background/30" />
        <div className="container mx-auto">
          <div className="mx-auto max-w-3xl text-center">
            <h1>
              <AnimatedGradientText
                speed={2}
                colorFrom="#a3a3a3"
                colorTo="#0a0a0a"
                className="text-4xl font-black tracking-tight md:text-6xl"
              >
                Check if your data has been leaked
              </AnimatedGradientText>
            </h1>
            <p className="mt-4 text-lg text-foreground/75">
              You can search Phone Numbers, Emails, Full Names, IP addresses,
              Domains, Keywords…
            </p>
            <p className="mt-2 text-sm text-foreground/60">
              Privacy-first search. We don’t store queries. Try emails, phones,
              usernames, IPs, or domains.
            </p>
            <div className="mt-10 grid gap-4">
              <div className="group relative overflow-hidden rounded-3xl border border-border/80 bg-card/90 p-2 shadow-[0_24px_48px_-28px_rgba(0,0,0,0.5)] ring-1 ring-brand-800/25 backdrop-blur-2xl transition dark:border-border/60 dark:bg-card/70">
                <div className="pointer-events-none absolute inset-0 -z-10 hidden md:block bg-[radial-gradient(1200px_600px_at_50%_-200px,theme(colors.brand.500/0.16),transparent_60%)]" />
                <input
                  value={query}
                  onChange={(e) =>
                    startTransition(() => setQuery(e.target.value))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onSearch();
                  }}
                  placeholder="Enter an email, phone, IP, domain, keyword…"
                  className="h-14 w-full rounded-2xl bg-transparent px-4 text-base outline-none placeholder:text-foreground/50"
                />
              </div>
              <Button
                variant="hero"
                onClick={onSearch}
                disabled={loading}
                className="h-12 rounded-2xl text-base shadow-xl hover:scale-[1.03]"
              >
                {loading ? "Searching…" : "Search"}
              </Button>
              <p className="text-xs text-foreground/60">
                1 request/second per IP. Complex queries may take longer.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto pb-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.4em] text-brand-300">
            Capabilities
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            Intelligence built for rapid response
          </h2>
          <p className="mt-3 text-base font-semibold text-foreground/80">
            Blend real-time monitoring with verified breach data to keep your
            team ahead of emerging threats.
          </p>
        </div>
        <div className="mt-12">
          <FeatureGrid />
        </div>
      </section>
    </Layout>
  );
}
