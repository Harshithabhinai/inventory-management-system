"use client";

import React, { useState, useEffect } from "react";
import { Purchase, Supplier, Product } from "@/types";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { useToast } from "./Toast";
import {
  ArrowDownToLine,
  Plus,
  Search,
  FileText,
  Trash2,
  X,
  Truck,
  CheckCircle2,
  Printer,
  Calendar,
  Layers,
  ArrowRight,
} from "lucide-react";

interface PurchasesViewProps {
  purchases: Purchase[];
  suppliers: Supplier[];
  products: Product[];
  loading: boolean;
  onRefresh: () => Promise<void>;
  preselectedSupplierId?: number | null;
  onClearPreselectedSupplier?: () => void;
  openCreateModalDirectly?: boolean;
  onCloseCreateModal?: () => void;
}

interface NewPurchaseItem {
  productId: string;
  quantity: number;
  unitPrice: string;
}

export function PurchasesView({
  purchases,
  suppliers,
  products,
  loading,
  onRefresh,
  preselectedSupplierId,
  openCreateModalDirectly = false,
  onCloseCreateModal,
}: PurchasesViewProps) {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(openCreateModalDirectly);
  const [selectedInvoice, setSelectedInvoice] = useState<Purchase | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [supplierId, setSupplierId] = useState<string>(
    preselectedSupplierId ? preselectedSupplierId.toString() : suppliers.length > 0 ? suppliers[0].id.toString() : ""
  );
  const [purchaseNumber, setPurchaseNumber] = useState<string>("");
  useEffect(() => {
    const t = setTimeout(() => {
      setPurchaseNumber(`PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    }, 0);
    return () => clearTimeout(t);
  }, []);
  const [purchaseDate, setPurchaseDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState<string>("");

  const [items, setItems] = useState<NewPurchaseItem[]>([
    {
      productId: products.length > 0 ? products[0].id.toString() : "",
      quantity: 10,
      unitPrice: products.length > 0 ? products[0].costPrice || "50.00" : "50.00",
    },
  ]);

  const openCreateModal = () => {
    setPurchaseNumber(`PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    setPurchaseDate(new Date().toISOString().split("T")[0]);
    setNotes("");
    if (preselectedSupplierId) {
      setSupplierId(preselectedSupplierId.toString());
    } else if (suppliers.length > 0) {
      setSupplierId(suppliers[0].id.toString());
    }

    if (products.length > 0) {
      setItems([
        {
          productId: products[0].id.toString(),
          quantity: 10,
          unitPrice: products[0].costPrice || "50.00",
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
      updated[index].unitPrice = selectedProd.costPrice || selectedProd.price || "0.00";
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
    const nextProd = products.find((p) => !items.some((itm) => itm.productId === p.id.toString())) || products[0];
    if (nextProd) {
      setItems([
        ...items,
        {
          productId: nextProd.id.toString(),
          quantity: 5,
          unitPrice: nextProd.costPrice || "0.00",
        },
      ]);
    }
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) {
      showToast("Purchase must contain at least one item", "warning");
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateGrandTotal = () => {
    return items.reduce((sum, itm) => sum + itm.quantity * parseFloat(itm.unitPrice || "0"), 0);
  };

  const handleCreatePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) {
      showToast("Please select a supplier", "warning");
      return;
    }

    if (items.length === 0) {
      showToast("Please add at least one line item", "warning");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        supplierId: parseInt(supplierId, 10),
        purchaseNumber,
        purchaseDate,
        notes,
        items: items.map((itm) => ({
          productId: parseInt(itm.productId, 10),
          quantity: itm.quantity,
          unitPrice: parseFloat(itm.unitPrice || "0").toFixed(2),
        })),
      };

      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create purchase order");

      showToast(`Purchase ${purchaseNumber} completed! Stock increased.`, "success");
      setIsCreateModalOpen(false);
      if (onCloseCreateModal) onCloseCreateModal();
      await onRefresh();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const viewPurchaseInvoice = async (po: Purchase) => {
    try {
      const res = await fetch(`/api/purchases/${po.id}`);
      const data = await res.json();
      if (res.ok) {
        setSelectedInvoice(data);
      } else {
        setSelectedInvoice(po);
      }
    } catch {
      setSelectedInvoice(po);
    }
  };

  const filteredPurchases = purchases.filter(
    (p) =>
      p.purchaseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.supplierName && p.supplierName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Purchase Management</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Stock In Flow
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Receive inventory orders from suppliers, calculate landed costs, and automatically replenish stock
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md transition active:scale-95 self-start sm:self-auto"
        >
          <ArrowDownToLine className="w-4 h-4" />
          <span>New Purchase Order (Stock In)</span>
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by PO number or supplier name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium hidden sm:block">
          Total Recorded Orders: <span className="font-bold text-slate-800">{purchases.length}</span>
        </div>
      </div>

      {/* Purchases Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">PO Reference</th>
                <th className="py-3.5 px-4">Supplier</th>
                <th className="py-3.5 px-4">Purchase Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Total Amount</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Loading purchase orders...
                  </td>
                </tr>
              ) : filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No purchase records found.
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                      {po.purchaseNumber}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {po.supplierName || `Supplier #${po.supplierId}`}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {formatDate(po.purchaseDate)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Completed (Stock In)</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      {formatCurrency(po.totalAmount)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => viewPurchaseInvoice(po)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View PO</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Purchase Modal (Stock In Form) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <ArrowDownToLine className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Create Purchase Order (Stock In)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Submitting this PO will atomically increase product inventory and record audit logs.
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

            <form onSubmit={handleCreatePurchase} className="p-6 space-y-5">
              {/* Top Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Supplier *
                  </label>
                  <select
                    required
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    PO Reference Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={purchaseNumber}
                    onChange={(e) => setPurchaseNumber(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Purchase Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Items Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Purchase Line Items
                  </h4>
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                  {items.map((item, idx) => {
                    const lineTotal = item.quantity * parseFloat(item.unitPrice || "0");
                    const selectedProd = products.find((p) => p.id.toString() === item.productId);

                    return (
                      <div
                        key={idx}
                        className="grid grid-cols-12 gap-2 items-center bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs"
                      >
                        <div className="col-span-5">
                          <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">
                            Product
                          </label>
                          <select
                            value={item.productId}
                            onChange={(e) => handleProductSelect(idx, e.target.value)}
                            className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                          >
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.sku}) — Current Stock: {p.stockQuantity}
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
                            className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">
                            Unit Cost ($)
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
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Notes & Grand Total */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Purchase Order Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Expedited shipping, payment terms net 30"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-right">
                  <span className="text-xs font-semibold text-emerald-800 uppercase block">
                    Grand Purchase Total
                  </span>
                  <span className="text-2xl font-extrabold text-emerald-700">
                    {formatCurrency(calculateGrandTotal())}
                  </span>
                </div>
              </div>

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
                  disabled={submitting}
                  className="px-6 py-2 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-2"
                >
                  <ArrowDownToLine className="w-4 h-4" />
                  <span>{submitting ? "Processing..." : "Complete Stock In"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Purchase Invoice Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  Purchase Order Voucher
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 font-mono mt-0.5">
                  {selectedInvoice.purchaseNumber}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
                  title="Print PO"
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
                <span className="text-slate-400 block font-medium">Supplier</span>
                <span className="font-bold text-slate-900 text-sm">
                  {selectedInvoice.supplierName}
                </span>
                {selectedInvoice.supplierAddress && (
                  <p className="text-slate-500 mt-0.5">{selectedInvoice.supplierAddress}</p>
                )}
                {selectedInvoice.supplierEmail && (
                  <p className="text-slate-500">{selectedInvoice.supplierEmail}</p>
                )}
              </div>
              <div className="text-right">
                <span className="text-slate-400 block font-medium">Order Date</span>
                <span className="font-bold text-slate-900">
                  {formatDate(selectedInvoice.purchaseDate)}
                </span>
                <span className="text-slate-400 block font-medium mt-2">Status</span>
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  COMPLETED / RECEIVED
                </span>
              </div>
            </div>

            {/* Items */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Item</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-right">Line Total</th>
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
                        Item details captured in audit records.
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
                <span className="text-xs text-slate-400 block font-medium">Grand Total</span>
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
