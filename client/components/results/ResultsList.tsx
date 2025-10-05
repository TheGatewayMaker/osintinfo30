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
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
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
  return (
    <div className="overflow-x-auto rounded-xl border border-border/50">
      <table className="min-w-full table-fixed">
        <colgroup>
          <col className="w-48 md:w-56 lg:w-64" />
          <col />
        </colgroup>
        <tbody className="divide-y divide-border/60">
          {fields.map((field, idx) => (
            <tr key={field.key} className={idx % 2 === 0 ? "bg-background/20" : "bg-background/40"}>
              <th className="align-top p-4 text-left text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-300">
                {field.label}
              </th>
              <td className="align-top p-4 text-sm leading-relaxed text-foreground">
                <ValueRenderer value={field.value} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
      <div className="space-y-4">
        {primitives.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {primitives.map((p, idx) => (
              <span
                key={idx}
                className="inline-flex items-center rounded-lg border border-border/60 bg-background px-3 py-1.5 text-sm font-medium"
              >
                {String(p)}
              </span>
            ))}
          </div>
        )}
        {objects.length > 0 && (
          <ObjectArrayTable items={objects} />
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
    <div className="grid gap-4 lg:grid-cols-2">
      {entries.map(([key, v]) => (
        <div key={key} className="space-y-2">
          <dt className="text-sm font-semibold text-brand-600 dark:text-brand-300">
            {formatLabel(key)}
          </dt>
          <dd className="break-words text-sm text-foreground pl-3 border-l-2 border-border/50">
            <ValueRenderer value={v} />
          </dd>
        </div>
      ))}
    </div>
  );
}
