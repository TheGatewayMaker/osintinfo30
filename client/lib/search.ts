export type SearchResult = unknown;

function detectHasResults(value: SearchResult): boolean {
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  if (value && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>).length > 0;
  }
  if (typeof value === "string") {
    return value.trim().length > 0 && !/no results/i.test(value);
  }
  return Boolean(value);
}

async function readResponseBody(response: Response): Promise<SearchResult> {
  const contentType = response.headers.get("content-type") || "";
  const raw = await response.text();

  if (!raw) {
    return contentType.includes("application/json") ? {} : "";
  }

  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(raw) as SearchResult;
    } catch {
      return raw;
    }
  }

  return raw;
}

export type PerformSearchResult = {
  data: SearchResult;
  hasResults: boolean;
};

export async function performSearch(
  query: string,
): Promise<PerformSearchResult> {
  const trimmed = query.trim();
  if (!trimmed) {
    throw new Error("Search query cannot be empty.");
  }

  const response = await fetch("/api/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      token: import.meta.env.LEAKOSINT_API_KEY,
      request: trimmed,
      limit: 100,
      lang: "en",
    }),
  });

  const body = await readResponseBody(response);

  if (!response.ok) {
    const fallbackMessage = `Search failed (${response.status}).`;
    if (typeof body === "string" && body.trim()) {
      throw new Error(body.trim());
    }
    if (body && typeof body === "object") {
      const message =
        (body as { error?: unknown; message?: unknown }).error ??
        (body as { error?: unknown; message?: unknown }).message;
      if (typeof message === "string" && message.trim()) {
        throw new Error(message.trim());
      }
    }
    throw new Error(fallbackMessage);
  }

  return {
    data: body,
    hasResults: detectHasResults(body),
  };
}

export { detectHasResults as hasSearchResults };
