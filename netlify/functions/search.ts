import fetch from "node-fetch";

export const handler = async (event: any) => {
  try {
    const headersIn = event?.headers || {};
    const headers: Record<string, string> = {};
    for (const [k, v] of Object.entries(headersIn)) {
      headers[String(k).toLowerCase()] = String(v ?? "");
    }

    const method = (event?.httpMethod || event?.method || "GET").toUpperCase();

    // Parse body (handle base64 encoding if present)
    let rawBody = event?.body;
    if (event?.isBase64Encoded && typeof rawBody === "string") {
      rawBody = Buffer.from(rawBody, "base64").toString("utf8");
    }

    let parsedBody: Record<string, unknown> = {};
    if (rawBody == null || rawBody === "") {
      parsedBody = {};
    } else if (typeof rawBody === "string") {
      try {
        parsedBody = JSON.parse(rawBody);
      } catch (err) {
        parsedBody = { request: (rawBody as string).trim() };
      }
    } else if (typeof rawBody === "object") {
      parsedBody = rawBody as Record<string, unknown>;
    }

    // Query params (for GET)
    const qs = event?.queryStringParameters || {};

    const rawCandidate =
      (parsedBody as any).request ??
      (parsedBody as any).query ??
      (parsedBody as any).q ??
      qs?.request ??
      qs?.query ??
      qs?.q;

    let requestPayload: string | string[] = "";
    if (Array.isArray(rawCandidate)) {
      requestPayload = rawCandidate.map((s) => String(s).trim()).filter(Boolean);
    } else if (
      typeof rawCandidate === "string" ||
      typeof rawCandidate === "number" ||
      typeof rawCandidate === "boolean"
    ) {
      requestPayload = String(rawCandidate).trim();
    }

    const rawLimit = (parsedBody as any).limit ?? qs?.limit ?? 100;
    const lang = (parsedBody as any).lang ?? qs?.lang ?? "en";

    const isValid =
      (typeof requestPayload === "string" && requestPayload.length > 0) ||
      (Array.isArray(requestPayload) && requestPayload.length > 0);

    if (!isValid) {
      return {
        statusCode: 400,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ error: "Invalid query" }),
      };
    }

    const safeLimit = Math.max(1, Math.min(10000, Number(rawLimit) || 100));

    const token = process.env.LEAKOSINT_API_KEY || (parsedBody as any).token;
    if (!token) {
      return {
        statusCode: 500,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ error: "Server not configured. Missing LEAKOSINT_API_KEY." }),
      };
    }

    const outgoing = {
      token,
      request: requestPayload,
      limit: safeLimit,
      lang,
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const resp = await fetch("https://leakosintapi.com/", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(outgoing),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    const contentType = resp.headers.get("content-type") || "";

    if (!resp.ok) {
      const text = await resp.text();
      const message = text || `Upstream error (${resp.status}).`;
      return {
        statusCode: resp.status,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ error: message, status: resp.status, upstream: true }),
      };
    }

    if (contentType.includes("application/json")) {
      const data = await resp.json();
      return {
        statusCode: 200,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      };
    }

    const text = await resp.text();
    return {
      statusCode: 200,
      headers: { "content-type": contentType || "text/plain" },
      body: text,
    };
  } catch (err: any) {
    const isAbort = err?.name === "AbortError";
    return {
      statusCode: 502,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ error: isAbort ? "Search provider timed out. Please retry." : err?.message || "Search failed" }),
    };
  }
};
