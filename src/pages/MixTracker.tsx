import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Target, TrendingUp, TrendingDown } from "lucide-react";
import { useApp } from "../context/AppContext";
import {
  networkTotals,
  allRegionViews,
  allSpViews,
  trendSeries,
  spsForRegionViews,
  SERVICE_TARGET,
} from "../lib/derive";
import { pct } from "../lib/format";
import { Card, PageHeader, RagBadge, Progress, SectionTitle } from "../components/common/ui";
import { MixTrajectory, HBarLeaderboard } from "../components/charts/charts";

export default function MixTracker() {
  const { filters } = useApp();
  const navigate = useNavigate();

  const totals = useMemo(() => networkTotals(filters), [filters]);
  const rViews = useMemo(() => allRegionViews(filters), [filters]);
  const sViews = useMemo(() => allSpViews(filters), [filters]);
  const trajectory = useMemo(
    () => trendSeries(spsForRegionViews(rViews), filters.currency),
    [rViews, filters.currency]
  );

  const ranked = useMemo(
    () => [...sViews].sort((a, b) => b.servicePct - a.servicePct),
    [sViews]
  );
  const leaders = ranked.filter((s) => s.servicePct >= SERVICE_TARGET);
  const laggards = ranked.filter((s) => s.servicePct < SERVICE_TARGET);

  const rankData = ranked.slice(0, 14).map((s) => ({
    label: s.name,
    value: s.servicePct,
    rag: s.mixRag,
  }));

  const gap = totals.servicePct - SERVICE_TARGET;

  return (
    <div>
      <PageHeader
        eyebrow="Strategic Mix Tracker"
        title="Service revenue share vs the 35% target"
        meta={<span>The strategic 2031 line is {SERVICE_TARGET}% recurring revenue.</span>}
        action={<RagBadge rag={totals.servicePct >= SERVICE_TARGET ? "green" : totals.servicePct >= SERVICE_TARGET - 7 ? "amber" : "red"} label={`${gap >= 0 ? "+" : ""}${gap.toFixed(1)} pts`} />}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="flex flex-col justify-center p-6">
          <div className="flex items-center gap-2 text-slate-500">
            <Target size={18} /> <span className="text-sm font-medium">Network service mix</span>
          </div>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-5xl font-extrabold text-navy">{pct(totals.servicePct)}</span>
            <span className="text-lg font-semibold text-slate-400">/ {SERVICE_TARGET}%</span>
          </div>
          <div className="mt-4"><Progress value={(totals.servicePct / SERVICE_TARGET) * 100} rag={totals.servicePct >= SERVICE_TARGET ? "green" : totals.servicePct >= SERVICE_TARGET - 7 ? "amber" : "red"} /></div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-ecoflo-50 p-3">
              <p className="flex items-center gap-1.5 text-xs text-ecoflo-700"><TrendingUp size={14} /> Leading</p>
              <p className="text-xl font-extrabold text-navy">{leaders.length}</p>
              <p className="text-xs text-slate-500">SPs at / above {SERVICE_TARGET}%</p>
            </div>
            <div className="rounded-lg bg-red-50 p-3">
              <p className="flex items-center gap-1.5 text-xs text-rag-red"><TrendingDown size={14} /> Lagging</p>
              <p className="text-xl font-extrabold text-navy">{laggards.length}</p>
              <p className="text-xs text-slate-500">SPs below {SERVICE_TARGET}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <SectionTitle title="Trajectory over time" subtitle="Network service mix by period against the target line" />
          <MixTrajectory data={trajectory} />
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <SectionTitle title="Region service mix" subtitle="Each region vs the 35% line" />
          <div className="space-y-3">
            {[...rViews].sort((a, b) => b.servicePct - a.servicePct).map((r) => (
              <button key={r.id} onClick={() => navigate(`/region/${r.id}`)} className="block w-full text-left">
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-navy">{r.name}</span>
                  <span className="font-semibold text-slate-500">{pct(r.servicePct)}</span>
                </div>
                <Progress value={(r.servicePct / SERVICE_TARGET) * 100} rag={r.mixRag} />
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <SectionTitle title="Lead vs lag ranking" subtitle="Service points ordered around the 35% line" />
          <HBarLeaderboard data={rankData} kind="mix" height={380} />
        </Card>
      </div>
    </div>
  );
}
