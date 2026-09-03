"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  color?: "indigo" | "emerald" | "amber" | "cyan" | "rose" | "violet";
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = "indigo",
}: StatCardProps) {
  const colorStyles = {
    indigo: "from-indigo-500/10 to-indigo-600/5 text-indigo-400 border-indigo-500/20 icon-bg:bg-indigo-500/10",
    emerald: "from-emerald-500/10 to-emerald-600/5 text-emerald-400 border-emerald-500/20 icon-bg:bg-emerald-500/10",
    amber: "from-amber-500/10 to-amber-600/5 text-amber-400 border-amber-500/20 icon-bg:bg-amber-500/10",
    cyan: "from-cyan-500/10 to-cyan-600/5 text-cyan-400 border-cyan-500/20 icon-bg:bg-cyan-500/10",
    rose: "from-rose-500/10 to-rose-600/5 text-rose-400 border-rose-500/20 icon-bg:bg-rose-500/10",
    violet: "from-violet-500/10 to-violet-600/5 text-violet-400 border-violet-500/20 icon-bg:bg-violet-500/10",
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-slate-900 border p-5 bg-gradient-to-br transition-all hover:scale-[1.01] ${colorStyles[color]}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
            {title}
          </p>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
            {value}
          </h3>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
          {trend && (
            <span className="inline-block text-[11px] font-semibold text-emerald-400 mt-2 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-md">
              {trend}
            </span>
          )}
        </div>
        <div className={`p-3 rounded-xl border border-white/5 ${colorStyles[color].split(" ")[2]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
