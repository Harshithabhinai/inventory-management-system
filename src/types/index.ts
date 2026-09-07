export interface User {
  id: number;
  name: string;
  email: string;
  role: "Admin" | "Manager" | "Sales";
  createdAt?: string;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  productCount?: number;
}

export interface Supplier {
  id: number;
  name: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  createdAt: string;
  totalPurchases?: number;
  totalSpend?: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  categoryId: number | null;
  categoryName?: string | null;
  price: string;
  costPrice: string;
  stockQuantity: number;
  reorderLevel: number;
  description: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PurchaseItem {
  id?: number;
  productId: number;
  productName?: string;
  sku?: string;
  quantity: number;
  unitPrice: string;
  totalPrice?: string;
}

export interface Purchase {
  id: number;
  purchaseNumber: string;
  supplierId: number;
  supplierName?: string;
  supplierEmail?: string;
  supplierPhone?: string;
  supplierAddress?: string;
  purchaseDate: string;
  totalAmount: string;
  status: string;
  notes: string | null;
  createdAt?: string;
  items?: PurchaseItem[];
}

export interface SaleItem {
  id?: number;
  productId: number;
  productName?: string;
  sku?: string;
  quantity: number;
  unitPrice: string;
  totalPrice?: string;
}

export interface Sale {
  id: number;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string | null;
  saleDate: string;
  totalAmount: string;
  paymentMethod: string;
  status: string;
  notes: string | null;
  createdAt?: string;
  items?: SaleItem[];
}

export interface StockTransaction {
  id: number;
  productId: number;
  productName?: string;
  sku?: string;
  transactionType: "PURCHASE_IN" | "SALE_OUT" | "ADJUSTMENT" | "INITIAL";
  quantityChange: number;
  previousStock: number;
  newStock: number;
  referenceId: string | null;
  notes: string | null;
  createdAt: string;
}

export interface DashboardMetrics {
  totalProducts: number;
  totalStock: number;
  lowStockCount: number;
  totalSales: string;
  totalPurchases: string;
  countSales: number;
  countPurchases: number;
  recentSales: Sale[];
  recentPurchases: Purchase[];
  lowStockList: Product[];
  categoryDistribution: Array<{
    categoryId: number;
    categoryName: string;
    productCount: number;
    totalStock: number;
    inventoryValue: string;
  }>;
  recentTransactions: Array<{
    id: number;
    productName: string;
    transactionType: string;
    quantityChange: number;
    newStock: number;
    referenceId: string;
    createdAt: string;
  }>;
}
