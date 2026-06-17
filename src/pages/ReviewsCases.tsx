import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Star, MessageSquareText, FolderOpen, CheckCircle2, Clock } from "lucide-react";
import { useApp } from "../context/AppContext";
import { allSpViews } from "../lib/derive";
import { num } from "../lib/format";
import { Card, KpiCard, PageHeader, SectionTitle } from "../components/common/ui";
import { CasesAgingChart } from "../components/charts/charts";

export default function ReviewsCases() {
  const { filters } = useApp();
  const navigate = useNavigate();
  const sViews = useMemo(() => allSpViews(filters), [filters]);

  const totalReviews = sViews.reduce((s, v) => s + v.reviewCount, 0);
  const avgRating = sViews.reduce((s, v) => s + v.rating * v.reviewCount, 0) / (totalReviews || 1);
  const openCases = sViews.reduce((s, v) => s + v.openCases, 0);
  const resolved = sViews.reduce((s, v) => s + v.sp.cases.resolved, 0);
  const oldest = Math.max(...sViews.map((v) => v.oldestOpenDays), 0);

  const aging = useMemo(() => {
    const buckets: Record<string, number> = { "0-7d": 0, "8-30d": 0, "30d+": 0 };
    for (const v of sViews) for (const a of v.sp.cases.aging) buckets[a.bucket] += a.count;
    return Object.entries(buckets).map(([bucket, count]) => ({ bucket, count }));
  }, [sViews]);

  const snippets = useMemo(
    () =>
      sViews.flatMap((v) => v.sp.reviews.recent.map((r) => ({ ...r, sp: v.name, spId: v.id })))
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 8),
    [sViews]
  );

  return (
    <div>
      <PageHeader eyebrow="Reviews & Cases" title="Customer sentiment and support load" meta={<span>Ratings and case status across the network.</span>} />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <KpiCard label="Avg rating" value={avgRating.toFixed(1)} sub="weighted by volume" icon={<Star size={16} />} />
        <KpiCard label="Total reviews" value={num(totalReviews)} icon={<MessageSquareText size={16} />} />
        <KpiCard label="Open cases" value={num(openCases)} accent="amber" icon={<FolderOpen size={16} />} />
        <KpiCard label="Resolved cases" value={num(resolved)} accent="green" icon={<CheckCircle2 size={16} />} />
        <KpiCard label="Oldest open" value={`${oldest}d`} accent={oldest > 30 ? "red" : "amber"} icon={<Clock size={16} />} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-5">
          <SectionTitle title="Open case aging" subtitle="Network-wide buckets" />
          <CasesAgingChart aging={aging} />
        </Card>
        <Card className="p-5 lg:col-span-2">
          <SectionTitle title="Recent reviews" subtitle="Latest snippets across service points" />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {snippets.map((s, i) => (
              <button key={i} onClick={() => navigate(`/sp/${s.spId}`)} className="rounded-lg border border-slate-100 p-3 text-left hover:bg-slate-50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-500">{"★".repeat(s.rating)}<span className="text-slate-300">{"★".repeat(5 - s.rating)}</span></span>
                  <span className="text-[11px] text-slate-400">{s.date}</span>
                </div>
                <p className="mt-1 text-sm text-slate-600">{s.text}</p>
                <p className="mt-1 text-xs font-medium text-navy">{s.sp}</p>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-6 p-5">
        <SectionTitle title="By service point" subtitle="Ratings and case counts" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="pb-2 font-medium">Service point</th>
                <th className="pb-2 font-medium">Region</th>
                <th className="pb-2 text-right font-medium">Rating</th>
                <th className="pb-2 text-right font-medium">Reviews</th>
                <th className="pb-2 text-right font-medium">Open</th>
                <th className="pb-2 text-right font-medium">In progress</th>
                <th className="pb-2 text-right font-medium">Resolved</th>
                <th className="pb-2 text-right font-medium">Oldest open</th>
              </tr>
            </thead>
            <tbody>
              {[...sViews].sort((a, b) => b.oldestOpenDays - a.oldestOpenDays).map((v) => (
                <tr key={v.id} onClick={() => navigate(`/sp/${v.id}`)} className="cursor-pointer border-t border-slate-100 hover:bg-slate-50">
                  <td className="py-2 font-medium text-navy">{v.name}</td>
                  <td className="py-2 text-slate-500">{v.regionName}</td>
                  <td className="py-2 text-right text-slate-600">{v.rating.toFixed(1)}</td>
                  <td className="py-2 text-right text-slate-600">{num(v.reviewCount)}</td>
                  <td className="py-2 text-right text-slate-600">{v.openCases}</td>
                  <td className="py-2 text-right text-slate-600">{v.sp.cases.inProgress}</td>
                  <td className="py-2 text-right text-slate-600">{num(v.sp.cases.resolved)}</td>
                  <td className={`py-2 text-right font-semibold ${v.oldestOpenDays > 30 ? "text-rag-red" : "text-slate-600"}`}>{v.oldestOpenDays}d</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
