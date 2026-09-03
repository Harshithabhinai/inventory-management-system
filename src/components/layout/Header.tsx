"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useEmployees } from "@/context/EmployeeContext";
import {
  Menu,
  Search,
  Plus,
  Download,
  UserCheck,
  Shield,
  Bell,
  RefreshCw,
} from "lucide-react";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export function Header({
  sidebarOpen,
  setSidebarOpen,
  currentTab,
  setCurrentTab,
}: HeaderProps) {
  const { user, isAdmin } = useAuth();
  const {
    openCreateModal,
    filterParams,
    setFilterParams,
    fetchEmployees,
    fetchStats,
    employees,
    totalEmployees,
  } = useEmployees();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterParams((prev) => ({ ...prev, search: e.target.value, page: 1 }));
    if (currentTab !== "employees") {
      setCurrentTab("employees");
    }
  };

  const handleExportCSV = () => {
    if (employees.length === 0) return;
    const headers = ["ID", "First Name", "Last Name", "Email", "Phone", "Department", "Designation", "Salary", "Joining Date", "Status", "Location"];
    const rows = employees.map((emp) => [
      emp.id,
      `"${emp.firstName}"`,
      `"${emp.lastName}"`,
      `"${emp.email}"`,
      `"${emp.phone}"`,
      `"${emp.department}"`,
      `"${emp.designation}"`,
      emp.salary,
      emp.joiningDate,
      emp.isActive ? "Active" : "Inactive",
      `"${emp.location || "Remote"}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `employees_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between gap-4">
      {/* Mobile Toggle & Left Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            {currentTab === "dashboard" && "Dashboard Analytics"}
            {currentTab === "employees" && "Employee Directory"}
            {currentTab === "departments" && "Department Overview"}
            {currentTab === "users" && "User Access & Permissions"}
            {currentTab === "settings" && "System Settings"}
          </h2>
          <p className="text-[11px] text-slate-400">
            {totalEmployees} records indexed
          </p>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-md mx-2 sm:mx-6">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search employee name, department, title..."
            value={filterParams.search}
            onChange={handleSearchChange}
            className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
          />
        </div>
      </div>

      {/* Actions & User Badge */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Refresh */}
        <button
          onClick={() => {
            fetchEmployees();
            fetchStats();
          }}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="Refresh Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* CSV Export */}
        <button
          onClick={handleExportCSV}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
          title="Export current table view to CSV"
        >
          <Download className="w-3.5 h-3.5 text-slate-400" />
          <span>Export</span>
        </button>

        {/* Add Employee (Admin only or disabled with tooltip) */}
        {isAdmin ? (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Employee</span>
          </button>
        ) : (
          <button
            disabled
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-500 text-xs font-medium border border-slate-800 cursor-not-allowed"
            title="Switch to Admin mode to add employees"
          >
            <Plus className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Add Employee (Admin Only)</span>
          </button>
        )}

        {/* Current Role Chip */}
        <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-800">
          <span
            className={`flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg border ${
              isAdmin
                ? "bg-indigo-950/80 text-indigo-300 border-indigo-700/50"
                : "bg-emerald-950/80 text-emerald-300 border-emerald-700/50"
            }`}
          >
            <Shield className="w-3 h-3" />
            {isAdmin ? "Admin Role" : "Employee Role"}
          </span>
        </div>
      </div>
    </header>
  );
}
