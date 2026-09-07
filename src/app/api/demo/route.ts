import { NextResponse } from "next/server";

const sampleProducts = [
  { id: 1, name: "ThinkPad Pro 16 Laptop", sku: "LAP-TP16-01", categoryId: 1, categoryName: "Laptops & Computers", price: "1250.00", costPrice: "950.00", stockQuantity: 12, reorderLevel: 5, updatedAt: new Date().toISOString() },
  { id: 2, name: "Dell UltraSharp 27 4K Monitor", sku: "MON-DL27-02", categoryId: 3, categoryName: "Monitors & Displays", price: "580.00", costPrice: "420.00", stockQuantity: 3, reorderLevel: 5, updatedAt: new Date().toISOString() },
  { id: 3, name: "Logitech MX Master 3S Mouse", sku: "ACC-MX3S-03", categoryId: 2, categoryName: "Computer Accessories", price: "99.00", costPrice: "65.00", stockQuantity: 28, reorderLevel: 10, updatedAt: new Date().toISOString() },
  { id: 4, name: "Keychron K2 Mechanical Keyboard", sku: "ACC-KCK2-04", categoryId: 2, categoryName: "Computer Accessories", price: "85.00", costPrice: "52.00", stockQuantity: 2, reorderLevel: 6, updatedAt: new Date().toISOString() },
  { id: 5, name: "Samsung 990 PRO 2TB NVMe SSD", sku: "STR-S990-05", categoryId: 4, categoryName: "Storage & Memory", price: "185.00", costPrice: "135.00", stockQuantity: 15, reorderLevel: 8, updatedAt: new Date().toISOString() },
  { id: 6, name: "Cisco Catalyst 8-Port PoE+ Switch", sku: "NET-CS08-06", categoryId: 5, categoryName: "Networking Gear", price: "340.00", costPrice: "240.00", stockQuantity: 4, reorderLevel: 5, updatedAt: new Date().toISOString() },
  { id: 7, name: "Corsair Vengeance 32GB DDR5 RAM", sku: "STR-CR32-07", categoryId: 4, categoryName: "Storage & Memory", price: "115.00", costPrice: "80.00", stockQuantity: 22, reorderLevel: 8, updatedAt: new Date().toISOString() },
  { id: 8, name: "ErgoMax Adjustable Office Chair", sku: "OFC-ERGO-08", categoryId: 6, categoryName: "Office Supplies", price: "299.00", costPrice: "190.00", stockQuantity: 8, reorderLevel: 4, updatedAt: new Date().toISOString() },
  { id: 9, name: "Anker USB-C 10-in-1 Hub", sku: "ACC-ANK1-09", categoryId: 2, categoryName: "Computer Accessories", price: "65.00", costPrice: "38.00", stockQuantity: 1, reorderLevel: 5, updatedAt: new Date().toISOString() },
  { id: 10, name: "Ubiquiti UniFi U6 Pro AP", sku: "NET-UB6P-10", categoryId: 5, categoryName: "Networking Gear", price: "160.00", costPrice: "115.00", stockQuantity: 14, reorderLevel: 6, updatedAt: new Date().toISOString() },
];

const sampleTransactions = [
  { id: 1, productId: 1, productName: "ThinkPad Pro 16 Laptop", sku: "LAP-TP16-01", transactionType: "INITIAL", quantityChange: 12, previousStock: 0, newStock: 12, referenceId: "INITIAL-STOCK", notes: "Initial stock setup", createdAt: new Date().toISOString() },
  { id: 2, productId: 2, productName: "Dell UltraSharp 27 4K Monitor", sku: "MON-DL27-02", transactionType: "INITIAL", quantityChange: 5, previousStock: 0, newStock: 5, referenceId: "INITIAL-STOCK", notes: "Initial stock setup", createdAt: new Date().toISOString() },
  { id: 3, productId: 3, productName: "Logitech MX Master 3S Mouse", sku: "ACC-MX3S-03", transactionType: "INITIAL", quantityChange: 28, previousStock: 0, newStock: 28, referenceId: "INITIAL-STOCK", notes: "Initial stock setup", createdAt: new Date().toISOString() },
  { id: 4, productId: 4, productName: "Keychron K2 Mechanical Keyboard", sku: "ACC-KCK2-04", transactionType: "INITIAL", quantityChange: 2, previousStock: 0, newStock: 2, referenceId: "INITIAL-STOCK", notes: "Initial stock setup", createdAt: new Date().toISOString() },
  { id: 5, productId: 5, productName: "Samsung 990 PRO 2TB NVMe SSD", sku: "STR-S990-05", transactionType: "INITIAL", quantityChange: 15, previousStock: 0, newStock: 15, referenceId: "INITIAL-STOCK", notes: "Initial stock setup", createdAt: new Date().toISOString() },
  { id: 6, productId: 6, productName: "Cisco Catalyst 8-Port PoE+ Switch", sku: "NET-CS08-06", transactionType: "INITIAL", quantityChange: 4, previousStock: 0, newStock: 4, referenceId: "INITIAL-STOCK", notes: "Initial stock setup", createdAt: new Date().toISOString() },
  { id: 7, productId: 7, productName: "Corsair Vengeance 32GB DDR5 RAM", sku: "STR-CR32-07", transactionType: "INITIAL", quantityChange: 22, previousStock: 0, newStock: 22, referenceId: "INITIAL-STOCK", notes: "Initial stock setup", createdAt: new Date().toISOString() },
  { id: 8, productId: 8, productName: "ErgoMax Adjustable Office Chair", sku: "OFC-ERGO-08", transactionType: "INITIAL", quantityChange: 8, previousStock: 0, newStock: 8, referenceId: "INITIAL-STOCK", notes: "Initial stock setup", createdAt: new Date().toISOString() },
  { id: 9, productId: 9, productName: "Anker USB-C 10-in-1 Hub", sku: "ACC-ANK1-09", transactionType: "INITIAL", quantityChange: 1, previousStock: 0, newStock: 1, referenceId: "INITIAL-STOCK", notes: "Initial stock setup", createdAt: new Date().toISOString() },
  { id: 10, productId: 10, productName: "Ubiquiti UniFi U6 Pro AP", sku: "NET-UB6P-10", transactionType: "INITIAL", quantityChange: 14, previousStock: 0, newStock: 14, referenceId: "INITIAL-STOCK", notes: "Initial stock setup", createdAt: new Date().toISOString() },
  { id: 11, productId: 2, productName: "Dell UltraSharp 27 4K Monitor", sku: "MON-DL27-02", transactionType: "SALE_OUT", quantityChange: -2, previousStock: 5, newStock: 3, referenceId: "INV-2025-002", notes: "Sale INV-2025-002", createdAt: new Date().toISOString() },
  { id: 12, productId: 5, productName: "Samsung 990 PRO 2TB NVMe SSD", sku: "STR-S990-05", transactionType: "PURCHASE_IN", quantityChange: 20, previousStock: 15, newStock: 35, referenceId: "PO-2025-002", notes: "Purchase PO-2025-002", createdAt: new Date().toISOString() },
];

export async function GET() {
  try {
    return NextResponse.json({ products: sampleProducts, transactions: sampleTransactions });
  } catch (err: any) {
    console.error("Demo endpoint error:", err);
    return NextResponse.json({ error: "Failed to load demo data" }, { status: 500 });
  }
}
