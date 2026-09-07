"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ToastProvider } from "@/components/Toast";
import { AuthProvider } from "@/components/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { DashboardView } from "@/components/DashboardView";
import { ProductsView } from "@/components/ProductsView";
import { CategoriesView } from "@/components/CategoriesView";
import { SuppliersView } from "@/components/SuppliersView";
import { PurchasesView } from "@/components/PurchasesView";
import { SalesView } from "@/components/SalesView";
import { StockView } from "@/components/StockView";
import { ReportsView } from "@/components/ReportsView";
import { ApiExplorerView } from "@/components/ApiExplorerView";
import { ArchitectureView } from "@/components/ArchitectureView";
import { Product, Category, Supplier, Purchase, Sale, DashboardMetrics } from "@/types";

function InventoryApp() {
  const [currentTab, setCurrentTab] = useState<string>("dashboard");
  const [loading, setLoading] = useState<boolean>(true);

  // Entities
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  // Modal triggers & cross-navigation state
  const [openNewSaleDirectly, setOpenNewSaleDirectly] = useState(false);
  const [openNewPurchaseDirectly, setOpenNewPurchaseDirectly] = useState(false);
  const [preselectedSupplierId, setPreselectedSupplierId] = useState<number | null>(null);
  const [productForAdjust, setProductForAdjust] = useState<Product | null>(null);
  const [stockInitialSubTab, setStockInitialSubTab] = useState<"current" | "alerts" | "history">("current");

  const refreshAllData = useCallback(async () => {
    try {
      const [metricsRes, prodRes, catRes, supRes, poRes, saleRes] = await Promise.all([
        fetch("/api/reports/dashboard"),
        fetch("/api/products"),
        fetch("/api/categories"),
        fetch("/api/suppliers"),
        fetch("/api/purchases"),
        fetch("/api/sales"),
      ]);

      const [m, p, c, s, po, sa] = await Promise.all([
        metricsRes.ok ? metricsRes.json() : null,
        prodRes.ok ? prodRes.json() : [],
        catRes.ok ? catRes.json() : [],
        supRes.ok ? supRes.json() : [],
        poRes.ok ? poRes.json() : [],
        saleRes.ok ? saleRes.json() : [],
      ]);

      if (m) setMetrics(m);
      if (Array.isArray(p)) setProducts(p);
      if (Array.isArray(c)) setCategories(c);
      if (Array.isArray(s)) setSuppliers(s);
      if (Array.isArray(po)) setPurchases(po);
      if (Array.isArray(sa)) setSales(sa);
    } catch (err) {
      console.error("Data fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => refreshAllData(), 0);
    return () => clearTimeout(t);
  }, [refreshAllData]);

  // Quick action triggers
  const handleOpenNewSale = () => {
    setCurrentTab("sales");
    setOpenNewSaleDirectly(true);
  };

  const handleOpenNewPurchase = () => {
    setCurrentTab("purchases");
    setPreselectedSupplierId(null);
    setOpenNewPurchaseDirectly(true);
  };

  const handleSupplierSelectForPurchase = (supId: number) => {
    setPreselectedSupplierId(supId);
    setCurrentTab("purchases");
    setOpenNewPurchaseDirectly(true);
  };

  const handleReorderProduct = (productId: number) => {
    setCurrentTab("purchases");
    setOpenNewPurchaseDirectly(true);
  };

  const handleOpenStockAdjust = (p?: Product) => {
    setProductForAdjust(p || null);
    setCurrentTab("stock");
    setStockInitialSubTab("current");
  };

  const handleNavigate = (tab: string) => {
    if (tab === "stock-alerts") {
      setCurrentTab("stock");
      setStockInitialSubTab("alerts");
      return;
    }
    setCurrentTab(tab);
  };

  const lowStockCount = metrics?.lowStockCount ?? products.filter((p) => p.stockQuantity <= p.reorderLevel).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onNavigate={handleNavigate}
        lowStockCount={lowStockCount}
        onOpenNewSale={handleOpenNewSale}
        onOpenNewPurchase={handleOpenNewPurchase}
        onRefreshData={refreshAllData}
      />

      {/* Main Layout Body */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar */}
        <div className="hidden md:block">
          <Sidebar
            currentTab={currentTab}
            onSelectTab={handleNavigate}
            lowStockCount={lowStockCount}
          />
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden bg-slate-900 text-white p-2 overflow-x-auto flex gap-2 border-b border-slate-800">
          {[
            { id: "dashboard", label: "Dashboard" },
            { id: "products", label: "Products" },
            { id: "categories", label: "Categories" },
            { id: "suppliers", label: "Suppliers" },
            { id: "purchases", label: "Purchases" },
            { id: "sales", label: "Sales" },
            { id: "stock", label: "Stock" },
            { id: "reports", label: "Reports" },
            { id: "api-explorer", label: "Swagger" },
            { id: "architecture", label: "Architecture" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                currentTab === item.id ? "bg-indigo-600 text-white font-bold" : "text-slate-400 hover:bg-slate-800"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          {currentTab === "dashboard" && (
            <DashboardView
              metrics={metrics}
              loading={loading}
              onNavigate={handleNavigate}
              onOpenNewSale={handleOpenNewSale}
              onOpenNewPurchase={handleOpenNewPurchase}
              onOpenNewProduct={() => {
                setCurrentTab("products");
              }}
              onOpenStockAdjust={() => handleOpenStockAdjust()}
            />
          )}

          {currentTab === "products" && (
            <ProductsView
              products={products}
              categories={categories}
              loading={loading}
              onRefresh={refreshAllData}
              onOpenStockAdjustForProduct={(p) => handleOpenStockAdjust(p)}
            />
          )}

          {currentTab === "categories" && (
            <CategoriesView
              categories={categories}
              loading={loading}
              onRefresh={refreshAllData}
            />
          )}

          {currentTab === "suppliers" && (
            <SuppliersView
              suppliers={suppliers}
              loading={loading}
              onRefresh={refreshAllData}
              onSelectSupplierForPurchase={handleSupplierSelectForPurchase}
            />
          )}

          {currentTab === "purchases" && (
            <PurchasesView
              purchases={purchases}
              suppliers={suppliers}
              products={products}
              loading={loading}
              onRefresh={refreshAllData}
              preselectedSupplierId={preselectedSupplierId}
              openCreateModalDirectly={openNewPurchaseDirectly}
              onCloseCreateModal={() => setOpenNewPurchaseDirectly(false)}
            />
          )}

          {currentTab === "sales" && (
            <SalesView
              sales={sales}
              products={products}
              loading={loading}
              onRefresh={refreshAllData}
              openCreateModalDirectly={openNewSaleDirectly}
              onCloseCreateModal={() => setOpenNewSaleDirectly(false)}
            />
          )}

          {currentTab === "stock" && (
            <StockView
              products={products}
              loading={loading}
              onRefresh={refreshAllData}
              preselectedProductForAdjust={productForAdjust}
              onOpenNewPurchaseForProduct={handleReorderProduct}
              initialTab={stockInitialSubTab}
            />
          )}

          {currentTab === "reports" && <ReportsView />}

          {currentTab === "api-explorer" && <ApiExplorerView />}

          {currentTab === "architecture" && <ArchitectureView />}
        </main>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <ToastProvider>
      <AuthProvider>
        <InventoryApp />
      </AuthProvider>
    </ToastProvider>
  );
}
