import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Map as MapIcon, Grid2x2 } from "lucide-react";
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
import { Card, KpiCard, PageHeader, MixBullet } from "../components/common/ui";
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
        title="North-America - Service Point Network"
        meta={
          <>
            <span>As of {PERIODS[filters.periodIndex]}</span>
            <span className="text-stone-300">|</span>
            <span>{totals.regionCount} regions, {totals.spCount} service points</span>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Network revenue" value={money(totals.revenue, filters.currency)} sub={`Target ${money(totals.target, filters.currency)}`} />
        <KpiCard
          label="Service mix"
          value={pct(totals.servicePct)}
          sub={`${mixGap >= 0 ? "+" : ""}${mixGap.toFixed(1)} pts vs ${SERVICE_TARGET}%`}
          foot={<MixBullet value={totals.servicePct} showValue={false} />}
        />
        <KpiCard label="Regions" value={num(totals.regionCount)} />
        <KpiCard label="Service points" value={num(totals.spCount)} />
        <KpiCard label="Systems installed" value={num(totals.systems)} />
        <KpiCard label="Maintenance contracts" value={num(totals.maintenanceContracts)} />
      </div>

      {/* Map hero */}
      <Card className="mt-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-3.5">
          <div>
            <h2 className="text-base font-bold tracking-tight text-navy">Regional footprint</h2>
            <p className="text-sm text-stone-500">Scroll to zoom, drag to pan, click a region to drill in</p>
          </div>
          <div className="flex overflow-hidden rounded-lg border border-stone-200 text-sm font-medium">
            <button
              onClick={() => setView("map")}
              className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${view === "map" ? "bg-navy text-white" : "bg-white text-stone-500 hover:bg-stone-50"}`}
            >
              <MapIcon size={15} /> Map
            </button>
            <button
              onClick={() => setView("grid")}
              className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${view === "grid" ? "bg-navy text-white" : "bg-white text-stone-500 hover:bg-stone-50"}`}
            >
              <Grid2x2 size={15} /> Grid
            </button>
          </div>
        </div>
        <div className="h-[62vh] min-h-[420px] w-full">
          {view === "map" ? (
            <NetworkMap regionViews={allRegionViews} currency={filters.currency} onSelect={(id) => navigate(`/region/${id}`)} />
          ) : (
            <div className="grid h-full grid-cols-1 gap-2 overflow-y-auto p-5 sm:grid-cols-2 lg:grid-cols-3">
              {allRegionViews
                .slice()
                .sort((a, b) => b.revenue - a.revenue)
                .map((r) => (
                  <button
                    key={r.id}
                    onClick={() => navigate(`/region/${r.id}`)}
                    className="rounded-lg border border-stone-200 p-3 text-left transition-colors hover:border-stone-300 hover:bg-stone-50"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-navy">{r.name}</p>
                        <p className="text-xs text-stone-500">{GROUP_LABELS[r.group]} - {r.spCount} SPs</p>
                      </div>
                      <p className="text-sm font-bold text-navy tabular-nums">{money(r.revenue, filters.currency)}</p>
                    </div>
                    <div className="mt-3">
                      <MixBullet value={r.servicePct} />
                    </div>
                  </button>
                ))}
            </div>
          )}
        </div>
      </Card>

      {/* What changed */}
      <div className="mt-6">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-500">What changed</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {digest.topMover && (
            <DigestTile
              kicker="Top mover"
              value={`${digest.topMover.deltaPct >= 0 ? "+" : ""}${digest.topMover.deltaPct.toFixed(1)}%`}
              body={`${digest.topMover.name} revenue vs prior period`}
              onClick={() => navigate(`/sp/${digest.topMover!.spId}`)}
            />
          )}
          {digest.mixGainer && (
            <DigestTile
              kicker="Biggest mix gain"
              value={`${digest.mixGainer.delta >= 0 ? "+" : ""}${digest.mixGainer.delta.toFixed(1)} pts`}
              body={`${digest.mixGainer.name} service mix`}
              onClick={() => navigate(`/sp/${digest.mixGainer!.spId}`)}
            />
          )}
          <DigestTile
            kicker="Inventory alerts"
            value={num(digest.lowStockCount)}
            body="Items low or out of stock"
            onClick={() => navigate("/inventory")}
          />
          <DigestTile
            kicker="Aging cases"
            value={num(digest.agingCaseCount)}
            body="SPs with a case over 30 days"
            onClick={() => navigate("/reviews")}
          />
        </div>
      </div>

      {/* Region groups */}
      <div className="mt-8 space-y-6">
        {groups.map((g) => (
          <div key={g.group}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-500">{GROUP_LABELS[g.group]}</h2>
              <div className="flex items-center gap-5 text-sm">
                <span className="text-stone-500">{g.regions.length} regions, {g.spCount} SPs</span>
                <span className="font-bold text-navy tabular-nums">{money(g.revenue, filters.currency)}</span>
                <span className="w-32"><MixBullet value={g.servicePct} /></span>
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
                        <p className="text-xs text-stone-500">Led by {r.leaders[0]} & {r.leaders[1]}</p>
                      </div>
                      <span className="text-xs text-stone-400 tabular-nums">{r.spCount} SPs</span>
                    </div>
                    <p className="mt-3 text-2xl font-extrabold text-navy tabular-nums">{money(r.revenue, filters.currency)}</p>
                    <div className="mt-3">
                      <div className="mb-1 flex justify-between text-xs text-stone-500">
                        <span>Service mix</span>
                        <span className="tabular-nums">Target {SERVICE_TARGET}%</span>
                      </div>
                      <MixBullet value={r.servicePct} />
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

function DigestTile({
  kicker,
  value,
  body,
  onClick,
}: {
  kicker: string;
  value: string;
  body: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg border border-stone-200 bg-white p-4 text-left transition-colors hover:border-stone-300 hover:bg-stone-50"
    >
      <p className="text-[11px] font-semibold uppercase tracking-wider text-ecoflo">{kicker}</p>
      <p className="mt-1.5 text-2xl font-extrabold text-navy tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-stone-500">{body}</p>
    </button>
  );
}
