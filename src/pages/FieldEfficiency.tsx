import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Gauge, Route, TrendingUp, ClipboardList, Navigation } from "lucide-react";
import { useApp } from "../context/AppContext";
import { allSpViews, allRegionViews } from "../lib/derive";
import { pct, num } from "../lib/format";
import { Card, KpiCard, PageHeader, SectionTitle } from "../components/common/ui";
import { HBarLeaderboard } from "../components/charts/charts";

export default function FieldEfficiency() {
  const { filters } = useApp();
  const navigate = useNavigate();
  const sViews = useMemo(() => allSpViews(filters), [filters]);
  const rViews = useMemo(() => allRegionViews(filters), [filters]);

  const avgKm = sViews.reduce((s, v) => s + v.revenuePerKm, 0) / (sViews.length || 1);
  const best = [...sViews].sort((a, b) => b.revenuePerKm - a.revenuePerKm)[0];
  const avgRoute = sViews.reduce((s, v) => s + v.routeScore, 0) / (sViews.length || 1);
  const avgUpsell = sViews.reduce((s, v) => s + v.upsellRate, 0) / (sViews.length || 1);
  const avgJobs = sViews.reduce((s, v) => s + v.jobsPerRoute, 0) / (sViews.length || 1);
  const totalKm = sViews.reduce((s, v) => s + v.kmDriven, 0);

  const spBoard = [...sViews]
    .sort((a, b) => b.revenuePerKm - a.revenuePerKm)
    .slice(0, 14)
    .map((v) => ({ label: v.name, value: v.revenuePerKm }));

  const regionBoard = [...rViews]
    .sort((a, b) => b.avgRevPerKm - a.avgRevPerKm)
    .map((r) => ({ label: r.name, value: r.avgRevPerKm }));

  return (
    <div>
      <PageHeader
        eyebrow="Field Efficiency"
        title="Revenue per kilometer driven"
        meta={<span>Headline field metric, measured at the service point level. No technician drill.</span>}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Network avg $/km" value={`$${avgKm.toFixed(1)}`} icon={<Gauge size={16} />} />
        <KpiCard label="Best SP" value={`$${best ? best.revenuePerKm.toFixed(1) : "0"}`} sub={best?.name} icon={<TrendingUp size={16} />} />
        <KpiCard label="Avg route score" value={`${avgRoute.toFixed(0)}/100`} icon={<Navigation size={16} />} />
        <KpiCard label="Avg upsell rate" value={pct(avgUpsell * 100, 0)} icon={<TrendingUp size={16} />} />
        <KpiCard label="Avg jobs / route" value={avgJobs.toFixed(1)} icon={<ClipboardList size={16} />} />
        <KpiCard label="Total km driven" value={num(totalKm)} icon={<Route size={16} />} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <SectionTitle title="$/km leaderboard - service points" subtitle="Top performers by revenue per km" />
          <HBarLeaderboard data={spBoard} kind="perKm" height={380} />
        </Card>
        <Card className="p-5">
          <SectionTitle title="$/km leaderboard - regions" subtitle="Region averages" />
          <HBarLeaderboard data={regionBoard} kind="perKm" height={380} />
        </Card>
      </div>

      <Card className="mt-6 p-5">
        <SectionTitle title="Efficiency drivers" subtitle="What sits behind the $/km figure at each service point" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="pb-2 font-medium">Service point</th>
                <th className="pb-2 text-right font-medium">$/km</th>
                <th className="pb-2 text-right font-medium">Route score</th>
                <th className="pb-2 text-right font-medium">Upsell rate</th>
                <th className="pb-2 text-right font-medium">Jobs / route</th>
                <th className="pb-2 text-right font-medium">Km driven</th>
              </tr>
            </thead>
            <tbody>
              {[...sViews].sort((a, b) => b.revenuePerKm - a.revenuePerKm).map((v) => (
                <tr
                  key={v.id}
                  onClick={() => navigate(`/sp/${v.id}`)}
                  className="cursor-pointer border-t border-slate-100 hover:bg-slate-50"
                >
                  <td className="py-2 font-medium text-navy">{v.name}</td>
                  <td className="py-2 text-right font-semibold text-navy">${v.revenuePerKm.toFixed(1)}</td>
                  <td className="py-2 text-right text-slate-600">{v.routeScore}</td>
                  <td className="py-2 text-right text-slate-600">{pct(v.upsellRate * 100, 0)}</td>
                  <td className="py-2 text-right text-slate-600">{v.jobsPerRoute.toFixed(1)}</td>
                  <td className="py-2 text-right text-slate-600">{num(v.kmDriven)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
