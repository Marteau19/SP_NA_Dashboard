import { useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { regions } from "../data/seedData";
import { buildRegionView, GROUP_LABELS, SERVICE_TARGET } from "../lib/derive";
import { money, pct } from "../lib/format";
import { Card, KpiCard, PageHeader, LeaderChip, MixBullet, SectionTitle } from "../components/common/ui";
import { RegionMap } from "../components/RegionMap";

export default function RegionView() {
  const { regionId } = useParams();
  const { filters } = useApp();
  const navigate = useNavigate();
  const region = regions.find((r) => r.id === regionId);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const view = useMemo(() => (region ? buildRegionView(region, filters) : null), [region, filters]);

  if (!region || !view) {
    return (
      <div className="py-20 text-center text-stone-500">
        Region not found. <Link to="/" className="text-ecoflo underline">Back to network</Link>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow={GROUP_LABELS[view.group]}
        title={view.name}
        meta={
          <>
            <span className="flex items-center gap-1.5">
              Intrapreneurs <LeaderChip acr={view.leaders[0]} /> <LeaderChip acr={view.leaders[1]} />
            </span>
            <span className="text-stone-300">|</span>
            <span>{view.spCount} service points</span>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Region revenue" value={money(view.revenue, filters.currency)} sub={`Target ${money(view.target, filters.currency)}`} />
        <KpiCard
          label="Service mix"
          value={pct(view.servicePct)}
          sub={`Target ${SERVICE_TARGET}%`}
          foot={<MixBullet value={view.servicePct} showValue={false} />}
        />
        <KpiCard label="Attainment" value={`${((view.revenue / view.target) * 100).toFixed(0)}%`} sub="of revenue target" />
        <KpiCard label="Open cases" value={String(view.openCases)} />
        <KpiCard label="Avg rating" value={view.avgRating.toFixed(1)} sub="out of 5" />
        <KpiCard label="Avg $/km" value={`$${view.avgRevPerKm.toFixed(1)}`} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="p-5">
          <SectionTitle title="Coverage map" subtitle="Service points and their approximate 100km service areas" />
          <RegionMap
            region={region}
            spViews={view.spViews}
            hoveredId={hoveredId}
            onHover={setHoveredId}
            onSelect={(id) => navigate(`/sp/${id}`)}
          />
        </Card>

        <div>
          <h2 className="mb-3 text-base font-bold tracking-tight text-navy">Service points</h2>
          <div className="grid grid-cols-1 gap-3">
            {view.spViews
              .slice()
              .sort((a, b) => b.revenue - a.revenue)
              .map((sp) => {
                const active = hoveredId === sp.id;
                return (
                  <div
                    key={sp.id}
                    onClick={() => navigate(`/sp/${sp.id}`)}
                    onMouseEnter={() => setHoveredId(sp.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={`cursor-pointer rounded-lg border bg-white p-4 transition-colors ${
                      active ? "border-ecoflo bg-stone-50" : "border-stone-200 hover:border-stone-300 hover:bg-stone-50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-navy">{sp.name}</p>
                        <p className="text-xs text-stone-500">Lead {sp.lead}</p>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-5 gap-2 text-center">
                      <Mini label="Revenue" value={money(sp.revenue, filters.currency)} />
                      <Mini label="Mix" value={pct(sp.servicePct)} />
                      <Mini label="$/km" value={`$${sp.revenuePerKm.toFixed(1)}`} />
                      <Mini label="Rating" value={sp.rating.toFixed(1)} />
                      <Mini label="Cases" value={String(sp.openCases)} />
                    </div>
                    <div className="mt-3">
                      <MixBullet value={sp.servicePct} showValue={false} />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-bold text-navy tabular-nums">{value}</p>
      <p className="text-[11px] uppercase tracking-wide text-stone-400">{label}</p>
    </div>
  );
}
