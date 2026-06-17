import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  LineChart,
  BarChart,
  LabelList,
} from "recharts";
import type { Currency } from "../../data/seedData";
import { money, pct } from "../../lib/format";
import { RAG_HEX, SERVICE_TARGET, mixRag, type TrendPoint } from "../../lib/derive";

const NAVY = "#041E42";
const ECOFLO = "#64A70B";
const GRID = "#f0eeec";
const AXIS = "#78716c";
const CURSOR = "#fafaf9";
// Navy tints for the case-aging buckets (kept within the palette).
const NAVY_TINTS = ["#9aa6bf", "#5b6b8c", "#041e42"];

function tip(): React.CSSProperties {
  return {
    borderRadius: 8,
    border: "1px solid #e7e5e4",
    boxShadow: "none",
    fontSize: 12,
  };
}

export function MixDonut({
  product,
  recurring,
  currency,
}: {
  product: number;
  recurring: number;
  currency: Currency;
}) {
  const total = product + recurring;
  const data = [
    { name: "Product (systems)", value: product, color: NAVY },
    { name: "Recurring (service)", value: recurring, color: ECOFLO },
  ];
  const recurringPct = total ? (recurring / total) * 100 : 0;
  return (
    <div className="relative h-56">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            innerRadius={64}
            outerRadius={92}
            paddingAngle={2}
            stroke="none"
          >
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={tip()}
            formatter={(v: number, n: string) => [money(v, currency), n]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-extrabold text-navy">{pct(recurringPct)}</span>
        <span className="text-xs text-stone-500">recurring mix</span>
      </div>
    </div>
  );
}

export function RevenueTrend({ data, currency }: { data: TrendPoint[]; currency: Currency }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey="period" tick={{ fontSize: 11, fill: AXIS }} axisLine={false} tickLine={false} />
          <YAxis
            yAxisId="rev"
            tick={{ fontSize: 11, fill: AXIS }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => money(v, currency)}
            width={56}
          />
          <YAxis
            yAxisId="pct"
            orientation="right"
            domain={[0, 50]}
            tick={{ fontSize: 11, fill: AXIS }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
            width={40}
          />
          <Tooltip
            contentStyle={tip()}
            formatter={(v: number, n: string) =>
              n === "Service mix" ? [pct(v), n] : [money(v, currency), n]
            }
          />
          <Bar yAxisId="rev" dataKey="revenue" name="Revenue" fill={NAVY} radius={[4, 4, 0, 0]} barSize={26} />
          <ReferenceLine
            yAxisId="pct"
            y={SERVICE_TARGET}
            stroke={ECOFLO}
            strokeDasharray="4 4"
            ifOverflow="extendDomain"
          />
          <Line
            yAxisId="pct"
            type="monotone"
            dataKey="servicePct"
            name="Service mix"
            stroke={ECOFLO}
            strokeWidth={2.5}
            dot={{ r: 3 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MixTrajectory({ data }: { data: TrendPoint[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey="period" tick={{ fontSize: 11, fill: AXIS }} axisLine={false} tickLine={false} />
          <YAxis
            domain={[0, 50]}
            tick={{ fontSize: 11, fill: AXIS }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
            width={40}
          />
          <Tooltip contentStyle={tip()} formatter={(v: number) => [pct(v), "Service mix"]} />
          <ReferenceLine
            y={SERVICE_TARGET}
            stroke={ECOFLO}
            strokeDasharray="5 4"
            label={{ value: `Target ${SERVICE_TARGET}%`, fontSize: 11, fill: ECOFLO, position: "insideTopRight" }}
          />
          <Line
            type="monotone"
            dataKey="servicePct"
            stroke={NAVY}
            strokeWidth={3}
            dot={{ r: 3.5, fill: NAVY }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export interface HBarDatum {
  label: string;
  value: number;
  rag?: ReturnType<typeof mixRag>;
}

// Horizontal bar leaderboard. `kind` controls the value formatting and bar color.
export function HBarLeaderboard({
  data,
  kind,
  height = 320,
}: {
  data: HBarDatum[];
  kind: "perKm" | "mix" | "number" | "rating";
  height?: number;
}) {
  const valueLabel = (v: number) => {
    if (kind === "perKm") return `$${v.toFixed(1)}`;
    if (kind === "mix") return `${v.toFixed(1)}%`;
    if (kind === "rating") return v.toFixed(1);
    return v.toLocaleString("en-US");
  };
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 48, left: 8, bottom: 4 }}>
          <CartesianGrid stroke={GRID} horizontal={false} />
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="label"
            tick={{ fontSize: 11, fill: AXIS }}
            axisLine={false}
            tickLine={false}
            width={150}
          />
          <Tooltip cursor={{ fill: CURSOR }} contentStyle={tip()} formatter={(v: number) => [valueLabel(v), ""]} />
          <Bar dataKey="value" radius={[0, 5, 5, 0]} barSize={16}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.rag ? RAG_HEX[d.rag] : NAVY} />
            ))}
            <LabelList dataKey="value" position="right" formatter={valueLabel} style={{ fontSize: 11, fill: AXIS, fontWeight: 600 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CasesAgingChart({
  aging,
}: {
  aging: { bucket: string; count: number }[];
}) {
  return (
    <div className="h-44">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={aging} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: AXIS }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: AXIS }} axisLine={false} tickLine={false} width={28} allowDecimals={false} />
          <Tooltip cursor={{ fill: CURSOR }} contentStyle={tip()} />
          <Bar dataKey="count" name="Open cases" radius={[4, 4, 0, 0]} barSize={40}>
            {aging.map((_, i) => (
              <Cell key={i} fill={NAVY_TINTS[i] ?? NAVY} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
