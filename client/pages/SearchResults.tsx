import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResultsList } from "@/components/results/ResultsList";
import { collectDistinctFieldValues } from "@/components/results/result-utils";
import { useAuth } from "@/context/AuthContext";
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
import { CheckCircle2, Circle, ClipboardList, Layers, ShieldCheck, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";

const SOURCE_KEYS = ["source", "breach", "leak name", "leak"];

type ReviewStepItem = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const REVIEW_STEPS: ReviewStepItem[] = [
  {
    title: "Validate exposed identities",
    description:
      "Confirm that each record matches the identifiers you are investigating and note any aliases or related accounts.",
    icon: ShieldCheck,
  },
  {
    title: "Compare field coverage",
    description:
      "Track which data points surface most often to help prioritize remediation and downstream monitoring.",
    icon: Layers,
  },
  {
    title: "Document next actions",
    description:
      "Capture the steps your team will take to mitigate risk, notify impacted parties, or escalate the finding.",
    icon: ClipboardList,
  },
];

interface LocationState {
  result?: SearchResult;
  normalized?: NormalizedSearchResults;
}

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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void onSearch();
  }

  const hasResults = normalized?.hasMeaningfulData ?? false;
  const trimmedQuery = query.trim();
  const records = normalized?.records ?? [];
  const recordCount = normalized?.recordCount ?? 0;
  const fieldCount = normalized?.fieldCount ?? 0;

  const sources = useMemo(
    () => (hasResults ? collectDistinctFieldValues(records, SOURCE_KEYS) : []),
    [hasResults, records],
  );

  const formattedRemaining = Number.isFinite(remaining)
    ? Number(remaining).toLocaleString()
    : "—";
  const formattedRecords = recordCount.toLocaleString();
  const formattedFields = fieldCount.toLocaleString();
  const sourceCount = sources.length;
  const formattedSourceCount = sourceCount
    ? sourceCount.toLocaleString()
    : "—";

  const metricItems = [
    {
      label: "Records matched",
      value: hasResults ? formattedRecords : "—",
      sublabel: hasResults ? "Normalized entries" : "Run a search to populate",
    },
    {
      label: "Fields detected",
      value: hasResults ? formattedFields : "—",
      sublabel: hasResults ? "Unique mapped fields" : "Pending results",
    },
    {
      label: "Sources mapped",
      value: sourceCount > 0 ? formattedSourceCount : "—",
      sublabel: sourceCount > 0 ? "Distinct leak origins" : "Awaiting data",
    },
    {
      label: "Remaining balance",
      value: formattedRemaining,
      sublabel: "Search credits available",
    },
  ];

  const statusItems = [
    {
      label: "Query provided",
      description: trimmedQuery
        ? `Searching for \"${trimmedQuery}\"`
        : "Enter an email, domain, or identifier to begin",
      active: Boolean(trimmedQuery),
    },
    {
      label: "Structured data normalized",
      description: hasResults
        ? "Records are ready to explore in the grid."
        : "Results will populate here after your next search.",
      active: hasResults,
    },
    {
      label: "Source enrichment",
      description: sourceCount > 0
        ? `Identified ${formattedSourceCount} source${sourceCount === 1 ? "" : "s"}.`
        : "Run another search to surface data origins.",
      active: sourceCount > 0,
    },
  ];

  return (
    <Layout>
      <section className="relative isolate overflow-hidden pb-16 pt-10 md:pb-20 md:pt-14">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,theme(colors.brand.500/12),transparent_60%)]" />
        <div className="container mx-auto">
          <div className="mx-auto max-w-6xl space-y-10">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)]">
              <div className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-gradient-to-br from-brand-500/10 via-background/95 to-background p-8 shadow-xl shadow-brand-500/10">
                <div className="absolute -right-24 top-1/2 hidden h-56 w-56 -translate-y-1/2 rounded-full bg-brand-500/10 blur-3xl lg:block" />
                <div className="relative space-y-6">
                  <header className="space-y-3">
                    <p className="inline-flex items-center gap-2 rounded-full border border-brand-600/40 bg-brand-500/15 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-foreground">
                      Search Exposure
                    </p>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
                      {trimmedQuery
                        ? `Results for "${trimmedQuery}"`
                        : "Check if your data has leaked"}
                    </h1>
                    <p className="text-sm leading-relaxed text-foreground/70 md:text-base">
                      Search across verified breach intelligence and OSINT
                      sources. Refine your query at any time and review the
                      structured results below.
                    </p>
                  </header>

                  <form
                    onSubmit={handleSubmit}
                    className="space-y-3 rounded-2xl border border-border/70 bg-background p-4 shadow-inner shadow-black/5"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <Input
                        aria-label="Search query"
                        placeholder="Enter an email, phone, IP, domain, or keyword"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        className="h-12 flex-1 rounded-xl border-foreground/10 bg-background text-base shadow-sm focus-visible:ring-brand-500"
                      />
                      <Button
                        type="submit"
                        className="h-12 shrink-0 rounded-xl px-6 text-sm font-semibold"
                        disabled={loading}
                      >
                        {loading ? "Searching…" : "Search again"}
                      </Button>
                    </div>
                    <p className="text-xs text-foreground/60">
                      Remaining searches:{" "}
                      <span className="font-semibold text-brand-600 dark:text-brand-300">
                        {formattedRemaining}
                      </span>
                    </p>
                  </form>
                </div>
              </div>

              <aside className="rounded-[2rem] border border-border/70 bg-background p-6 shadow-md lg:sticky lg:top-28">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-base font-semibold text-foreground">
                    Query summary
                  </h2>
                  <span className="rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-300">
                    {hasResults ? "Updated" : "Awaiting"}
                  </span>
                </div>
                <dl className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 xl:gap-5">
                  <SummaryItem label="Query">
                    {trimmedQuery ? (
                      <span className="break-words text-sm font-semibold text-foreground">
                        {trimmedQuery}
                      </span>
                    ) : (
                      <EmptyValue />
                    )}
                  </SummaryItem>
                  <SummaryItem label="Total results">
                    <span className="text-2xl font-bold text-foreground">
                      {formattedRecords}
                    </span>
                  </SummaryItem>
                  <SummaryItem label="Fields captured">
                    <span className="text-xl font-semibold text-foreground">
                      {formattedFields}
                    </span>
                  </SummaryItem>
                  <SummaryItem label="Data sources">
                    <SummarySources sources={sources} />
                  </SummaryItem>
                  <SummaryItem label="Remaining balance">
                    <span className="text-lg font-semibold text-foreground">
                      {formattedRemaining}
                    </span>
                  </SummaryItem>
                </dl>
              </aside>
            </div>

            <section className="relative overflow-hidden rounded-[2.5rem] border border-border/70 bg-gradient-to-br from-brand-500/12 via-background to-background px-6 py-8 shadow-2xl shadow-brand-900/15 md:px-8 md:py-10">
              <div className="pointer-events-none absolute -inset-20 -z-10 bg-[radial-gradient(circle_farthest-corner_at_0%_0%,theme(colors.brand.500/0.18),transparent_65%)]" />
              <div className="pointer-events-none absolute inset-y-0 right-0 -z-10 hidden w-2/5 bg-[radial-gradient(circle_at_center,theme(colors.brand.300/0.22),transparent_70%)] blur-3xl lg:block" />
              <div className="relative space-y-10">
                <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="max-w-2xl space-y-3">
                    <span className="inline-flex items-center gap-2 rounded-full border border-brand-600/30 bg-brand-500/15 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-brand-600 dark:text-brand-200">
                      Structured intelligence
                    </span>
                    <h2 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
                      Structured results
                    </h2>
                    <p className="text-sm leading-relaxed text-foreground/70 md:text-base">
                      Visualize every breach record in an immersive layout, monitor enrichment at a glance, and guide your response playbook without leaving the page.
                    </p>
                  </div>
                  <dl className="grid w-full gap-3 sm:grid-cols-2 lg:w-auto lg:min-w-[28rem] lg:grid-cols-2 xl:grid-cols-4">
                    {metricItems.map((metric) => (
                      <MetricCard
                        key={metric.label}
                        label={metric.label}
                        value={metric.value}
                        sublabel={metric.sublabel}
                      />
                    ))}
                  </dl>
                </header>

                <div className="grid gap-8 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
                  <div className="space-y-6">
                    <div className="overflow-hidden rounded-[32px] border border-border/60 bg-background/90 shadow-xl shadow-brand-900/20 backdrop-blur">
                      <div className="flex flex-col gap-2 border-b border-border/60 bg-background/70 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            Record explorer
                          </h3>
                          <p className="text-sm text-foreground/60">
                            Dive into each normalized result to understand what was captured, when, and from which leak source.
                          </p>
                        </div>
                        {hasResults && (
                          <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-200">
                            Showing {formattedRecords} records
                          </span>
                        )}
                      </div>
                      <div className="p-6">
                        {normalized ? (
                          normalized.records.length ? (
                            <ResultsList
                              records={normalized.records}
                              totalCount={normalized.recordCount}
                            />
                          ) : (
                            <ResultsNotice message="No results found for this query." />
                          )
                        ) : (
                          <ResultsNotice message="Results will appear here after you run a search." />
                        )}
                      </div>
                    </div>

                    <div className="rounded-[30px] border border-border/60 bg-background/80 p-6 shadow-inner shadow-brand-500/15 backdrop-blur-sm">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="text-base font-semibold text-foreground">
                            Mapped sources
                          </h3>
                          <p className="mt-1 text-sm text-foreground/60">
                            Track which breach repositories or OSINT feeds produced each record to understand provenance.
                          </p>
                        </div>
                        <span className="rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-200">
                          {sourceCount > 0
                            ? `${formattedSourceCount} source${sourceCount === 1 ? "" : "s"}`
                            : "Awaiting"}
                        </span>
                      </div>
                      <div className="mt-4">
                        <SummarySources sources={sources} />
                      </div>
                    </div>
                  </div>

                  <aside className="space-y-6">
                    <div className="rounded-[30px] border border-border/60 bg-background/80 p-6 shadow-inner shadow-brand-500/15 backdrop-blur-sm">
                      <h3 className="text-base font-semibold text-foreground">
                        Review workflow
                      </h3>
                      <p className="mt-2 text-sm text-foreground/60">
                        Use this checklist to validate structured records and coordinate remediation.
                      </p>
                      <div className="mt-6 space-y-4">
                        {REVIEW_STEPS.map((step, index) => (
                          <ReviewStep
                            key={step.title}
                            icon={step.icon}
                            title={step.title}
                            description={step.description}
                            index={index + 1}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[30px] border border-border/60 bg-background/80 p-6 shadow-inner shadow-brand-500/15 backdrop-blur-sm">
                      <h3 className="text-base font-semibold text-foreground">
                        Status tracker
                      </h3>
                      <ul className="mt-4 space-y-3">
                        {statusItems.map((item) => (
                          <StatusItem
                            key={item.label}
                            label={item.label}
                            description={item.description}
                            active={item.active}
                          />
                        ))}
                      </ul>
                    </div>
                  </aside>
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>
    </Layout>
  );
}

function SummaryItem({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-inner shadow-black/5">
      <dt className="text-[0.65rem] font-semibold uppercase tracking-wide text-foreground/60">
        {label}
      </dt>
      <dd className="mt-2 min-h-[1.5rem] text-sm font-medium text-foreground">
        {children}
      </dd>
    </div>
  );
}

function SummarySources({ sources }: { sources: string[] }) {
  if (!sources.length) {
    return <EmptyValue />;
  }

  const display = sources.slice(0, 4);
  const overflow = sources.length - display.length;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center rounded-full border border-brand-600/40 bg-brand-500/15 px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wide text-foreground">
        Osint Info DBs
      </span>
      {display.map((source) => (
        <span
          key={source}
          className="inline-flex items-center rounded-full border border-border/60 bg-background px-2.5 py-1 text-xs font-semibold text-foreground/80"
        >
          {source}
        </span>
      ))}
      {overflow > 0 && (
        <span className="inline-flex items-center rounded-full border border-border/60 bg-background px-2.5 py-1 text-xs font-semibold text-foreground/60">
          +{overflow} more
        </span>
      )}
    </div>
  );
}

function EmptyValue() {
  return <span className="text-foreground/50">—</span>;
}

function ResultsNotice({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border/70 bg-background/75 px-6 py-12 text-center text-sm font-medium text-foreground/60">
      {message}
    </div>
  );
}
