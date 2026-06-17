import type { ReactNode } from "react";
import { RAG_HEX, SERVICE_TARGET, mixRag, type Rag } from "../../lib/derive";

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
    ? "cursor-pointer transition-colors hover:border-stone-300 hover:bg-stone-50"
    : "";
  return (
    <div
      onClick={onClick}
      className={`rounded-lg border border-stone-200 bg-white ${interactive} ${className}`}
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
        <h2 className="text-base font-bold tracking-tight text-navy">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-stone-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// Flat bordered KPI tile. The number dominates; the caption stays quiet.
// No icons, no accent dots. An optional foot slot carries the mix bullet.
export function KpiCard({
  label,
  value,
  sub,
  foot,
}: {
  label: string;
  value: string;
  sub?: ReactNode;
  foot?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4">
      <p className="text-[11px] font-medium uppercase tracking-wider text-stone-500">{label}</p>
      <p className="mt-1.5 text-[26px] font-extrabold leading-none tracking-tight text-navy tabular-nums">
        {value}
      </p>
      {sub && <p className="mt-1.5 text-xs text-stone-500 tabular-nums">{sub}</p>}
      {foot && <div className="mt-2.5">{foot}</div>}
    </div>
  );
}

// The single mix-vs-target motif, reused at every level. A bullet bar showing
// actual service mix against the 35% line. This is the only place RAG color
// appears, and it appears sparingly.
export function MixBullet({
  value,
  target = SERVICE_TARGET,
  max = 50,
  showValue = true,
}: {
  value: number;
  target?: number;
  max?: number;
  showValue?: boolean;
}) {
  const rag = mixRag(value, target);
  const clamp = (v: number) => Math.min(100, Math.max(0, (v / max) * 100));
  return (
    <div className="flex items-center gap-2">
      <div className="relative h-1.5 flex-1 rounded-full bg-stone-200">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all"
          style={{ width: `${clamp(value)}%`, background: RAG_HEX[rag] }}
        />
        <div
          className="absolute top-1/2 h-3 w-px -translate-y-1/2 bg-navy/70"
          style={{ left: `${clamp(target)}%` }}
        />
      </div>
      {showValue && (
        <span className="w-12 shrink-0 text-right text-xs font-semibold text-navy tabular-nums">
          {value.toFixed(1)}%
        </span>
      )}
    </div>
  );
}

// Restrained stock status. OK is neutral; only real problems carry color.
export function StatusPill({ status }: { status: "ok" | "low" | "out" }) {
  const map = {
    ok: { dot: "bg-stone-300", label: "OK" },
    low: { dot: "bg-rag-amber", label: "Low" },
    out: { dot: "bg-rag-red", label: "Out" },
  } as const;
  const s = map[status];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600">
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
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
        <h1 className="mt-1.5 text-[28px] font-extrabold leading-tight tracking-tight text-navy">
          {title}
        </h1>
        {meta && (
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-stone-500 tabular-nums">
            {meta}
          </div>
        )}
      </div>
      {action}
    </div>
  );
}

export function LeaderChip({ acr }: { acr: string }) {
  return (
    <span className="inline-flex h-6 items-center rounded-md border border-stone-200 bg-stone-50 px-2 font-mono text-xs font-semibold text-navy">
      {acr}
    </span>
  );
}

// Re-exported so callers can read the canonical RAG, used only by MixBullet.
export type { Rag };
