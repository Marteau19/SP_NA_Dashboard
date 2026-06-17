import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  Target,
  Route,
  Boxes,
  MessageSquareText,
  BarChart3,
  Leaf,
} from "lucide-react";

const NAV = [
  { to: "/", label: "Network Overview", icon: LayoutGrid, end: true },
  { to: "/mix", label: "Strategic Mix", icon: Target },
  { to: "/field", label: "Field Efficiency", icon: Route },
  { to: "/inventory", label: "Inventory", icon: Boxes },
  { to: "/reviews", label: "Reviews & Cases", icon: MessageSquareText },
  { to: "/benchmarking", label: "Benchmarking", icon: BarChart3 },
];

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col bg-navy text-white lg:flex">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ecoflo">
          <Leaf size={20} className="text-white" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-extrabold">PTWE Console</p>
          <p className="text-[11px] text-white/60">Service Point Network</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="px-5 py-4 text-[11px] leading-relaxed text-white/40">
        North America network
        <br />
        Prototype - mock data only
      </div>
    </aside>
  );
}
