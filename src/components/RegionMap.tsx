import { useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
// Bundled locally (world-atlas npm package) so the map needs no runtime fetch.
import topoData from "world-atlas/countries-110m.json";
import { RAG_HEX, type SpView } from "../lib/derive";
import { pct } from "../lib/format";
import type { Region } from "../data/seedData";
import { spScatter, circlePolygon } from "../lib/geo";

const NA_IDS = new Set(["124", "840", "484"]); // Canada, USA, Mexico
const COVERAGE_RADIUS_KM = 50; // 100km diameter coverage per service point

export function RegionMap({
  region,
  spViews,
  onSelect,
}: {
  region: Region;
  spViews: SpView[];
  onSelect: (spId: string) => void;
}) {
  const [hover, setHover] = useState<{ sp: SpView; x: number; y: number } | null>(null);

  const positions = useMemo(
    () => spScatter(region.coords, spViews.length, region.id),
    [region.coords, region.id, spViews.length]
  );

  return (
    <div className="relative">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ center: [region.coords[1], region.coords[0]], scale: 4200 }}
        height={380}
        style={{ width: "100%", height: "auto" }}
      >
        <Geographies geography={topoData as object}>
          {({ geographies, path }) => (
            <>
              {geographies
                .filter((g) => NA_IDS.has(String(g.id)))
                .map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#eef2f7"
                    stroke="#d8e0ea"
                    strokeWidth={0.5}
                    style={{ default: { outline: "none" }, hover: { outline: "none" }, pressed: { outline: "none" } }}
                  />
                ))}
              {/* Coverage circles (~100km diameter) drawn with the map projection. */}
              {spViews.map((sp, i) => (
                <path
                  key={`cov-${sp.id}`}
                  d={path(circlePolygon(positions[i], COVERAGE_RADIUS_KM)) ?? undefined}
                  fill={RAG_HEX[sp.mixRag]}
                  fillOpacity={0.16}
                  stroke={RAG_HEX[sp.mixRag]}
                  strokeWidth={1.2}
                  strokeOpacity={0.7}
                />
              ))}
            </>
          )}
        </Geographies>

        {spViews.map((sp, i) => (
          <Marker
            key={sp.id}
            coordinates={positions[i]}
            onClick={() => onSelect(sp.id)}
            onMouseEnter={(e) => setHover({ sp, x: e.clientX, y: e.clientY })}
            onMouseMove={(e) => setHover({ sp, x: e.clientX, y: e.clientY })}
            onMouseLeave={() => setHover(null)}
            style={{ default: { cursor: "pointer" }, hover: { cursor: "pointer" } }}
          >
            <circle r={5} fill={RAG_HEX[sp.mixRag]} stroke="#fff" strokeWidth={1.5} />
            <text
              textAnchor="middle"
              y={-9}
              className="fill-navy"
              style={{ fontSize: 9, fontWeight: 700, paintOrder: "stroke", stroke: "#fff", strokeWidth: 2.5 }}
            >
              {sp.name}
            </text>
          </Marker>
        ))}
      </ComposableMap>

      {hover && (
        <div
          className="pointer-events-none fixed z-50 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-cardHover"
          style={{ left: hover.x + 12, top: hover.y + 12 }}
        >
          <p className="font-bold text-navy">{hover.sp.name}</p>
          <p className="text-slate-500">Service mix {pct(hover.sp.servicePct)}</p>
          <p className="text-slate-500">${hover.sp.revenuePerKm.toFixed(1)}/km</p>
        </div>
      )}

      <div className="mt-3 flex items-center justify-center gap-5 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full" style={{ background: RAG_HEX.green }} /> At / above 35%
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full" style={{ background: RAG_HEX.amber }} /> Within 7 pts
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full" style={{ background: RAG_HEX.red }} /> Below target
        </span>
        <span className="text-slate-400">Ring = ~100km coverage</span>
      </div>
    </div>
  );
}
