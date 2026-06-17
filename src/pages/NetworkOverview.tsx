import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DollarSign,
  Target,
  Map as MapIcon,
  Grid2x2,
  Layers,
  Wrench,
  Building2,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  PackageX,
  Clock,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import {
  networkTotals,
  groupSummaries,
  buildDigest,
  GROUP_LABELS,
  SERVICE_TARGET,
  PERIODS,
} from "../lib/derive";
import { money, pct, num } from "../lib/format";
import { Card, KpiCard, PageHeader, RagBadge, RagDot, Progress } from "../components/common/ui";
import { NetworkMap } from "../components/NetworkMap";

export default function NetworkOverview() {
  const { filters } = useApp();
  const navigate = useNavigate();
  const [view, setView] = useState<"map" | "grid">("map");

  const totals = useMemo(() => networkTotals(filters), [filters]);
  const groups = useMemo(() => groupSummaries(filters), [filters]);
  const digest = useMemo(() => buildDigest(filters), [filters]);
  const allRegionViews = useMemo(() => groups.flatMap((g) => g.regions), [groups]);

  const mixGap = totals.servicePct - SERVICE_TARGET;

  return (
    <div>
      <PageHeader
        eyebrow="Network Overview"
        title="North American Service Point Network"
        meta={
          <>
            <span>As of {PERIODS[filters.periodIndex]}</span>
            <span className="text-slate-300">|</span>
            <span>{totals.regionCount} regions, {totals.spCount} service points</span>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Network revenue" value={money(totals.revenue, filters.currency)} icon={<DollarSign size={16} />} sub={`Target ${money(totals.target, filters.currency)}`} />
        <KpiCard
          label="Service mix"
          value={pct(totals.servicePct)}
          accent={totals.servicePct >= SERVICE_TARGET ? "green" : totals.servicePct >= SERVICE_TARGET - 7 ? "amber" : "red"}
          icon={<Target size={16} />}
          sub={`${mixGap >= 0 ? "+" : ""}${mixGap.toFixed(1)} pts vs ${SERVICE_TARGET}%`}
        />
        <KpiCard label="Regions" value={num(totals.regionCount)} icon={<Building2 size={16} />} />
        <KpiCard label="Service points" value={num(totals.spCount)} icon={<MapIcon size={16} />} />
        <KpiCard label="Systems installed" value={num(totals.systems)} icon={<Layers size={16} />} />
        <KpiCard label="Maintenance contracts" value={num(totals.maintenanceContracts)} icon={<Wrench size={16} />} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
            <h2 className="font-bold text-navy">Regional footprint</h2>
            <div className="flex overflow-hidden rounded-lg border border-slate-200 text-sm font-medium">
              <button
                onClick={() => setView("map")}
                className={`flex items-center gap-1.5 px-3 py-1.5 ${view === "map" ? "bg-navy text-white" : "bg-white text-slate-500"}`}
              >
                <MapIcon size={15} /> Map
              </button>
              <button
                onClick={() => setView("grid")}
                className={`flex items-center gap-1.5 px-3 py-1.5 ${view === "grid" ? "bg-navy text-white" : "bg-white text-slate-500"}`}
              >
                <Grid2x2 size={15} /> Grid
              </button>
            </div>
          </div>
          <div className="p-5">
            {view === "map" ? (
              <NetworkMap regionViews={allRegionViews} currency={filters.currency} onSelect={(id) => navigate(`/region/${id}`)} />
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {allRegionViews
                  .slice()
                  .sort((a, b) => b.revenue - a.revenue)
                  .map((r) => (
                    <button
                      key={r.id}
                      onClick={() => navigate(`/region/${r.id}`)}
                      className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-left hover:border-ecoflo/40 hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-2.5">
                        <RagDot rag={r.mixRag} />
                        <div>
                          <p className="text-sm font-semibold text-navy">{r.name}</p>
                          <p className="text-xs text-slate-500">{GROUP_LABELS[r.group]} - {r.spCount} SPs</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-navy">{money(r.revenue, filters.currency)}</p>
                        <p className="text-xs text-slate-500">{pct(r.servicePct)} mix</p>
                      </div>
                    </button>
                  ))}
              </div>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles size={18} className="text-ecoflo" />
            <h2 className="font-bold text-navy">What changed</h2>
          </div>
          <p className="mb-4 text-xs text-slate-500">
            Highlights since the prior period ({PERIODS[Math.max(0, filters.periodIndex - 1)]}).
          </p>
          <div className="space-y-3">
            {digest.topMover && (
              <DigestRow
                icon={<ArrowUpRight size={16} className="text-ecoflo" />}
                title="Top mover"
                body={`${digest.topMover.name} grew ${digest.topMover.deltaPct.toFixed(1)}% in revenue.`}
                onClick={() => navigate(`/sp/${digest.topMover!.spId}`)}
              />
            )}
            {digest.mixGainer && (
              <DigestRow
                icon={<TrendingUp size={16} className="text-ecoflo" />}
                title="Biggest mix gain"
                body={`${digest.mixGainer.name} lifted service mix by ${digest.mixGainer.delta.toFixed(1)} pts.`}
                onClick={() => navigate(`/sp/${digest.mixGainer!.spId}`)}
              />
            )}
            <DigestRow
              icon={<PackageX size={16} className="text-rag-amber" />}
              title="Inventory alerts"
              body={`${digest.lowStockCount} items low or out of stock across the network.`}
              onClick={() => navigate("/inventory")}
            />
            <DigestRow
              icon={<Clock size={16} className="text-rag-red" />}
              title="Aging cases"
              body={`${digest.agingCaseCount} SPs have an open case older than 30 days.`}
              onClick={() => navigate("/reviews")}
            />
          </div>
        </Card>
      </div>

      <div className="mt-6 space-y-5">
        {groups.map((g) => (
          <div key={g.group}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">{GROUP_LABELS[g.group]}</h2>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-slate-500">{g.regions.length} regions, {g.spCount} SPs</span>
                <span className="font-bold text-navy">{money(g.revenue, filters.currency)}</span>
                <RagBadge rag={g.servicePct >= SERVICE_TARGET ? "green" : g.servicePct >= SERVICE_TARGET - 7 ? "amber" : "red"} label={`${pct(g.servicePct)} mix`} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {g.regions
                .slice()
                .sort((a, b) => b.revenue - a.revenue)
                .map((r) => (
                  <Card key={r.id} onClick={() => navigate(`/region/${r.id}`)} className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-navy">{r.name}</p>
                        <p className="text-xs text-slate-500">
                          Led by {r.leaders[0]} & {r.leaders[1]}
                        </p>
                      </div>
                      <RagDot rag={r.mixRag} />
                    </div>
                    <div className="mt-3 flex items-baseline justify-between">
                      <span className="text-xl font-extrabold text-navy">{money(r.revenue, filters.currency)}</span>
                      <span className="text-xs text-slate-500">{r.spCount} SPs</span>
                    </div>
                    <div className="mt-3">
                      <div className="mb-1 flex justify-between text-xs text-slate-500">
                        <span>Service mix</span>
                        <span className="font-semibold text-navy">{pct(r.servicePct)} / {SERVICE_TARGET}%</span>
                      </div>
                      <Progress value={(r.servicePct / SERVICE_TARGET) * 100} rag={r.mixRag} />
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DigestRow({
  icon,
  title,
  body,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="flex w-full items-start gap-3 rounded-lg border border-slate-100 p-3 text-left hover:bg-slate-50">
      <span className="mt-0.5">{icon}</span>
      <div>
        <p className="text-sm font-semibold text-navy">{title}</p>
        <p className="text-xs text-slate-500">{body}</p>
      </div>
    </button>
  );
}
