import {
  normalizeSearchResults,
  type NormalizedSearchResults,
} from "@/lib/search-normalize";

export type SearchResult = unknown;

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
  normalized: NormalizedSearchResults;
  hasResults: boolean;
};

export async function performSearch(
  query: string,
): Promise<PerformSearchResult> {
  const trimmed = query.trim();
  if (!trimmed) {
    throw new Error("Search query cannot be empty.");
  }

  const params = new URLSearchParams({
    q: trimmed,
    limit: String(100),
    lang: "en",
  });

  const response = await fetch(`/api/search?${params.toString()}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
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

  const normalized = normalizeSearchResults(body);

  return {
    data: body,
    normalized,
    hasResults: normalized.hasMeaningfulData,
  };
}

export function hasSearchResults(value: SearchResult): boolean {
  return normalizeSearchResults(value).hasMeaningfulData;
}
