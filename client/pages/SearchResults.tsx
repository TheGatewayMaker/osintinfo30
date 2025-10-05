import Layout from "@/components/layout/Layout";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { performSearch } from "@/lib/search";
import {
  consumeSearchCredit,
  computeRemaining,
  isFirestorePermissionDenied,
} from "@/lib/user";
import { toast } from "sonner";

const HIDDEN_KEYS = new Set([
  "num of results",
  "num_of_results",
  "num-results",
  "numresults",
  "num results",
  "price",
  "search time",
  "search_time",
  "search-time",
]);

function isHiddenKey(key: string) {
  return HIDDEN_KEYS.has(key.trim().toLowerCase());
}

function sanitizeData(data: any): any {
  if (Array.isArray(data)) {
    return data.map((d) => sanitizeData(d));
  }
  if (data && typeof data === "object") {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(data)) {
      if (isHiddenKey(k)) continue;
      out[k] = sanitizeData(v);
    }
    return out;
  }
  return data;
}

function titleFromItem(item: Record<string, any>): {
  key?: string;
  value?: string;
} {
  const candidates = [
    "title",
    "name",
    "email",
    "username",
    "domain",
    "ip",
    "id",
  ];
  for (const c of candidates) {
    if (item[c]) {
      const val = String(item[c]);
      if (val.trim()) return { key: c, value: val };
    }
  }
  return {};
}

export default function SearchResults() {
  const [params] = useSearchParams();
  const initialQ = params.get("q") ?? "";
  const [query, setQuery] = useState(initialQ);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as any;

  useEffect(() => {
    setQuery(initialQ);
  }, [initialQ]);

  const remaining = computeRemaining(profile);

  useEffect(() => {
    if (!initialQ.trim()) return;
    if (
      (location as any).state &&
      (location as any).state.result !== undefined
    ) {
      setResult((location as any).state.result);
      return;
    }
    void onSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQ]);

  async function onSearch() {
    if (!query.trim()) return;
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
    setResult(null);
    try {
      const { data, hasResults } = await performSearch(query);
      setResult(sanitizeData(data));

      if (hasResults) {
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

  const cleaned = useMemo(() => sanitizeData(result), [result]);

  return (
    <Layout>
      <section className="relative py-10 md:py-14">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,theme(colors.brand.500/10),transparent_50%)]" />
        <div className="container mx-auto">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                Search Results
              </h1>
              <p className="mt-2 text-sm font-semibold text-foreground/70">
                Clean, readable results with your site’s styling.
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
              <div className="flex items-center justify-between">
                <div className="text-sm text-foreground/60">
                  Remaining:{" "}
                  <span className="font-semibold text-amber-600 dark:text-amber-400">
                    {remaining}
                  </span>
                </div>
                <Button onClick={onSearch} disabled={loading} className="h-10">
                  {loading ? "Searching…" : "Search"}
                </Button>
              </div>
            </div>

            <div className="mt-8">
              {cleaned == null ? (
                <div className="text-center text-sm text-foreground/60">
                  Results will appear here.
                </div>
              ) : (
                <ResultRenderer data={cleaned} />
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

function ResultRenderer({ data }: { data: any }) {
  if (typeof data === "string") {
    return (
      <pre className="overflow-auto rounded-2xl border border-border bg-card/80 p-4 text-left whitespace-pre-wrap shadow ring-1 ring-brand-500/10">
        {data}
      </pre>
    );
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      return <Empty />;
    }
    const isObjectArray = data.every((it) => it && typeof it === "object");
    if (!isObjectArray) {
      return (
        <pre className="overflow-auto rounded-2xl border border-border bg-card/80 p-4 text-left whitespace-pre-wrap shadow ring-1 ring-brand-500/10">
          {JSON.stringify(data, null, 2)}
        </pre>
      );
    }
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {data.map((item, idx) => (
          <ItemCard key={idx} item={item as Record<string, any>} />
        ))}
      </div>
    );
  }

  if (data && typeof data === "object") {
    return <ItemCard item={data as Record<string, any>} single />;
  }

  return (
    <pre className="overflow-auto rounded-2xl border border-border bg-card/80 p-4 text-left whitespace-pre-wrap shadow ring-1 ring-brand-500/10">
      {String(data)}
    </pre>
  );
}

function ItemCard({
  item,
  single,
}: {
  item: Record<string, any>;
  single?: boolean;
}) {
  const { key: titleKey, value: titleVal } = titleFromItem(item);
  const rest: Record<string, any> = {};
  for (const [k, v] of Object.entries(item)) {
    if (isHiddenKey(k)) continue;
    if (titleKey && k === titleKey) continue;
    rest[k] = v;
  }
  return (
    <div
      className={`rounded-2xl border border-border bg-card/80 p-5 shadow ring-1 ring-brand-500/10 ${single ? "" : ""}`}
    >
      {titleVal && (
        <h3 className="text-xl md:text-2xl font-bold tracking-tight mb-3 break-words">
          {titleVal}
        </h3>
      )}
      <KeyValueGrid obj={rest} />
    </div>
  );
}

function KeyValueGrid({ obj }: { obj: Record<string, any> }) {
  const entries = Object.entries(obj || {});
  if (!entries.length) return <Empty />;
  return (
    <div className="grid gap-y-3 gap-x-6 text-sm">
      {entries.map(([k, v]) => (
        <div key={k} className="grid grid-cols-3 gap-2 items-start">
          <div className="col-span-1 text-xs font-semibold uppercase tracking-wide text-foreground/60 break-words">
            {k}
          </div>
          <div className="col-span-2 break-words text-sm font-semibold text-foreground">
            {typeof v === "object" ? (
              <pre className="rounded border border-border bg-background/50 p-2 text-xs whitespace-pre-wrap">
                {JSON.stringify(v, null, 2)}
              </pre>
            ) : (
              String(v)
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function Empty() {
  return (
    <div className="text-center text-sm text-foreground/60">
      No results found.
    </div>
  );
}
