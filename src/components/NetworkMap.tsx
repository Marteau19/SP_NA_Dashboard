import { useState } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
// Bundled locally (world-atlas npm package) so the map needs no runtime fetch.
import topoData from "world-atlas/countries-110m.json";
import { RAG_HEX, type RegionView } from "../lib/derive";
import { money, pct } from "../lib/format";
import type { Currency } from "../data/seedData";

// ISO numeric ids for the three NA countries we want to render.
const NA_IDS = new Set(["124", "840", "484"]); // Canada, USA, Mexico

export function NetworkMap({
  regionViews,
  currency,
  onSelect,
}: {
  regionViews: RegionView[];
  currency: Currency;
  onSelect: (regionId: string) => void;
}) {
  const [hover, setHover] = useState<{ r: RegionView; x: number; y: number } | null>(null);
  const maxRev = Math.max(...regionViews.map((r) => r.revenue), 1);
  const radius = (rev: number) => 7 + (rev / maxRev) * 18;

  return (
    <div className="relative">
      <ComposableMap
        projection="geoAlbers"
        projectionConfig={{ rotate: [98, 0, 0], center: [0, 52], scale: 620 }}
        height={420}
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
                  fill="#eef2f7"
                  stroke="#d8e0ea"
                  strokeWidth={0.6}
                  style={{ default: { outline: "none" }, hover: { outline: "none" }, pressed: { outline: "none" } }}
                />
              ))
          }
        </Geographies>
        {regionViews.map((r) => (
          <Marker
            key={r.id}
            coordinates={[r.region.coords[1], r.region.coords[0]]}
            onClick={() => onSelect(r.id)}
            onMouseEnter={(e) => setHover({ r, x: e.clientX, y: e.clientY })}
            onMouseMove={(e) => setHover({ r, x: e.clientX, y: e.clientY })}
            onMouseLeave={() => setHover(null)}
            style={{ default: { cursor: "pointer" }, hover: { cursor: "pointer" } }}
          >
            <circle
              r={radius(r.revenue)}
              fill={RAG_HEX[r.mixRag]}
              fillOpacity={0.75}
              stroke="#fff"
              strokeWidth={1.5}
            />
          </Marker>
        ))}
      </ComposableMap>
      {hover && (
        <div
          className="pointer-events-none fixed z-50 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-cardHover"
          style={{ left: hover.x + 12, top: hover.y + 12 }}
        >
          <p className="font-bold text-navy">{hover.r.name}</p>
          <p className="text-slate-500">Revenue {money(hover.r.revenue, currency)}</p>
          <p className="text-slate-500">Service mix {pct(hover.r.servicePct)}</p>
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
        <span className="text-slate-400">Marker size = revenue</span>
      </div>
    </div>
  );
}
