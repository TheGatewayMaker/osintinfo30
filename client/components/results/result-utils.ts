import type {
  ResultField,
  ResultRecord,
  ResultValue,
} from "@/lib/search-normalize";

export function normalizeFieldKey(key: string) {
  return key.trim().toLowerCase().replace(/[\s_-]+/g, " ");
}

export function extractFirstText(value: ResultValue): string | undefined {
  if (value == null) return undefined;
  if (typeof value === "string" || typeof value === "number") {
    const text = String(value).trim();
    return text || undefined;
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const text = extractFirstText(item as ResultValue);
      if (text) return text;
    }
    return undefined;
  }
  if (typeof value === "object") {
    for (const nested of Object.values(value)) {
      const text = extractFirstText(nested as ResultValue);
      if (text) return text;
    }
  }
  return undefined;
}

export function findFieldValue(
  fields: ResultField[],
  candidates: string[],
): string | undefined {
  const normalizedCandidates = candidates.map((candidate) =>
    candidate.toLowerCase(),
  );

  for (const field of fields) {
    const key = normalizeFieldKey(field.key);
    if (normalizedCandidates.includes(key)) {
      const value = extractFirstText(field.value);
      if (value) return value;
    }
  }

  return undefined;
}

export function collectDistinctFieldValues(
  records: ResultRecord[],
  candidates: string[],
): string[] {
  const unique = new Set<string>();

  records.forEach((record) => {
    const value = findFieldValue(record.fields, candidates);
    if (value) unique.add(value);
  });

  return Array.from(unique).sort((a, b) => a.localeCompare(b));
}
