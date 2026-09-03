"use client";

import React from "react";
import { useEmployees } from "@/context/EmployeeContext";
import { useAuth } from "@/context/AuthContext";
import { Eye, Edit2, Trash2, Mail, Phone, MapPin, CheckCircle, XCircle } from "lucide-react";

export function EmployeeCards() {
  const { employees, loading, openDetailModal, openEditModal, deleteEmployee, toggleActiveStatus } =
    useEmployees();
  const { isAdmin } = useAuth();

  const formatCurrency = (val: string | number) => {
    const num = typeof val === "string" ? parseFloat(val) : val;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(num || 0);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-48 bg-slate-900 rounded-2xl border border-slate-800 animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="p-12 text-center bg-slate-900 rounded-2xl border border-slate-800 text-slate-400">
        <p className="text-sm font-semibold text-slate-300">No employees match criteria</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {employees.map((emp) => (
        <div
          key={emp.id}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between group shadow-lg"
        >
          <div>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                {emp.avatarUrl ? (
                  <img
                    src={emp.avatarUrl}
                    alt={`${emp.firstName} ${emp.lastName}`}
                    className="w-12 h-12 rounded-full object-cover border border-slate-700 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-indigo-950 border border-indigo-700/50 text-indigo-300 flex items-center justify-center font-bold text-sm shrink-0">
                    {emp.firstName[0]}
                    {emp.lastName[0]}
                  </div>
                )}
                <div>
                  <h4
                    onClick={() => openDetailModal(emp)}
                    className="font-bold text-slate-100 hover:text-indigo-400 cursor-pointer text-sm"
                  >
                    {emp.firstName} {emp.lastName}
                  </h4>
                  <p className="text-xs text-indigo-400 font-medium">{emp.designation}</p>
                </div>
              </div>

              <button
                disabled={!isAdmin}
                onClick={() => toggleActiveStatus(emp)}
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  emp.isActive
                    ? "bg-emerald-950 text-emerald-300 border-emerald-700/50"
                    : "bg-amber-950 text-amber-300 border-amber-700/50"
                }`}
              >
                {emp.isActive ? "Active" : "Inactive"}
              </button>
            </div>

            <div className="space-y-1.5 text-xs text-slate-400 my-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Department:</span>
                <span className="font-semibold text-slate-200">{emp.department}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Salary:</span>
                <span className="font-mono font-semibold text-emerald-400">
                  {formatCurrency(emp.salary)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="truncate max-w-[170px] text-slate-300">{emp.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Location:</span>
                <span className="text-slate-300">{emp.location || "Remote"}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <span className="text-[10px] text-slate-500">Joined {emp.joiningDate}</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => openDetailModal(emp)}
                className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition"
                title="View Profile"
              >
                <Eye className="w-4 h-4" />
              </button>
              {isAdmin && (
                <>
                  <button
                    onClick={() => openEditModal(emp)}
                    className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteEmployee(emp.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
