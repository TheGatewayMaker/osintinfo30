import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { AnimatedGradientText } from "@/registry/magicui/animated-gradient-text";
import { FeatureGrid } from "@/components/home/FeatureGrid";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
  computeRemaining,
  consumeSearchCredit,
  isFirestorePermissionDenied,
} from "@/lib/user";
import { performSearch } from "@/lib/search";

function saveResultsToStorage(
  query: string,
  payload: unknown,
  normalized: unknown,
) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const key = `osint:results:${id}`;
  const value = {
    query,
    data: payload,
    normalized,
    createdAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage errors
  }
  return { id, key };
}

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
      const { data, normalized } = await performSearch(q);
      const { id } = saveResultsToStorage(q, data, normalized);

      if (normalized.hasMeaningfulData) {
        try {
          await consumeSearchCredit(user.uid, 1);
        } catch (creditError) {
          if (!isFirestorePermissionDenied(creditError)) {
            console.warn("Credit consumption failed", creditError);
          }
        }
      }

      const url = `/osintinforesults?q=${encodeURIComponent(q)}&rid=${encodeURIComponent(id)}`;
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e: any) {
      const message = e?.message || "Search error.";
      toast.error(message);
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
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-600/20 via-background/0 to-background/30" />
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
              <div className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-2 shadow-2xl shadow-cyan-500/20 ring-1 ring-cyan-500/25 backdrop-blur-2xl transition dark:border-white/10 dark:bg-white/5">
                <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(1200px_600px_at_50%_-200px,theme(colors.emerald.400/0.18),transparent_60%)]" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
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
