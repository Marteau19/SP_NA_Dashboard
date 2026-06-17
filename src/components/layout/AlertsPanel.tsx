import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { buildAlerts, type Alert } from "../../lib/derive";

export function AlertsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { filters } = useApp();
  const navigate = useNavigate();
  const alerts = useMemo(() => buildAlerts(filters), [filters]);
  const high = alerts.filter((a) => a.severity === "high").length;

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-navy/20" onClick={onClose} />}
      <div
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-stone-200 bg-white shadow-xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-navy">Alerts</h2>
            <p className="text-xs text-stone-500 tabular-nums">
              {alerts.length} active, {high} high priority
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-stone-400 transition-colors hover:bg-stone-100" title="Close">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 space-y-2 overflow-y-auto p-4">
          {alerts.length === 0 && (
            <p className="py-12 text-center text-sm text-stone-400">No active alerts.</p>
          )}
          {alerts.map((a: Alert) => (
            <button
              key={a.id}
              onClick={() => {
                if (a.spId) navigate(`/sp/${a.spId}`);
                else if (a.regionId) navigate(`/region/${a.regionId}`);
                onClose();
              }}
              className="flex w-full items-start gap-3 rounded-lg border border-stone-200 bg-white p-3 text-left transition-colors hover:border-stone-300 hover:bg-stone-50"
            >
              <span
                className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                style={{ background: a.severity === "high" ? "#D14343" : "#E0A106" }}
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-navy">{a.title}</p>
                <p className="text-xs text-stone-500">{a.detail}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
