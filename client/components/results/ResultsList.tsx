import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  formatLabel,
  hasMeaningfulValue,
  type ResultField,
  type ResultRecord,
  type ResultValue,
} from "@/lib/search-normalize";
import { findFieldValue } from "./result-utils";

const SOURCE_FIELD_KEYS = ["source", "breach", "leak name", "leak"];
const DATASET_FIELD_KEYS = ["database", "db", "table", "collection"];

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

  const defaultOpenValues =
    records.length > 0 ? [records[0].id || "record-0"] : [];
  const total = totalCount ?? records.length;

  return (
    <Accordion
      type="multiple"
      defaultValue={defaultOpenValues}
      className="flex flex-col gap-4"
    >
      {records.map((record, index) => {
        const itemValue = record.id || `record-${index}`;
        return (
          <AccordionItem
            key={itemValue}
            value={itemValue}
            className="overflow-hidden rounded-3xl border border-border/70 bg-background/90 shadow-lg shadow-brand-500/10 transition-all data-[state=open]:shadow-brand-500/25 data-[state=open]:ring-1 data-[state=open]:ring-brand-500/20"
          >
          <AccordionTrigger className="px-6 py-5 text-left text-base font-semibold text-foreground">
            <RecordHeader
              record={record}
              order={index + 1}
              totalCount={total}
            />
          </AccordionTrigger>
          <AccordionContent className="px-6">
            <FieldList fields={record.fields} />
          </AccordionContent>
        </AccordionItem>
        );
      })}
    </Accordion>
  );
}

function RecordHeader({
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

  const source = findFieldValue(record.fields, SOURCE_FIELD_KEYS);
  const dataset = findFieldValue(record.fields, DATASET_FIELD_KEYS);
  const fieldCount = record.fields.length;

  return (
    <div className="flex w-full flex-col gap-4 text-left">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wide text-foreground/50">
        <span className="inline-flex items-center gap-2">
          <span className="rounded-full bg-brand-500/10 px-2 py-1 text-brand-600 dark:text-brand-300">
            Record {order}
          </span>
          <span className="text-foreground/40">of {totalCount}</span>
        </span>
        <span className="rounded-full border border-border/60 bg-background/70 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-foreground/60">
          #{order}
        </span>
      </div>
      <div className="space-y-1">
        <h2 className="text-xl font-bold leading-snug text-foreground md:text-2xl">
          {displayTitle}
        </h2>
        {subtitle && (
          <p className="text-sm font-medium text-foreground/70 md:text-base">
            {subtitle}
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {source && <MetaPill label="Source" value={source} />}
        {dataset && <MetaPill label="Dataset" value={dataset} />}
        <MetaPill label="Fields" value={String(fieldCount)} />
      </div>
    </div>
  );
}

function MetaPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex max-w-full items-center gap-1 rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs font-semibold text-foreground/70 shadow-sm shadow-brand-500/10">
      <span className="text-foreground/50">{label}:</span>
      <span className="break-words text-foreground/80">{value}</span>
    </div>
  );
}

function FieldList({ fields }: { fields: ResultField[] }) {
  if (!fields.length) {
    return null;
  }

  return (
    <dl className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/60 bg-background/85 shadow-inner shadow-black/5">
      {fields.map((field) => {
        const label = field.label?.trim() || formatLabel(field.key);
        return (
          <div
            key={field.key}
            className="grid gap-y-2 gap-x-6 px-5 py-4 sm:grid-cols-[minmax(160px,0.35fr)_1fr]"
          >
            <dt className="text-xs font-semibold uppercase tracking-wide text-foreground/60">
              {label}
            </dt>
            <dd className="min-w-0 text-sm font-medium leading-6 text-foreground break-words md:text-base">
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
      (item) =>
        typeof item === "string" ||
        typeof item === "number" ||
        typeof item === "boolean",
    ) as Array<string | number | boolean>;
    const objects = items.filter(
      (item) => item && typeof item === "object" && !Array.isArray(item),
    ) as Array<Record<string, ResultValue>>;

    return (
      <div className="space-y-4">
        {primitives.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {primitives.map((primitive, index) => (
              <span
                key={`${primitive}-${index}`}
                className="inline-flex items-center rounded-full border border-border/50 bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-700 dark:text-brand-200"
              >
                {String(primitive)}
              </span>
            ))}
          </div>
        )}
        {objects.length > 0 && (
          <div className="space-y-4">
            {objects.map((objectValue, index) => (
              <div
                key={index}
                className="rounded-2xl border border-border/60 bg-background/70 p-4 shadow-sm shadow-brand-500/5"
              >
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/50">
                  Item {index + 1}
                </div>
                <ObjectRenderer obj={objectValue} />
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
  const entries = Object.entries(obj).filter(([, val]) => hasMeaningfulValue(val));
  if (!entries.length) {
    return <span className="text-foreground/50">Not provided</span>;
  }

  return (
    <dl className="space-y-3">
      {entries.map(([key, val]) => (
        <div
          key={key}
          className="grid gap-y-1 gap-x-4 rounded-xl bg-background/60 px-3 py-2 sm:grid-cols-[minmax(140px,0.35fr)_1fr]"
        >
          <dt className="text-xs font-semibold uppercase tracking-wide text-foreground/60">
            {formatLabel(key)}
          </dt>
          <dd className="text-sm font-medium text-foreground/80">
            <ValueRenderer value={val} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
