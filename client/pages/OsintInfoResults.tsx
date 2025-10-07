import { FormEvent, useEffect, useRef, useState } from "react";
import Layout from "@/components/layout/Layout";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResultsList } from "@/components/results/ResultsList";
import { performSearch } from "@/lib/search";
import {
  computeRemaining,
  consumeSearchCredit,
  isFirestorePermissionDenied,
} from "@/lib/user";
import { type NormalizedSearchResults } from "@/lib/search-normalize";
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
    console.warn("Search tracking failed", e);
  }
}

function readHandoffFromStorage(
  id: string | null,
): { query: string; normalized: NormalizedSearchResults } | null {
  if (!id) return null;
  try {
    const raw = localStorage.getItem(`osint:results:${id}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      query: string;
      normalized: NormalizedSearchResults;
    };
    return { query: parsed.query, normalized: parsed.normalized };
  } catch {
    return null;
  }
}

function formatResultsText(
  site: string,
  query: string,
  normalized: NormalizedSearchResults,
) {
  const lines: string[] = [];
  const stringify = (val: any, depth = 0): string => {
    if (val == null) return "";
    if (
      typeof val === "string" ||
      typeof val === "number" ||
      typeof val === "boolean"
    ) {
      return String(val);
    }
    if (Array.isArray(val)) {
      return val
        .map((v) => stringify(v, depth + 1))
        .filter(Boolean)
        .join(", ");
    }
    if (typeof val === "object") {
      const parts: string[] = [];
      for (const [k, v] of Object.entries(val)) {
        const s = stringify(v, depth + 1);
        if (s) parts.push(`${k}: ${s}`);
      }
      return parts.join(", ");
    }
    return String(val);
  };

  lines.push(`${site} for "${query}"`);
  lines.push("");
  if (normalized.records.length === 0) {
    lines.push("No results found.");
  } else {
    lines.push(`Results (${normalized.records.length})`);
    normalized.records.forEach((rec, idx) => {
      const title = rec.title?.trim() || `Record ${idx + 1}`;
      lines.push("");
      lines.push(`${idx + 1}. ${title}`);
      if (rec.contextLabel && rec.contextLabel !== title) {
        lines.push(`Context: ${rec.contextLabel}`);
      }
      for (const field of rec.fields) {
        const value = stringify(field.value).trim();
        if (value) lines.push(`- ${field.label}: ${value}`);
      }
    });
  }
  lines.push("");
  lines.push(
    "Need Help regarding anything? Contact us now at Telegram @Osint_Info_supportbot",
  );
  lines.push("");
  lines.push("Thankyou for using our service!");
  return lines.join("\n");
}

export default function OsintInfoResults() {
  const [params] = useSearchParams();
  const initialQ = params.get("q") ?? "";
  const rid = params.get("rid");
  const [query, setQuery] = useState(initialQ);
  const [loading, setLoading] = useState(false);
  const [normalized, setNormalized] = useState<NormalizedSearchResults | null>(
    null,
  );
  const [handoffChecked, setHandoffChecked] = useState(false);
  const { user, profile, loading: authLoading } = useAuth();

  useEffect(() => {
    setQuery(initialQ);
  }, [initialQ]);

  useEffect(() => {
    if (handoffChecked) return;

    const handoff = readHandoffFromStorage(rid);
    if (handoff) {
      setQuery(handoff.query);
      setNormalized(handoff.normalized);
      setHandoffChecked(true);
      return;
    }

    if (!initialQ.trim()) {
      setHandoffChecked(true);
      return;
    }

    if (authLoading || !user) {
      return;
    }

    setHandoffChecked(true);
    void onSearch(initialQ);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, handoffChecked, initialQ, rid, user]);

  async function onSearch(explicit?: string) {
    const trimmed = (explicit ?? query).trim();
    if (!trimmed) return;

    if (authLoading) return;
    if (!user) {
      toast.error("Please sign in to search.");
      return;
    }

    if (profile) {
      const remaining = computeRemaining(profile);
      if (!Number.isFinite(remaining) || remaining <= 0) {
        toast.error("No searches remaining. Please purchase more.");
        return;
      }
    }

    setLoading(true);
    try {
      const { normalized: freshNormalized } = await performSearch(trimmed);
      setNormalized(freshNormalized);

      void postSearchTrack(
        user.email,
        trimmed,
        freshNormalized.hasMeaningfulData,
      );

      if (freshNormalized.hasMeaningfulData) {
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

  const handleDownload = () => {
    if (!normalized) return;
    const site = "Osint Info Results";
    const content = formatResultsText(
      site,
      trimmedQuery || "Query",
      normalized,
    );
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const slug = (trimmedQuery || "query")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    a.href = url;
    a.download = `osint-info-results-${slug || "query"}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <section className="relative isolate overflow-hidden py-10 md:py-14">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,theme(colors.brand.500/12),transparent_60%)]" />

        {/* Main container */}
        <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
          {/* Header and search section */}
          <header className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              {trimmedQuery
                ? `Osint Info Results for "${trimmedQuery}"`
                : "Osint Info Results"}
            </h1>

            <p className="mt-2 text-sm text-foreground/70">
              Clean, readable cards with key details highlighted. Refine your
              search below.
            </p>

            {/* Download Button */}
            <div className="mt-5 flex items-center justify-center gap-3">
              <Button
                variant="hero"
                onClick={handleDownload}
                className="h-10 rounded-xl px-5 transition-all hover:scale-105 hover:shadow-lg"
              >
                Download Results
              </Button>
            </div>

            {/* Search Bar */}
            <form
              onSubmit={handleSubmit}
              className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <Input
                aria-label="Search query"
                placeholder="Enter an email, phone, IP, domain, or keyword"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-12 flex-1 rounded-xl border border-border/50 bg-background/70 px-4 text-sm shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
              <Button
                type="submit"
                disabled={loading}
                className="h-12 rounded-xl px-6 transition-all hover:scale-105 hover:shadow-md"
              >
                {loading ? "Searching…" : "Search"}
              </Button>
            </form>
          </header>

          {/* Results Section */}
          <div className="mt-12">
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
