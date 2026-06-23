import { useEffect, useRef, useState } from "react";
import { animate, motion } from "framer-motion";
import { ComposableMap, Geographies, Geography, Graticule, Line, Marker, Sphere } from "react-simple-maps";
import topoData from "world-atlas/countries-110m.json";
import { Activity } from "lucide-react";
import logo from "../Ecoflo-R_Logo-RGB.png";

// Brand colours, kept local so the splash renders before any app context.
const ECOFLO = "#64A70B";

// Quebec is Ecoflo's home base; every connection arc fans out from here to
// convey a network that is reaching across the globe in real time.
const HUB: [number, number] = [-71.2, 46.8];
const NODES: [number, number][] = [
  [-79.4, 43.7], // Toronto
  [-123.1, 49.3], // Vancouver
  [-87.6, 41.9], // Chicago
  [-118.2, 34.1], // Los Angeles
  [-99.1, 19.4], // Mexico City
  [-46.6, -23.6], // Sao Paulo
  [-0.1, 51.5], // London
  [2.3, 48.9], // Paris
  [13.4, 52.5], // Berlin
  [55.3, 25.2], // Dubai
  [103.8, 1.35], // Singapore
  [139.7, 35.7], // Tokyo
  [151.2, -33.9], // Sydney
];

// Status messages stream past while the network "comes online", landing on the
// line the brief asked for.
const STEPS = [
  "Establishing secure uplink",
  "Synchronizing live telemetry",
  "Mapping service points worldwide",
  "Accessing Service Point Network",
];

const TOTAL_MS = 3200;

function StatCounter({ to, suffix = "", label }: { to: number; suffix?: string; label: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const controls = animate(0, to, {
      duration: TOTAL_MS / 1000 - 0.4,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setVal(v),
    });
    return () => controls.stop();
  }, [to]);
  return (
    <div className="text-center">
      <p className="text-xl font-extrabold tabular-nums text-white">
        {Math.round(val).toLocaleString()}
        {suffix}
      </p>
      <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/45">{label}</p>
    </div>
  );
}

export function BootSplash({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const doneRef = useRef(false);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone();
  };

  useEffect(() => {
    const stepEvery = TOTAL_MS / STEPS.length;
    const timers = STEPS.map((_, i) => setTimeout(() => setStep(i), i * stepEvery));
    const bar = animate(0, 100, {
      duration: TOTAL_MS / 1000,
      ease: "easeInOut",
      onUpdate: (v) => setProgress(v),
    });
    const end = setTimeout(finish, TOTAL_MS);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(end);
      bar.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-navy"
      style={{
        background:
          "radial-gradient(1200px 600px at 50% 38%, #0a2c5a 0%, #041E42 55%, #02132b 100%)",
      }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.6, ease: "easeInOut" } }}
      onClick={finish}
      role="status"
      aria-label="Accessing Service Point Network"
    >
      {/* Full-bleed live network map */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <motion.div
          className="w-[min(1100px,140vw)]"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 0.55, scale: 1 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        >
          <ComposableMap
            projection="geoEqualEarth"
            projectionConfig={{ scale: 168 }}
            width={1000}
            height={470}
            style={{ width: "100%", height: "auto" }}
          >
            <Sphere id="boot-sphere" stroke="rgba(255,255,255,0.06)" strokeWidth={0.5} fill="transparent" />
            <Graticule stroke="rgba(255,255,255,0.05)" strokeWidth={0.4} />
            <Geographies geography={topoData as object}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#10305c"
                    stroke="#1c4685"
                    strokeWidth={0.35}
                    style={{
                      default: { outline: "none" },
                      hover: { outline: "none" },
                      pressed: { outline: "none" },
                    }}
                  />
                ))
              }
            </Geographies>

            {/* Live connection arcs streaming out from the hub */}
            {NODES.map((to, i) => (
              <Line
                key={`arc-${i}`}
                from={HUB}
                to={to}
                stroke={ECOFLO}
                strokeWidth={0.9}
                strokeLinecap="round"
                className="ecoflo-arc"
                style={{ animationDelay: `${(i % 5) * 0.18}s` }}
              />
            ))}

            {/* Pulsing network nodes */}
            {[HUB, ...NODES].map((coord, i) => {
              const hub = i === 0;
              return (
                <Marker key={`node-${i}`} coordinates={coord}>
                  <motion.circle
                    fill="none"
                    stroke={ECOFLO}
                    strokeWidth={1}
                    initial={{ r: hub ? 4 : 2.5, opacity: 0.7 }}
                    animate={{ r: hub ? 20 : 13, opacity: 0 }}
                    transition={{
                      duration: 1.9,
                      repeat: Infinity,
                      ease: "easeOut",
                      delay: (i % 6) * 0.28,
                    }}
                  />
                  <circle r={hub ? 3.6 : 2.2} fill={ECOFLO} />
                  {hub && <circle r={1.6} fill="#fff" />}
                </Marker>
              );
            })}
          </ComposableMap>
        </motion.div>
      </div>

      {/* Soft vignette for depth */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(900px 520px at 50% 42%, transparent 40%, rgba(2,15,40,0.65) 100%)" }}
      />

      {/* Foreground content */}
      <div className="relative z-10 flex w-full max-w-md flex-col items-center px-8">
        <motion.img
          src={logo}
          alt="Ecoflo"
          className="h-12 w-auto drop-shadow-[0_0_24px_rgba(100,167,11,0.35)]"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        <motion.p
          className="mt-3 text-[13px] font-semibold uppercase tracking-[0.32em] text-white/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.7 }}
        >
          Service Point Network
        </motion.p>

        {/* Live status line */}
        <div className="mt-10 flex h-6 items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ecoflo opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-ecoflo" />
          </span>
          <motion.span
            key={step}
            className="text-sm font-medium text-white/85"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            {STEPS[step]}
            <span className="ml-0.5 animate-pulse text-ecoflo">…</span>
          </motion.span>
        </div>

        {/* Progress bar */}
        <div className="mt-5 h-1 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-ecoflo shadow-[0_0_12px_rgba(100,167,11,0.7)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Live stat chips */}
        <div className="mt-8 flex items-center gap-8">
          <StatCounter to={214} label="Service points" />
          <StatCounter to={12} label="Regions" />
          <div className="text-center">
            <p className="flex items-center justify-center gap-1.5 text-xl font-extrabold text-ecoflo">
              <Activity size={16} className="animate-pulse" />
              LIVE
            </p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/45">Data feed</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
