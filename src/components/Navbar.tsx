"use client";

import React, { useState } from "react";
import { useAuth } from "./AuthContext";
import { useToast } from "./Toast";
import {
  Boxes,
  Bell,
  PlusCircle,
  ShoppingCart,
  RefreshCw,
  UserCheck,
  ChevronDown,
  Layers,
  Sparkles,
  ShieldCheck,
  Code2,
} from "lucide-react";

interface NavbarProps {
  onNavigate: (tab: string) => void;
  lowStockCount: number;
  onOpenNewSale: () => void;
  onOpenNewPurchase: () => void;
  onRefreshData: () => Promise<void>;
}

export function Navbar({
  onNavigate,
  lowStockCount,
  onOpenNewSale,
  onOpenNewPurchase,
  onRefreshData,
}: NavbarProps) {
  const { user, switchUser, logout } = useAuth();
  const { showToast } = useToast();
  const [isReseeding, setIsReseeding] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleReseed = async () => {
    setIsReseeding(true);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      if (!res.ok) throw new Error("Failed to reset database");
      await onRefreshData();
      showToast("Demo database re-seeded successfully!", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to reset data", "error");
    } finally {
      setIsReseeding(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate("dashboard")}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-lg tracking-tight">StockFlow Pro</span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Enterprise
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden md:block">
              Angular + ASP.NET Core Web API + SQL Server Architecture
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Action: New Sale */}
          <button
            onClick={onOpenNewSale}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 transition shadow-xs"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">New Sale</span>
          </button>

          {/* Quick Action: New Purchase */}
          <button
            onClick={onOpenNewPurchase}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 transition shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">New Purchase</span>
          </button>

          {/* Low Stock Alert Bell */}
          <button
            onClick={() => onNavigate("stock-alerts")}
            title="Low Stock Alerts"
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
          >
            <Bell className="w-5 h-5" />
            {lowStockCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white animate-pulse">
                {lowStockCount}
              </span>
            )}
          </button>

          {/* Reset Demo Data Button */}
          <button
            onClick={handleReseed}
            disabled={isReseeding}
            title="Reset to fresh demo inventory data"
            className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReseeding ? "animate-spin text-indigo-600" : ""}`} />
            <span>Reset Demo</span>
          </button>

          {/* User Menu / Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
            >
              <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                {user?.name?.slice(0, 2).toUpperCase() || "US"}
              </div>
              <div className="text-left hidden md:block">
                <div className="text-xs font-semibold text-slate-800 leading-none">{user?.name}</div>
                <div className="text-[10px] text-slate-500 leading-tight flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  {user?.role}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {userMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                onClick={() => setUserMenuOpen(false)}
              >
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-xs font-medium text-slate-400">Signed in as</p>
                  <p className="text-sm font-semibold text-slate-900 truncate">{user?.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                    Role: {user?.role}
                  </span>
                </div>

                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Switch Demo Role
                </div>
                <button
                  onClick={() => switchUser("Admin")}
                  className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 flex items-center justify-between ${
                    user?.role === "Admin" ? "font-semibold text-indigo-600 bg-indigo-50/50" : "text-slate-700"
                  }`}
                >
                  <span>Admin User</span>
                  <span className="text-[10px] text-slate-400">Full Access</span>
                </button>
                <button
                  onClick={() => switchUser("Manager")}
                  className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 flex items-center justify-between ${
                    user?.role === "Manager" ? "font-semibold text-indigo-600 bg-indigo-50/50" : "text-slate-700"
                  }`}
                >
                  <span>Sarah Manager</span>
                  <span className="text-[10px] text-slate-400">Inventory Mgr</span>
                </button>
                <button
                  onClick={() => switchUser("Sales")}
                  className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 flex items-center justify-between ${
                    user?.role === "Sales" ? "font-semibold text-indigo-600 bg-indigo-50/50" : "text-slate-700"
                  }`}
                >
                  <span>Alex Sales</span>
                  <span className="text-[10px] text-slate-400">Sales Rep</span>
                </button>

                <div className="border-t border-slate-100 mt-2 pt-1">
                  <button
                    onClick={() => {
                      onNavigate("architecture");
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Code2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>View .NET & Angular Code</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
