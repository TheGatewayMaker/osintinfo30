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

export function ResultsList({ records, totalCount }: { records: ResultRecord[]; totalCount?: number }) {
  if (!records.length) {
    return null;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
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
  const title = record.title || `Record ${order} of ${totalCount}`;
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
    <article className="group rounded-2xl border border-border bg-card/90 p-6 shadow-sm shadow-brand-500/10 ring-1 ring-brand-500/10 backdrop-blur h-full transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-xl hover:shadow-brand-500/20 hover:ring-brand-500/30">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
            {title}
          </h2>
          {subtitle && (
            <p className="text-base font-semibold text-foreground/70">
              {subtitle}
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {source && <MetaPill label="Source" value={source} />}
            {database && <MetaPill label="Database" value={database} />}
            <MetaPill label="Fields" value={String(fieldCount)} />
          </div>
        </div>
        <span className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-semibold uppercase tracking-wider text-foreground/60">
          #{order}
        </span>
      </header>
      <div className="mt-5">
        <FieldColumns fields={record.fields} />
      </div>
    </article>
  );
}

function MetaPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background px-2.5 py-1 text-xs font-semibold text-foreground/80">
      <span className="text-foreground/60">{label}:</span>
      <span className="max-w-[28ch] truncate">{value}</span>
    </span>
  );
}

function FieldColumns({ fields }: { fields: ResultField[] }) {
  const halfway = Math.ceil(fields.length / 2);
  const left = fields.slice(0, halfway);
  const right = fields.slice(halfway);

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <FieldColumn fields={left} />
      <FieldColumn fields={right} />
    </div>
  );
}

function FieldColumn({ fields }: { fields: ResultField[] }) {
  return (
    <dl className="space-y-4">
      {fields.map((field) => (
        <div
          key={field.key}
          className="group/field grid [grid-template-columns:180px_1fr] items-start gap-2 sm:gap-3 rounded-lg px-2 py-1 transition-colors hover:bg-foreground/5"
        >
          <dt className="text-sm font-extrabold tracking-wide text-brand-600 dark:text-brand-300 transition-colors group-hover/field:text-brand-400">
            {field.label}
          </dt>
          <dd className="min-w-0 break-words text-base font-medium text-foreground transition-colors group-hover/field:text-foreground group-hover/field:underline decoration-brand-400/50 underline-offset-2">
            <ValueRenderer value={field.value} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

function ValueRenderer({ value }: { value: ResultValue }) {
  if (value === null || value === undefined) {
    return <span className="text-foreground/50">Not provided</span>;
  }

  if (typeof value === "string") {
    return <span className="break-words">{value}</span>;
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
      <div className="space-y-3">
        {primitives.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {primitives.map((p, idx) => (
              <span
                key={idx}
                className="inline-flex items-center rounded-full border border-border/60 bg-background px-2.5 py-0.5 text-xs font-medium"
              >
                {String(p)}
              </span>
            ))}
          </div>
        )}
        {objects.length > 0 && (
          <div className="grid gap-3 md:grid-cols-2">
            {objects.map((obj, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-border/70 bg-background/60 p-4 shadow-sm"
              >
                <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-foreground/60">
                  Item #{idx + 1}
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
        <div key={key} className="group/field grid [grid-template-columns:180px_1fr] items-start gap-2 sm:gap-3 rounded-md px-2 py-1 transition-colors hover:bg-foreground/5">
          <dt className="text-sm font-extrabold tracking-wide text-brand-600 dark:text-brand-300 transition-colors group-hover/field:text-brand-400">
            {formatLabel(key)}
          </dt>
          <dd className="min-w-0 break-words text-base font-medium text-foreground transition-colors group-hover/field:text-foreground group-hover/field:underline decoration-brand-400/50 underline-offset-2">
            <ValueRenderer value={v} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
