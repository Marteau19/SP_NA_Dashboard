import { Bell, Presentation, ChevronDown } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { Breadcrumb } from "./Breadcrumb";
import { GROUP_LABELS, PERIODS, type GroupFilter } from "../../lib/derive";
import type { Currency } from "../../data/seedData";

const GROUP_OPTIONS: { value: GroupFilter; label: string }[] = [
  { value: "ALL", label: "All regions" },
  { value: "QC", label: GROUP_LABELS.QC },
  { value: "CAN-EN", label: GROUP_LABELS["CAN-EN"] },
  { value: "USA", label: GROUP_LABELS.USA },
];

function Select<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm font-medium text-navy shadow-sm focus:border-ecoflo focus:outline-none focus:ring-1 focus:ring-ecoflo"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown size={15} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

export function TopBar({ onOpenAlerts, alertCount }: { onOpenAlerts: () => void; alertCount: number }) {
  const { group, setGroup, periodIndex, setPeriodIndex, currency, setCurrency, setPresentation } = useApp();

  return (
    <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-6 py-3 backdrop-blur">
      <Breadcrumb />
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={group}
          onChange={setGroup}
          options={GROUP_OPTIONS}
        />
        <Select
          value={String(periodIndex)}
          onChange={(v) => setPeriodIndex(Number(v))}
          options={PERIODS.map((p, i) => ({ value: String(i), label: p }))}
        />
        <div className="flex overflow-hidden rounded-lg border border-slate-200 text-sm font-semibold">
          {(["CAD", "USD"] as Currency[]).map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={`px-3 py-2 transition-colors ${
                currency === c ? "bg-navy text-white" : "bg-white text-slate-500 hover:bg-slate-50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <button
          onClick={onOpenAlerts}
          className="relative rounded-lg border border-slate-200 bg-white p-2 text-slate-500 shadow-sm hover:bg-slate-50"
          title="Alerts"
        >
          <Bell size={18} />
          {alertCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-rag-red px-1 text-[10px] font-bold text-white">
              {alertCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setPresentation(true)}
          className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 shadow-sm hover:bg-slate-50"
          title="Presentation mode"
        >
          <Presentation size={18} />
        </button>
      </div>
    </header>
  );
}
