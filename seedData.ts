// PTWE Service Point Management Console - mock seed data
// Single source of truth for the prototype. All numbers are invented.
// Hierarchy: Network -> Region (intrapreneur couple) -> Service Point.
// SP count per region is roughly 1 per 2M of mock revenue.

export type RegionGroup = "QC" | "CAN-EN" | "USA";
export type Currency = "CAD" | "USD";
export type StockStatus = "ok" | "low" | "out";

export interface Stream {
  count: number;
  revenue: number; // in dollars (mock)
}

export interface HistoryPoint {
  period: string;
  revenue: number;
  servicePct: number;
}

export interface FieldEfficiency {
  revenuePerKm: number; // $ generated per km driven
  kmDriven: number;
  routeScore: number; // 0-100, route optimization quality
  upsellRate: number; // 0-1
  jobsPerRoute: number;
}

export interface Review {
  rating: number;
  date: string;
  text: string;
}

export interface Reviews {
  avgRating: number;
  count: number;
  recent: Review[];
}

export interface CaseAging {
  bucket: string;
  count: number;
}

export interface Cases {
  open: number;
  inProgress: number;
  resolved: number;
  oldestOpenDays: number;
  aging: CaseAging[];
}

export interface InventoryItem {
  item: string;
  onHand: number;
  reserved: number;
  reorderPoint: number;
  status: StockStatus;
}

export interface ServicePoint {
  id: string;
  name: string;
  lead: string;
  streams: {
    systems: Stream;
    maintenance: Stream;
    fmr: Stream;
    service: Stream;
  };
  revenue: number;
  servicePct: number;
  target: number;
  history: HistoryPoint[];
  field: FieldEfficiency;
  reviews: Reviews;
  cases: Cases;
  inventory: InventoryItem[];
}

export interface RegionRollup {
  spCount: number;
  revenue: number;
  servicePct: number;
  target: number;
  openCases: number;
  avgRating: number;
  avgRevPerKm: number;
}

export interface Region {
  id: string;
  name: string;
  group: RegionGroup;
  currency: Currency;
  coords: [number, number]; // lat, lng for the map
  leaders: [string, string]; // intrapreneur couple
  servicePoints: ServicePoint[];
  rollup: RegionRollup;
}

interface RegionDef {
  id: string;
  name: string;
  group: RegionGroup;
  currency: Currency;
  coords: [number, number];
  leaders: [string, string];
  spCount: number;
}

// 12 regions (T&P and Peripherals intentionally excluded). NA only.
const REGION_DEFS: RegionDef[] = [
  { id: "lau-out", name: "Laurentides-Outaouais", group: "QC", currency: "CAD", coords: [46.0, -75.0], leaders: ["THEP", "BELJ"], spCount: 4 },
  { id: "lanaudiere", name: "Lanaudiere", group: "QC", currency: "CAD", coords: [46.3, -73.4], leaders: ["NORA", "PELM"], spCount: 2 },
  { id: "monteregie", name: "Monteregie", group: "QC", currency: "CAD", coords: [45.4, -73.0], leaders: ["COUN2", "DANA"], spCount: 3 },
  { id: "estrie-centre", name: "Estrie-Centre", group: "QC", currency: "CAD", coords: [45.4, -71.9], leaders: ["ROYS", "VONA"], spCount: 2 },
  { id: "qc-lsj-mauricie", name: "QC-LSJ-CN-Mauricie", group: "QC", currency: "CAD", coords: [47.5, -72.0], leaders: ["DUBM6", "GELR"], spCount: 2 },
  { id: "est-chaudiere", name: "Est-Chaudiere-Appalaches", group: "QC", currency: "CAD", coords: [46.6, -70.7], leaders: ["AMRM", "DESM10"], spCount: 2 },
  { id: "ontario", name: "Ontario", group: "CAN-EN", currency: "CAD", coords: [43.7, -79.4], leaders: ["MORS11", "BOLM"], spCount: 3 },
  { id: "east", name: "East", group: "CAN-EN", currency: "CAD", coords: [45.0, -63.0], leaders: ["DUPA", "MARC18"], spCount: 1 },
  { id: "west", name: "West", group: "CAN-EN", currency: "CAD", coords: [51.0, -114.0], leaders: ["TREA8", "GILJ"], spCount: 1 },
  { id: "iowa", name: "Iowa", group: "USA", currency: "USD", coords: [41.9, -93.6], leaders: ["GENP", "DVOK"], spCount: 2 },
  { id: "new-jersey", name: "New Jersey", group: "USA", currency: "USD", coords: [40.2, -74.7], leaders: ["CHAJ11", "LAFS4"], spCount: 1 },
  { id: "pennsylvania", name: "Pennsylvania", group: "USA", currency: "USD", coords: [40.9, -77.8], leaders: ["TREB", "MORG7"], spCount: 5 },
];

const SP_LEAD_POOL = [
  "LAVS", "BERG3", "HUOT", "ROCM", "STPL", "GAGM", "FORC", "BLAI2",
  "TURG", "MENV", "PARH", "CYRD", "LEVS", "BOUL", "DESR2", "PAQM",
];

const REVIEW_POOL = [
  "Quick response and a clean install.",
  "Technician explained the maintenance clearly.",
  "Booking was easy and the system is running well.",
  "Great follow-up after the service visit.",
  "Filter replacement was on schedule, no issues.",
  "Friendly crew, left the site spotless.",
  "Took a bit longer than expected but solid work.",
  "Proactive reminder for the next service was helpful.",
];

const REVIEW_DATES = ["2026-05-02", "2026-05-14", "2026-05-21", "2026-06-03", "2026-06-09", "2026-06-12"];

const HISTORY_LABELS = ["FY25 Q3", "FY25 Q4", "FY26 Q1", "FY26 Q2", "FY26 Q3", "FY26 Q4"];

const INVENTORY_ITEMS = ["Ecoflo systems", "Filter media (FMR)", "Pump assemblies", "Control panels", "Spare parts kits"];

// Deterministic PRNG so the prototype is stable across reloads.
function mulberry32(a: number): () => number {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function buildServicePoint(def: RegionDef, idx: number): ServicePoint {
  const id = `${def.id}-sp${idx + 1}`;
  const rng = mulberry32(hash(id));
  const rint = (min: number, max: number) => Math.floor(rng() * (max - min + 1)) + min;
  const rfloat = (min: number, max: number, dec = 2) => Number((rng() * (max - min) + min).toFixed(dec));
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];

  // Product (systems) is the base today. Recurring is sized off a target mix
  // drawn around the 35% strategic line so some SPs lead and some lag.
  const unitSystem = rint(9000, 12000);
  const unitMaint = rint(170, 210);
  const unitFmr = rint(2700, 3000);
  const unitService = rint(100, 140);

  const systemsRevenue = rint(900000, 2400000);
  const targetMix = rfloat(0.18, 0.42, 3); // recurring share of total
  const recurringRevenue = Math.round((systemsRevenue * targetMix) / (1 - targetMix));

  const maintShare = rfloat(0.5, 0.6);
  const fmrShare = rfloat(0.3, 0.4);
  const maintRevenue = Math.round(recurringRevenue * maintShare);
  const fmrRevenue = Math.round(recurringRevenue * fmrShare);
  const serviceRevenue = recurringRevenue - maintRevenue - fmrRevenue;

  const systems: Stream = { count: Math.round(systemsRevenue / unitSystem), revenue: systemsRevenue };
  const maintenance: Stream = { count: Math.round(maintRevenue / unitMaint), revenue: maintRevenue };
  const fmr: Stream = { count: Math.round(fmrRevenue / unitFmr), revenue: fmrRevenue };
  const service: Stream = { count: Math.round(serviceRevenue / unitService), revenue: serviceRevenue };

  const revenue = systems.revenue + maintenance.revenue + fmr.revenue + service.revenue;
  const recurring = maintenance.revenue + fmr.revenue + service.revenue;
  const servicePct = Number(((recurring / revenue) * 100).toFixed(1));
  const target = Math.round(revenue * rfloat(0.95, 1.15));

  const history: HistoryPoint[] = HISTORY_LABELS.map((period, i) => {
    const f = 0.78 + i * 0.044; // ramps to ~1.0 at current period
    const mixDelta = (5 - i) * rfloat(0.6, 1.2, 2); // mix lower in the past
    return {
      period,
      revenue: Math.round(revenue * f),
      servicePct: Number(Math.max(8, servicePct - mixDelta).toFixed(1)),
    };
  });

  const field: FieldEfficiency = {
    revenuePerKm: rfloat(8, 22),
    kmDriven: rint(45000, 130000),
    routeScore: rint(55, 96),
    upsellRate: Number(rfloat(0.05, 0.3).toFixed(2)),
    jobsPerRoute: rfloat(3, 7, 1),
  };

  const reviews: Reviews = {
    avgRating: rfloat(3.8, 4.9, 1),
    count: rint(20, 200),
    recent: Array.from({ length: 3 }, () => ({
      rating: rint(3, 5),
      date: pick(REVIEW_DATES),
      text: pick(REVIEW_POOL),
    })),
  };

  const open = rint(2, 25);
  const a1 = rint(0, open);
  const a2 = rint(0, open - a1);
  const a3 = open - a1 - a2;
  const cases: Cases = {
    open,
    inProgress: rint(1, 15),
    resolved: rint(60, 400),
    oldestOpenDays: rint(1, 45),
    aging: [
      { bucket: "0-7d", count: a1 },
      { bucket: "8-30d", count: a2 },
      { bucket: "30d+", count: a3 },
    ],
  };

  const inventory: InventoryItem[] = INVENTORY_ITEMS.map((item) => {
    const reorderPoint = rint(20, 120);
    const onHand = rng() < 0.12 ? 0 : rint(0, 200);
    const reserved = rint(0, Math.max(0, Math.floor(onHand * 0.4)));
    const status: StockStatus = onHand === 0 ? "out" : onHand <= reorderPoint ? "low" : "ok";
    return { item, onHand, reserved, reorderPoint, status };
  });

  return {
    id,
    name: `${def.name} SP${idx + 1}`,
    lead: SP_LEAD_POOL[hash(id) % SP_LEAD_POOL.length],
    streams: { systems, maintenance, fmr, service },
    revenue,
    servicePct,
    target,
    history,
    field,
    reviews,
    cases,
    inventory,
  };
}

function buildRegion(def: RegionDef): Region {
  const servicePoints = Array.from({ length: def.spCount }, (_, i) => buildServicePoint(def, i));
  const revenue = servicePoints.reduce((s, sp) => s + sp.revenue, 0);
  const recurring = servicePoints.reduce(
    (s, sp) => s + sp.streams.maintenance.revenue + sp.streams.fmr.revenue + sp.streams.service.revenue,
    0
  );
  const rollup: RegionRollup = {
    spCount: servicePoints.length,
    revenue,
    servicePct: Number(((recurring / revenue) * 100).toFixed(1)),
    target: servicePoints.reduce((s, sp) => s + sp.target, 0),
    openCases: servicePoints.reduce((s, sp) => s + sp.cases.open, 0),
    avgRating: Number((servicePoints.reduce((s, sp) => s + sp.reviews.avgRating, 0) / servicePoints.length).toFixed(1)),
    avgRevPerKm: Number((servicePoints.reduce((s, sp) => s + sp.field.revenuePerKm, 0) / servicePoints.length).toFixed(1)),
  };
  return { ...def, servicePoints, rollup };
}

export const regions: Region[] = REGION_DEFS.map(buildRegion);

const allSPs = regions.flatMap((r) => r.servicePoints);
const networkRevenue = allSPs.reduce((s, sp) => s + sp.revenue, 0);
const networkRecurring = allSPs.reduce(
  (s, sp) => s + sp.streams.maintenance.revenue + sp.streams.fmr.revenue + sp.streams.service.revenue,
  0
);

export const network = {
  revenue: networkRevenue,
  servicePct: Number(((networkRecurring / networkRevenue) * 100).toFixed(1)),
  serviceTarget: 35, // strategic 2031 target, %
  regionCount: regions.length,
  spCount: allSPs.length,
  systems: allSPs.reduce((s, sp) => s + sp.streams.systems.count, 0),
  maintenanceContracts: allSPs.reduce((s, sp) => s + sp.streams.maintenance.count, 0),
  openCases: allSPs.reduce((s, sp) => s + sp.cases.open, 0),
  avgRating: Number((allSPs.reduce((s, sp) => s + sp.reviews.avgRating, 0) / allSPs.length).toFixed(1)),
};
