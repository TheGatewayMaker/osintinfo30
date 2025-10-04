const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
};

type NetlifyEvent = {
  httpMethod?: string;
  headers?: Record<string, string | undefined>;
  queryStringParameters?: Record<string, string | undefined> | null;
  body?: string | null;
  isBase64Encoded?: boolean;
};

type NetlifyContext = Record<string, unknown>;

type NetlifyResult = {
  statusCode: number;
  headers?: Record<string, string>;
  body?: string;
};

type ParsedPayload = {
  request?: unknown;
  query?: unknown;
  q?: unknown;
  limit?: unknown;
  lang?: unknown;
};

function respond(statusCode: number, body: Record<string, unknown> | string): NetlifyResult {
  const payload = typeof body === "string" ? body : JSON.stringify(body);
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
    body: payload,
  };
}

function parseBody(event: NetlifyEvent): ParsedPayload {
  const rawBody = event.body;
  if (!rawBody) {
    return {};
  }

  let decoded = rawBody;
  if (event.isBase64Encoded) {
    decoded = Buffer.from(rawBody, "base64").toString("utf-8");
  }

  try {
    const parsed = JSON.parse(decoded);
    if (parsed && typeof parsed === "object") {
      return parsed as ParsedPayload;
    }
  } catch {
    const trimmed = decoded.trim();
    if (trimmed.length > 0) {
      return { request: trimmed };
    }
  }

  return {};
}

function coerceRequest(value: unknown): string | string[] | null {
  if (Array.isArray(value)) {
    const normalized = value
      .map((v) => {
        if (
          typeof v === "string" ||
          typeof v === "number" ||
          typeof v === "boolean"
        ) {
          const text = String(v).trim();
          return text.length > 0 ? text : null;
        }
        return null;
      })
      .filter((v): v is string => Boolean(v));
    return normalized.length > 0 ? normalized : null;
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    const text = String(value).trim();
    return text.length > 0 ? text : null;
  }

  return null;
}

function clampLimit(value: unknown, fallback: number): number {
  const num = Number(value);
  if (!Number.isFinite(num)) {
    return fallback;
  }
  const int = Math.floor(num);
  const withinLower = Math.max(int, 1);
  const withinBounds = Math.min(withinLower, 10000);
  return withinBounds;
}

export const handler = async (event: NetlifyEvent, _context: NetlifyContext): Promise<NetlifyResult> => {
  const method = (event.httpMethod || "GET").toUpperCase();
  if (method === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        ...corsHeaders,
      },
    };
  }

  if (method !== "GET" && method !== "POST") {
    return respond(405, { error: "Method not allowed" });
  }

  const token = process.env.LEAKOSINT_API_KEY;
  if (!token) {
    return respond(500, { error: "Server not configured. Missing LEAKOSINT_API_KEY." });
  }

  const queryParams = event.queryStringParameters ?? {};
  const body = parseBody(event);

  const requestCandidate =
    body.request ??
    body.query ??
    body.q ??
    queryParams.request ??
    queryParams.query ??
    queryParams.q;

  const requestPayload = coerceRequest(requestCandidate);
  if (!requestPayload) {
    return respond(400, { error: "Invalid query" });
  }

  const limitCandidate = body.limit ?? queryParams.limit;
  const langCandidate = body.lang ?? queryParams.lang;

  const limit = clampLimit(limitCandidate, 100);
  const lang = typeof langCandidate === "string" && langCandidate.trim().length > 0
    ? langCandidate.trim()
    : "en";

  const payload = {
    token,
    request: requestPayload,
    limit,
    lang,
  } as const;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch("https://leakosintapi.com/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
      const message = (await response.text()) || `Upstream error (${response.status}).`;
      return respond(response.status, {
        error: message,
        status: response.status,
        upstream: true,
      });
    }

    if (contentType.includes("application/json")) {
      const data = await response.json();
      return respond(200, data);
    }

    const text = await response.text();
    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": contentType || "text/plain",
      },
      body: text,
    };
  } catch (error: unknown) {
    const message =
      error && typeof error === "object" && "message" in error
        ? String((error as { message?: unknown }).message)
        : "Search failed";
    const isTimeout =
      error && typeof error === "object" && "name" in error && (error as { name?: unknown }).name === "AbortError";
    return respond(502, {
      error: isTimeout ? "Search provider timed out. Please retry." : message,
    });
  }
};
