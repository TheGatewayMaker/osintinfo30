import { useState } from "react";
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
    try {
      const url = `/osintinforesults?q=${encodeURIComponent(q)}`;
      window.open(url, "_blank", "noopener,noreferrer");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <section className="relative flex items-center justify-center overflow-hidden py-24 md:py-36">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_top,theme(colors.brand.500/12),transparent_55%)]" />
        <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-500/25 blur-3xl" />
        <div className="pointer-events-none absolute bottom-8 right-10 -z-10 h-64 w-64 rounded-full bg-fuchsia-500/20 blur-[120px]" />
        <div className="pointer-events-none absolute top-16 left-10 -z-10 hidden h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl sm:block" />
        <div className="container mx-auto">
          <div className="mx-auto max-w-3xl text-center">
            <h1>
              <AnimatedGradientText
                speed={2}
                colorFrom="#4ade80"
                colorTo="#06b6d4"
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
              <div className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-3 shadow-2xl shadow-brand-500/25 ring-1 ring-brand-500/25 backdrop-blur-2xl transition focus-within:border-white/40 focus-within:ring-brand-400/40 dark:border-white/10 dark:bg-white/5">
                <div className="pointer-events-none absolute -top-16 right-0 h-40 w-40 rounded-full bg-white/20 opacity-0 blur-3xl transition-opacity duration-300 group-focus-within:opacity-80 group-hover:opacity-80 dark:bg-white/10" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onSearch();
                  }}
                  placeholder="Enter an email, phone, IP, domain, keyword…"
                  className="h-11 w-full rounded-xl bg-transparent px-4 text-base outline-none md:h-12"
                />
              </div>
              <Button
                onClick={onSearch}
                disabled={loading}
                className="h-12 transform-gpu rounded-xl text-base transition duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.025]"
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
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-brand-300">
            Capabilities
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Intelligence built for rapid response
          </h2>
          <p className="mt-3 text-base text-foreground/70">
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
