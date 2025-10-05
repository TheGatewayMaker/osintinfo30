import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  formatLabel,
  hasMeaningfulValue,
  type ResultField,
  type ResultRecord,
  type ResultValue,
} from "@/lib/search-normalize";
import { findFieldValue } from "./result-utils";
import { Link as LinkIcon, Lock, ShieldAlert, UserRound } from "lucide-react";

const SOURCE_FIELD_KEYS = ["source", "breach", "leak name", "leak"];
const DATASET_FIELD_KEYS = ["database", "db", "table", "collection"];
const NICKNAME_FIELD_KEYS = [
  "nickname",
  "username",
  "user",
  "login",
  "handle",
  "nick",
  "screen name",
  "account",
];
const PASSWORD_FIELD_KEYS = ["password", "pass", "pwd", "pass hash", "hash"];
const URL_FIELD_KEYS = [
  "url",
  "link",
  "profile url",
  "website",
  "site",
  "domain",
  "profile",
];
const LEAK_DETAIL_FIELD_KEYS = [
  "description",
  "details",
  "notes",
  "info",
  "exposure",
  "record",
  "data",
  ...SOURCE_FIELD_KEYS,
  ...DATASET_FIELD_KEYS,
];

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

  const total = totalCount ?? records.length;

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {records.map((record, index) => (
        <ResultCard
          key={record.id || `record-${index}`}
          record={record}
          order={index + 1}
          totalCount={total}
          defaultExpanded={index === 0}
        />
      ))}
    </div>
  );
}

function ResultCard({
  record,
  order,
  totalCount,
  defaultExpanded,
}: {
  record: ResultRecord;
  order: number;
  totalCount: number;
  defaultExpanded: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const nickname = findFieldValue(record.fields, NICKNAME_FIELD_KEYS);
  const password = findFieldValue(record.fields, PASSWORD_FIELD_KEYS);
  const url = findFieldValue(record.fields, URL_FIELD_KEYS);
  const contextSummary = record.contextLabel?.trim() || undefined;
  const leakDetail =
    findFieldValue(record.fields, LEAK_DETAIL_FIELD_KEYS) ??
    findFieldValue(record.fields, SOURCE_FIELD_KEYS);
  const infoLeakDetails = leakDetail ?? contextSummary;
  const source = findFieldValue(record.fields, SOURCE_FIELD_KEYS);
  const dataset = findFieldValue(record.fields, DATASET_FIELD_KEYS);

  const displayTitle =
    record.title?.trim() || nickname || `Record ${order}`;
  const nicknameDisplay = nickname ?? displayTitle;
  const urlHref = createHref(url);
  const fieldCount = record.fields.length;
  const showSummary =
    contextSummary && contextSummary !== infoLeakDetails ? contextSummary : undefined;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[26px] border border-border/60 bg-background/95 p-6 shadow-lg shadow-brand-500/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-brand-500/20">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,theme(colors.brand.500/0.18),transparent_60%)] opacity-70" />
      <header className="flex items-center justify-between text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-foreground/60">
        <span className="inline-flex items-center gap-2">
          <span className="rounded-full bg-brand-500/15 px-3 py-1 text-brand-200">
            Record {order}
          </span>
        </span>
        <span className="text-foreground/40">of {totalCount.toLocaleString()}</span>
      </header>

      <h3 className="mt-5 text-2xl font-bold tracking-tight text-foreground">
        {displayTitle}
      </h3>
      {showSummary && (
        <p className="mt-2 text-sm leading-relaxed text-foreground/65">
          {showSummary}
        </p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <InfoTile
          label="Nickname"
          icon={<UserRound className="h-4 w-4 text-brand-200" />}
          value={nicknameDisplay}
        />
        <InfoTile
          label="Password"
          icon={<Lock className="h-4 w-4 text-brand-200" />}
          value={password}
          valueClassName="font-mono text-brand-100"
          fallback="Not available"
        />
        <InfoTile
          label="Profile URL"
          icon={<LinkIcon className="h-4 w-4 text-brand-200" />}
          value={url}
          href={urlHref}
          fallback="Not provided"
        />
        <InfoTile
          label="Info leak details"
          icon={<ShieldAlert className="h-4 w-4 text-brand-200" />}
          value={infoLeakDetails}
          fallback="No details"
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {source && <MetaPill label="Source" value={source} />}
        {dataset && <MetaPill label="Dataset" value={dataset} />}
        <MetaPill label="Fields" value={String(fieldCount)} />
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setExpanded((prev) => !prev)}
        className="mt-6 w-full justify-center rounded-xl border border-border/60 bg-background/70 text-xs font-semibold uppercase tracking-wide text-foreground/70 transition-all hover:bg-brand-500/10 hover:text-foreground"
      >
        {expanded ? "Hide full details" : "View full details"}
      </Button>

      {expanded && (
        <div className="mt-5 space-y-4">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-foreground/60">
            Full record fields
          </h4>
          <FieldList fields={record.fields} />
        </div>
      )}
    </article>
  );
}

function InfoTile({
  label,
  value,
  icon,
  href,
  fallback = "—",
  valueClassName,
}: {
  label: string;
  value?: string | null;
  icon: ReactNode;
  href?: string;
  fallback?: string;
  valueClassName?: string;
}) {
  const displayValue = value?.toString().trim();
  const baseValueClass = "text-sm font-semibold leading-5 text-foreground break-words";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-background/80 p-4 shadow-inner shadow-black/5 transition-colors duration-300 group-hover:border-brand-500/40">
      <div className="flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-wide text-foreground/50">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-3 min-h-[1.4rem]">
        {displayValue ? (
          href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold leading-5 text-brand-100 underline-offset-4 transition-colors hover:text-brand-50 hover:underline break-words"
            >
              {displayValue}
            </a>
          ) : (
            <span className={`${baseValueClass} ${valueClassName ?? ""}`}>
              {displayValue}
            </span>
          )
        ) : (
          <span className="text-sm font-medium text-foreground/45">{fallback}</span>
        )}
      </div>
    </div>
  );
}

function MetaPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-border/50 bg-background/70 px-3 py-1 text-xs font-semibold text-foreground/70 shadow-inner shadow-black/5">
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
    <dl className="divide-y divide-border/50 overflow-hidden rounded-2xl border border-border/50 bg-background/80 shadow-inner shadow-black/5">
      {fields.map((field) => {
        const label = field.label?.trim() || formatLabel(field.key);
        return (
          <div key={field.key} className="space-y-1 px-5 py-4">
            <dt className="text-sm font-bold text-foreground md:text-base">
              {label}
            </dt>
            <dd className="min-w-0 break-words text-sm font-medium leading-6 text-foreground md:text-base">
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
                className="inline-flex items-center rounded-full border border-border/50 bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-200"
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
                className="rounded-2xl border border-border/60 bg-background/80 p-4"
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
  const entries = Object.entries(obj).filter(([, val]) =>
    hasMeaningfulValue(val),
  );
  if (!entries.length) {
    return <span className="text-foreground/50">Not provided</span>;
  }

  return (
    <dl className="space-y-3">
      {entries.map(([key, val]) => (
        <div key={key} className="space-y-1 rounded-xl bg-background/70 px-3 py-2">
          <dt className="text-sm font-bold text-foreground md:text-base">
            {formatLabel(key)}
          </dt>
          <dd className="text-sm font-medium text-foreground/90 md:text-base">
            <ValueRenderer value={val} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

function createHref(raw?: string | null) {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  if (/^(https?|ftp|mailto):\/\//i.test(trimmed)) {
    return trimmed;
  }
  if (trimmed.startsWith("www.")) {
    return `https://${trimmed}`;
  }
  if (!/\s/.test(trimmed) && trimmed.includes(".")) {
    return `https://${trimmed}`;
  }
  return undefined;
}
