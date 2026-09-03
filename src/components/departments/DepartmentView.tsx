"use client";

import React from "react";
import { useEmployees } from "@/context/EmployeeContext";
import { Building2, Users, DollarSign, ArrowRight, TrendingUp } from "lucide-react";

interface DepartmentViewProps {
  setCurrentTab: (tab: string) => void;
}

export function DepartmentView({ setCurrentTab }: DepartmentViewProps) {
  const { stats, setFilterParams } = useEmployees();

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const handleSelectDepartment = (deptName: string) => {
    setFilterParams((prev) => ({
      ...prev,
      department: deptName,
      page: 1,
    }));
    setCurrentTab("employees");
  };

  if (!stats) {
    return <div className="p-8 text-center text-slate-400">Loading department data...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-indigo-400" />
          <span>Department Operational Overview</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Detailed metrics across all {stats.departmentCount} active business units.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.departmentBreakdown.map((dept) => (
          <div
            key={dept.name}
            className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 transition flex flex-col justify-between shadow-xl group"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {dept.count} Members
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-100 group-hover:text-indigo-400 transition">
                {dept.name}
              </h3>

              <div className="my-4 p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Active Headcount:</span>
                  <span className="font-semibold text-emerald-400">{dept.active} Active</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Inactive Headcount:</span>
                  <span className="font-semibold text-amber-400">{dept.inactive} Inactive</span>
                </div>
                <div className="flex items-center justify-between text-slate-400 pt-2 border-t border-slate-800">
                  <span>Total Department Payroll:</span>
                  <span className="font-mono font-bold text-slate-100">
                    {formatCurrency(dept.totalSalary)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Average Salary:</span>
                  <span className="font-mono font-semibold text-slate-300">
                    {formatCurrency(dept.avgSalary)}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleSelectDepartment(dept.name)}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 hover:border-indigo-500 transition flex items-center justify-center gap-2"
            >
              <span>View Department Employees</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
