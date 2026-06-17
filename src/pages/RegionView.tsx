import { useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { DollarSign, Target, FolderOpen, Star, Route, ChevronRight } from "lucide-react";
import { useApp } from "../context/AppContext";
import { regions } from "../data/seedData";
import { buildRegionView, GROUP_LABELS, SERVICE_TARGET } from "../lib/derive";
import { money, pct } from "../lib/format";
import { Card, KpiCard, PageHeader, RagBadge, RagDot, LeaderChip, Progress, SectionTitle } from "../components/common/ui";
import { RegionMap } from "../components/RegionMap";

export default function RegionView() {
  const { regionId } = useParams();
  const { filters } = useApp();
  const navigate = useNavigate();
  const region = regions.find((r) => r.id === regionId);

  const view = useMemo(() => (region ? buildRegionView(region, filters) : null), [region, filters]);

  if (!region || !view) {
    return (
      <div className="py-20 text-center text-slate-500">
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
            <span className="text-slate-300">|</span>
            <span>{view.spCount} service points</span>
          </>
        }
        action={<RagBadge rag={view.mixRag} label={`${pct(view.servicePct)} service mix`} />}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Region revenue" value={money(view.revenue, filters.currency)} icon={<DollarSign size={16} />} sub={`Target ${money(view.target, filters.currency)}`} accent={view.revenueRag} />
        <KpiCard label="Service mix" value={pct(view.servicePct)} icon={<Target size={16} />} accent={view.mixRag} sub={`Target ${SERVICE_TARGET}%`} />
        <KpiCard label="Target" value={`${SERVICE_TARGET}%`} sub="Strategic 2031 line" />
        <KpiCard label="Open cases" value={String(view.openCases)} icon={<FolderOpen size={16} />} />
        <KpiCard label="Avg rating" value={view.avgRating.toFixed(1)} icon={<Star size={16} />} sub="out of 5" />
        <KpiCard label="Avg $/km" value={`$${view.avgRevPerKm.toFixed(1)}`} icon={<Route size={16} />} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="p-5">
          <SectionTitle title="Coverage map" subtitle="Service points and their approximate 100km service areas" />
          <RegionMap region={region} spViews={view.spViews} onSelect={(id) => navigate(`/sp/${id}`)} />
        </Card>

        <div>
          <h2 className="mb-3 text-lg font-bold text-navy">Service points</h2>
          <div className="grid grid-cols-1 gap-3">
            {view.spViews
              .slice()
              .sort((a, b) => b.revenue - a.revenue)
              .map((sp) => (
                <Card key={sp.id} onClick={() => navigate(`/sp/${sp.id}`)} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <RagDot rag={sp.mixRag} />
                  <div>
                    <p className="font-semibold text-navy">{sp.name}</p>
                    <p className="text-xs text-slate-500">Lead {sp.lead}</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-300" />
              </div>
              <div className="mt-3 grid grid-cols-5 gap-2 text-center">
                <Mini label="Revenue" value={money(sp.revenue, filters.currency)} />
                <Mini label="Mix" value={pct(sp.servicePct)} />
                <Mini label="$/km" value={`$${sp.revenuePerKm.toFixed(1)}`} />
                <Mini label="Rating" value={sp.rating.toFixed(1)} />
                <Mini label="Cases" value={String(sp.openCases)} />
              </div>
              <div className="mt-3">
                <Progress value={(sp.servicePct / SERVICE_TARGET) * 100} rag={sp.mixRag} />
              </div>
                </Card>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-bold text-navy">{value}</p>
      <p className="text-[11px] uppercase tracking-wide text-slate-400">{label}</p>
    </div>
  );
}
