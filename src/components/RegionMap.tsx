import { useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { motion } from "framer-motion";
// Bundled locally (world-atlas npm package) so the map needs no runtime fetch.
import topoData from "world-atlas/countries-110m.json";
import { RAG_HEX, type SpView } from "../lib/derive";
import { pct } from "../lib/format";
import type { Region } from "../data/seedData";
import { spScatter } from "../lib/geo";

const NA_IDS = new Set(["124", "840", "484"]); // Canada, USA, Mexico
const REGION_SCALE = 4200;
const COVERAGE_RADIUS_KM = 50; // ~100km diameter coverage per service point
// Pixel radius for the coverage ring at this projection scale (fixed view).
const COVERAGE_PX = (COVERAGE_RADIUS_KM / 111.32) * REGION_SCALE * (Math.PI / 180);

export function RegionMap({
  region,
  spViews,
  hoveredId,
  onHover,
  onSelect,
}: {
  region: Region;
  spViews: SpView[];
  hoveredId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (spId: string) => void;
}) {
  const [tip, setTip] = useState<{ sp: SpView; x: number; y: number } | null>(null);

  const positions = useMemo(
    () => spScatter(region.coords, spViews.length, region.id),
    [region.coords, region.id, spViews.length]
  );

  return (
    <div className="relative">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ center: [region.coords[1], region.coords[0]], scale: REGION_SCALE }}
        height={380}
        style={{ width: "100%", height: "auto" }}
      >
        <Geographies geography={topoData as object}>
          {({ geographies }) =>
            geographies
              .filter((g) => NA_IDS.has(String(g.id)))
              .map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#f1efec"
                  stroke="#e2ded9"
                  strokeWidth={0.5}
                  style={{ default: { outline: "none" }, hover: { outline: "none" }, pressed: { outline: "none" } }}
                />
              ))
          }
        </Geographies>

        {spViews.map((sp, i) => {
          const active = hoveredId === sp.id;
          const color = RAG_HEX[sp.mixRag];
          return (
            <Marker
              key={sp.id}
              coordinates={positions[i]}
              onClick={() => onSelect(sp.id)}
              onMouseEnter={(e) => {
                onHover(sp.id);
                setTip({ sp, x: e.clientX, y: e.clientY });
              }}
              onMouseMove={(e) => setTip({ sp, x: e.clientX, y: e.clientY })}
              onMouseLeave={() => {
                onHover(null);
                setTip(null);
              }}
              style={{ default: { cursor: "pointer" }, hover: { cursor: "pointer" } }}
            >
              {/* Coverage ring (~100km) with staggered radius-grow on load. */}
              <motion.circle
                initial={{ r: 0, opacity: 0 }}
                animate={{ r: COVERAGE_PX, opacity: 1 }}
                transition={{ delay: 0.1 + i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                fill={color}
                fillOpacity={active ? 0.28 : 0.14}
                stroke={color}
                strokeWidth={active ? 2 : 1.2}
                strokeOpacity={active ? 1 : 0.7}
                style={{ transition: "fill-opacity 0.2s, stroke-width 0.2s, stroke-opacity 0.2s" }}
              />
              <motion.circle
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 + i * 0.06, type: "spring", stiffness: 300, damping: 18 }}
                whileHover={{ scale: 1.3 }}
                r={5}
                fill={color}
                stroke="#fff"
                strokeWidth={1.5}
              />
              <text
                textAnchor="middle"
                y={-COVERAGE_PX - 4}
                className="fill-navy"
                style={{ fontSize: 9, fontWeight: 700, paintOrder: "stroke", stroke: "#fff", strokeWidth: 2.5 }}
              >
                {sp.name}
              </text>
            </Marker>
          );
        })}
      </ComposableMap>

      {tip && (
        <div
          className="pointer-events-none fixed z-50 rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs"
          style={{ left: tip.x + 14, top: tip.y + 14 }}
        >
          <p className="font-bold text-navy">{tip.sp.name}</p>
          <p className="text-stone-500 tabular-nums">Service mix {pct(tip.sp.servicePct)}</p>
          <p className="text-stone-500 tabular-nums">${tip.sp.revenuePerKm.toFixed(1)}/km</p>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-stone-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: RAG_HEX.green }} /> At / above 35%
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: RAG_HEX.amber }} /> Within 7 pts
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: RAG_HEX.red }} /> Below target
        </span>
        <span className="text-stone-400">Ring = ~100km coverage</span>
      </div>
    </div>
  );
}
