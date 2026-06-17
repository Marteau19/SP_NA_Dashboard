import { useMemo, useState } from "react";
import { Outlet } from "react-router-dom";
import { Minimize2 } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { AlertsPanel } from "./AlertsPanel";
import { useApp } from "../../context/AppContext";
import { buildAlerts } from "../../lib/derive";

export function AppLayout() {
  const { presentation, setPresentation, filters } = useApp();
  const [alertsOpen, setAlertsOpen] = useState(false);
  const alertCount = useMemo(() => buildAlerts(filters).filter((a) => a.severity === "high").length, [filters]);

  if (presentation) {
    return (
      <div className="min-h-screen bg-stone-50">
        <main className="mx-auto max-w-[1400px] px-8 py-8">
          <Outlet />
        </main>
        <button
          onClick={() => setPresentation(false)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-navy px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-navy-800"
        >
          <Minimize2 size={16} />
          Exit presentation
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-stone-50">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onOpenAlerts={() => setAlertsOpen(true)} alertCount={alertCount} />
        <main className="mx-auto w-full max-w-[1400px] flex-1 px-6 py-6">
          <Outlet />
        </main>
      </div>
      <AlertsPanel open={alertsOpen} onClose={() => setAlertsOpen(false)} />
    </div>
  );
}
