"use client";

import React, { useState } from "react";
import { Supplier } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "./Toast";
import {
  Truck,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Mail,
  Phone,
  MapPin,
  ArrowDownToLine,
  User,
} from "lucide-react";

interface SuppliersViewProps {
  suppliers: Supplier[];
  loading: boolean;
  onRefresh: () => Promise<void>;
  onSelectSupplierForPurchase: (supplierId: number) => void;
}

export function SuppliersView({
  suppliers,
  loading,
  onRefresh,
  onSelectSupplierForPurchase,
}: SuppliersViewProps) {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
  });

  const openAddModal = () => {
    setEditingSupplier(null);
    setFormData({
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (s: Supplier) => {
    setEditingSupplier(s);
    setFormData({
      name: s.name,
      contactPerson: s.contactPerson || "",
      email: s.email || "",
      phone: s.phone || "",
      address: s.address || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast("Supplier name is required", "warning");
      return;
    }

    setSubmitting(true);
    try {
      const url = editingSupplier ? `/api/suppliers/${editingSupplier.id}` : "/api/suppliers";
      const method = editingSupplier ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save supplier");

      showToast(
        editingSupplier ? "Supplier updated successfully!" : "Supplier created successfully!",
        "success"
      );
      setIsModalOpen(false);
      await onRefresh();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/suppliers/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete supplier");

      showToast("Supplier deleted successfully", "success");
      setDeleteConfirmId(null);
      await onRefresh();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const filtered = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.contactPerson && s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Suppliers & Vendors</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage procurement partners, contact points, and historical purchase volumes
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md transition active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Supplier</span>
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search suppliers by name, representative, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Grid of Suppliers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-48 bg-slate-100 rounded-2xl animate-pulse"></div>
          ))
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            No suppliers found matching your query.
          </div>
        ) : (
          filtered.map((sup) => (
            <div
              key={sup.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-indigo-200 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{sup.name}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{sup.contactPerson || "No contact person listed"}</span>
                      </div>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                    {sup.totalPurchases ?? 0} POs
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-600">
                  {sup.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <a href={`mailto:${sup.email}`} className="text-indigo-600 hover:underline">
                        {sup.email}
                      </a>
                    </div>
                  )}
                  {sup.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{sup.phone}</span>
                    </div>
                  )}
                  {sup.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{sup.address}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block">Total Spend</span>
                  <span className="text-sm font-bold text-slate-800">
                    {formatCurrency(sup.totalSpend || 0)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectSupplierForPurchase(sup.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                  >
                    <ArrowDownToLine className="w-3.5 h-3.5" />
                    <span>Create PO</span>
                  </button>
                  <button
                    onClick={() => openEditModal(sup)}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                    title="Edit Supplier"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(sup.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Delete Supplier"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">
                {editingSupplier ? "Edit Supplier" : "Add New Supplier"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Supplier / Company Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Tech Distribution"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contact Person
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe (Account Rep)"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="orders@supplier.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Address</label>
                <textarea
                  rows={2}
                  placeholder="Warehouse address, city, state..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {submitting ? "Saving..." : editingSupplier ? "Update" : "Save Supplier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Delete Supplier</h3>
            <p className="text-xs text-slate-600">
              Suppliers with historical purchase orders cannot be removed to preserve accounting records.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
