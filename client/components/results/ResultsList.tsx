import {
  formatLabel,
  hasMeaningfulValue,
  type ResultField,
  type ResultRecord,
  type ResultValue,
} from "@/lib/search-normalize";

function normalizeKeyLocal(key: string) {
  return key
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, " ");
}

function extractFirstString(value: ResultValue): string | undefined {
  if (value == null) return undefined;
  if (typeof value === "string" || typeof value === "number") {
    const s = String(value).trim();
    return s || undefined;
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) {
    for (const v of value) {
      const s = extractFirstString(v as ResultValue);
      if (s) return s;
    }
    return undefined;
  }
  if (typeof value === "object") {
    for (const v of Object.values(value)) {
      const s = extractFirstString(v as ResultValue);
      if (s) return s;
    }
  }
  return undefined;
}

function findFieldValue(
  fields: ResultField[],
  candidates: string[],
): string | undefined {
  for (const f of fields) {
    const key = normalizeKeyLocal(f.key);
    if (candidates.includes(key)) {
      const v = extractFirstString(f.value);
      if (v) return v;
    }
  }
  return undefined;
}

export function ResultsList({
  records,
  totalCount,
}: {
  records: ResultRecord[];
  totalCount?: number;
}) {
  if (!records.length) {
    return null;
  }

  return (
    <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
      {records.map((record, index) => (
        <ResultCard
          key={record.id || index}
          record={record}
          order={index + 1}
          totalCount={totalCount ?? records.length}
        />
      ))}
    </div>
  );
}

function ResultCard({
  record,
  order,
  totalCount,
}: {
  record: ResultRecord;
  order: number;
  totalCount: number;
}) {
  const displayTitle = record.title?.trim() || `Record ${order}`;
  const subtitle =
    record.contextLabel && record.contextLabel !== record.title
      ? record.contextLabel
      : undefined;

  const source = findFieldValue(record.fields, [
    "source",
    "breach",
    "leak name",
    "leak",
  ]);
  const database = findFieldValue(record.fields, [
    "database",
    "db",
    "table",
    "collection",
  ]);
  const fieldCount = record.fields.length;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/70 bg-card/95 p-7 shadow-lg shadow-brand-500/10 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.01] hover:border-brand-400/40 hover:shadow-2xl hover:shadow-brand-500/30">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-500/80">
            <span className="rounded-full bg-brand-500/10 px-2 py-1 text-brand-600 dark:text-brand-300">
              Record {order}
            </span>
            <span className="text-foreground/50">of {totalCount}</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
            {displayTitle}
          </h2>
          {subtitle && (
            <p className="text-sm font-semibold text-foreground/70 md:text-base">
              {subtitle}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            {source && <MetaPill label="Source" value={source} />}
            {database && <MetaPill label="Database" value={database} />}
            <MetaPill label="Fields" value={String(fieldCount)} />
          </div>
        </div>
        <span className="rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-foreground/60 shadow-sm">
          #{order}
        </span>
      </header>

      <div className="mt-6">
        <FieldList fields={record.fields} />
      </div>
    </article>
  );
}

function MetaPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs font-semibold text-foreground/80 shadow-sm shadow-brand-500/10">
      <span className="text-foreground/50">{label}:</span>
      <span className="max-w-[32ch] truncate text-foreground/80">{value}</span>
    </span>
  );
}

function FieldList({ fields }: { fields: ResultField[] }) {
  if (!fields.length) {
    return null;
  }

  return (
    <dl className="overflow-hidden rounded-2xl border border-border/60 bg-background/80 shadow-inner shadow-black/5 backdrop-blur-sm">
      {fields.map((field) => {
        const label = field.label?.trim() || formatLabel(field.key);
        return (
          <div
            key={field.key}
            className="group/field grid [grid-template-columns:minmax(140px,0.4fr)_1fr] items-start gap-x-6 gap-y-2 px-5 py-4 transition-all duration-200 even:bg-background/60 hover:bg-brand-500/10 sm:[grid-template-columns:minmax(180px,0.35fr)_1fr]"
          >
            <dt className="text-xs font-semibold uppercase tracking-wide text-foreground/60 transition-colors group-hover/field:text-brand-500 dark:group-hover/field:text-brand-300">
              {label}
            </dt>
            <dd className="min-w-0 text-sm font-medium text-foreground/80 transition-all duration-200 group-hover/field:text-foreground group-hover/field:underline group-hover/field:decoration-brand-400/50 group-hover/field:underline-offset-4 group-hover/field:[text-shadow:0_0_12px_rgba(167,139,250,0.3)] md:text-base">
              <ValueRenderer value={field.value} />
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

function ValueRenderer({ value }: { value: ResultValue }) {
  if (value === null || value === undefined) {
    return <span className="text-foreground/50">Not provided</span>;
  }

  if (typeof value === "string") {
    return <span className="whitespace-pre-line break-words">{value}</span>;
  }

  if (typeof value === "number") {
    return <span>{value}</span>;
  }

  if (typeof value === "boolean") {
    return <span>{value ? "Yes" : "No"}</span>;
  }

  if (Array.isArray(value)) {
    const items = value.filter((item) => hasMeaningfulValue(item));
    if (!items.length) {
      return <span className="text-foreground/50">None</span>;
    }

    const primitives = items.filter(
      (i) =>
        typeof i === "string" ||
        typeof i === "number" ||
        typeof i === "boolean",
    ) as Array<string | number | boolean>;
    const objects = items.filter(
      (i) => i && typeof i === "object" && !Array.isArray(i),
    ) as Array<Record<string, ResultValue>>;

    return (
      <div className="space-y-4">
        {primitives.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {primitives.map((p, idx) => (
              <span
                key={idx}
                className="inline-flex items-center rounded-full border border-border/50 bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-700 dark:text-brand-200"
              >
                {String(p)}
              </span>
            ))}
          </div>
        )}
        {objects.length > 0 && (
          <div className="space-y-4">
            {objects.map((obj, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-border/60 bg-background/70 p-4 shadow-sm shadow-brand-500/5"
              >
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/50">
                  Item {idx + 1}
                </div>
                <ObjectRenderer obj={obj} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (typeof value === "object") {
    return <ObjectRenderer obj={value as Record<string, ResultValue>} />;
  }

  return <span className="break-words">{String(value)}</span>;
}

function ObjectRenderer({ obj }: { obj: Record<string, ResultValue> }) {
  const entries = Object.entries(obj).filter(([, v]) => hasMeaningfulValue(v));
  if (!entries.length) {
    return <span className="text-foreground/50">Not provided</span>;
  }

  return (
    <dl className="space-y-3">
      {entries.map(([key, v]) => (
        <div
          key={key}
          className="grid [grid-template-columns:minmax(120px,0.35fr)_1fr] items-start gap-x-4 gap-y-1 rounded-xl bg-background/60 px-3 py-2"
        >
          <dt className="text-xs font-semibold uppercase tracking-wide text-foreground/60">
            {formatLabel(key)}
          </dt>
          <dd className="text-sm font-medium text-foreground/80">
            <ValueRenderer value={v} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
