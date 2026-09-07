"use client";

import React from "react";
import { DashboardMetrics } from "@/types";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import {
  Boxes,
  Package,
  AlertTriangle,
  TrendingUp,
  ArrowDownToLine,
  ArrowUpFromLine,
  PlusCircle,
  ShoppingCart,
  Sliders,
  ChevronRight,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

interface DashboardViewProps {
  metrics: DashboardMetrics | null;
  loading: boolean;
  onNavigate: (tab: string) => void;
  onOpenNewSale: () => void;
  onOpenNewPurchase: () => void;
  onOpenNewProduct: () => void;
  onOpenStockAdjust: () => void;
}

export function DashboardView({
  metrics,
  loading,
  onNavigate,
  onOpenNewSale,
  onOpenNewPurchase,
  onOpenNewProduct,
  onOpenStockAdjust,
}: DashboardViewProps) {
  if (loading || !metrics) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded-md w-64"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
        <div className="h-72 bg-slate-200 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                Live Enterprise System
              </span>
              <span className="text-xs text-slate-300">SQL Server & EF Core Architecture</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              Inventory Management Dashboard
            </h1>
            <p className="text-sm text-slate-300 max-w-xl mt-1">
              Real-time stock calculations, automated low-stock warnings, purchase restocking, and sales deduction with transactional integrity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenNewSale}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm shadow-md transition active:scale-95"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Create Sale</span>
            </button>
            <button
              onClick={onOpenNewPurchase}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm shadow-md transition active:scale-95"
            >
              <ArrowDownToLine className="w-4 h-4" />
              <span>Stock In (Purchase)</span>
            </button>
            <button
              onClick={onOpenStockAdjust}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm border border-slate-700 transition"
            >
              <Sliders className="w-4 h-4" />
              <span>Adjust</span>
            </button>
          </div>
        </div>
      </div>

      {/* Low Stock Warning Banner if any */}
      {metrics.lowStockCount > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-500 text-white rounded-xl shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900">
                Low Stock Alert: {metrics.lowStockCount} Product{metrics.lowStockCount > 1 ? "s" : ""} Below Reorder Level!
              </h3>
              <p className="text-xs text-amber-700 mt-0.5">
                Certain items have fallen below their safety threshold and require immediate purchase reorders.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate("stock")}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold self-start sm:self-auto transition shadow-xs"
          >
            <span>Review Low Stock</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Products */}
        <div
          onClick={() => onNavigate("products")}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-indigo-200 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Products
            </span>
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{metrics.totalProducts}</div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span>Active catalog items</span>
            </div>
          </div>
        </div>

        {/* Total Available Stock Units */}
        <div
          onClick={() => onNavigate("stock")}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-emerald-200 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Stock Units
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{metrics.totalStock}</div>
            <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Across warehouse storage</span>
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div
          onClick={() => onNavigate("stock")}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-rose-200 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Low Stock Items
            </span>
            <div
              className={`p-2.5 rounded-xl transition ${
                metrics.lowStockCount > 0
                  ? "bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div
              className={`text-2xl font-bold ${
                metrics.lowStockCount > 0 ? "text-rose-600" : "text-slate-900"
              }`}
            >
              {metrics.lowStockCount}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span>Items at or below reorder level</span>
            </div>
          </div>
        </div>

        {/* Total Sales Revenue */}
        <div
          onClick={() => onNavigate("sales")}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-purple-200 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Sales
            </span>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(metrics.totalSales)}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span>{metrics.countSales} completed orders</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row: Recent Stock Movements & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Real-time Transactions Feed (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span>Recent Inventory Transactions (Audit Log)</span>
              </h2>
              <p className="text-xs text-slate-500">Every stock increase, decrease, or adjustment recorded</p>
            </div>
            <button
              onClick={() => onNavigate("stock")}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {metrics.recentTransactions && metrics.recentTransactions.length > 0 ? (
              metrics.recentTransactions.map((tx) => (
                <div key={tx.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        tx.transactionType === "PURCHASE_IN"
                          ? "bg-emerald-100 text-emerald-700"
                          : tx.transactionType === "SALE_OUT"
                          ? "bg-rose-100 text-rose-700"
                          : tx.transactionType === "ADJUSTMENT"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {tx.transactionType === "PURCHASE_IN" ? (
                        <ArrowDownToLine className="w-4 h-4" />
                      ) : tx.transactionType === "SALE_OUT" ? (
                        <ArrowUpFromLine className="w-4 h-4" />
                      ) : (
                        <Sliders className="w-4 h-4" />
                      )}
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-slate-800">
                        {tx.productName || "Product"}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        <span className="font-mono text-[11px] text-slate-600">
                          {tx.referenceId || "Audit"}
                        </span>
                        <span>•</span>
                        <span>{formatDateTime(tx.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-sm font-bold ${
                        tx.quantityChange > 0 ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {tx.quantityChange > 0 ? `+${tx.quantityChange}` : tx.quantityChange} units
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Balance: <span className="font-semibold text-slate-600">{tx.newStock}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-sm text-slate-400">No transactions recorded yet.</div>
            )}
          </div>
        </div>

        {/* Category Stock Distribution (1 col) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Stock by Category</h2>
              <p className="text-xs text-slate-500">Unit breakdown & value</p>
            </div>
            <button
              onClick={() => onNavigate("categories")}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Categories
            </button>
          </div>

          <div className="space-y-3.5">
            {metrics.categoryDistribution?.map((cat) => {
              const maxStock = Math.max(...metrics.categoryDistribution.map((c) => c.totalStock), 1);
              const percentage = Math.round((cat.totalStock / (metrics.totalStock || 1)) * 100);

              return (
                <div key={cat.categoryId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 truncate max-w-[150px]">
                      {cat.categoryName}
                    </span>
                    <span className="font-bold text-slate-900">
                      {cat.totalStock} units{" "}
                      <span className="text-slate-400 font-normal">({percentage}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(8, (cat.totalStock / maxStock) * 100))}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Valuation Summary */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Total Purchase Spend</span>
              <span className="font-bold text-slate-800">{formatCurrency(metrics.totalPurchases)}</span>
            </div>
            <div className="flex justify-between items-center text-xs mt-1">
              <span className="text-slate-500">Total Sales Realized</span>
              <span className="font-bold text-emerald-600">{formatCurrency(metrics.totalSales)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Purchases & Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Purchases (Stock In) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                <ArrowDownToLine className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recent Purchases (Stock In)</h3>
                <p className="text-xs text-slate-500">Supplier deliveries and restocking</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate("purchases")}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              View Purchases
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400">
                  <th className="pb-2 font-medium">PO Number</th>
                  <th className="pb-2 font-medium">Supplier</th>
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {metrics.recentPurchases && metrics.recentPurchases.length > 0 ? (
                  metrics.recentPurchases.map((po) => (
                    <tr key={po.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 font-mono font-medium text-indigo-600">{po.purchaseNumber}</td>
                      <td className="py-2.5 font-medium text-slate-800">{po.supplierName || "Supplier"}</td>
                      <td className="py-2.5 text-slate-500">{formatDate(po.purchaseDate)}</td>
                      <td className="py-2.5 text-right font-bold text-slate-900">
                        {formatCurrency(po.totalAmount)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-slate-400">
                      No purchases yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Sales (Stock Out) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recent Sales (Stock Out)</h3>
                <p className="text-xs text-slate-500">Customer shipments and deductions</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate("sales")}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              View Sales
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400">
                  <th className="pb-2 font-medium">Invoice #</th>
                  <th className="pb-2 font-medium">Customer</th>
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {metrics.recentSales && metrics.recentSales.length > 0 ? (
                  metrics.recentSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 font-mono font-medium text-emerald-600">{sale.invoiceNumber}</td>
                      <td className="py-2.5 font-medium text-slate-800">{sale.customerName}</td>
                      <td className="py-2.5 text-slate-500">{formatDate(sale.saleDate)}</td>
                      <td className="py-2.5 text-right font-bold text-emerald-600">
                        {formatCurrency(sale.totalAmount)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-slate-400">
                      No sales yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
