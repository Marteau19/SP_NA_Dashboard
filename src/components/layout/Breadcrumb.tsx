import { Link, useLocation, useParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { regions } from "../../data/seedData";

const SECTION_LABELS: Record<string, string> = {
  mix: "Strategic Mix",
  field: "Field Efficiency",
  inventory: "Inventory",
  reviews: "Reviews & Cases",
  benchmarking: "Benchmarking",
};

interface Crumb {
  label: string;
  to?: string;
}

export function Breadcrumb() {
  const { pathname } = useLocation();
  const params = useParams();
  const crumbs: Crumb[] = [{ label: "Network", to: "/" }];

  const seg = pathname.split("/").filter(Boolean);
  if (seg[0] === "region" && params.regionId) {
    const r = regions.find((x) => x.id === params.regionId);
    if (r) crumbs.push({ label: r.name });
  } else if (seg[0] === "sp" && params.spId) {
    const r = regions.find((x) => x.servicePoints.some((s) => s.id === params.spId));
    const sp = r?.servicePoints.find((s) => s.id === params.spId);
    if (r) crumbs.push({ label: r.name, to: `/region/${r.id}` });
    if (sp) crumbs.push({ label: sp.name });
  } else if (seg[0] && SECTION_LABELS[seg[0]]) {
    crumbs.push({ label: SECTION_LABELS[seg[0]] });
  }

  return (
    <nav className="flex items-center gap-1.5 text-sm">
      {crumbs.map((c, i) => {
        const last = i === crumbs.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight size={14} className="text-stone-300" />}
            {c.to && !last ? (
              <Link to={c.to} className="font-medium text-stone-500 hover:text-ecoflo">
                {c.label}
              </Link>
            ) : (
              <span className={last ? "font-semibold text-navy" : "text-stone-500"}>{c.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
