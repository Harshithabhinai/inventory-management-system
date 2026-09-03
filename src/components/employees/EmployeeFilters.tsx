"use client";

import React from "react";
import { useEmployees } from "@/context/EmployeeContext";
import {
  Search,
  Filter,
  ArrowUpDown,
  LayoutList,
  LayoutGrid,
  X,
  RotateCcw,
} from "lucide-react";

export function EmployeeFilters() {
  const {
    filterParams,
    setFilterParams,
    departmentsList,
    viewMode,
    setViewMode,
  } = useEmployees();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterParams((prev) => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterParams((prev) => ({ ...prev, department: e.target.value, page: 1 }));
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterParams((prev) => ({ ...prev, isActive: e.target.value, page: 1 }));
  };

  const handleSortByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterParams((prev) => ({ ...prev, sortBy: e.target.value, page: 1 }));
  };

  const toggleSortOrder = () => {
    setFilterParams((prev) => ({
      ...prev,
      sortOrder: prev.sortOrder === "asc" ? "desc" : "asc",
    }));
  };

  const resetFilters = () => {
    setFilterParams({
      search: "",
      department: "All",
      isActive: "all",
      sortBy: "firstName",
      sortOrder: "asc",
      page: 1,
      limit: 10,
    });
  };

  const hasActiveFilters =
    filterParams.search !== "" ||
    filterParams.department !== "All" ||
    filterParams.isActive !== "all";

  return (
    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search name, email, designation..."
            value={filterParams.search}
            onChange={handleSearchChange}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
          {filterParams.search && (
            <button
              onClick={() => setFilterParams((prev) => ({ ...prev, search: "", page: 1 }))}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Department Filter */}
          <select
            value={filterParams.department}
            onChange={handleDepartmentChange}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
          >
            <option value="All">All Departments</option>
            {departmentsList.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterParams.isActive}
            onChange={handleStatusChange}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
          >
            <option value="all">All Statuses</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>

          {/* Sort By */}
          <select
            value={filterParams.sortBy}
            onChange={handleSortByChange}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
          >
            <option value="firstName">Sort: First Name</option>
            <option value="lastName">Sort: Last Name</option>
            <option value="department">Sort: Department</option>
            <option value="salary">Sort: Salary</option>
            <option value="joiningDate">Sort: Joining Date</option>
            <option value="isActive">Sort: Status</option>
          </select>

          {/* Sort Direction Toggle */}
          <button
            onClick={toggleSortOrder}
            className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition"
            title={`Sort Order: ${filterParams.sortOrder.toUpperCase()}`}
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="p-2 text-rose-400 hover:bg-rose-950/40 border border-rose-800/40 rounded-xl transition text-xs flex items-center gap-1"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}

          {/* View Mode Toggle (Table vs Cards) */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 ml-auto">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition ${
                viewMode === "table"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Table View"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition ${
                viewMode === "grid"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Grid Cards View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
