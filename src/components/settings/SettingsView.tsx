"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useEmployees } from "@/context/EmployeeContext";
import { Settings, RefreshCcw, Database, Shield, CheckCircle2 } from "lucide-react";

export function SettingsView() {
  const { user, isAdmin } = useAuth();
  const { fetchEmployees, fetchStats, addToast } = useEmployees();
  const [resetting, setResetting] = useState(false);

  const handleRefreshData = async () => {
    setResetting(true);
    await fetchEmployees();
    await fetchStats();
    setResetting(false);
    addToast("Data re-synced successfully!", "success");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-400" />
          <span>System Settings & Configuration</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure application defaults, review current session data, and trigger data synchronization.
        </p>
      </div>

      {/* Profile Overview */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-400" />
          <span>Active Session Information</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400">Logged in User:</span>
            <p className="font-semibold text-slate-200 mt-0.5">{user?.username}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400">Email Address:</span>
            <p className="font-semibold text-slate-200 mt-0.5">{user?.email}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400">Role Privilege Level:</span>
            <p className="font-semibold text-indigo-400 mt-0.5">{user?.role}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400">Database Connection:</span>
            <p className="font-semibold text-emerald-400 mt-0.5">PostgreSQL (Drizzle ORM)</p>
          </div>
        </div>
      </div>

      {/* Database Maintenance */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" />
          <span>Database & Cache Management</span>
        </h3>

        <p className="text-xs text-slate-300">
          Re-query backend database endpoints and refresh in-memory state.
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefreshData}
            disabled={resetting}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCcw className={`w-4 h-4 ${resetting ? "animate-spin" : ""}`} />
            <span>Sync & Refresh All Data</span>
          </button>
        </div>
      </div>
    </div>
  );
}
