import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download } from "lucide-react";
import { useApp } from "../context/AppContext";
import { allSpViews, allRegionViews } from "../lib/derive";
import { num } from "../lib/format";
import { downloadCsv } from "../lib/csv";
import { Card, PageHeader, SectionTitle } from "../components/common/ui";
import { HBarLeaderboard } from "../components/charts/charts";

type Level = "sp" | "region";
type MetricKey = "perKm" | "mix" | "contracts" | "rating";

const METRICS: { key: MetricKey; label: string }[] = [
  { key: "perKm", label: "$/km" },
  { key: "mix", label: "Service mix" },
  { key: "contracts", label: "Contracts" },
  { key: "rating", label: "Rating" },
];

interface Entity {
  id: string;
  name: string;
  navTo: string;
  values: Record<MetricKey, number>;
}

function fmt(key: MetricKey, v: number): string {
  if (key === "perKm") return `$${v.toFixed(1)}`;
  if (key === "mix") return `${v.toFixed(1)}%`;
  if (key === "rating") return v.toFixed(1);
  return num(Math.round(v));
}

// Monochrome navy-intensity ramp; stronger values read darker. Keeps the
// heatmap on-palette (no multi-color), in the spirit of Linear / Vercel.
const HEAT_LO = [245, 244, 242]; // warm near-white
const HEAT_HI = [4, 30, 66]; // navy
function heatColor(t: number): string {
  const ch = (i: number) => Math.round(HEAT_LO[i] + (HEAT_HI[i] - HEAT_LO[i]) * t);
  return `rgb(${ch(0)}, ${ch(1)}, ${ch(2)})`;
}
// White text once the cell is dark enough to need it.
function heatText(t: number): string {
  return t > 0.5 ? "#ffffff" : "#041e42";
}

export default function Benchmarking() {
  const { filters } = useApp();
  const navigate = useNavigate();
  const [level, setLevel] = useState<Level>("sp");
  const [metric, setMetric] = useState<MetricKey>("perKm");

  const entities = useMemo<Entity[]>(() => {
    if (level === "region") {
      return allRegionViews(filters).map((r) => ({
        id: r.id,
        name: r.name,
        navTo: `/region/${r.id}`,
        values: {
          perKm: r.avgRevPerKm,
          mix: r.servicePct,
          contracts: r.spViews.reduce((s, v) => s + v.sp.streams.maintenance.count, 0),
          rating: r.avgRating,
        },
      }));
    }
    return allSpViews(filters).map((v) => ({
      id: v.id,
      name: v.name,
      navTo: `/sp/${v.id}`,
      values: {
        perKm: v.revenuePerKm,
        mix: v.servicePct,
        contracts: v.sp.streams.maintenance.count,
        rating: v.rating,
      },
    }));
  }, [level, filters]);

  // Per-metric min/max for normalization.
  const ranges = useMemo(() => {
    const r: Record<MetricKey, { min: number; max: number }> = {
      perKm: { min: Infinity, max: -Infinity },
      mix: { min: Infinity, max: -Infinity },
      contracts: { min: Infinity, max: -Infinity },
      rating: { min: Infinity, max: -Infinity },
    };
    for (const e of entities)
      for (const m of METRICS) {
        r[m.key].min = Math.min(r[m.key].min, e.values[m.key]);
        r[m.key].max = Math.max(r[m.key].max, e.values[m.key]);
      }
    return r;
  }, [entities]);

  const norm = (key: MetricKey, v: number) => {
    const { min, max } = ranges[key];
    return max === min ? 0.5 : (v - min) / (max - min);
  };

  const board = [...entities]
    .sort((a, b) => b.values[metric] - a.values[metric])
    .slice(0, level === "sp" ? 14 : entities.length)
    .map((e) => ({ label: e.name, value: e.values[metric] }));

  const sortedForHeat = [...entities].sort((a, b) => b.values[metric] - a.values[metric]);

  const exportCsv = () => {
    downloadCsv(`benchmark-${level}.csv`, [
      ["Name", ...METRICS.map((m) => m.label)],
      ...sortedForHeat.map((e) => [e.name, ...METRICS.map((m) => fmt(m.key, e.values[m.key]))]),
    ]);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Benchmarking"
        title="Compare across the network"
        meta={<span>Rank and compare {level === "sp" ? "service points" : "regions"} on the metric that matters.</span>}
        action={
          <button onClick={exportCsv} className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-navy shadow-sm hover:bg-stone-50">
            <Download size={16} /> Export CSV
          </button>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex overflow-hidden rounded-lg border border-stone-200 text-sm font-medium">
          {(["sp", "region"] as Level[]).map((l) => (
            <button key={l} onClick={() => setLevel(l)} className={`px-4 py-2 ${level === l ? "bg-navy text-white" : "bg-white text-stone-500 hover:bg-stone-50"}`}>
              {l === "sp" ? "Service points" : "Regions"}
            </button>
          ))}
        </div>
        <div className="flex overflow-hidden rounded-lg border border-stone-200 text-sm font-medium">
          {METRICS.map((m) => (
            <button key={m.key} onClick={() => setMetric(m.key)} className={`px-4 py-2 ${metric === m.key ? "bg-ecoflo text-white" : "bg-white text-stone-500 hover:bg-stone-50"}`}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <SectionTitle title={`Leaderboard - ${METRICS.find((m) => m.key === metric)!.label}`} subtitle="Ranked best to worst" />
          <HBarLeaderboard data={board} kind={metric === "perKm" ? "perKm" : metric === "mix" ? "mix" : metric === "rating" ? "rating" : "number"} height={420} />
        </Card>

        <Card className="p-5">
          <SectionTitle title="Performance heatmap" subtitle="Each cell shaded relative to the network (darker is stronger)" />
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-1 text-sm">
              <thead>
                <tr>
                  <th className="px-2 py-1 text-left text-xs font-medium uppercase tracking-wide text-stone-400">{level === "sp" ? "Service point" : "Region"}</th>
                  {METRICS.map((m) => (
                    <th key={m.key} className="px-2 py-1 text-center text-xs font-medium uppercase tracking-wide text-stone-400">{m.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedForHeat.map((e) => (
                  <tr key={e.id} className="cursor-pointer" onClick={() => navigate(e.navTo)}>
                    <td className="whitespace-nowrap px-2 py-1 text-xs font-medium text-navy hover:underline">{e.name}</td>
                    {METRICS.map((m) => (
                      <td
                        key={m.key}
                        className="rounded px-2 py-1.5 text-center text-xs font-semibold tabular-nums"
                        style={{
                          background: heatColor(norm(m.key, e.values[m.key])),
                          color: heatText(norm(m.key, e.values[m.key])),
                        }}
                        title={`${e.name} - ${m.label}: ${fmt(m.key, e.values[m.key])}`}
                      >
                        {fmt(m.key, e.values[m.key])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
