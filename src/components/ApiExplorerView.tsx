"use client";

import React, { useState } from "react";
import { Terminal, Send, CheckCircle2, Copy, Play, ArrowRight, Code } from "lucide-react";
import { useToast } from "./Toast";

interface EndpointDef {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  category: string;
  description: string;
  sampleBody?: string;
}

const endpoints: EndpointDef[] = [
  {
    category: "Authentication",
    method: "POST",
    path: "/api/auth/login",
    description: "Authenticate staff user and return JWT bearer token",
    sampleBody: JSON.stringify({ email: "admin@inventory.com", password: "password123" }, null, 2),
  },
  {
    category: "Products",
    method: "GET",
    path: "/api/products",
    description: "Get all inventory products with category details and stock status",
  },
  {
    category: "Products",
    method: "GET",
    path: "/api/products?lowStock=true",
    description: "Filter products at or below safety reorder threshold",
  },
  {
    category: "Products",
    method: "POST",
    path: "/api/products",
    description: "Add a new product item into catalog",
    sampleBody: JSON.stringify(
      {
        name: "Wireless Presenter Pointer",
        sku: "ACC-WP01-99",
        categoryId: 2,
        price: "45.00",
        costPrice: "24.00",
        stockQuantity: 15,
        reorderLevel: 5,
        description: "Red laser pointer with USB receiver",
      },
      null,
      2
    ),
  },
  {
    category: "Categories",
    method: "GET",
    path: "/api/categories",
    description: "List all product categories and aggregate item counts",
  },
  {
    category: "Suppliers",
    method: "GET",
    path: "/api/suppliers",
    description: "Fetch suppliers and vendor purchase statistics",
  },
  {
    category: "Purchases (Stock In)",
    method: "GET",
    path: "/api/purchases",
    description: "List recent purchase orders with supplier details",
  },
  {
    category: "Purchases (Stock In)",
    method: "POST",
    path: "/api/purchases",
    description: "Create purchase order, atomically increment stock, and record audit log",
    sampleBody: JSON.stringify(
      {
        supplierId: 1,
        purchaseNumber: `PO-TEST-${Math.floor(1000 + Math.random() * 9000)}`,
        items: [{ productId: 1, quantity: 5, unitPrice: "950.00" }],
      },
      null,
      2
    ),
  },
  {
    category: "Sales (Stock Out)",
    method: "GET",
    path: "/api/sales",
    description: "List completed sales orders and customer invoices",
  },
  {
    category: "Sales (Stock Out)",
    method: "POST",
    path: "/api/sales",
    description: "Create customer sale: verifies stock, deducts balance, and rejects if insufficient",
    sampleBody: JSON.stringify(
      {
        customerName: "Global Logistics LLC",
        customerEmail: "orders@globallogistics.com",
        paymentMethod: "Credit Card",
        items: [{ productId: 1, quantity: 1, unitPrice: "1250.00" }],
      },
      null,
      2
    ),
  },
  {
    category: "Stock & Audit",
    method: "GET",
    path: "/api/stock",
    description: "Get current stock levels, health status, and line valuation",
  },
  {
    category: "Stock & Audit",
    method: "GET",
    path: "/api/stock/low-stock",
    description: "Get all critical stock products requiring immediate replenishment",
  },
  {
    category: "Stock & Audit",
    method: "POST",
    path: "/api/stock/adjust",
    description: "Manually adjust stock for count audit, damage, or discrepancy",
    sampleBody: JSON.stringify(
      {
        productId: 1,
        type: "ADD",
        quantity: 2,
        reason: "Count Audit",
        notes: "Found extra box in secondary shelf",
      },
      null,
      2
    ),
  },
  {
    category: "Stock & Audit",
    method: "GET",
    path: "/api/stock/transactions",
    description: "Query transactional movement audit log history",
  },
  {
    category: "Reports & KPIs",
    method: "GET",
    path: "/api/reports/dashboard",
    description: "Executive KPIs, sales totals, stock counts, and recent logs",
  },
  {
    category: "Reports & KPIs",
    method: "GET",
    path: "/api/reports/stock",
    description: "Inventory valuation, cost basis, and margin projection",
  },
];

export function ApiExplorerView() {
  const { showToast } = useToast();
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointDef>(endpoints[1]);
  const [requestBody, setRequestBody] = useState<string>(selectedEndpoint.sampleBody || "");
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<string>("");
  const [responseData, setResponseData] = useState<any>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSelectEndpoint = (ep: EndpointDef) => {
    setSelectedEndpoint(ep);
    setRequestBody(ep.sampleBody || "");
    setResponseStatus(null);
    setResponseData(null);
    setLatency(null);
  };

  const handleExecute = async () => {
    setLoading(true);
    setResponseStatus(null);
    setResponseData(null);
    const start = performance.now();

    try {
      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers: { "Content-Type": "application/json" },
      };

      if (["POST", "PUT"].includes(selectedEndpoint.method) && requestBody) {
        options.body = requestBody;
      }

      const res = await fetch(selectedEndpoint.path, options);
      const elapsed = Math.round(performance.now() - start);
      setLatency(elapsed);
      setResponseStatus(res.status);

      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const json = await res.json();
        setResponseData(json);
      } else {
        const text = await res.text();
        setResponseData(text);
      }
    } catch (err: any) {
      setResponseStatus(500);
      setResponseData({ error: err.message || "Network request failed" });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyResponse = () => {
    if (responseData) {
      navigator.clipboard.writeText(JSON.stringify(responseData, null, 2));
      showToast("Response JSON copied to clipboard!", "success");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Swagger / REST API Console
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Interactive Test Runner
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Test backend ASP.NET Core / Next.js Web API endpoints in real-time with sample payloads and JSON outputs
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Endpoints Sidebar (4 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-4 max-h-[750px] overflow-y-auto space-y-4">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
            Available API Endpoints
          </div>

          <div className="space-y-1.5">
            {endpoints.map((ep, idx) => {
              const isSelected = selectedEndpoint.path === ep.path && selectedEndpoint.method === ep.method;

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectEndpoint(ep)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition flex flex-col gap-1 border ${
                    isSelected
                      ? "bg-indigo-50 border-indigo-200 shadow-xs"
                      : "border-transparent hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-1.5 py-0.5 rounded font-mono font-bold text-[10px] ${
                        ep.method === "GET"
                          ? "bg-blue-100 text-blue-700"
                          : ep.method === "POST"
                          ? "bg-emerald-100 text-emerald-700"
                          : ep.method === "PUT"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="font-mono font-semibold text-slate-800 truncate">
                      {ep.path}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 line-clamp-1">{ep.description}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Request / Response Panel (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Active Endpoint Box */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                    selectedEndpoint.method === "GET"
                      ? "bg-blue-100 text-blue-700"
                      : selectedEndpoint.method === "POST"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {selectedEndpoint.method}
                </span>
                <span className="font-mono text-sm font-bold text-slate-900">
                  {selectedEndpoint.path}
                </span>
              </div>

              <button
                onClick={handleExecute}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md transition disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{loading ? "Calling..." : "Execute API"}</span>
              </button>
            </div>

            <p className="text-xs text-slate-600">{selectedEndpoint.description}</p>

            {/* Request Body if POST/PUT */}
            {["POST", "PUT"].includes(selectedEndpoint.method) && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Request Payload (JSON)
                </label>
                <textarea
                  rows={6}
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  className="w-full font-mono text-xs bg-slate-900 text-emerald-400 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>
            )}
          </div>

          {/* Response Console */}
          <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Live Response Console
                </span>
                {responseStatus && (
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
                      responseStatus >= 200 && responseStatus < 300
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                    }`}
                  >
                    Status: {responseStatus}
                  </span>
                )}
                {latency !== null && (
                  <span className="text-xs text-slate-400 font-mono">{latency} ms</span>
                )}
              </div>

              {responseData && (
                <button
                  onClick={handleCopyResponse}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition"
                  title="Copy JSON"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto font-mono text-xs">
              {loading ? (
                <div className="py-8 text-center text-slate-500">Dispatching HTTP request...</div>
              ) : responseData ? (
                <pre className="text-emerald-300 leading-relaxed overflow-x-auto">
                  {typeof responseData === "string"
                    ? responseData
                    : JSON.stringify(responseData, null, 2)}
                </pre>
              ) : (
                <div className="py-8 text-center text-slate-500">
                  Click &ldquo;Execute API&rdquo; above to run this endpoint and view output.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
