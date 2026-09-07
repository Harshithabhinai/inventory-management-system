"use client";

import React, { useState, useEffect } from "react";
import { formatCurrency, exportToCsv } from "@/lib/utils";
import {
  BarChart3,
  TrendingUp,
  ArrowDownToLine,
  Boxes,
  Download,
  Calendar,
  Layers,
  CheckCircle2,
  AlertTriangle,
  PieChart,
} from "lucide-react";

export function ReportsView() {
  const [activeReport, setActiveReport] = useState<"sales" | "purchases" | "stock">("sales");
  const [loading, setLoading] = useState(false);

  const [salesData, setSalesData] = useState<any>(null);
  const [purchasesData, setPurchasesData] = useState<any>(null);
  const [stockData, setStockData] = useState<any>(null);

  async function fetchActiveReport() {
    setLoading(true);
    try {
      if (activeReport === "sales") {
        const res = await fetch("/api/reports/sales");
        const data = await res.json();
        setSalesData(data);
      } else if (activeReport === "purchases") {
        const res = await fetch("/api/reports/purchases");
        const data = await res.json();
        setPurchasesData(data);
      } else if (activeReport === "stock") {
        const res = await fetch("/api/reports/stock");
        const data = await res.json();
        setStockData(data);
      }
    } catch (err) {
      console.error("Report fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(() => fetchActiveReport(), 0);
    return () => clearTimeout(t);
  }, [activeReport]);

  const handleExportCsv = () => {
    if (activeReport === "sales" && salesData?.topProducts) {
      exportToCsv("sales-report", salesData.topProducts);
    } else if (activeReport === "purchases" && purchasesData?.supplierBreakdown) {
      exportToCsv("purchases-report", purchasesData.supplierBreakdown);
    } else if (activeReport === "stock" && stockData?.products) {
      exportToCsv("stock-valuation-report", stockData.products);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Business Reports & Analytics</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit inventory capital, analyze top revenue drivers, and track vendor procurement spend
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-md transition self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* Report Switcher Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveReport("sales")}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
            activeReport === "sales"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Sales & Revenue Analytics</span>
        </button>

        <button
          onClick={() => setActiveReport("purchases")}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
            activeReport === "purchases"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <ArrowDownToLine className="w-4 h-4" />
          <span>Procurement & Vendor Spend</span>
        </button>

        <button
          onClick={() => setActiveReport("stock")}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
            activeReport === "stock"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Stock Valuation & Health</span>
        </button>
      </div>

      {/* SALES REPORT */}
      {activeReport === "sales" && (
        <div className="space-y-6">
          {loading || !salesData ? (
            <div className="h-64 bg-slate-100 rounded-2xl animate-pulse"></div>
          ) : (
            <>
              {/* Sales KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Total Revenue</span>
                  <div className="text-2xl font-bold text-slate-900 mt-2">
                    {formatCurrency(salesData.totalRevenue)}
                  </div>
                  <span className="text-xs text-emerald-600 font-medium">Realized sales volume</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Completed Orders</span>
                  <div className="text-2xl font-bold text-slate-900 mt-2">
                    {salesData.totalSalesCount}
                  </div>
                  <span className="text-xs text-slate-400">Total customer transactions</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Average Order Value</span>
                  <div className="text-2xl font-bold text-indigo-600 mt-2">
                    {formatCurrency(salesData.averageOrderValue)}
                  </div>
                  <span className="text-xs text-slate-400">Per invoice average</span>
                </div>
              </div>

              {/* Top Selling Products */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
                <h3 className="font-bold text-slate-900 text-base mb-1">Top Selling Products</h3>
                <p className="text-xs text-slate-500 mb-4">Ranked by unit velocity and revenue</p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                      <tr>
                        <th className="py-2.5 px-3">Product Name</th>
                        <th className="py-2.5 px-3">SKU</th>
                        <th className="py-2.5 px-3 text-center">Units Sold</th>
                        <th className="py-2.5 px-3 text-right">Revenue Generated</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {salesData.topProducts?.map((p: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-semibold text-slate-900">
                            {idx + 1}. {p.productName}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-500">{p.sku}</td>
                          <td className="py-2.5 px-3 text-center font-bold text-slate-800">
                            {p.unitsSold}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-emerald-600">
                            {formatCurrency(p.revenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
                <h3 className="font-bold text-slate-900 text-base mb-1">Payment Method Breakdown</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                  {salesData.paymentMethods?.map((pm: any, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-xs font-semibold text-slate-600">{pm.method}</span>
                      <div className="text-base font-bold text-slate-900 mt-1">
                        {formatCurrency(pm.total)}
                      </div>
                      <span className="text-[11px] text-slate-400">{pm.count} transactions</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* PURCHASES REPORT */}
      {activeReport === "purchases" && (
        <div className="space-y-6">
          {loading || !purchasesData ? (
            <div className="h-64 bg-slate-100 rounded-2xl animate-pulse"></div>
          ) : (
            <>
              {/* Purchase KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Total Procurement Spend</span>
                  <div className="text-2xl font-bold text-slate-900 mt-2">
                    {formatCurrency(purchasesData.totalSpent)}
                  </div>
                  <span className="text-xs text-slate-400">Total goods purchased</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Purchase Orders</span>
                  <div className="text-2xl font-bold text-slate-900 mt-2">
                    {purchasesData.totalPurchasesCount}
                  </div>
                  <span className="text-xs text-slate-400">Issued and completed POs</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Average PO Size</span>
                  <div className="text-2xl font-bold text-emerald-600 mt-2">
                    {formatCurrency(purchasesData.averagePurchaseValue)}
                  </div>
                  <span className="text-xs text-slate-400">Per supplier order</span>
                </div>
              </div>

              {/* Supplier Breakdown */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
                <h3 className="font-bold text-slate-900 text-base mb-1">Procurement by Supplier</h3>
                <p className="text-xs text-slate-500 mb-4">Total capital allocated per vendor partner</p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                      <tr>
                        <th className="py-2.5 px-3">Supplier Name</th>
                        <th className="py-2.5 px-3">Representative</th>
                        <th className="py-2.5 px-3 text-center">Orders Placed</th>
                        <th className="py-2.5 px-3 text-right">Total Expenditure</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {purchasesData.supplierBreakdown?.map((s: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-semibold text-slate-900">{s.supplierName}</td>
                          <td className="py-2.5 px-3 text-slate-500">{s.contactPerson || "—"}</td>
                          <td className="py-2.5 px-3 text-center font-bold text-slate-800">
                            {s.purchaseCount}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                            {formatCurrency(s.totalSpent)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* STOCK VALUATION REPORT */}
      {activeReport === "stock" && (
        <div className="space-y-6">
          {loading || !stockData ? (
            <div className="h-64 bg-slate-100 rounded-2xl animate-pulse"></div>
          ) : (
            <>
              {/* Valuation Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Retail Inventory Value</span>
                  <div className="text-2xl font-bold text-slate-900 mt-2">
                    {formatCurrency(stockData.totalRetailValue)}
                  </div>
                  <span className="text-xs text-slate-400">At current selling prices</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Inventory Cost Basis</span>
                  <div className="text-2xl font-bold text-slate-700 mt-2">
                    {formatCurrency(stockData.totalCostValue)}
                  </div>
                  <span className="text-xs text-slate-400">Capital tied in stock</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Potential Gross Profit</span>
                  <div className="text-2xl font-bold text-emerald-600 mt-2">
                    {formatCurrency(stockData.potentialProfit)}
                  </div>
                  <span className="text-xs text-emerald-700 font-medium">
                    {stockData.profitMarginPercent}% projected margin
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Stock Health</span>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm font-bold text-emerald-600">
                      {stockData.stockHealth?.inStock} Healthy
                    </span>
                    <span className="text-sm font-bold text-amber-600">
                      {stockData.stockHealth?.lowStock} Low
                    </span>
                    <span className="text-sm font-bold text-rose-600">
                      {stockData.stockHealth?.outOfStock} Out
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 mt-1 block">
                    {stockData.totalProducts} total catalog products
                  </span>
                </div>
              </div>

              {/* Product Valuation Detail Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
                <h3 className="font-bold text-slate-900 text-base mb-1">Catalog Item Valuations</h3>
                <p className="text-xs text-slate-500 mb-4">Stock balances and total current asset worth</p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                      <tr>
                        <th className="py-2.5 px-3">Product Name</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3 text-center">In Stock</th>
                        <th className="py-2.5 px-3 text-right">Unit Price</th>
                        <th className="py-2.5 px-3 text-right">Unit Cost</th>
                        <th className="py-2.5 px-3 text-right">Total Valuation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {stockData.products?.map((p: any) => (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-semibold text-slate-900">
                            {p.name}
                            <span className="block text-[10px] text-slate-400 font-mono">{p.sku}</span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">{p.categoryName || "—"}</td>
                          <td className="py-2.5 px-3 text-center font-bold text-slate-900">
                            {p.stockQuantity}
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-700">
                            {formatCurrency(p.price)}
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-500">
                            {formatCurrency(p.costPrice)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                            {formatCurrency(p.totalValuation)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
