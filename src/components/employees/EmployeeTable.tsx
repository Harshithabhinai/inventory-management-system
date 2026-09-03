"use client";

import React, { useState } from "react";
import { useEmployees } from "@/context/EmployeeContext";
import { useAuth } from "@/context/AuthContext";
import { Employee } from "@/types";
import {
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  XCircle,
  Shield,
} from "lucide-react";

export function EmployeeTable() {
  const {
    employees,
    totalEmployees,
    totalPages,
    loading,
    filterParams,
    setFilterParams,
    openDetailModal,
    openEditModal,
    deleteEmployee,
    toggleActiveStatus,
  } = useEmployees();

  const { isAdmin } = useAuth();
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const formatCurrency = (val: string | number) => {
    const num = typeof val === "string" ? parseFloat(val) : val;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(num || 0);
  };

  const handleSort = (columnKey: string) => {
    if (filterParams.sortBy === columnKey) {
      setFilterParams((prev) => ({
        ...prev,
        sortOrder: prev.sortOrder === "asc" ? "desc" : "asc",
      }));
    } else {
      setFilterParams((prev) => ({
        ...prev,
        sortBy: columnKey,
        sortOrder: "asc",
      }));
    }
  };

  const handleConfirmDelete = async (id: number) => {
    await deleteEmployee(id);
    setDeleteConfirmId(null);
  };

  const getDeptColor = (dept: string) => {
    switch (dept) {
      case "Engineering":
        return "bg-indigo-500/10 text-indigo-300 border-indigo-500/30";
      case "Human Resources":
        return "bg-rose-500/10 text-rose-300 border-rose-500/30";
      case "Finance":
        return "bg-emerald-500/10 text-emerald-300 border-emerald-500/30";
      case "Marketing":
        return "bg-amber-500/10 text-amber-300 border-amber-500/30";
      case "Operations":
        return "bg-cyan-500/10 text-cyan-300 border-cyan-500/30";
      case "Product":
        return "bg-violet-500/10 text-violet-300 border-violet-500/30";
      case "Sales":
        return "bg-teal-500/10 text-teal-300 border-teal-500/30";
      default:
        return "bg-slate-500/10 text-slate-300 border-slate-500/30";
    }
  };

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <th
                onClick={() => handleSort("firstName")}
                className="py-3.5 px-4 cursor-pointer hover:text-slate-200 transition select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Employee Name</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="py-3.5 px-4">Contact</th>
              <th
                onClick={() => handleSort("department")}
                className="py-3.5 px-4 cursor-pointer hover:text-slate-200 transition select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Department & Role</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort("salary")}
                className="py-3.5 px-4 cursor-pointer hover:text-slate-200 transition select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Annual Compensation</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort("joiningDate")}
                className="py-3.5 px-4 cursor-pointer hover:text-slate-200 transition select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Joining Date</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort("isActive")}
                className="py-3.5 px-4 cursor-pointer hover:text-slate-200 transition select-none text-center"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>Status</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/60 text-xs">
            {loading ? (
              [1, 2, 3, 4, 5].map((n) => (
                <tr key={n} className="animate-pulse">
                  <td colSpan={7} className="py-4 px-4">
                    <div className="h-6 bg-slate-800/60 rounded-lg"></div>
                  </td>
                </tr>
              ))
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <p className="text-sm font-semibold text-slate-300">No employees found</p>
                  <p className="text-xs mt-1">Try adjusting your search criteria or clear filters.</p>
                </td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr
                  key={emp.id}
                  className="hover:bg-slate-800/40 transition group"
                >
                  {/* Name & Avatar */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      {emp.avatarUrl ? (
                        <img
                          src={emp.avatarUrl}
                          alt={`${emp.firstName} ${emp.lastName}`}
                          className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-indigo-950 border border-indigo-700/50 text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0">
                          {emp.firstName[0]}
                          {emp.lastName[0]}
                        </div>
                      )}
                      <div>
                        <button
                          onClick={() => openDetailModal(emp)}
                          className="font-semibold text-slate-100 hover:text-indigo-400 transition text-left"
                        >
                          {emp.firstName} {emp.lastName}
                        </button>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {emp.location || "Remote"}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5 text-[11px] text-slate-300">
                      <p className="flex items-center gap-1.5 text-slate-300">
                        <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="truncate max-w-[150px]">{emp.email}</span>
                      </p>
                      <p className="flex items-center gap-1.5 text-slate-400">
                        <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                        <span>{emp.phone}</span>
                      </p>
                    </div>
                  </td>

                  {/* Department & Title */}
                  <td className="py-3.5 px-4">
                    <div>
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border ${getDeptColor(
                          emp.department
                        )}`}
                      >
                        {emp.department}
                      </span>
                      <p className="text-xs text-slate-300 font-medium mt-1">
                        {emp.designation}
                      </p>
                    </div>
                  </td>

                  {/* Compensation */}
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-200">
                    {formatCurrency(emp.salary)}
                  </td>

                  {/* Joining Date */}
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                    {emp.joiningDate}
                  </td>

                  {/* Status Toggle */}
                  <td className="py-3.5 px-4 text-center">
                    {isAdmin ? (
                      <button
                        onClick={() => toggleActiveStatus(emp)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition ${
                          emp.isActive
                            ? "bg-emerald-950/80 text-emerald-300 border-emerald-700/50 hover:bg-emerald-900"
                            : "bg-amber-950/80 text-amber-300 border-amber-700/50 hover:bg-amber-900"
                        }`}
                        title="Click to toggle employee active status"
                      >
                        {emp.isActive ? (
                          <>
                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-amber-400" />
                            <span>Inactive</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                          emp.isActive
                            ? "bg-emerald-950/40 text-emerald-300 border-emerald-800/40"
                            : "bg-amber-950/40 text-amber-300 border-amber-800/40"
                        }`}
                      >
                        {emp.isActive ? "Active" : "Inactive"}
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* View */}
                      <button
                        onClick={() => openDetailModal(emp)}
                        className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition"
                        title="View Profile Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Edit */}
                      {isAdmin ? (
                        <button
                          onClick={() => openEditModal(emp)}
                          className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition"
                          title="Edit Employee"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          disabled
                          className="p-1.5 text-slate-600 cursor-not-allowed"
                          title="Admin permission required to edit"
                        >
                          <Edit2 className="w-4 h-4 opacity-40" />
                        </button>
                      )}

                      {/* Delete */}
                      {isAdmin ? (
                        deleteConfirmId === emp.id ? (
                          <div className="flex items-center gap-1 bg-rose-950 p-1 rounded-lg border border-rose-800 animate-fadeIn">
                            <button
                              onClick={() => handleConfirmDelete(emp.id)}
                              className="px-2 py-0.5 bg-rose-600 text-white rounded text-[10px] font-bold hover:bg-rose-500"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-1 text-slate-400 hover:text-white text-[10px]"
                            >
                              X
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(emp.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition"
                            title="Delete Employee"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )
                      ) : (
                        <button
                          disabled
                          className="p-1.5 text-slate-600 cursor-not-allowed"
                          title="Admin permission required to delete"
                        >
                          <Trash2 className="w-4 h-4 opacity-40" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls Footer */}
      <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="text-slate-400">
          Showing{" "}
          <strong className="text-slate-200">
            {totalEmployees === 0 ? 0 : (filterParams.page - 1) * filterParams.limit + 1}
          </strong>{" "}
          to{" "}
          <strong className="text-slate-200">
            {Math.min(filterParams.page * filterParams.limit, totalEmployees)}
          </strong>{" "}
          of <strong className="text-slate-200">{totalEmployees}</strong> entries
        </div>

        <div className="flex items-center gap-3">
          {/* Page Size Dropdown */}
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>Per page:</span>
            <select
              value={filterParams.limit}
              onChange={(e) =>
                setFilterParams((prev) => ({
                  ...prev,
                  limit: parseInt(e.target.value, 10),
                  page: 1,
                }))
              }
              className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          {/* Page Navigation Buttons */}
          <div className="flex items-center gap-1">
            <button
              disabled={filterParams.page <= 1}
              onClick={() =>
                setFilterParams((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))
              }
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 font-semibold text-slate-300 bg-slate-900 border border-slate-800 rounded-lg">
              Page {filterParams.page} of {totalPages}
            </span>

            <button
              disabled={filterParams.page >= totalPages}
              onClick={() =>
                setFilterParams((prev) => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))
              }
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
