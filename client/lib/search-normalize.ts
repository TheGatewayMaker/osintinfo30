const HIDDEN_KEY_VALUES = [
  "num of results",
  "num_of_results",
  "num-results",
  "numresults",
  "num results",
  "price",
  "search time",
  "search_time",
  "search-time",
];

const ACRONYMS = new Set([
  "ip",
  "url",
  "id",
  "ssid",
  "ssidpassword",
  "otp",
  "ssn",
  "dob",
  "uid",
  "mac",
  "imei",
  "imsi",
  "md5",
  "sha1",
  "sha256",
]);

const TITLE_KEY_CANDIDATES = [
  "title",
  "name",
  "full name",
  "full_name",
  "email",
  "username",
  "user name",
  "domain",
  "ip",
  "ip address",
  "ip_address",
  "address",
  "id",
  "record id",
  "leak name",
  "breach",
  "source",
];

const UNMEANINGFUL_STRINGS = new Set([
  "",
  "n/a",
  "na",
  "none",
  "null",
  "undefined",
  "unknown",
  "no data",
  "circular reference",
]);

const hiddenKeys = new Set(HIDDEN_KEY_VALUES.map(normalizeKey));

let recordCounter = 0;

function nextRecordId() {
  recordCounter += 1;
  return `record-${recordCounter}`;
}

function normalizeKey(key: string) {
  return key.trim().toLowerCase().replace(/[\s_-]+/g, " ");
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(
    value && typeof value === "object" && !Array.isArray(value),
  );
}

function shouldSkipKey(key: string) {
  const normalized = normalizeKey(key);
  return !normalized || hiddenKeys.has(normalized);
}

export function formatLabel(key: string) {
  const cleaned = key
    .replace(/[_-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return "Value";

  return cleaned
    .split(" ")
    .map((word) => {
      const lower = word.toLowerCase();
      if (ACRONYMS.has(lower)) return lower.toUpperCase();
      if (lower.length <= 2 && /[a-z]/i.test(lower)) {
        return lower.toUpperCase();
      }
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

export type ResultPrimitive = string | number | boolean | null | undefined;

export type ResultValue =
  | ResultPrimitive
  | ResultValue[]
  | { [key: string]: ResultValue };

export type ResultField = {
  key: string;
  label: string;
  value: ResultValue;
};

export type ResultRecord = {
  id: string;
  title?: string;
  contextLabel?: string;
  fields: ResultField[];
};

export type NormalizedSearchResults = {
  records: ResultRecord[];
  recordCount: number;
  fieldCount: number;
  hasMeaningfulData: boolean;
};

function deriveTitle(obj: Record<string, unknown>) {
  for (const [rawKey, rawValue] of Object.entries(obj)) {
    if (typeof rawValue !== "string") continue;
    const normalized = normalizeKey(rawKey);
    if (TITLE_KEY_CANDIDATES.includes(normalized) && rawValue.trim()) {
      return rawValue.trim();
    }
  }
  return undefined;
}

function normalizeValue(value: unknown, seen: WeakSet<object>): ResultValue {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === "string") {
    return value.trim();
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => normalizeValue(item, seen));
  }
  if (typeof value === "object") {
    const objectValue = value as Record<string, unknown>;
    if (seen.has(objectValue)) {
      return "Circular reference";
    }
    seen.add(objectValue);
    const result: Record<string, ResultValue> = {};
    for (const [key, val] of Object.entries(objectValue)) {
      if (shouldSkipKey(key)) continue;
      const normalized = normalizeValue(val, seen);
      if (normalized === null || normalized === undefined) continue;
      if (
        Array.isArray(normalized) &&
        !normalized.some((item) => hasMeaningfulValue(item))
      ) {
        continue;
      }
      if (
        typeof normalized === "object" &&
        !Array.isArray(normalized) &&
        !Object.values(normalized).some((item) => hasMeaningfulValue(item))
      ) {
        continue;
      }
      result[key] = normalized;
    }
    seen.delete(objectValue);
    return result;
  }
  return String(value);
}

export function hasMeaningfulValue(value: ResultValue): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return !UNMEANINGFUL_STRINGS.has(trimmed.toLowerCase());
  }
  if (typeof value === "number") {
    return !Number.isNaN(value);
  }
  if (typeof value === "boolean") {
    return true;
  }
  if (Array.isArray(value)) {
    return value.some((item) => hasMeaningfulValue(item));
  }
  const entries = Object.values(value as Record<string, ResultValue>);
  return entries.some((item) => hasMeaningfulValue(item));
}

function objectToRecord(
  obj: Record<string, unknown>,
  contextLabel?: string,
): ResultRecord | null {
  const fields: ResultField[] = [];

  for (const [key, rawValue] of Object.entries(obj)) {
    if (shouldSkipKey(key)) continue;
    const normalizedValue = normalizeValue(rawValue, new WeakSet<object>());
    if (!hasMeaningfulValue(normalizedValue)) continue;

    fields.push({
      key,
      label: formatLabel(key),
      value: normalizedValue,
    });
  }

  if (!fields.length) return null;

  const title = deriveTitle(obj) ?? contextLabel;

  return {
    id: nextRecordId(),
    title,
    contextLabel: contextLabel && contextLabel !== title ? contextLabel : undefined,
    fields,
  };
}

function appendArrayRecords(
  records: ResultRecord[],
  items: unknown[],
  contextLabel?: string,
) {
  const objectItems = items.filter(isPlainObject) as Record<string, unknown>[];
  if (objectItems.length === items.length) {
    objectItems.forEach((item) => {
      const record = objectToRecord(item, contextLabel);
      if (record) {
        records.push(record);
      }
    });
    return;
  }

  const normalizedArray = items
    .map((item) => normalizeValue(item, new WeakSet<object>()))
    .filter((item) => hasMeaningfulValue(item));

  if (!normalizedArray.length) return;

  const label = contextLabel ?? "Values";

  records.push({
    id: nextRecordId(),
    title: contextLabel,
    contextLabel,
    fields: [
      {
        key: label.toLowerCase(),
        label: formatLabel(label),
        value: normalizedArray as ResultValue,
      },
    ],
  });
}

export function normalizeSearchResults(
  data: unknown,
): NormalizedSearchResults {
  const records: ResultRecord[] = [];

  function process(value: unknown, contextLabel?: string) {
    if (Array.isArray(value)) {
      appendArrayRecords(records, value, contextLabel);
      return;
    }

    if (isPlainObject(value)) {
      const objValue = value as Record<string, unknown>;
      const nestedArrays: Array<[string, unknown[]]> = [];
      const baseFields: Record<string, unknown> = {};

      for (const [key, val] of Object.entries(objValue)) {
        if (shouldSkipKey(key)) continue;
        if (Array.isArray(val)) {
          nestedArrays.push([key, val]);
        } else {
          baseFields[key] = val;
        }
      }

      const record = objectToRecord(baseFields, contextLabel);
      if (record) {
        records.push(record);
      }

      nestedArrays.forEach(([key, arr]) => {
        process(arr, formatLabel(key));
      });

      return;
    }

    const normalizedValue = normalizeValue(value, new WeakSet<object>());
    if (!hasMeaningfulValue(normalizedValue)) {
      return;
    }

    const label = contextLabel ?? "Value";
    records.push({
      id: nextRecordId(),
      title: contextLabel,
      contextLabel,
      fields: [
        {
          key: label.toLowerCase(),
          label: formatLabel(label),
          value: normalizedValue,
        },
      ],
    });
  }

  process(data);

  const cleanedRecords = records.filter((record) =>
    record.fields.some((field) => hasMeaningfulValue(field.value)),
  );

  const recordCount = cleanedRecords.length;
  const fieldCount = cleanedRecords.reduce(
    (total, current) => total + current.fields.length,
    0,
  );

  return {
    records: cleanedRecords,
    recordCount,
    fieldCount,
    hasMeaningfulData: recordCount > 0,
  };
}

export const HIDDEN_KEYS = hiddenKeys;
