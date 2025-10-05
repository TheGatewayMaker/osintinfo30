import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { performSearch } from "@/lib/search";
import type { SearchResult } from "@/lib/search";
import {
  computeRemaining,
  consumeSearchCredit,
  isFirestorePermissionDenied,
} from "@/lib/user";
import {
  normalizeSearchResults,
  type NormalizedSearchResults,
} from "@/lib/search-normalize";
import { ResultsList } from "@/components/results/ResultsList";

type LocationState = {
  result?: SearchResult;
  normalized?: NormalizedSearchResults;
};

export default function SearchResults() {
  const [params] = useSearchParams();
  const initialQ = params.get("q") ?? "";
  const [query, setQuery] = useState(initialQ);
  const [loading, setLoading] = useState(false);
  const [normalized, setNormalized] = useState<NormalizedSearchResults | null>(
    null,
  );
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as { state?: LocationState };

  useEffect(() => {
    setQuery(initialQ);
  }, [initialQ]);

  const remaining = computeRemaining(profile);

  useEffect(() => {
    if (!initialQ.trim()) return;
    const stateResult = location.state?.result;
    const stateNormalized = location.state?.normalized;

    if (stateResult !== undefined) {
      if (stateNormalized && typeof stateNormalized === "object") {
        setNormalized(stateNormalized);
      } else {
        setNormalized(normalizeSearchResults(stateResult));
      }
      return;
    }

    void onSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQ]);

  async function onSearch() {
    const trimmed = query.trim();
    if (!trimmed) return;
    if (!user) {
      toast.error("Please sign in to search.");
      setTimeout(() => navigate("/auth"), 2000);
      return;
    }
    if (!Number.isFinite(remaining) || remaining <= 0) {
      toast.error("No searches remaining. Please purchase more.");
      return;
    }

    setLoading(true);
    try {
      const { data, normalized: freshNormalized } =
        await performSearch(trimmed);
      setNormalized(freshNormalized);

      try {
        await consumeSearchCredit(user.uid, 1);
      } catch (creditError) {
        if (isFirestorePermissionDenied(creditError)) {
          console.warn(
            "Skipping credit consumption due to permission error.",
            creditError,
          );
        } else {
          throw creditError;
        }
      }

      navigate(`/search?q=${encodeURIComponent(trimmed)}`, {
        replace: true,
        state: { result: data, normalized: freshNormalized },
      });
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Search error.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  const hasResults = normalized?.hasMeaningfulData ?? false;

  return (
    <Layout>
      <section className="relative py-10 md:py-14">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,theme(colors.brand.500/10),transparent_50%)]" />
        <div className="container mx-auto">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
                {query.trim() ? `Results for "${query.trim()}"` : "Search Results"}
              </h1>
              <p className="mt-2 text-sm font-semibold text-foreground/70">
                Clean, readable OSINT results. Refine your query and re-run as needed.
              </p>
            </div>

            <div className="mt-6 grid gap-3">
              <div className="rounded-2xl border border-border bg-card/80 p-3 shadow-lg shadow-brand-500/10 ring-1 ring-brand-500/10 backdrop-blur">
                <Input
                  placeholder="Enter an email, phone, IP, domain, keyword…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onSearch();
                  }}
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-foreground/60">
                  Remaining:{" "}
                  <span className="font-semibold text-amber-600 dark:text-amber-400">
                    {remaining}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    onClick={onSearch}
                    disabled={loading}
                    className="h-10"
                  >
                    {loading ? "Searching…" : "Search"}
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-6 rounded-3xl border border-border/70 bg-card/70 p-6 shadow-lg shadow-brand-500/10 ring-1 ring-brand-500/10 backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <SummaryPill
                    label="Total results"
                    value={normalized?.recordCount ?? 0}
                  />
                  <SummaryPill
                    label="Fields"
                    value={normalized?.fieldCount ?? 0}
                  />
                </div>
                {hasResults && (
                  <div className="text-xs font-medium uppercase tracking-wide text-foreground/60">
                    Results captured from OSINT provider
                  </div>
                )}
              </div>

              {normalized ? (
                normalized.records.length ? (
                  <ResultsList records={normalized.records} />
                ) : (
                  <ResultsNotice message="No results found for this query." />
                )
              ) : (
                <ResultsNotice message="Results will appear here after you run a search." />
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

function SummaryPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border/70 bg-background/70 px-4 py-3 shadow-sm shadow-brand-500/5">
      <div className="text-[0.65rem] font-semibold uppercase tracking-wide text-foreground/60">
        {label}
      </div>
      <div className="mt-1 text-lg font-semibold text-foreground">{value}</div>
    </div>
  );
}

function ResultsNotice({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/60 px-6 py-12 text-center text-sm text-foreground/60 shadow-inner shadow-black/5">
      {message}
    </div>
  );
}
