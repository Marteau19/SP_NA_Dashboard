import {
  regions,
  network,
  type Region,
  type RegionGroup,
  type ServicePoint,
  type Currency,
} from "../data/seedData";
import { convert } from "./format";

export const SERVICE_TARGET = network.serviceTarget; // 35

export type GroupFilter = RegionGroup | "ALL";
export type Rag = "green" | "amber" | "red";

export interface Filters {
  group: GroupFilter;
  periodIndex: number;
  currency: Currency;
}

// Period labels come straight from the seed history so nothing is hardcoded.
export const PERIODS: string[] = regions[0].servicePoints[0].history.map((h) => h.period);
export const LATEST_PERIOD_INDEX = PERIODS.length - 1;

export const GROUP_LABELS: Record<RegionGroup, string> = {
  QC: "Quebec",
  "CAN-EN": "Canada (English)",
  USA: "United States",
};
export const GROUP_ORDER: RegionGroup[] = ["QC", "CAN-EN", "USA"];

// --- RAG helpers -----------------------------------------------------------

// Service-mix health relative to the strategic line (default 35%).
export function mixRag(servicePct: number, target = SERVICE_TARGET): Rag {
  if (servicePct >= target) return "green";
  if (servicePct >= target - 7) return "amber";
  return "red";
}

// Revenue performance vs its own target.
export function revenueRag(revenue: number, target: number): Rag {
  const ratio = revenue / target;
  if (ratio >= 1) return "green";
  if (ratio >= 0.9) return "amber";
  return "red";
}

export const RAG_HEX: Record<Rag, string> = {
  green: "#64A70B",
  amber: "#E0A106",
  red: "#D14343",
};

// --- Period-aware native metrics ------------------------------------------

export interface SpMetrics {
  revenue: number;
  recurring: number;
  systems: number;
  servicePct: number;
}

// Native-currency metrics for an SP at a given period, derived from history.
export function spMetricsAt(sp: ServicePoint, periodIndex: number): SpMetrics {
  const h = sp.history[periodIndex] ?? sp.history[sp.history.length - 1];
  const recurring = (h.revenue * h.servicePct) / 100;
  return {
    revenue: h.revenue,
    recurring,
    systems: h.revenue - recurring,
    servicePct: h.servicePct,
  };
}

// --- View models -----------------------------------------------------------

export interface SpView {
  id: string;
  name: string;
  lead: string;
  region: Region;
  regionId: string;
  regionName: string;
  group: RegionGroup;
  revenue: number; // display currency, at selected period
  target: number; // display currency
  targetRatio: number;
  servicePct: number;
  systemsRevenue: number;
  recurringRevenue: number;
  revenuePerKm: number; // display currency
  kmDriven: number;
  routeScore: number;
  upsellRate: number;
  jobsPerRoute: number;
  rating: number;
  reviewCount: number;
  openCases: number;
  oldestOpenDays: number;
  inventoryAlerts: number;
  mixRag: Rag;
  revenueRag: Rag;
  sp: ServicePoint;
}

export function buildSpView(sp: ServicePoint, region: Region, f: Filters): SpView {
  const m = spMetricsAt(sp, f.periodIndex);
  const cur = region.currency;
  const revenue = convert(m.revenue, cur, f.currency);
  const target = convert(sp.target, cur, f.currency);
  const inventoryAlerts = sp.inventory.filter((i) => i.status !== "ok").length;
  return {
    id: sp.id,
    name: sp.name,
    lead: sp.lead,
    region,
    regionId: region.id,
    regionName: region.name,
    group: region.group,
    revenue,
    target,
    targetRatio: revenue / target,
    servicePct: m.servicePct,
    systemsRevenue: convert(m.systems, cur, f.currency),
    recurringRevenue: convert(m.recurring, cur, f.currency),
    revenuePerKm: convert(sp.field.revenuePerKm, cur, f.currency),
    kmDriven: sp.field.kmDriven,
    routeScore: sp.field.routeScore,
    upsellRate: sp.field.upsellRate,
    jobsPerRoute: sp.field.jobsPerRoute,
    rating: sp.reviews.avgRating,
    reviewCount: sp.reviews.count,
    openCases: sp.cases.open,
    oldestOpenDays: sp.cases.oldestOpenDays,
    inventoryAlerts,
    mixRag: mixRag(m.servicePct),
    revenueRag: revenueRag(revenue, target),
    sp,
  };
}

export function visibleRegions(group: GroupFilter): Region[] {
  return group === "ALL" ? regions : regions.filter((r) => r.group === group);
}

export function allSpViews(f: Filters): SpView[] {
  return visibleRegions(f.group).flatMap((r) =>
    r.servicePoints.map((sp) => buildSpView(sp, r, f))
  );
}

export interface RegionView {
  region: Region;
  id: string;
  name: string;
  group: RegionGroup;
  leaders: [string, string];
  spCount: number;
  revenue: number;
  target: number;
  servicePct: number;
  openCases: number;
  avgRating: number;
  avgRevPerKm: number;
  mixRag: Rag;
  revenueRag: Rag;
  spViews: SpView[];
}

export function buildRegionView(region: Region, f: Filters): RegionView {
  const spViews = region.servicePoints.map((sp) => buildSpView(sp, region, f));
  const revenue = spViews.reduce((s, v) => s + v.revenue, 0);
  const target = spViews.reduce((s, v) => s + v.target, 0);
  const recurring = spViews.reduce((s, v) => s + v.recurringRevenue, 0);
  const servicePct = revenue ? (recurring / revenue) * 100 : 0;
  return {
    region,
    id: region.id,
    name: region.name,
    group: region.group,
    leaders: region.leaders,
    spCount: spViews.length,
    revenue,
    target,
    servicePct,
    openCases: spViews.reduce((s, v) => s + v.openCases, 0),
    avgRating: spViews.reduce((s, v) => s + v.rating, 0) / spViews.length,
    avgRevPerKm: spViews.reduce((s, v) => s + v.revenuePerKm, 0) / spViews.length,
    mixRag: mixRag(servicePct),
    revenueRag: revenueRag(revenue, target),
    spViews,
  };
}

export function allRegionViews(f: Filters): RegionView[] {
  return visibleRegions(f.group).map((r) => buildRegionView(r, f));
}

export interface NetworkTotals {
  revenue: number;
  target: number;
  servicePct: number;
  regionCount: number;
  spCount: number;
  systems: number;
  maintenanceContracts: number;
  openCases: number;
  avgRating: number;
  avgRevPerKm: number;
}

export function networkTotals(f: Filters): NetworkTotals {
  const rViews = allRegionViews(f);
  const sViews = rViews.flatMap((r) => r.spViews);
  const revenue = rViews.reduce((s, r) => s + r.revenue, 0);
  const recurring = sViews.reduce((s, v) => s + v.recurringRevenue, 0);
  return {
    revenue,
    target: rViews.reduce((s, r) => s + r.target, 0),
    servicePct: revenue ? (recurring / revenue) * 100 : 0,
    regionCount: rViews.length,
    spCount: sViews.length,
    systems: sViews.reduce((s, v) => s + v.sp.streams.systems.count, 0),
    maintenanceContracts: sViews.reduce((s, v) => s + v.sp.streams.maintenance.count, 0),
    openCases: sViews.reduce((s, v) => s + v.openCases, 0),
    avgRating: sViews.length ? sViews.reduce((s, v) => s + v.rating, 0) / sViews.length : 0,
    avgRevPerKm: sViews.length ? sViews.reduce((s, v) => s + v.revenuePerKm, 0) / sViews.length : 0,
  };
}

export interface GroupSummary {
  group: RegionGroup;
  regions: RegionView[];
  revenue: number;
  servicePct: number;
  spCount: number;
}

export function groupSummaries(f: Filters): GroupSummary[] {
  const rViews = allRegionViews(f);
  return GROUP_ORDER.filter((g) => rViews.some((r) => r.group === g)).map((group) => {
    const inGroup = rViews.filter((r) => r.group === group);
    const revenue = inGroup.reduce((s, r) => s + r.revenue, 0);
    const recurring = inGroup.reduce(
      (s, r) => s + r.spViews.reduce((a, v) => a + v.recurringRevenue, 0),
      0
    );
    return {
      group,
      regions: inGroup,
      revenue,
      servicePct: revenue ? (recurring / revenue) * 100 : 0,
      spCount: inGroup.reduce((s, r) => s + r.spCount, 0),
    };
  });
}

// --- Trajectory series (network / region / sp) ----------------------------

export interface TrendPoint {
  period: string;
  revenue: number;
  servicePct: number;
}

// Period-by-period series for a set of SPs, normalized to display currency.
export function trendSeries(sps: { sp: ServicePoint; currency: Currency }[], currency: Currency): TrendPoint[] {
  return PERIODS.map((period, i) => {
    let revenue = 0;
    let recurring = 0;
    for (const { sp, currency: cur } of sps) {
      const m = spMetricsAt(sp, i);
      revenue += convert(m.revenue, cur, currency);
      recurring += convert(m.recurring, cur, currency);
    }
    return {
      period,
      revenue,
      servicePct: revenue ? Number(((recurring / revenue) * 100).toFixed(1)) : 0,
    };
  });
}

export function spsForRegionViews(rViews: RegionView[]): { sp: ServicePoint; currency: Currency }[] {
  return rViews.flatMap((r) => r.spViews.map((v) => ({ sp: v.sp, currency: r.region.currency })));
}

// --- Alerts ----------------------------------------------------------------

export type AlertSeverity = "high" | "medium";
export type AlertCategory = "performance" | "field" | "inventory" | "cases";

export interface Alert {
  id: string;
  severity: AlertSeverity;
  category: AlertCategory;
  title: string;
  detail: string;
  spId?: string;
  regionId?: string;
}

export function buildAlerts(f: Filters): Alert[] {
  const sViews = allSpViews(f);
  const alerts: Alert[] = [];

  // Low $/km threshold = 25th percentile across the visible network.
  const perKmSorted = [...sViews].map((v) => v.revenuePerKm).sort((a, b) => a - b);
  const lowKmThreshold = perKmSorted.length
    ? perKmSorted[Math.floor(perKmSorted.length * 0.25)]
    : 0;

  for (const v of sViews) {
    if (v.revenueRag === "red") {
      alerts.push({
        id: `perf-${v.id}`,
        severity: "high",
        category: "performance",
        title: `${v.name} is below target`,
        detail: `Tracking at ${(v.targetRatio * 100).toFixed(0)}% of revenue target.`,
        spId: v.id,
        regionId: v.regionId,
      });
    }
    if (v.revenuePerKm <= lowKmThreshold) {
      alerts.push({
        id: `km-${v.id}`,
        severity: "medium",
        category: "field",
        title: `${v.name} has low $/km`,
        detail: `Field efficiency at ${v.revenuePerKm.toFixed(1)}/km, bottom quartile.`,
        spId: v.id,
        regionId: v.regionId,
      });
    }
    if (v.oldestOpenDays > 30) {
      alerts.push({
        id: `case-${v.id}`,
        severity: "medium",
        category: "cases",
        title: `${v.name} has an aging case`,
        detail: `Oldest open case is ${v.oldestOpenDays} days old.`,
        spId: v.id,
        regionId: v.regionId,
      });
    }
    for (const inv of v.sp.inventory) {
      if (inv.status === "out") {
        alerts.push({
          id: `inv-out-${v.id}-${inv.item}`,
          severity: "high",
          category: "inventory",
          title: `${inv.item} out of stock`,
          detail: `${v.name} has 0 on hand (reorder at ${inv.reorderPoint}).`,
          spId: v.id,
          regionId: v.regionId,
        });
      } else if (inv.status === "low") {
        alerts.push({
          id: `inv-low-${v.id}-${inv.item}`,
          severity: "medium",
          category: "inventory",
          title: `${inv.item} low`,
          detail: `${v.name} at ${inv.onHand} on hand (reorder at ${inv.reorderPoint}).`,
          spId: v.id,
          regionId: v.regionId,
        });
      }
    }
  }

  const rank = { high: 0, medium: 1 };
  return alerts.sort((a, b) => rank[a.severity] - rank[b.severity]);
}

// --- "What changed" digest -------------------------------------------------

export interface Digest {
  topMover: { name: string; spId: string; regionId: string; deltaPct: number } | null;
  mixGainer: { name: string; spId: string; regionId: string; delta: number } | null;
  lowStockCount: number;
  agingCaseCount: number;
}

export function buildDigest(f: Filters): Digest {
  const last = LATEST_PERIOD_INDEX;
  const prev = Math.max(0, last - 1);
  const sViews = allSpViews(f);

  let topMover: Digest["topMover"] = null;
  let mixGainer: Digest["mixGainer"] = null;

  for (const v of sViews) {
    const cur = v.region.currency;
    const rNow = convert(spMetricsAt(v.sp, last).revenue, cur, f.currency);
    const rPrev = convert(spMetricsAt(v.sp, prev).revenue, cur, f.currency);
    const deltaPct = rPrev ? ((rNow - rPrev) / rPrev) * 100 : 0;
    if (!topMover || deltaPct > topMover.deltaPct) {
      topMover = { name: v.name, spId: v.id, regionId: v.regionId, deltaPct };
    }
    const mixDelta = spMetricsAt(v.sp, last).servicePct - spMetricsAt(v.sp, prev).servicePct;
    if (!mixGainer || mixDelta > mixGainer.delta) {
      mixGainer = { name: v.name, spId: v.id, regionId: v.regionId, delta: mixDelta };
    }
  }

  const lowStockCount = sViews.reduce(
    (s, v) => s + v.sp.inventory.filter((i) => i.status !== "ok").length,
    0
  );
  const agingCaseCount = sViews.filter((v) => v.oldestOpenDays > 30).length;

  return { topMover, mixGainer, lowStockCount, agingCaseCount };
}
