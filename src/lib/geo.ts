// Display-only geometry helpers for the region coverage map.
// Service points carry no coordinates in the seed, so we derive stable
// positions scattered around the region center. These are presentation
// positions only, not data, and are deterministic per service point id.

const KM_PER_DEG = 111.32;

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Returns [lng, lat] display positions for a region's service points,
// scattered on a ring around the region center (single SP sits at center).
export function spScatter(
  regionCoords: [number, number],
  count: number,
  seed: string
): [number, number][] {
  const [lat, lng] = regionCoords;
  if (count <= 1) return [[lng, lat]];
  const cosLat = Math.cos((lat * Math.PI) / 180) || 1;
  const start = (hash(seed) % 360) * (Math.PI / 180);
  const ring = 0.85; // degrees from center
  return Array.from({ length: count }, (_, i) => {
    const angle = start + (i / count) * 2 * Math.PI;
    const r = ring * (i % 2 === 0 ? 1 : 0.62); // alternate radius to spread overlap
    const dLat = r * Math.cos(angle);
    const dLng = (r * Math.sin(angle)) / cosLat;
    return [lng + dLng, lat + dLat] as [number, number];
  });
}

export interface CircleFeature {
  type: "Feature";
  properties: Record<string, never>;
  geometry: { type: "Polygon"; coordinates: number[][][] };
}

// Builds a GeoJSON polygon approximating a circle of radiusKm around
// [lng, lat], suitable for rendering through react-simple-maps projection.
export function circlePolygon(
  center: [number, number],
  radiusKm: number,
  steps = 64
): CircleFeature {
  const [lng, lat] = center;
  const cosLat = Math.cos((lat * Math.PI) / 180) || 1;
  const coords: number[][] = [];
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * 2 * Math.PI;
    const dLat = (radiusKm / KM_PER_DEG) * Math.cos(a);
    const dLng = (radiusKm / (KM_PER_DEG * cosLat)) * Math.sin(a);
    coords.push([lng + dLng, lat + dLat]);
  }
  return { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [coords] } };
}
