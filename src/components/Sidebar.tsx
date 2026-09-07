"use client";

import React from "react";
import {
  LayoutDashboard,
  Package,
  Tags,
  Truck,
  ArrowDownToLine,
  ArrowUpFromLine,
  Boxes,
  BarChart3,
  Terminal,
  FileCode,
  AlertTriangle,
  FileSpreadsheet,
} from "lucide-react";

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  lowStockCount: number;
}

export function Sidebar({ currentTab, onSelectTab, lowStockCount }: SidebarProps) {
  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      badge: null,
      section: "CORE",
    },
    {
      id: "products",
      label: "Products",
      icon: Package,
      badge: null,
      section: "INVENTORY",
    },
    {
      id: "categories",
      label: "Categories",
      icon: Tags,
      badge: null,
      section: "INVENTORY",
    },
    {
      id: "suppliers",
      label: "Suppliers",
      icon: Truck,
      badge: null,
      section: "INVENTORY",
    },
    {
      id: "purchases",
      label: "Purchases (Stock In)",
      icon: ArrowDownToLine,
      badge: null,
      section: "TRANSACTIONS",
    },
    {
      id: "sales",
      label: "Sales (Stock Out)",
      icon: ArrowUpFromLine,
      badge: null,
      section: "TRANSACTIONS",
    },
    {
      id: "stock",
      label: "Stock & Adjustments",
      icon: Boxes,
      badge: lowStockCount > 0 ? `${lowStockCount} Low` : null,
      badgeColor: "bg-amber-100 text-amber-800",
      section: "OPERATIONS",
    },
    {
      id: "reports",
      label: "Reports & Analytics",
      icon: BarChart3,
      badge: null,
      section: "OPERATIONS",
    },
    {
      id: "api-explorer",
      label: "Swagger / API Tester",
      icon: Terminal,
      badge: "REST",
      badgeColor: "bg-emerald-100 text-emerald-800",
      section: "DEVELOPER",
    },
    {
      id: "architecture",
      label: "Angular + .NET Architecture",
      icon: FileCode,
      badge: "C# / TS",
      badgeColor: "bg-indigo-100 text-indigo-800",
      section: "DEVELOPER",
    },
  ];

  let currentSection = "";

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] border-r border-slate-800">
      <div className="p-4 flex-1 space-y-6 overflow-y-auto">
        {navItems.map((item) => {
          const isNewSection = item.section !== currentSection;
          currentSection = item.section;
          const isActive = currentTab === item.id;

          return (
            <div key={item.id}>
              {isNewSection && (
                <div className="px-3 pt-3 pb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  {item.section}
                </div>
              )}
              <button
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    className={`w-4 h-4 transition ${
                      isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      item.badgeColor || "bg-indigo-500/20 text-indigo-300"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer Info Box */}
      <div className="p-4 m-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs">
        <div className="flex items-center gap-1.5 text-indigo-300 font-semibold mb-1">
          <Terminal className="w-3.5 h-3.5" />
          <span>Real-time DB Sync</span>
        </div>
        <p className="text-slate-400 text-[11px] leading-relaxed">
          Transactional ACID stock updates, low-stock checks, and complete audit logging enabled.
        </p>
      </div>
    </aside>
  );
}
