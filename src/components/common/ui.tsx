import type { ReactNode } from "react";
import { RAG_HEX, type Rag } from "../../lib/derive";

export function Card({
  children,
  className = "",
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const interactive = onClick
    ? "cursor-pointer transition-shadow hover:shadow-cardHover hover:border-ecoflo/40"
    : "";
  return (
    <div
      onClick={onClick}
      className={`rounded-xl border border-slate-200 bg-white shadow-card ${interactive} ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-lg font-bold text-navy">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function KpiCard({
  label,
  value,
  sub,
  accent,
  icon,
}: {
  label: string;
  value: string;
  sub?: ReactNode;
  accent?: Rag;
  icon?: ReactNode;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        {icon && <span className="text-slate-300">{icon}</span>}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-extrabold text-navy">{value}</span>
        {accent && (
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: RAG_HEX[accent] }} />
        )}
      </div>
      {sub && <div className="mt-1 text-xs text-slate-500">{sub}</div>}
    </Card>
  );
}

export function RagDot({ rag, className = "" }: { rag: Rag; className?: string }) {
  return (
    <span
      className={`inline-block h-2.5 w-2.5 rounded-full ${className}`}
      style={{ background: RAG_HEX[rag] }}
    />
  );
}

const RAG_TEXT: Record<Rag, string> = {
  green: "On track",
  amber: "Watch",
  red: "Off track",
};

export function RagBadge({ rag, label }: { rag: Rag; label?: string }) {
  const styles: Record<Rag, string> = {
    green: "bg-ecoflo-50 text-ecoflo-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${styles[rag]}`}
    >
      <RagDot rag={rag} />
      {label ?? RAG_TEXT[rag]}
    </span>
  );
}

export function StatusPill({ status }: { status: "ok" | "low" | "out" }) {
  const map = {
    ok: { cls: "bg-ecoflo-50 text-ecoflo-700", label: "OK" },
    low: { cls: "bg-amber-50 text-amber-700", label: "Low" },
    out: { cls: "bg-red-50 text-red-700", label: "Out" },
  } as const;
  const s = map[status];
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${s.cls}`}>{s.label}</span>
  );
}

export function Progress({ value, rag }: { value: number; rag: Rag }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: RAG_HEX[rag] }}
      />
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  meta,
  action,
}: {
  eyebrow?: ReactNode;
  title: string;
  meta?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-wider text-ecoflo">{eyebrow}</p>
        )}
        <h1 className="mt-1 text-2xl font-extrabold text-navy">{title}</h1>
        {meta && <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">{meta}</div>}
      </div>
      {action}
    </div>
  );
}

export function LeaderChip({ acr }: { acr: string }) {
  return (
    <span className="inline-flex h-7 items-center rounded-md bg-navy/5 px-2 font-mono text-xs font-semibold text-navy">
      {acr}
    </span>
  );
}
