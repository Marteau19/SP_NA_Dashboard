import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Boxes, PackageX, AlertTriangle, CheckCircle2, Download } from "lucide-react";
import { useApp } from "../context/AppContext";
import { allSpViews } from "../lib/derive";
import { num } from "../lib/format";
import { downloadCsv } from "../lib/csv";
import { Card, KpiCard, PageHeader, StatusPill, SectionTitle } from "../components/common/ui";

interface Row {
  spId: string;
  spName: string;
  region: string;
  item: string;
  onHand: number;
  reserved: number;
  reorderPoint: number;
  status: "ok" | "low" | "out";
}

export default function Inventory() {
  const { filters } = useApp();
  const navigate = useNavigate();
  const [issuesOnly, setIssuesOnly] = useState(false);

  const rows = useMemo<Row[]>(() => {
    return allSpViews(filters).flatMap((v) =>
      v.sp.inventory.map((inv) => ({
        spId: v.id,
        spName: v.name,
        region: v.regionName,
        item: inv.item,
        onHand: inv.onHand,
        reserved: inv.reserved,
        reorderPoint: inv.reorderPoint,
        status: inv.status,
      }))
    );
  }, [filters]);

  const out = rows.filter((r) => r.status === "out").length;
  const low = rows.filter((r) => r.status === "low").length;
  const ok = rows.filter((r) => r.status === "ok").length;

  const shown = issuesOnly ? rows.filter((r) => r.status !== "ok") : rows;
  const sorted = [...shown].sort((a, b) => {
    const rank = { out: 0, low: 1, ok: 2 };
    return rank[a.status] - rank[b.status];
  });

  const exportCsv = () => {
    downloadCsv("inventory.csv", [
      ["Service Point", "Region", "Item", "On hand", "Reserved", "Reorder point", "Status"],
      ...sorted.map((r) => [r.spName, r.region, r.item, r.onHand, r.reserved, r.reorderPoint, r.status]),
    ]);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Inventory Tracking"
        title="Stock across the service point network"
        meta={<span>On-hand, reserved and reorder levels by item type.</span>}
        action={
          <button onClick={exportCsv} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-navy shadow-sm hover:bg-slate-50">
            <Download size={16} /> Export CSV
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Items tracked" value={num(rows.length)} icon={<Boxes size={16} />} />
        <KpiCard label="Out of stock" value={num(out)} accent="red" icon={<PackageX size={16} />} />
        <KpiCard label="Low stock" value={num(low)} accent="amber" icon={<AlertTriangle size={16} />} />
        <KpiCard label="In stock" value={num(ok)} accent="green" icon={<CheckCircle2 size={16} />} />
      </div>

      <Card className="mt-6 p-5">
        <SectionTitle
          title="Stock detail"
          subtitle={`${sorted.length} rows`}
          action={
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={issuesOnly} onChange={(e) => setIssuesOnly(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-ecoflo focus:ring-ecoflo" />
              Issues only
            </label>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="pb-2 font-medium">Service point</th>
                <th className="pb-2 font-medium">Region</th>
                <th className="pb-2 font-medium">Item</th>
                <th className="pb-2 text-right font-medium">On hand</th>
                <th className="pb-2 text-right font-medium">Reserved</th>
                <th className="pb-2 text-right font-medium">Reorder</th>
                <th className="pb-2 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r, i) => (
                <tr key={i} onClick={() => navigate(`/sp/${r.spId}`)} className="cursor-pointer border-t border-slate-100 hover:bg-slate-50">
                  <td className="py-2 font-medium text-navy">{r.spName}</td>
                  <td className="py-2 text-slate-500">{r.region}</td>
                  <td className="py-2 text-slate-600">{r.item}</td>
                  <td className="py-2 text-right text-slate-600">{r.onHand}</td>
                  <td className="py-2 text-right text-slate-600">{r.reserved}</td>
                  <td className="py-2 text-right text-slate-600">{r.reorderPoint}</td>
                  <td className="py-2 text-right"><StatusPill status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
