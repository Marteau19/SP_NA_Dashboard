import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { regions } from "../data/seedData";
import { buildSpView, trendSeries, GROUP_LABELS, SERVICE_TARGET } from "../lib/derive";
import { convert, money, pct, num } from "../lib/format";
import { Card, PageHeader, LeaderChip, StatusPill, SectionTitle, MixBullet } from "../components/common/ui";
import { MixDonut, RevenueTrend, CasesAgingChart } from "../components/charts/charts";

const STREAM_META = [
  { key: "systems", label: "Systems", note: "Product" },
  { key: "maintenance", label: "Maintenance", note: "Recurring" },
  { key: "fmr", label: "Filter media (FMR)", note: "Recurring" },
  { key: "service", label: "Service", note: "Recurring" },
] as const;

export default function ServicePointScorecard() {
  const { spId } = useParams();
  const { filters } = useApp();

  const found = useMemo(() => {
    for (const r of regions) {
      const sp = r.servicePoints.find((s) => s.id === spId);
      if (sp) return { region: r, sp };
    }
    return null;
  }, [spId]);

  const view = useMemo(() => (found ? buildSpView(found.sp, found.region, filters) : null), [found, filters]);
  const trend = useMemo(
    () => (found ? trendSeries([{ sp: found.sp, currency: found.region.currency }], filters.currency) : []),
    [found, filters.currency]
  );

  if (!found || !view) {
    return (
      <div className="py-20 text-center text-stone-500">
        Service point not found. <Link to="/" className="text-ecoflo underline">Back to network</Link>
      </div>
    );
  }

  const { region, sp } = found;
  const cur = filters.currency;
  const recurring = view.recurringRevenue;
  const product = view.systemsRevenue;
  const ratingFull = Math.round(sp.reviews.avgRating);

  return (
    <div>
      <PageHeader
        eyebrow={
          <Link to={`/region/${region.id}`} className="hover:underline">
            {GROUP_LABELS[region.group]} / {region.name}
          </Link>
        }
        title={view.name}
        meta={
          <span className="flex items-center gap-1.5">
            Lead <LeaderChip acr={sp.lead} />
          </span>
        }
        action={
          <div className="w-60">
            <div className="mb-1 flex justify-between text-xs text-stone-500">
              <span>Service mix</span>
              <span className="tabular-nums">Target {SERVICE_TARGET}%</span>
            </div>
            <MixBullet value={view.servicePct} />
          </div>
        }
      />

      {/* Contact (mock) */}
      <Card className="mb-6 p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ContactItem label="Phone" value={sp.contact.phone} href={`tel:${sp.contact.phone.replace(/[^\d]/g, "")}`} />
          <ContactItem label="Email" value={sp.contact.email} href={`mailto:${sp.contact.email}`} />
          <ContactItem label="Address" value={sp.contact.address} />
          <ContactItem label="Hours" value={sp.contact.hours} />
        </div>
      </Card>

      {/* Revenue streams */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {STREAM_META.map(({ key, label, note }) => {
          const stream = sp.streams[key];
          return (
            <Card key={key} className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium uppercase tracking-wider text-stone-500">{label}</p>
                <span className={`text-[11px] font-semibold uppercase tracking-wide ${note === "Product" ? "text-stone-400" : "text-ecoflo"}`}>{note}</span>
              </div>
              <p className="mt-2 text-2xl font-extrabold text-navy tabular-nums">{money(convert(stream.revenue, region.currency, cur), cur)}</p>
              <p className="text-xs text-stone-500 tabular-nums">{num(stream.count)} units</p>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Revenue mix donut */}
        <Card className="p-5">
          <SectionTitle title="Revenue mix" subtitle="Product vs recurring" />
          <MixDonut product={product} recurring={recurring} currency={cur} />
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border border-stone-200 p-3">
              <p className="flex items-center gap-1.5 text-xs text-stone-500"><span className="h-2.5 w-2.5 rounded-full bg-navy" /> Product</p>
              <p className="font-bold text-navy tabular-nums">{money(product, cur)}</p>
            </div>
            <div className="rounded-lg border border-stone-200 p-3">
              <p className="flex items-center gap-1.5 text-xs text-stone-500"><span className="h-2.5 w-2.5 rounded-full bg-ecoflo" /> Recurring</p>
              <p className="font-bold text-navy tabular-nums">{money(recurring, cur)}</p>
            </div>
          </div>
        </Card>

        {/* Trend */}
        <Card className="p-5 lg:col-span-2">
          <SectionTitle title="Revenue and service mix trend" subtitle="Bars are revenue, line is service mix vs the 35% target" />
          <RevenueTrend data={trend} currency={cur} />
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Performance vs target */}
        <Card className="p-5">
          <SectionTitle title="Performance vs target" />
          <span className="text-3xl font-extrabold text-navy tabular-nums">{money(view.revenue, cur)}</span>
          <p className="mt-1 text-xs text-stone-500 tabular-nums">Target {money(view.target, cur)}</p>
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs text-stone-500">
              <span>Attainment</span>
              <span className="font-semibold text-navy tabular-nums">{(view.targetRatio * 100).toFixed(0)}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-200">
              <div className="h-full rounded-full bg-navy" style={{ width: `${Math.min(100, view.targetRatio * 100)}%` }} />
            </div>
          </div>
          <div className="mt-4 rounded-lg border border-stone-200 p-3">
            <div className="mb-2 flex justify-between text-xs">
              <span className="text-stone-500">Service mix vs target</span>
              <span className="font-semibold text-navy tabular-nums">{SERVICE_TARGET}%</span>
            </div>
            <MixBullet value={view.servicePct} />
          </div>
        </Card>

        {/* $/km block */}
        <Card className="p-5">
          <SectionTitle title="Field efficiency ($/km)" subtitle="Service point level" />
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-navy tabular-nums">${view.revenuePerKm.toFixed(1)}</span>
            <span className="text-sm text-stone-500">/ km</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <Stat label="Km driven" value={num(sp.field.kmDriven)} />
            <Stat label="Route score" value={`${sp.field.routeScore}/100`} />
            <Stat label="Upsell rate" value={pct(sp.field.upsellRate * 100, 0)} />
            <Stat label="Jobs / route" value={sp.field.jobsPerRoute.toFixed(1)} />
          </div>
        </Card>

        {/* Reviews */}
        <Card className="p-5">
          <SectionTitle title="Reviews" subtitle={`${num(sp.reviews.count)} total reviews`} />
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-navy tabular-nums">{sp.reviews.avgRating.toFixed(1)}</span>
            <span className="text-sm text-stone-500">/ 5</span>
            <span className="ml-1 text-sm tracking-tight text-navy">
              {"★".repeat(ratingFull)}<span className="text-stone-300">{"★".repeat(5 - ratingFull)}</span>
            </span>
          </div>
          <div className="mt-4 space-y-2">
            {sp.reviews.recent.map((rv, i) => (
              <div key={i} className="rounded-lg border border-stone-200 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs tracking-tight text-navy">{"★".repeat(rv.rating)}<span className="text-stone-300">{"★".repeat(5 - rv.rating)}</span></span>
                  <span className="text-[11px] text-stone-400 tabular-nums">{rv.date}</span>
                </div>
                <p className="mt-1 text-sm text-stone-600">{rv.text}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Cases */}
        <Card className="p-5">
          <SectionTitle title="Support cases" subtitle={`Oldest open case ${sp.cases.oldestOpenDays} days`} />
          <div className="grid grid-cols-3 gap-3">
            <CaseStat label="Open" value={sp.cases.open} />
            <CaseStat label="In progress" value={sp.cases.inProgress} />
            <CaseStat label="Resolved" value={sp.cases.resolved} />
          </div>
          <p className="mb-1 mt-4 text-xs font-medium uppercase tracking-wide text-stone-500">Open case aging</p>
          <CasesAgingChart aging={sp.cases.aging} />
          {sp.cases.oldestOpenDays > 30 && (
            <p className="mt-2 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-medium text-rag-red">
              Flag: oldest open case exceeds 30 days.
            </p>
          )}
        </Card>

        {/* Inventory */}
        <Card className="p-5">
          <SectionTitle title="Inventory snapshot" subtitle="On-hand vs reorder point" />
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-stone-400">
                <th className="pb-2 font-medium">Item</th>
                <th className="pb-2 text-right font-medium">On hand</th>
                <th className="pb-2 text-right font-medium">Reserved</th>
                <th className="pb-2 text-right font-medium">Reorder</th>
                <th className="pb-2 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {sp.inventory.map((inv) => (
                <tr key={inv.item} className="border-t border-stone-100">
                  <td className="py-2 font-medium text-navy">{inv.item}</td>
                  <td className="py-2 text-right text-stone-600 tabular-nums">{inv.onHand}</td>
                  <td className="py-2 text-right text-stone-600 tabular-nums">{inv.reserved}</td>
                  <td className="py-2 text-right text-stone-600 tabular-nums">{inv.reorderPoint}</td>
                  <td className="py-2 text-right"><StatusPill status={inv.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-stone-200 p-3">
      <p className="text-xs text-stone-500">{label}</p>
      <p className="mt-0.5 font-bold text-navy tabular-nums">{value}</p>
    </div>
  );
}

function ContactItem({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-wider text-stone-400">{label}</p>
      {href ? (
        <a href={href} className="block truncate text-sm font-semibold text-navy hover:text-ecoflo">{value}</a>
      ) : (
        <p className="truncate text-sm font-semibold text-navy" title={value}>{value}</p>
      )}
    </div>
  );
}

function CaseStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-stone-200 p-3 text-center">
      <p className="text-2xl font-extrabold text-navy tabular-nums">{value}</p>
      <p className="text-[11px] uppercase tracking-wide text-stone-400">{label}</p>
    </div>
  );
}
