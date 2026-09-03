"use client";

import React from "react";
import { useEmployees } from "@/context/EmployeeContext";
import { useAuth } from "@/context/AuthContext";
import {
  X,
  Mail,
  Phone,
  Building2,
  Calendar,
  DollarSign,
  MapPin,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  Shield,
  FileText,
  Briefcase,
} from "lucide-react";

export function EmployeeDetailModal() {
  const {
    isDetailModalOpen,
    closeDetailModal,
    selectedEmployee,
    openEditModal,
    deleteEmployee,
    toggleActiveStatus,
  } = useEmployees();

  const { isAdmin } = useAuth();

  if (!isDetailModalOpen || !selectedEmployee) return null;

  const emp = selectedEmployee;

  const formatCurrency = (val: string | number) => {
    const num = typeof val === "string" ? parseFloat(val) : val;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(num || 0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl flex flex-col">
        {/* Header Cover Banner */}
        <div className="h-28 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 relative p-4 flex items-start justify-between">
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-slate-900/80 text-slate-300 border border-slate-700/50 backdrop-blur">
            ID: #{emp.id}
          </span>
          <button
            onClick={closeDetailModal}
            className="p-1.5 text-slate-300 hover:text-white rounded-xl bg-slate-900/60 hover:bg-slate-900 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Card Body */}
        <div className="px-6 pb-6 pt-0 relative space-y-6">
          {/* Avatar and Basic Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-12">
            <div className="flex items-end gap-4">
              {emp.avatarUrl ? (
                <img
                  src={emp.avatarUrl}
                  alt={`${emp.firstName} ${emp.lastName}`}
                  className="w-20 h-20 rounded-2xl object-cover border-4 border-slate-900 shadow-xl"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-indigo-950 border-4 border-slate-900 text-indigo-300 flex items-center justify-center font-bold text-xl shadow-xl">
                  {emp.firstName[0]}
                  {emp.lastName[0]}
                </div>
              )}
              <div>
                <h2 className="text-xl font-extrabold text-white">
                  {emp.firstName} {emp.lastName}
                </h2>
                <p className="text-xs text-indigo-400 font-semibold">{emp.designation}</p>
              </div>
            </div>

            <button
              disabled={!isAdmin}
              onClick={() => toggleActiveStatus(emp)}
              className={`px-3 py-1 rounded-full text-xs font-bold border transition flex items-center gap-1.5 ${
                emp.isActive
                  ? "bg-emerald-950 text-emerald-300 border-emerald-700/50"
                  : "bg-amber-950 text-amber-300 border-amber-700/50"
              }`}
            >
              {emp.isActive ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Active</span>
                </>
              ) : (
                <>
                  <XCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Inactive</span>
                </>
              )}
            </button>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-slate-400">
                <Mail className="w-4 h-4 text-indigo-400" />
                <span className="font-semibold text-slate-300">Email Address</span>
              </div>
              <p className="text-slate-100 font-medium truncate">{emp.email}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-slate-400">
                <Phone className="w-4 h-4 text-indigo-400" />
                <span className="font-semibold text-slate-300">Phone Contact</span>
              </div>
              <p className="text-slate-100 font-medium">{emp.phone}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-slate-400">
                <Building2 className="w-4 h-4 text-indigo-400" />
                <span className="font-semibold text-slate-300">Department</span>
              </div>
              <p className="text-slate-100 font-medium">{emp.department}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-slate-400">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-slate-300">Annual Salary</span>
              </div>
              <p className="text-slate-100 font-mono font-bold text-sm">
                {formatCurrency(emp.salary)}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-slate-400">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span className="font-semibold text-slate-300">Joining Date</span>
              </div>
              <p className="text-slate-100 font-mono">{emp.joiningDate}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-slate-400">
                <MapPin className="w-4 h-4 text-indigo-400" />
                <span className="font-semibold text-slate-300">Office Location</span>
              </div>
              <p className="text-slate-100 font-medium">{emp.location || "Remote Workspace"}</p>
            </div>
          </div>

          {/* Notes Section */}
          {emp.notes && (
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>Internal Bio & Notes</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{emp.notes}</p>
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              Created {new Date(emp.createdAt || "").toLocaleDateString()}
            </span>

            <div className="flex items-center gap-2">
              {isAdmin ? (
                <>
                  <button
                    onClick={() => {
                      closeDetailModal();
                      openEditModal(emp);
                    }}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                  <button
                    onClick={async () => {
                      await deleteEmployee(emp.id);
                      closeDetailModal();
                    }}
                    className="p-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/50 text-xs font-semibold transition"
                    title="Delete Employee"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <span className="text-[11px] text-slate-500 italic">
                  Read-only view (Employee Role)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
