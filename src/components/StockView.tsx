"use client";

import React, { useState, useEffect } from "react";
import { Product, StockTransaction } from "@/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { useToast } from "./Toast";
import {
  Boxes,
  AlertTriangle,
  Sliders,
  History,
  Search,
  CheckCircle2,
  XCircle,
  ArrowDownToLine,
  ArrowUpFromLine,
  RefreshCw,
  X,
  Filter,
} from "lucide-react";

interface StockViewProps {
  products: Product[];
  loading: boolean;
  onRefresh: () => Promise<void>;
  preselectedProductForAdjust?: Product | null;
  onOpenNewPurchaseForProduct?: (productId: number) => void;
  initialTab?: "current" | "alerts" | "history";
}

export function StockView({
  products,
  loading,
  onRefresh,
  preselectedProductForAdjust,
  onOpenNewPurchaseForProduct,
  initialTab = "current",
}: StockViewProps) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<"current" | "alerts" | "history">(initialTab);
  const [searchTerm, setSearchTerm] = useState("");

  // Adjustment Modal
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(!!preselectedProductForAdjust);
  const [adjustProductId, setAdjustProductId] = useState<string>(
    preselectedProductForAdjust ? preselectedProductForAdjust.id.toString() : ""
  );
  const [adjustType, setAdjustType] = useState<"ADD" | "SUBTRACT" | "SET">("ADD");
  const [adjustQuantity, setAdjustQuantity] = useState<string>("5");
  const [adjustReason, setAdjustReason] = useState<string>("Count Audit");
  const [adjustNotes, setAdjustNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  // History state
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [txLoading, setTxLoading] = useState(false);
  const [txTypeFilter, setTxTypeFilter] = useState("ALL");

  useEffect(() => {
    if (preselectedProductForAdjust) {
      const t = setTimeout(() => {
        setAdjustProductId(preselectedProductForAdjust.id.toString());
        setIsAdjustModalOpen(true);
      }, 0);
      return () => clearTimeout(t);
    }
  }, [preselectedProductForAdjust]);

  async function fetchTransactions() {
    setTxLoading(true);
    try {
      const url =
        txTypeFilter !== "ALL"
          ? `/api/stock/transactions?type=${txTypeFilter}`
          : "/api/stock/transactions";
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setTransactions(data);
      }
    } catch {
      // Ignore
    } finally {
      setTxLoading(false);
    }
  }

  useEffect(() => {
    if (activeTab === "history") {
      const t = setTimeout(() => fetchTransactions(), 0);
      return () => clearTimeout(t);
    }
  }, [activeTab, txTypeFilter]);

  const openAdjustForProduct = (p: Product) => {
    setAdjustProductId(p.id.toString());
    setAdjustType("ADD");
    setAdjustQuantity("5");
    setAdjustReason("Count Audit");
    setAdjustNotes("");
    setIsAdjustModalOpen(true);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustProductId) {
      showToast("Select a product to adjust", "warning");
      return;
    }

    const qty = parseInt(adjustQuantity, 10);
    if (isNaN(qty) || qty < 0) {
      showToast("Quantity must be a valid positive integer", "warning");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/stock/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: parseInt(adjustProductId, 10),
          type: adjustType,
          quantity: qty,
          reason: adjustReason,
          notes: adjustNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to adjust stock");

      showToast("Stock adjusted and audit transaction recorded!", "success");
      setIsAdjustModalOpen(false);
      await onRefresh();
      if (activeTab === "history") {
        await fetchTransactions();
      }
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered lists
  const lowStockList = products.filter((p) => p.stockQuantity <= p.reorderLevel);

  const filteredCurrent = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedProdForModal = products.find((p) => p.id.toString() === adjustProductId);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Stock Management</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              Audit & Balances
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor real-time physical inventory, resolve stock discrepancies, and respond to reorder alerts
          </p>
        </div>

        <button
          onClick={() => {
            if (products.length > 0) {
              setAdjustProductId(products[0].id.toString());
            }
            setIsAdjustModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md transition active:scale-95 self-start sm:self-auto"
        >
          <Sliders className="w-4 h-4" />
          <span>Manual Stock Adjustment</span>
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b border-slate-200 gap-8">
        <button
          onClick={() => setActiveTab("current")}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
            activeTab === "current"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Current Stock ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("alerts")}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
            activeTab === "alerts"
              ? "border-amber-600 text-amber-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Low Stock Alerts</span>
          {lowStockList.length > 0 && (
            <span className="px-2 py-0.2 text-[10px] font-bold rounded-full bg-rose-500 text-white">
              {lowStockList.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
            activeTab === "history"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <History className="w-4 h-4" />
          <span>Movement Audit Log</span>
        </button>
      </div>

      {/* Tab 1: Current Stock */}
      {activeTab === "current" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search stock by product name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div className="text-xs text-slate-500 hidden sm:block">
              Total Units in Warehouse:{" "}
              <span className="font-bold text-slate-900">
                {products.reduce((acc, p) => acc + p.stockQuantity, 0)}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                  <tr>
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4">SKU</th>
                    <th className="py-3 px-4 text-center">Available Stock</th>
                    <th className="py-3 px-4 text-center">Reorder Threshold</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Inventory Valuation</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCurrent.map((p) => {
                    const isOut = p.stockQuantity <= 0;
                    const isLow = p.stockQuantity <= p.reorderLevel;
                    const valuation = p.stockQuantity * parseFloat(p.price || "0");

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4 font-semibold text-slate-900">{p.name}</td>
                        <td className="py-3 px-4 font-mono text-xs text-slate-600">{p.sku}</td>
                        <td className="py-3 px-4 text-center font-bold text-slate-900">
                          {p.stockQuantity}
                        </td>
                        <td className="py-3 px-4 text-center text-slate-500 font-medium">
                          {p.reorderLevel}
                        </td>
                        <td className="py-3 px-4">
                          {isOut ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                              <XCircle className="w-3 h-3" /> Out of Stock
                            </span>
                          ) : isLow ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                              <AlertTriangle className="w-3 h-3" /> Low Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                              <CheckCircle2 className="w-3 h-3" /> Healthy
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-800">
                          {formatCurrency(valuation)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => openAdjustForProduct(p)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                            <span>Adjust</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Low Stock Alerts */}
      {activeTab === "alerts" && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Automated Safety Stock Depletion Engine</p>
              <p className="mt-0.5 text-amber-800 leading-relaxed">
                Items shown here have reached or fallen below their configured reorder level. Click &ldquo;Create Purchase Order&rdquo; to quickly order stock replenishment from your suppliers.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowStockList.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                All inventory items are currently above their minimum safety thresholds!
              </div>
            ) : (
              lowStockList.map((p) => {
                const deficit = Math.max(0, p.reorderLevel - p.stockQuantity + 5);

                return (
                  <div
                    key={p.id}
                    className="bg-white p-5 rounded-2xl border border-rose-200 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-mono text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                            {p.sku}
                          </span>
                          <h3 className="font-bold text-slate-900 text-base mt-2">{p.name}</h3>
                        </div>
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-700">
                          ALERT
                        </span>
                      </div>

                      <div className="mt-4 p-3 bg-slate-50 rounded-xl space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Current Stock:</span>
                          <span className="font-bold text-rose-600 text-sm">
                            {p.stockQuantity} units
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Reorder Level:</span>
                          <span className="font-bold text-slate-700">{p.reorderLevel} units</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-200 pt-1.5">
                          <span className="text-slate-500">Suggested Order:</span>
                          <span className="font-bold text-emerald-700">+{deficit} units</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => openAdjustForProduct(p)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                      >
                        Adjust
                      </button>
                      <button
                        onClick={() => {
                          if (onOpenNewPurchaseForProduct) {
                            onOpenNewPurchaseForProduct(p.id);
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs"
                      >
                        <ArrowDownToLine className="w-3.5 h-3.5" />
                        <span>Reorder Stock</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Movement Audit Log */}
      {activeTab === "history" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-slate-600">Filter Event:</span>
              <select
                value={txTypeFilter}
                onChange={(e) => setTxTypeFilter(e.target.value)}
                className="py-1.5 px-3 text-xs border border-slate-200 rounded-lg bg-white font-medium"
              >
                <option value="ALL">All Movement Types</option>
                <option value="PURCHASE_IN">Purchases (Stock In)</option>
                <option value="SALE_OUT">Sales (Stock Out)</option>
                <option value="ADJUSTMENT">Manual Adjustments</option>
                <option value="INITIAL">Initial Balance</option>
              </select>
            </div>

            <button
              onClick={fetchTransactions}
              className="text-xs font-medium text-slate-600 hover:text-indigo-600 flex items-center gap-1 self-end sm:self-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Log</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Reference</th>
                    <th className="py-3 px-4 text-right">Previous</th>
                    <th className="py-3 px-4 text-right">Quantity Delta</th>
                    <th className="py-3 px-4 text-right">New Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {txLoading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        Loading audit log...
                      </td>
                    </tr>
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No transactions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                          {formatDateTime(t.createdAt)}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">{t.productName}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              t.transactionType === "PURCHASE_IN"
                                ? "bg-emerald-100 text-emerald-800"
                                : t.transactionType === "SALE_OUT"
                                ? "bg-rose-100 text-rose-800"
                                : t.transactionType === "ADJUSTMENT"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {t.transactionType}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">
                          {t.referenceId || "—"}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-400 font-medium">
                          {t.previousStock}
                        </td>
                        <td
                          className={`py-3 px-4 text-right font-bold ${
                            t.quantityChange > 0 ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          {t.quantityChange > 0 ? `+${t.quantityChange}` : t.quantityChange}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">
                          {t.newStock}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Manual Stock Adjustment Modal */}
      {isAdjustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Manual Stock Adjustment</h3>
                  <p className="text-xs text-slate-500">Audit correction, damage, or discrepancy</p>
                </div>
              </div>
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Product *
                </label>
                <select
                  value={adjustProductId}
                  onChange={(e) => setAdjustProductId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="">Select a Product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku}) — Current: {p.stockQuantity}
                    </option>
                  ))}
                </select>
                {selectedProdForModal && (
                  <div className="mt-1.5 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg flex justify-between">
                    <span>Current In-Stock Balance:</span>
                    <span className="font-bold text-slate-900">
                      {selectedProdForModal.stockQuantity} units
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Adjustment Type *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType("ADD")}
                    className={`py-2 px-2 text-xs font-semibold rounded-xl border text-center transition ${
                      adjustType === "ADD"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-800"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    + Add Stock
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType("SUBTRACT")}
                    className={`py-2 px-2 text-xs font-semibold rounded-xl border text-center transition ${
                      adjustType === "SUBTRACT"
                        ? "bg-rose-50 border-rose-500 text-rose-800"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    - Deduct Stock
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType("SET")}
                    className={`py-2 px-2 text-xs font-semibold rounded-xl border text-center transition ${
                      adjustType === "SET"
                        ? "bg-indigo-50 border-indigo-500 text-indigo-800"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    = Set Exact
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {adjustType === "SET" ? "Exact Stock Count" : "Quantity Change"} *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={adjustQuantity}
                  onChange={(e) => setAdjustQuantity(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Adjustment Reason *
                </label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white"
                >
                  <option value="Count Audit">Periodic Inventory Count Audit</option>
                  <option value="Damage">Damaged in Transit / Warehouse</option>
                  <option value="Loss">Loss / Missing Goods</option>
                  <option value="Return">Customer Return Restock</option>
                  <option value="Write-off">Defective Item Write-off</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Audit Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Discrepancy identified during quarterly warehouse audit"
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {submitting ? "Updating..." : "Commit Adjustment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
