import { useEffect, useMemo, useRef, useState } from "react";
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps";
import { animate, motion } from "framer-motion";
import { Plus, Minus, Maximize } from "lucide-react";
// Bundled locally (world-atlas npm package) so the map needs no runtime fetch.
import topoData from "world-atlas/countries-110m.json";
import { RAG_HEX, type RegionView } from "../lib/derive";
import { money, pct } from "../lib/format";
import type { Currency } from "../data/seedData";
import { fitMercator } from "../lib/geo";

const NA_IDS = new Set(["124", "840", "484"]); // Canada, USA, Mexico
const MAP_W = 1000;
const MAP_H = 520;
const MIN_ZOOM = 1;
const MAX_ZOOM = 8;
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface Position {
  coordinates: [number, number];
  zoom: number;
}

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

  const fit = useMemo(
    () => fitMercator(regionViews.map((r) => r.region.coords), MAP_W, MAP_H),
    [regionViews]
  );

  const [position, setPosition] = useState<Position>({ coordinates: fit.center, zoom: 1 });
  const posRef = useRef(position);
  posRef.current = position;

  // Reframe whenever the populated set of markers changes (group filter).
  useEffect(() => {
    setPosition({ coordinates: fit.center, zoom: 1 });
  }, [fit.center, fit.scale]);

  const maxRev = Math.max(...regionViews.map((r) => r.revenue), 1);
  const radius = (rev: number) => 5 + (rev / maxRev) * 11;

  const animateTo = (coordinates: [number, number], zoom: number, onDone?: () => void) => {
    const start = posRef.current;
    const z = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
    animate(0, 1, {
      duration: 0.7,
      ease: EASE,
      onUpdate: (t) =>
        setPosition({
          coordinates: [
            start.coordinates[0] + (coordinates[0] - start.coordinates[0]) * t,
            start.coordinates[1] + (coordinates[1] - start.coordinates[1]) * t,
          ],
          zoom: start.zoom + (z - start.zoom) * t,
        }),
      onComplete: onDone,
    });
  };

  const zoomBy = (factor: number) =>
    animateTo(posRef.current.coordinates, posRef.current.zoom * factor);
  const reset = () => animateTo(fit.center, 1);

  const handleRegionClick = (r: RegionView) =>
    animateTo([r.region.coords[1], r.region.coords[0]], 4, () => onSelect(r.id));

  return (
    <div className="relative h-full w-full">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ center: fit.center, scale: fit.scale }}
        width={MAP_W}
        height={MAP_H}
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup
          center={position.coordinates}
          zoom={position.zoom}
          minZoom={MIN_ZOOM}
          maxZoom={MAX_ZOOM}
          onMoveEnd={(p) => setPosition(p as Position)}
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

          {regionViews.map((r, i) => {
            const rr = radius(r.revenue);
            return (
              <Marker
                key={r.id}
                coordinates={[r.region.coords[1], r.region.coords[0]]}
                onClick={() => handleRegionClick(r)}
                onMouseEnter={(e) => setHover({ r, x: e.clientX, y: e.clientY })}
                onMouseMove={(e) => setHover({ r, x: e.clientX, y: e.clientY })}
                onMouseLeave={() => setHover(null)}
                style={{ default: { cursor: "pointer" }, hover: { cursor: "pointer" } }}
              >
                <motion.circle
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15 + i * 0.045, type: "spring", stiffness: 280, damping: 18 }}
                  whileHover={{ scale: 1.35 }}
                  r={rr}
                  fill={RAG_HEX[r.mixRag]}
                  fillOpacity={0.85}
                  stroke="#fff"
                  strokeWidth={1.5}
                />
              </Marker>
            );
          })}
        </ZoomableGroup>
      </ComposableMap>

      {/* Zoom controls */}
      <div className="absolute right-3 top-3 flex flex-col overflow-hidden rounded-lg border border-stone-200 bg-white">
        <button onClick={() => zoomBy(1.6)} className="p-2 text-stone-600 transition-colors hover:bg-stone-50" title="Zoom in">
          <Plus size={16} />
        </button>
        <button onClick={() => zoomBy(1 / 1.6)} className="border-t border-stone-200 p-2 text-stone-600 transition-colors hover:bg-stone-50" title="Zoom out">
          <Minus size={16} />
        </button>
        <button onClick={reset} className="border-t border-stone-200 p-2 text-stone-600 transition-colors hover:bg-stone-50" title="Reset view">
          <Maximize size={16} />
        </button>
      </div>

      {hover && (
        <div
          className="pointer-events-none fixed z-50 rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs"
          style={{ left: hover.x + 14, top: hover.y + 14 }}
        >
          <p className="font-bold text-navy">{hover.r.name}</p>
          <p className="text-stone-500 tabular-nums">Revenue {money(hover.r.revenue, currency)}</p>
          <p className="text-stone-500 tabular-nums">Service mix {pct(hover.r.servicePct)}</p>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-stone-200 bg-white/90 px-3 py-2 text-[11px] text-stone-500 backdrop-blur">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: RAG_HEX.green }} /> At / above 35%
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: RAG_HEX.amber }} /> Within 7 pts
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: RAG_HEX.red }} /> Below target
        </span>
        <span className="text-stone-400">Marker size = revenue</span>
      </div>
    </div>
  );
}
