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
        <ResultCard key={record.id || index} record={record} order={index + 1} />
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
          <h2 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm font-medium text-foreground/60">{subtitle}</p>
          )}
        </div>
        <span className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-semibold uppercase tracking-wider text-foreground/60">
          #{order}
        </span>
      </header>
      <div className="mt-5">
        <FieldGrid fields={record.fields} />
      </div>
    </article>
  );
}

function FieldGrid({ fields }: { fields: ResultField[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {fields.map((field) => (
        <div
          key={field.key}
          className="rounded-xl border border-border/70 bg-background/60 p-4 shadow-sm shadow-brand-500/5"
        >
          <div className="text-xs font-semibold uppercase tracking-wide text-foreground/60">
            {field.label}
          </div>
          <div className="mt-2 text-sm font-semibold text-foreground">
            <ValueRenderer value={field.value} />
          </div>
        </div>
      ))}
    </div>
  );
}

function ValueRenderer({ value }: { value: ResultValue }) {
  if (value === null || value === undefined) {
    return <span className="text-foreground/50">Not provided</span>;
  }

  if (typeof value === "string") {
    return <span className="break-words text-sm font-medium">{value}</span>;
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

    const allPrimitive = meaningfulItems.every(
      (item) =>
        item === null ||
        item === undefined ||
        typeof item === "string" ||
        typeof item === "number" ||
        typeof item === "boolean",
    );

    if (allPrimitive) {
      return (
        <div className="flex flex-wrap gap-2">
          {meaningfulItems.map((item, idx) => (
            <span
              key={idx}
              className="rounded-full bg-brand-500/15 px-3 py-1 text-xs font-semibold text-brand-700 dark:text-brand-200"
            >
              {formatPrimitive(item)}
            </span>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {meaningfulItems.map((item, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-border/70 bg-background/60 p-3"
          >
            <ValueRenderer value={item as ResultValue} />
          </div>
        ))}
      </div>
    );
  }

  const entries = Object.entries(value as Record<string, ResultValue>);
  if (!entries.length) {
    return <span className="text-foreground/50">Not provided</span>;
  }

  return (
    <div className="space-y-3">
      {entries.map(([key, nested]) => (
        <div
          key={key}
          className="rounded-xl border border-border/60 bg-background/50 p-3 shadow-inner shadow-black/5"
        >
          <div className="text-[0.65rem] font-semibold uppercase tracking-wide text-foreground/60">
            {formatLabel(key)}
          </div>
          <div className="mt-1 text-sm font-medium text-foreground">
            <ValueRenderer value={nested} />
          </div>
        </div>
      ))}
    </div>
  );
}

function formatPrimitive(value: ResultValue) {
  if (value === null || value === undefined) return "Not provided";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}
