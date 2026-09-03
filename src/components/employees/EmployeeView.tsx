"use client";

import React from "react";
import { useEmployees } from "@/context/EmployeeContext";
import { useAuth } from "@/context/AuthContext";
import { EmployeeFilters } from "./EmployeeFilters";
import { EmployeeTable } from "./EmployeeTable";
import { EmployeeCards } from "./EmployeeCards";
import { Plus, Users, ShieldAlert } from "lucide-react";

export function EmployeeView() {
  const { viewMode, openCreateModal, totalEmployees } = useEmployees();
  const { isAdmin } = useAuth();

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <span>Employee Directory</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage records, search personnel profiles, update statuses, and review compensation.
          </p>
        </div>

        {isAdmin ? (
          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Employee</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs shrink-0">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>View Only Mode (Employee Role)</span>
          </div>
        )}
      </div>

      {/* Filter Toolbar */}
      <EmployeeFilters />

      {/* Directory Content */}
      {viewMode === "table" ? <EmployeeTable /> : <EmployeeCards />}
    </div>
  );
}
