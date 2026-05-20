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

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

export default function StatsView() {
  const [days, setDays] = useState<number>(30);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/stats?days=${days}`).then((r) => r.json()).then((data) => {
      if (!cancelled && data && !data.error) setStats(data);
    });
    return () => { cancelled = true; };
  }, [days]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">통계 대시보드</h1>
        <div className="flex rounded-lg bg-gray-100 p-0.5 gap-0.5">
          {RANGES.map((d) => (
            <button key={d} onClick={() => setDays(d)}
              className={`px-3 py-1 rounded text-xs ${days === d ? "bg-white shadow text-gray-900" : "text-gray-500"}`}>
              {d}일
            </button>
          ))}
        </div>
      </div>

      {!stats ? (
        <p className="text-gray-400 text-sm">불러오는 중...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <StatCard label="WAU (7일)" value={stats.wau.toLocaleString()} sub={`전체 ${stats.totalUsers.toLocaleString()}명`} />
            <StatCard label="전체 작품" value={stats.totalProjects.toLocaleString()} sub={`컷 ${stats.totalCuts.toLocaleString()}`} />
            <StatCard label={`매출 (${days}일)`} value={`${stats.revenueKrw.toLocaleString()}원`} sub={`충전 ${stats.creditsPurchased.toLocaleString()} 크레딧`} />
            <StatCard
              label={`소비 크레딧 (${days}일)`}
              value={stats.creditsDaily.reduce((s, d) => s + d.value, 0).toLocaleString()}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <MiniChart title={`작품 생성 (최근 ${days}일)`} data={stats.projectsDaily} color="#111" />
            <MiniChart title={`컷 생성 (최근 ${days}일)`} data={stats.cutsDaily} color="#6366f1" />
            <MiniChart title={`크레딧 소비 (최근 ${days}일)`} data={stats.creditsDaily} color="#f97316" type="line" />
          </div>
        </>
      )}
    </div>
  );
}
