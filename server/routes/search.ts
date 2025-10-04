import type { RequestHandler } from "express";

const lastRequestPerIp = new Map<string, number>();

export const handleLeakSearch: RequestHandler = async (req, res) => {
  const now = Date.now();
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "unknown";
  const last = lastRequestPerIp.get(ip) ?? 0;
  if (now - last < 1000) {
    res
      .status(429)
      .json({ error: "Rate limit exceeded. Max 1 request per second per IP." });
    return;
  }
  lastRequestPerIp.set(ip, now);

  const token = process.env.LEAKOSINT_API_KEY;
  if (!token) {
    res
      .status(500)
      .json({ error: "Server not configured. Missing LEAKOSINT_API_KEY." });
    return;
  }

  // Accept JSON body, form body, or query string, with "query" or "q" keys
  const parsedBody: any = (() => {
    if (typeof req.body === "string") {
      try {
        return JSON.parse(req.body);
      } catch {
        return {};
      }
    }
    return req.body ?? {};
  })();

  const rawQuery =
    (parsedBody as any).query ??
    (parsedBody as any).q ??
    (req.query as any)?.query ??
    (req.query as any)?.q;
  const query = typeof rawQuery === "string" ? rawQuery.trim() : "";

  const rawLimit = (parsedBody as any).limit ?? (req.query as any)?.limit ?? 1000;
  const lang = (parsedBody as any).lang ?? (req.query as any)?.lang ?? "en";
  const type = (parsedBody as any).type ?? (req.query as any)?.type ?? "json";

  if (!query) {
    res.status(400).json({ error: "Invalid query" });
    return;
  }

  const safeLimit = Math.max(100, Math.min(10000, Number(rawLimit) || 1000));
  const body = {
    token,
    request: query,
    limit: safeLimit,
    lang,
    type,
  } as const;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const r = await fetch("https://leakosintapi.com/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    const contentType = r.headers.get("content-type") || "";

    if (!r.ok) {
      // Normalize upstream errors (e.g., 502/503) to JSON for the client
      const text = await r.text();
      const message = text || `Upstream error (${r.status}).`;
      res
        .status(r.status)
        .json({ error: message, status: r.status, upstream: true });
      return;
    }

    if (contentType.includes("application/json")) {
      const data = await r.json();
      res.json(data);
    } else {
      const text = await r.text();
      res.type(contentType).send(text);
    }
  } catch (e: any) {
    const isAbort = e?.name === "AbortError";
    res.status(502).json({
      error: isAbort
        ? "Search provider timed out. Please retry."
        : e?.message || "Search failed",
    });
  }
};
