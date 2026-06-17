import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { X, AlertTriangle, TrendingDown, Boxes, Clock } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { buildAlerts, type Alert, type AlertCategory } from "../../lib/derive";

const ICONS: Record<AlertCategory, typeof AlertTriangle> = {
  performance: TrendingDown,
  field: AlertTriangle,
  inventory: Boxes,
  cases: Clock,
};

export function AlertsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { filters } = useApp();
  const navigate = useNavigate();
  const alerts = useMemo(() => buildAlerts(filters), [filters]);
  const high = alerts.filter((a) => a.severity === "high").length;

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-navy/20" onClick={onClose} />}
      <div
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-navy">Alerts</h2>
            <p className="text-xs text-slate-500">
              {alerts.length} active - {high} high priority
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 space-y-2 overflow-y-auto p-4">
          {alerts.length === 0 && (
            <p className="py-12 text-center text-sm text-slate-400">No active alerts.</p>
          )}
          {alerts.map((a: Alert) => {
            const Icon = ICONS[a.category];
            const accent =
              a.severity === "high" ? "border-l-rag-red" : "border-l-rag-amber";
            return (
              <button
                key={a.id}
                onClick={() => {
                  if (a.spId) navigate(`/sp/${a.spId}`);
                  else if (a.regionId) navigate(`/region/${a.regionId}`);
                  onClose();
                }}
                className={`flex w-full items-start gap-3 rounded-lg border border-slate-200 border-l-4 ${accent} bg-white p-3 text-left transition-colors hover:bg-slate-50`}
              >
                <Icon
                  size={18}
                  className={a.severity === "high" ? "mt-0.5 text-rag-red" : "mt-0.5 text-rag-amber"}
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-navy">{a.title}</p>
                  <p className="text-xs text-slate-500">{a.detail}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
