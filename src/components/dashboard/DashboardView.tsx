"use client";

import React from "react";
import { useEmployees } from "@/context/EmployeeContext";
import { useAuth } from "@/context/AuthContext";
import { StatCard } from "./StatCard";
import {
  Users,
  UserCheck,
  UserX,
  DollarSign,
  TrendingUp,
  Building2,
  Plus,
  ArrowRight,
  Clock,
  Briefcase,
  PieChart,
  Layers,
  Sparkles,
  ShieldAlert,
} from "lucide-react";

interface DashboardViewProps {
  setCurrentTab: (tab: string) => void;
}

export function DashboardView({ setCurrentTab }: DashboardViewProps) {
  const { stats, statsLoading, openCreateModal } = useEmployees();
  const { isAdmin, user } = useAuth();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (statsLoading || !stats) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-900 rounded-2xl border border-slate-800"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-slate-900 rounded-2xl border border-slate-800"></div>
          <div className="h-80 bg-slate-900 rounded-2xl border border-slate-800"></div>
        </div>
      </div>
    );
  }

  const activePercent = stats.totalEmployees
    ? Math.round((stats.activeEmployees / stats.totalEmployees) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-slate-800 p-6 sm:p-8">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Welcome back, {user?.username}
              </span>
              <span className="text-xs text-slate-400">• Role: {user?.role}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Employee Operations Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Real-time monitoring of personnel, department workforce distributions, payroll allocations, and system audit logs.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setCurrentTab("employees")}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-2"
            >
              <span>View Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            {isAdmin && (
              <button
                onClick={openCreateModal}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>New Employee</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Employees"
          value={stats.totalEmployees}
          subtitle={`${stats.departmentCount} departments`}
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Active Personnel"
          value={stats.activeEmployees}
          subtitle={`${activePercent}% operational capacity`}
          icon={UserCheck}
          color="emerald"
        />
        <StatCard
          title="Inactive Personnel"
          value={stats.inactiveEmployees}
          subtitle="On sabbatical or resigned"
          icon={UserX}
          color="amber"
        />
        <StatCard
          title="Annual Payroll"
          value={formatCurrency(stats.totalPayroll)}
          subtitle={`Avg: ${formatCurrency(stats.averageSalary)} / yr`}
          icon={DollarSign}
          color="cyan"
        />
      </div>

      {/* Active Workforce Gauge & Quick Metrics */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1 w-full">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className="text-slate-300">Active vs Inactive Retention Ratio</span>
            <span className="text-emerald-400">{activePercent}% Active</span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
              style={{ width: `${activePercent}%` }}
              title={`Active: ${stats.activeEmployees}`}
            />
            <div
              className="h-full bg-amber-500/60 transition-all duration-500"
              style={{ width: `${100 - activePercent}%` }}
              title={`Inactive: ${stats.inactiveEmployees}`}
            />
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400 mt-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Active ({stats.activeEmployees})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Inactive ({stats.inactiveEmployees})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right border-r border-slate-800 pr-4">
            <p className="text-[10px] uppercase font-bold text-slate-500">Average Salary</p>
            <p className="text-base font-bold text-slate-100">
              {formatCurrency(stats.averageSalary)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-slate-500">Departments</p>
            <p className="text-base font-bold text-slate-100">{stats.departmentCount}</p>
          </div>
        </div>
      </div>

      {/* Main Charts & Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Workforce Breakdown */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-slate-100 text-sm uppercase tracking-wider">
                  Department Headcount & Payroll Allocation
                </h3>
              </div>
              <button
                onClick={() => setCurrentTab("departments")}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-4">
              {stats.departmentBreakdown.map((dept) => {
                const maxCount = Math.max(...stats.departmentBreakdown.map((d) => d.count)) || 1;
                const percent = Math.round((dept.count / maxCount) * 100);

                return (
                  <div key={dept.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-semibold text-slate-200">
                        <span>{dept.name}</span>
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                          {dept.count} emp
                        </span>
                      </div>
                      <div className="text-slate-400 font-mono text-[11px]">
                        Total: {formatCurrency(dept.totalSalary)} | Avg: {formatCurrency(dept.avgSalary)}
                      </div>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden flex">
                      <div
                        className="h-full bg-indigo-500 transition-all duration-500 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Salary Tier Distribution & Location Overview */}
        <div className="space-y-6">
          {/* Salary Tiers */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-slate-100 text-sm uppercase tracking-wider">
                Salary Compensation Tiers
              </h3>
            </div>

            <div className="space-y-3">
              {[
                { label: "< $70,000", count: stats.salaryTiers.under70k, color: "bg-blue-500" },
                { label: "$70,000 - $95,000", count: stats.salaryTiers.tier70to95k, color: "bg-cyan-500" },
                { label: "$95,000 - $120,000", count: stats.salaryTiers.tier95to120k, color: "bg-indigo-500" },
                { label: "> $120,000", count: stats.salaryTiers.over120k, color: "bg-emerald-500" },
              ].map((tier) => (
                <div key={tier.label} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className={`w-3 h-3 rounded-md ${tier.color}`} />
                    <span>{tier.label}</span>
                  </div>
                  <span className="font-bold text-slate-100 font-mono bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-700">
                    {tier.count} emp
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Location Breakdown */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-slate-100 text-sm uppercase tracking-wider">
                Hub & Remote Workspaces
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {stats.locationBreakdown.map((loc) => (
                <span
                  key={loc.location}
                  className="text-xs font-medium px-3 py-1.5 rounded-xl bg-slate-800/90 text-slate-300 border border-slate-700 flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  {loc.location}: <strong className="text-white">{loc.count}</strong>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Audit Log / Recent System Activity */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-slate-100 text-sm uppercase tracking-wider">
              Recent System Activity & Audit Trail
            </h3>
          </div>
          <span className="text-xs text-slate-400">Live system events</span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {stats.recentActivities.length === 0 ? (
            <p className="text-xs text-slate-500 py-4">No recent activity logged.</p>
          ) : (
            stats.recentActivities.map((act) => (
              <div key={act.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-200">{act.action}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{act.details}</p>
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 shrink-0 font-mono">
                  By <strong className="text-slate-300">{act.userName}</strong> ({act.userRole}) •{" "}
                  {new Date(act.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
