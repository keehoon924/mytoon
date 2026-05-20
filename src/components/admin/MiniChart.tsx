"use client";

type Point = { date: string; value: number };

type Props = {
  title: string;
  data: Point[];
  color?: string;
  type?: "bar" | "line";
};

export default function MiniChart({ title, data, color = "#111", type = "bar" }: Props) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const total = data.reduce((s, d) => s + d.value, 0);
  const w = 600;
  const h = 120;
  const padL = 30, padR = 8, padT = 8, padB = 18;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;

  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="flex items-baseline justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        <span className="text-xs text-gray-400">합계 {total.toLocaleString()}</span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-32">
        {[0, 0.5, 1].map((p) => {
          const y = padT + innerH * (1 - p);
          return (
            <g key={p}>
              <line x1={padL} y1={y} x2={w - padR} y2={y} stroke="#eee" strokeWidth={1} />
              <text x={padL - 4} y={y + 3} textAnchor="end" fontSize={9} fill="#999">
                {Math.round(max * p).toLocaleString()}
              </text>
            </g>
          );
        })}
        {type === "bar" ? (
          data.map((d, i) => {
            const bw = innerW / data.length;
            const x = padL + bw * i + bw * 0.15;
            const bh = (d.value / max) * innerH;
            const y = padT + innerH - bh;
            return (
              <rect key={d.date} x={x} y={y} width={bw * 0.7} height={Math.max(0, bh)} fill={color} />
            );
          })
        ) : (
          (() => {
            const path = data.map((d, i) => {
              const x = padL + (innerW / Math.max(1, data.length - 1)) * i;
              const y = padT + innerH - (d.value / max) * innerH;
              return `${i === 0 ? "M" : "L"}${x},${y}`;
            }).join(" ");
            return <path d={path} stroke={color} strokeWidth={1.5} fill="none" />;
          })()
        )}
        <text x={padL} y={h - 4} fontSize={9} fill="#aaa">{data[0]?.date.slice(5)}</text>
        <text x={w - padR} y={h - 4} fontSize={9} fill="#aaa" textAnchor="end">{data.at(-1)?.date.slice(5)}</text>
      </svg>
    </div>
  );
}
