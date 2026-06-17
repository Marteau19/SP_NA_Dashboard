# PTWE Service Point Management Console

A high-fidelity prototype that gives PTWE leadership visibility over the North
American Service Point network (Quebec, Canada-English, USA). It is a
client-side single-page app with mock data only. There is no backend, no auth,
and no external data calls.

## Run it

```bash
npm install
npm run dev
```

Then open the printed local URL (default http://localhost:5173).

To build a production bundle:

```bash
npm run build && npm run preview
```

## Tech stack

- React + TypeScript + Vite
- Tailwind CSS (Ecoflo green `#64A70B`, Premier Tech navy `#041E42`, Plus Jakarta Sans)
- Recharts for charts
- react-simple-maps for the North America map (geography bundled locally via
  `world-atlas`, so no runtime fetch)
- lucide-react for icons

## Data

All values are derived from `src/data/seedData.ts`, the single source of truth.
Nothing is hardcoded elsewhere. The hierarchy is Network -> Region
(intrapreneur couple) -> Service Point. All figures are mock.

## Screens

1. Network overview - NA map, KPI strip, region cards grouped by QC / CAN-EN /
   USA, map/grid toggle, "what changed" digest
2. Region view - rollup KPIs, leadership couple, service point mini-scorecards
3. Service Point scorecard - four revenue streams, revenue mix donut, trend,
   performance vs target (RAG), $/km block, reviews, support cases, inventory
4. Strategic mix tracker - service share vs the 35% target with trajectory and
   lead/lag ranking
5. Field efficiency - $/km headline, drivers, leaderboards
6. Inventory - stock per SP with low/out alerts
7. Reviews and cases - ratings and case status
8. Benchmarking - leaderboard plus heatmap by selectable metric

## Cross-cutting

- Global filters (region group, period) and a breadcrumb drill path
- Alerts panel aggregating underperformance, low $/km, low/out stock, aging cases
- Presentation mode (hides nav chrome for screen-sharing)
- CSV export on Inventory and Benchmarking, plus a print view
- Display currency toggle (CAD / USD) that normalizes the seed's mixed currencies
