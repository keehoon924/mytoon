"use client";

import { useEffect, useState } from "react";
import MiniChart from "@/components/admin/MiniChart";

type Stats = {
  days: number;
  totalUsers: number;
  wau: number;
  totalProjects: number;
  totalCuts: number;
  revenueKrw: number;
  creditsPurchased: number;
  projectsDaily: { date: string; value: number }[];
  cutsDaily: { date: string; value: number }[];
  creditsDaily: { date: string; value: number }[];
};

const RANGES = [7, 30, 90] as const;

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-5 hover:shadow-sm transition-shadow">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${accent ?? "text-gray-900"}`}>{value}</p>
      {sub && <p className="mt-1.5 text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

export default function StatsView() {
  const [days, setDays] = useState<number>(30);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/admin/stats?days=${days}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data && !data.error) setStats(data);
        if (!cancelled) setLoading(false);
      })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [days]);

  const totalCreditConsumed = stats?.creditsDaily.reduce((s, d) => s + d.value, 0) ?? 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">통계 대시보드</h1>
          <p className="text-xs text-gray-400 mt-0.5">서비스 주요 지표를 확인합니다.</p>
        </div>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          {RANGES.map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-1.5 text-xs transition-colors ${
                days === d
                  ? "bg-purple-600 text-white font-medium"
                  : "bg-white text-gray-500 hover:bg-gray-50"
              }`}
            >
              {d}일
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border bg-white p-5 animate-pulse">
              <div className="h-3 bg-gray-100 rounded w-1/2 mb-3" />
              <div className="h-8 bg-gray-100 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <StatCard
              label="전체 회원"
              value={stats.totalUsers.toLocaleString()}
              sub={`WAU ${stats.wau.toLocaleString()}명`}
              accent="text-purple-700"
            />
            <StatCard
              label="전체 작품"
              value={stats.totalProjects.toLocaleString()}
              sub={`컷 ${stats.totalCuts.toLocaleString()}개`}
            />
            <StatCard
              label={`매출 (${days}일)`}
              value={`${stats.revenueKrw.toLocaleString()}원`}
              sub={`충전 ${stats.creditsPurchased.toLocaleString()} 크레딧`}
              accent="text-emerald-600"
            />
            <StatCard
              label={`소비 크레딧 (${days}일)`}
              value={totalCreditConsumed.toLocaleString()}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <MiniChart
              title={`작품 생성 (최근 ${days}일)`}
              data={stats.projectsDaily}
              color="#7c3aed"
            />
            <MiniChart
              title={`컷 생성 (최근 ${days}일)`}
              data={stats.cutsDaily}
              color="#6366f1"
            />
            <MiniChart
              title={`크레딧 소비 (최근 ${days}일)`}
              data={stats.creditsDaily}
              color="#f97316"
              type="line"
            />
          </div>
        </>
      ) : (
        <p className="text-gray-400 text-sm">데이터를 불러올 수 없습니다.</p>
      )}
    </div>
  );
}
