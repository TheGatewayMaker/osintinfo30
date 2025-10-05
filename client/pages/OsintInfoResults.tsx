import { FormEvent, useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResultsList } from "@/components/results/ResultsList";
import { performSearch, type SearchResult } from "@/lib/search";
import {
  computeRemaining,
  consumeSearchCredit,
  isFirestorePermissionDenied,
} from "@/lib/user";
import {
  normalizeSearchResults,
  type NormalizedSearchResults,
} from "@/lib/search-normalize";
import { toast } from "sonner";

async function postSearchTrack(
  email: string | null | undefined,
  query: string,
  found: boolean,
) {
  try {
    const payload = {
      email: email || "unknown",
      query,
      found,
      timestamp: new Date().toISOString(),
    };
    await fetch("/api/track-search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    // Swallow errors so UX is not affected
    console.warn("Search tracking failed", e);
  }
}

export default function OsintInfoResults() {
  const [params] = useSearchParams();
  const initialQ = params.get("q") ?? "";
  const [query, setQuery] = useState(initialQ);
  const [loading, setLoading] = useState(false);
  const [normalized, setNormalized] = useState<NormalizedSearchResults | null>(
    null,
  );
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setQuery(initialQ);
  }, [initialQ]);

  useEffect(() => {
    if (!initialQ.trim()) return;
    // Run search on mount for provided query
    void onSearch(initialQ);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQ]);

  async function onSearch(explicit?: string) {
    const trimmed = (explicit ?? query).trim();
    if (!trimmed) return;

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
      const { data, normalized: freshNormalized } =
        await performSearch(trimmed);
      setNormalized(freshNormalized);

      // Track to Discord webhook (backend endpoint)
      void postSearchTrack(
        user.email,
        trimmed,
        freshNormalized.hasMeaningfulData,
      );

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

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void onSearch();
  }

  const trimmedQuery = query.trim();
  const hasResults = normalized?.hasMeaningfulData ?? false;

  return (
    <Layout>
      <section className="relative isolate overflow-hidden py-10 md:py-14">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,theme(colors.brand.500/12),transparent_60%)]" />
        <div className="container mx-auto max-w-6xl">
          <header className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              {trimmedQuery
                ? `Results for "${trimmedQuery}"`
                : "Search results"}
            </h1>
            <p className="mt-2 text-sm text-foreground/70">
              Clean, readable cards with key details highlighted. Refine your
              search below.
            </p>
            <form
              onSubmit={handleSubmit}
              className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <Input
                aria-label="Search query"
                placeholder="Enter an email, phone, IP, domain, or keyword"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-12 flex-1 rounded-xl"
              />
              <Button
                type="submit"
                disabled={loading}
                className="h-12 rounded-xl px-6"
              >
                {loading ? "Searching…" : "Search"}
              </Button>
            </form>
          </header>

          <div className="mt-10">
            {normalized ? (
              normalized.records.length ? (
                <ResultsList
                  records={normalized.records}
                  totalCount={normalized.recordCount}
                />
              ) : (
                <div className="mx-auto max-w-md rounded-2xl border border-dashed border-brand-500/40 bg-brand-500/10 p-8 text-center">
                  <p className="text-base font-semibold">No results found.</p>
                  <p className="mt-1 text-sm text-foreground/60">
                    Try a different query or broaden your terms.
                  </p>
                </div>
              )
            ) : (
              <div className="mx-auto max-w-md rounded-2xl border border-dashed border-border/60 bg-background/70 p-8 text-center">
                <p className="text-base font-semibold">
                  Results will appear here after you run a search.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
