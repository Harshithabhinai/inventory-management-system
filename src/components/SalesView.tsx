"use client";

import React, { useState, useEffect } from "react";
import { Sale, Product } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "./Toast";
import {
  ShoppingCart,
  Plus,
  Search,
  FileText,
  Trash2,
  X,
  Printer,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  User,
  ArrowUpFromLine,
  ShieldAlert,
} from "lucide-react";

interface SalesViewProps {
  sales: Sale[];
  products: Product[];
  loading: boolean;
  onRefresh: () => Promise<void>;
  openCreateModalDirectly?: boolean;
  onCloseCreateModal?: () => void;
}

interface NewSaleItem {
  productId: string;
  quantity: number;
  unitPrice: string;
}

export function SalesView({
  sales,
  products,
  loading,
  onRefresh,
  openCreateModalDirectly = false,
  onCloseCreateModal,
}: SalesViewProps) {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(openCreateModalDirectly);
  const [selectedInvoice, setSelectedInvoice] = useState<Sale | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  useEffect(() => {
    const t = setTimeout(() => {
      setInvoiceNumber(`INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    }, 0);
    return () => clearTimeout(t);
  }, []);
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState("Credit Card");
  const [notes, setNotes] = useState("");

  const inStockProducts = products.filter((p) => p.stockQuantity > 0);
  const defaultProd = inStockProducts.length > 0 ? inStockProducts[0] : products[0];

  const [items, setItems] = useState<NewSaleItem[]>([
    {
      productId: defaultProd ? defaultProd.id.toString() : "",
      quantity: 1,
      unitPrice: defaultProd ? defaultProd.price || "0.00" : "0.00",
    },
  ]);

  const openCreateModal = () => {
    setInvoiceNumber(`INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    setSaleDate(new Date().toISOString().split("T")[0]);
    setCustomerName("");
    setCustomerEmail("");
    setPaymentMethod("Credit Card");
    setNotes("");

    const available = products.filter((p) => p.stockQuantity > 0);
    const prod = available.length > 0 ? available[0] : products[0];
    if (prod) {
      setItems([
        {
          productId: prod.id.toString(),
          quantity: 1,
          unitPrice: prod.price,
        },
      ]);
    }
    setIsCreateModalOpen(true);
  };

  const handleProductSelect = (index: number, prodId: string) => {
    const selectedProd = products.find((p) => p.id.toString() === prodId);
    const updated = [...items];
    updated[index].productId = prodId;
    if (selectedProd) {
      updated[index].unitPrice = selectedProd.price;
      // Auto-cap quantity if current quantity exceeds stock
      if (selectedProd.stockQuantity > 0 && updated[index].quantity > selectedProd.stockQuantity) {
        updated[index].quantity = selectedProd.stockQuantity;
      }
    }
    setItems(updated);
  };

  const handleQuantityChange = (index: number, qty: number) => {
    const updated = [...items];
    updated[index].quantity = Math.max(1, qty);
    setItems(updated);
  };

  const handlePriceChange = (index: number, price: string) => {
    const updated = [...items];
    updated[index].unitPrice = price;
    setItems(updated);
  };

  const addItemRow = () => {
    const available = products.filter(
      (p) => p.stockQuantity > 0 && !items.some((itm) => itm.productId === p.id.toString())
    );
    const nextProd = available[0] || products[0];
    if (nextProd) {
      setItems([
        ...items,
        {
          productId: nextProd.id.toString(),
          quantity: 1,
          unitPrice: nextProd.price,
        },
      ]);
    }
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) {
      showToast("Sale must contain at least one product", "warning");
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateGrandTotal = () => {
    return items.reduce((sum, itm) => sum + itm.quantity * parseFloat(itm.unitPrice || "0"), 0);
  };

  // Check if any line item has insufficient stock
  const hasInsufficientStockError = items.some((item) => {
    const prod = products.find((p) => p.id.toString() === item.productId);
    return prod ? item.quantity > prod.stockQuantity : false;
  });

  const handleCreateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      showToast("Customer name is required", "warning");
      return;
    }

    if (items.length === 0) {
      showToast("Please add at least one line item", "warning");
      return;
    }

    // Client-side guard before hitting backend
    for (const item of items) {
      const prod = products.find((p) => p.id.toString() === item.productId);
      if (!prod) continue;
      if (item.quantity > prod.stockQuantity) {
        showToast(
          `Cannot proceed: '${prod.name}' has only ${prod.stockQuantity} in stock (requested ${item.quantity})`,
          "error"
        );
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim() || null,
        invoiceNumber,
        saleDate,
        paymentMethod,
        notes: notes.trim() || null,
        items: items.map((itm) => ({
          productId: parseInt(itm.productId, 10),
          quantity: itm.quantity,
          unitPrice: parseFloat(itm.unitPrice || "0").toFixed(2),
        })),
      };

      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to process sale");
      }

      showToast(`Sale #${invoiceNumber} completed! Stock deducted.`, "success");
      setIsCreateModalOpen(false);
      if (onCloseCreateModal) onCloseCreateModal();
      await onRefresh();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const viewSaleInvoice = async (sale: Sale) => {
    try {
      const res = await fetch(`/api/sales/${sale.id}`);
      const data = await res.json();
      if (res.ok) {
        setSelectedInvoice(data);
      } else {
        setSelectedInvoice(sale);
      }
    } catch {
      setSelectedInvoice(sale);
    }
  };

  const filteredSales = sales.filter(
    (s) =>
      s.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sales Management</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Stock Out Flow
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Process customer orders, verify available stock thresholds, deduct inventory, and issue tax invoices
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md transition active:scale-95 self-start sm:self-auto"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>New Customer Sale (Stock Out)</span>
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by invoice number or customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium hidden sm:block">
          Total Recorded Invoices: <span className="font-bold text-slate-800">{sales.length}</span>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Sale Date</th>
                <th className="py-3.5 px-4">Payment Method</th>
                <th className="py-3.5 px-4 text-right">Total Amount</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Loading sales records...
                  </td>
                </tr>
              ) : filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No sales records found.
                  </td>
                </tr>
              ) : (
                filteredSales.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">
                      {s.invoiceNumber}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{s.customerName}</div>
                      {s.customerEmail && (
                        <div className="text-xs text-slate-400">{s.customerEmail}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">{formatDate(s.saleDate)}</td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        <CreditCard className="w-3 h-3 text-slate-400" />
                        <span>{s.paymentMethod}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      {formatCurrency(s.totalAmount)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => viewSaleInvoice(s)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Invoice</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Sale Modal (Stock Out with Strict Stock Checking) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Create Customer Sale (Stock Out)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Verifies stock quantity availability before committing. Decrements product inventory and logs SALE_OUT.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  if (onCloseCreateModal) onCloseCreateModal();
                }}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSale} className="p-6 space-y-5">
              {/* Customer & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Customer / Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Corporation"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Customer Email
                  </label>
                  <input
                    type="email"
                    placeholder="billing@acme.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Invoice #
                  </label>
                  <input
                    type="text"
                    required
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sale Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={saleDate}
                    onChange={(e) => setSaleDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="Credit Card">Credit Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI / Digital Wallet</option>
                  </select>
                </div>
              </div>

              {/* Items Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Sale Line Items
                  </h4>
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                  {items.map((item, idx) => {
                    const lineTotal = item.quantity * parseFloat(item.unitPrice || "0");
                    const selectedProd = products.find((p) => p.id.toString() === item.productId);
                    const stock = selectedProd ? selectedProd.stockQuantity : 0;
                    const isExceedingStock = item.quantity > stock;

                    return (
                      <div
                        key={idx}
                        className={`grid grid-cols-12 gap-2 items-center bg-white p-2.5 rounded-lg border shadow-2xs transition ${
                          isExceedingStock ? "border-rose-300 bg-rose-50/40" : "border-slate-200"
                        }`}
                      >
                        <div className="col-span-5">
                          <div className="flex items-center justify-between mb-0.5">
                            <label className="text-[10px] font-semibold text-slate-400">
                              Product
                            </label>
                            {selectedProd && (
                              <span
                                className={`text-[10px] font-semibold ${
                                  stock <= 0
                                    ? "text-rose-600 font-bold"
                                    : isExceedingStock
                                    ? "text-rose-600 font-bold"
                                    : "text-slate-500"
                                }`}
                              >
                                Avail: {stock} units
                              </span>
                            )}
                          </div>
                          <select
                            value={item.productId}
                            onChange={(e) => handleProductSelect(idx, e.target.value)}
                            className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                          >
                            {products.map((p) => (
                              <option key={p.id} value={p.id} disabled={p.stockQuantity <= 0}>
                                {p.name} ({p.sku}) — Stock: {p.stockQuantity}
                                {p.stockQuantity <= 0 ? " [OUT OF STOCK]" : ""}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-span-2">
                          <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">
                            Quantity
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleQuantityChange(idx, parseInt(e.target.value, 10) || 1)
                            }
                            className={`w-full px-2 py-1.5 text-xs border rounded-lg ${
                              isExceedingStock
                                ? "border-rose-400 text-rose-700 bg-rose-50"
                                : "border-slate-200"
                            }`}
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">
                            Unit Price ($)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) => handlePriceChange(idx, e.target.value)}
                            className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg"
                          />
                        </div>

                        <div className="col-span-2 text-right">
                          <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">
                            Total
                          </label>
                          <div className="font-bold text-xs text-slate-900 py-1.5">
                            {formatCurrency(lineTotal)}
                          </div>
                        </div>

                        <div className="col-span-1 text-center">
                          <button
                            type="button"
                            onClick={() => removeItemRow(idx)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                            title="Remove Line"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {isExceedingStock && (
                          <div className="col-span-12 text-[11px] font-medium text-rose-600 flex items-center gap-1 mt-1 bg-rose-100/60 px-2 py-1 rounded">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            <span>
                              Requested quantity ({item.quantity}) exceeds available inventory (
                              {stock}). Please reduce quantity or reorder stock first.
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Notes & Grand Total */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Invoice Notes / Delivery Instructions
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Delivered via FedEx Ground, PO# 98234"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-right">
                  <span className="text-xs font-semibold text-indigo-800 uppercase block">
                    Total Amount Due
                  </span>
                  <span className="text-2xl font-extrabold text-indigo-700">
                    {formatCurrency(calculateGrandTotal())}
                  </span>
                </div>
              </div>

              {hasInsufficientStockError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-rose-700">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>
                    Cannot complete sale: One or more products exceed available stock. The backend transaction will reject this order to protect inventory integrity.
                  </span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || hasInsufficientStockError}
                  className="px-6 py-2 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{submitting ? "Validating & Committing..." : "Complete Sale"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sale Tax Invoice Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                  Tax Invoice / Receipt
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 font-mono mt-0.5">
                  {selectedInvoice.invoiceNumber}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
                  title="Print Invoice"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Billed To</span>
                <span className="font-bold text-slate-900 text-sm">
                  {selectedInvoice.customerName}
                </span>
                {selectedInvoice.customerEmail && (
                  <p className="text-slate-500 mt-0.5">{selectedInvoice.customerEmail}</p>
                )}
                <div className="mt-2 text-slate-600">
                  <span>Payment: </span>
                  <span className="font-semibold text-slate-800">
                    {selectedInvoice.paymentMethod}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block font-medium">Invoice Date</span>
                <span className="font-bold text-slate-900">
                  {formatDate(selectedInvoice.saleDate)}
                </span>
                <span className="text-slate-400 block font-medium mt-2">Status</span>
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  PAID & FULFILLED
                </span>
              </div>
            </div>

            {/* Line items */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
                    selectedInvoice.items.map((itm, i) => (
                      <tr key={i}>
                        <td className="py-2.5 px-3">
                          <span className="font-semibold text-slate-900">{itm.productName}</span>
                          <span className="block text-[11px] text-slate-400 font-mono">{itm.sku}</span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-800">
                          {itm.quantity}
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium text-slate-600">
                          {formatCurrency(itm.unitPrice)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                          {formatCurrency(itm.totalPrice || itm.quantity * parseFloat(itm.unitPrice))}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-3 px-3 text-center text-slate-400">
                        Item details logged in audit database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-2">
              <div className="text-xs text-slate-500">
                {selectedInvoice.notes && <span>Notes: {selectedInvoice.notes}</span>}
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block font-medium">Total Paid</span>
                <span className="text-xl font-black text-slate-900">
                  {formatCurrency(selectedInvoice.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
