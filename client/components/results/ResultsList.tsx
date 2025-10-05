import {
  formatLabel,
  hasMeaningfulValue,
  type ResultField,
  type ResultRecord,
  type ResultValue,
} from "@/lib/search-normalize";

export function ResultsList({ records }: { records: ResultRecord[] }) {
  if (!records.length) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      {records.map((record, index) => (
        <ResultCard
          key={record.id || index}
          record={record}
          order={index + 1}
        />
      ))}
    </div>
  );
}

function ResultCard({
  record,
  order,
}: {
  record: ResultRecord;
  order: number;
}) {
  const title = record.title || `Record ${order}`;
  const subtitle =
    record.contextLabel && record.contextLabel !== record.title
      ? record.contextLabel
      : undefined;

  return (
    <article className="rounded-2xl border border-border bg-card/90 p-6 shadow-sm shadow-brand-500/10 ring-1 ring-brand-500/10 backdrop-blur">
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
        <div key={field.key} className="grid grid-cols-3 items-start gap-3">
          <dt className="col-span-1 text-sm font-extrabold tracking-wide text-brand-600 dark:text-brand-300">
            {field.label}
          </dt>
          <dd className="col-span-2 break-words text-base font-medium text-foreground">
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
    const meaningfulItems = value.filter((item) => hasMeaningfulValue(item));
    if (!meaningfulItems.length) {
      return <span className="text-foreground/50">None</span>;
    }

    const parts = meaningfulItems.map((item) => {
      if (item === null || item === undefined) return "Not provided";
      if (
        typeof item === "string" ||
        typeof item === "number" ||
        typeof item === "boolean"
      )
        return formatPrimitive(item);
      try {
        return conciseObject(item as Record<string, ResultValue>);
      } catch {
        return JSON.stringify(item);
      }
    });

    return <span>{parts.join(", ")}</span>;
  }

  try {
    return <span>{conciseObject(value as Record<string, ResultValue>)}</span>;
  } catch {
    return <span>{JSON.stringify(value)}</span>;
  }
}

function conciseObject(obj: Record<string, ResultValue>) {
  const entries = Object.entries(obj).filter(([, v]) => hasMeaningfulValue(v));
  if (!entries.length) return "Not provided";
  const parts = entries.map(([key, v]) => {
    if (v === null || v === undefined) return `${formatLabel(key)}: Not provided`;
    if (
      typeof v === "string" ||
      typeof v === "number" ||
      typeof v === "boolean"
    )
      return `${formatLabel(key)}: ${formatPrimitive(v)}`;
    if (Array.isArray(v)) {
      const arr = v.filter((i) => hasMeaningfulValue(i));
      if (!arr.length) return `${formatLabel(key)}: None`;
      const primOnly = arr.every(
        (i) => typeof i === "string" || typeof i === "number" || typeof i === "boolean",
      );
      const val = primOnly ? arr.map(formatPrimitive).join(", ") : `${arr.length} items`;
      return `${formatLabel(key)}: ${val}`;
    }
    return `${formatLabel(key)}: ${Object.keys(v as object).length} fields`;
  });
  return parts.join(" • ");
}

function formatPrimitive(value: ResultValue) {
  if (value === null || value === undefined) return "Not provided";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}
