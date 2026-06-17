import type { ReactNode } from "react";
import { Leaf, Monitor } from "lucide-react";

// Proof-of-concept gate. The console is built for desktop widths, so below the
// lg breakpoint we show a generic message instead of the cramped experience.
// Purely CSS-driven so it responds to resize without a flash of the wrong view.
export function MobileGate({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="flex min-h-screen flex-col items-center justify-center bg-navy px-8 text-center text-white lg:hidden">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-ecoflo">
          <Leaf size={26} className="text-white" />
        </div>
        <div className="mb-5 flex items-center gap-2 text-white/60">
          <Monitor size={18} />
          <span className="text-xs font-semibold uppercase tracking-wider">Desktop only</span>
        </div>
        <h1 className="max-w-sm text-2xl font-extrabold leading-tight">
          This console is built for desktop
        </h1>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70">
          The PTWE Service Point console is a proof of concept optimized for larger screens.
          Please open it on a desktop or a window at least 1024px wide to explore the network.
        </p>
        <p className="mt-8 text-[11px] uppercase tracking-wider text-white/40">
          North America network, prototype with mock data
        </p>
      </div>
      <div className="hidden lg:block">{children}</div>
    </>
  );
}
