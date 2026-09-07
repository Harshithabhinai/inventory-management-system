"use client";

import React, { useState } from "react";
import { Product, Category } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "./Toast";
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  X,
  Boxes,
  Percent,
} from "lucide-react";

interface ProductsViewProps {
  products: Product[];
  categories: Category[];
  loading: boolean;
  onRefresh: () => Promise<void>;
  onOpenStockAdjustForProduct: (product: Product) => void;
  filterLowStockInitial?: boolean;
}

export function ProductsView({
  products,
  categories,
  loading,
  onRefresh,
  onOpenStockAdjustForProduct,
  filterLowStockInitial = false,
}: ProductsViewProps) {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showLowStockOnly, setShowLowStockOnly] = useState(filterLowStockInitial);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete modal
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    categoryId: "",
    price: "",
    costPrice: "",
    stockQuantity: "0",
    reorderLevel: "5",
    description: "",
  });

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      categoryId: categories.length > 0 ? categories[0].id.toString() : "",
      price: "",
      costPrice: "",
      stockQuantity: "10",
      reorderLevel: "5",
      description: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      sku: p.sku,
      categoryId: p.categoryId ? p.categoryId.toString() : "",
      price: p.price,
      costPrice: p.costPrice || "0.00",
      stockQuantity: p.stockQuantity.toString(),
      reorderLevel: p.reorderLevel.toString(),
      description: p.description || "",
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.sku.trim()) {
      showToast("Please provide both Product Name and SKU", "warning");
      return;
    }

    setSubmitting(true);
    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save product");

      showToast(
        editingProduct ? "Product updated successfully!" : "Product created successfully!",
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
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete product");

      showToast("Product deleted successfully", "success");
      setDeleteConfirmId(null);
      await onRefresh();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCat =
      selectedCategory === "all" || (p.categoryId && p.categoryId.toString() === selectedCategory);

    const matchesLowStock = !showLowStockOnly || p.stockQuantity <= p.reorderLevel;

    return matchesSearch && matchesCat && matchesLowStock;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Product Catalog</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {filteredProducts.length} items
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage inventory items, SKUs, sales pricing, and safety reorder thresholds
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md transition active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by product name, SKU, or specs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="py-2 px-3 text-sm border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id.toString()}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Low Stock Toggle */}
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition select-none">
            <input
              type="checkbox"
              checked={showLowStockOnly}
              onChange={(e) => setShowLowStockOnly(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span className={showLowStockOnly ? "text-rose-600" : "text-slate-600"}>
              Low Stock Only
            </span>
          </label>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Product & SKU</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-center">Available Stock</th>
                <th className="py-3.5 px-4 text-right">Selling Price</th>
                <th className="py-3.5 px-4 text-right">Cost Price</th>
                <th className="py-3.5 px-4 text-right">Margin</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading products...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No products found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLow = p.stockQuantity <= p.reorderLevel;
                  const isOut = p.stockQuantity <= 0;
                  const price = parseFloat(p.price || "0");
                  const cost = parseFloat(p.costPrice || "0");
                  const margin = price > 0 ? Math.round(((price - cost) / price) * 100) : 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{p.name}</div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px] text-slate-700 font-semibold">
                            {p.sku}
                          </span>
                          {p.description && (
                            <span className="truncate max-w-xs">{p.description}</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {p.categoryName || "Uncategorized"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-base font-bold ${
                                isOut ? "text-rose-600" : isLow ? "text-amber-600" : "text-emerald-700"
                              }`}
                            >
                              {p.stockQuantity}
                            </span>
                            <span className="text-xs text-slate-400">/ reorder at {p.reorderLevel}</span>
                          </div>
                          {isOut ? (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-700 mt-0.5">
                              OUT OF STOCK
                            </span>
                          ) : isLow ? (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 flex items-center gap-1 mt-0.5">
                              <AlertTriangle className="w-3 h-3" /> LOW STOCK
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-50 text-emerald-700 mt-0.5">
                              HEALTHY
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        {formatCurrency(p.price)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-medium text-slate-600">
                        {formatCurrency(p.costPrice || "0.00")}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`inline-block font-semibold text-xs px-2 py-0.5 rounded ${
                            margin >= 30
                              ? "bg-emerald-50 text-emerald-700"
                              : margin > 0
                              ? "bg-blue-50 text-blue-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {margin}%
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onOpenStockAdjustForProduct(p)}
                            title="Adjust Stock Quantity"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                          >
                            <Sliders className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(p)}
                            title="Edit Product"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(p.id)}
                            title="Delete Product"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {editingProduct ? "Edit Product" : "Add New Product"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingProduct
                      ? "Update product details and price points"
                      : "Create a new catalog item with starting stock and SKU"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dell UltraSharp 27"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    SKU (Stock Keeping Unit) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MON-DL27-02"
                    value={formData.sku}
                    onChange={(e) =>
                      setFormData({ ...formData, sku: e.target.value.toUpperCase() })
                    }
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-xl uppercase focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Selling Price ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="499.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cost Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="350.00"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {!editingProduct && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Initial Stock Quantity
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.stockQuantity}
                      onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Creates an initial stock transaction record
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Reorder Level Alert Threshold *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.reorderLevel}
                    onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Triggers low-stock alert when stock reaches this level
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description / Specification
                </label>
                <textarea
                  rows={2}
                  placeholder="Technical specs, model variants, warranty details..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition disabled:opacity-50"
                >
                  {submitting ? "Saving..." : editingProduct ? "Update Product" : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-50 rounded-2xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Delete Product</h3>
                <p className="text-xs text-slate-500">Are you sure you want to delete this product?</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
              Safety check: Products with historical sales or purchase records cannot be deleted to maintain audit integrity.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md transition disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
