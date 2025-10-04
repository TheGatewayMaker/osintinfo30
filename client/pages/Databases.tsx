import Layout from "@/components/layout/Layout";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { consumeSearchCredit, computeRemaining } from "@/lib/user";
import { toast } from "sonner";

export default function Databases() {
  const [params] = useSearchParams();
  const initialQ = params.get("q") ?? "";
  const [query, setQuery] = useState(initialQ);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setQuery(initialQ);
  }, [initialQ]);

  useEffect(() => {
    if (initialQ.trim()) {
      void onSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQ]);

  const remaining = computeRemaining(profile);

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
      const r = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      });
      const contentType = r.headers.get("content-type") || "";
      if (!r.ok) {
        const text = await r.text();
        toast.error(text || `Search failed (${r.status}).`);
        return;
      }
      let data: any = null;
      if (contentType.includes("application/json")) {
        data = await r.json();
      } else {
        data = await r.text();
      }
      setResult(data);

      const hasResults = Array.isArray(data)
        ? data.length > 0
        : data && typeof data === "object"
          ? Object.keys(data).length > 0
          : typeof data === "string"
            ? data.trim().length > 0 && !/no results/i.test(data)
            : false;

      if (hasResults) {
        await consumeSearchCredit(user.uid, 1);
      }
    } catch (e: any) {
      toast.error(e?.message || "Search error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <section className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-3xl font-black">Databases</h1>
          <p className="mt-2 text-foreground/70">Search leaked data sources.</p>
        </div>

        <div className="mt-6 mx-auto max-w-3xl grid gap-3">
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
              Remaining: <span className="font-semibold">{remaining}</span>
            </div>
            <Button onClick={onSearch} disabled={loading} className="h-10">
              {loading ? "Searching…" : "Search"}
            </Button>
          </div>
        </div>

        <div className="mt-8">
          {result == null ? (
            <div className="text-center text-sm text-foreground/60">
              Results will appear here.
            </div>
          ) : typeof result === "string" ? (
            <pre className="overflow-auto rounded-xl border border-border bg-card/80 p-4 text-left whitespace-pre-wrap">
              {result}
            </pre>
          ) : (
            <pre className="overflow-auto rounded-xl border border-border bg-card/80 p-4 text-left">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </div>
      </section>
    </Layout>
  );
}
