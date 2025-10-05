import { useEffect, useRef, useState } from "react";
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

const PDF_FILE_PREFIX = "search-results";

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
  const [downloading, setDownloading] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
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
      const { data, normalized: freshNormalized } = await performSearch(trimmed);
      setNormalized(freshNormalized);

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

  async function handleDownload() {
    if (!normalized?.hasMeaningfulData || !resultsRef.current) {
      toast.error("There are no results to export yet.");
      return;
    }

    try {
      setDownloading(true);
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const element = resultsRef.current;
      const canvas = await html2canvas(element, {
        scale: window.devicePixelRatio > 1 ? 2 : 1,
        backgroundColor: null,
        useCORS: true,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png", 1.0);
      const orientation = canvas.width >= canvas.height ? "landscape" : "portrait";
      const pdf = new jsPDF({
        orientation,
        unit: "px",
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`${PDF_FILE_PREFIX}-${Date.now()}.pdf`);
    } catch (error) {
      console.error("PDF export failed", error);
      toast.error("Could not generate the PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  const canDownload = normalized?.hasMeaningfulData ?? false;

  return (
    <Layout>
      <section className="relative py-10 md:py-14">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,theme(colors.brand.500/10),transparent_50%)]" />
        <div className="container mx-auto">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
                Search Results
              </h1>
              <p className="mt-2 text-sm font-semibold text-foreground/70">
                Clean, human-readable intelligence data with your brand styling.
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
                  Remaining: {" "}
                  <span className="font-semibold text-amber-600 dark:text-amber-400">
                    {remaining}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button onClick={onSearch} disabled={loading} className="h-10">
                    {loading ? "Searching…" : "Search"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDownload}
                    disabled={downloading || !canDownload}
                    className="h-10"
                  >
                    {downloading ? "Generating PDF…" : "Download Results as PDF"}
                  </Button>
                </div>
              </div>
            </div>

            <div
              ref={resultsRef}
              className="mt-8 space-y-6 rounded-3xl border border-border/70 bg-card/70 p-6 shadow-lg shadow-brand-500/10 ring-1 ring-brand-500/10 backdrop-blur"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <SummaryPill label="Records" value={normalized?.recordCount ?? 0} />
                  <SummaryPill label="Data points" value={normalized?.fieldCount ?? 0} />
                </div>
                {canDownload && (
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
    <div className="rounded-2xl border border-border/70 bg-background/60 px-6 py-12 text-center text-sm text-foreground/65 shadow-inner shadow-black/5">
      {message}
    </div>
  );
}
