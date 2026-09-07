import { readFile } from "fs/promises";
import { join } from "path";

export const fallbackDemoData = {
  categories: [
    { id: 1, name: "Laptops & Computers", description: "Business and gaming laptops, mini PCs and desktop towers" },
    { id: 2, name: "Computer Accessories", description: "Keyboards, mice, webcams, headsets and docking stations" },
    { id: 3, name: "Monitors & Displays", description: "IPS, 4K, ultrawide and gaming monitors" },
    { id: 4, name: "Storage & Memory", description: "NVMe SSDs, external hard drives, DDR5 RAM modules" },
    { id: 5, name: "Networking Gear", description: "Routers, switches, patch panels, Cat6 cables" },
    { id: 6, name: "Office Supplies", description: "Ergonomic chairs, shredders, desk organizers" },
  ],
  suppliers: [
    {
      id: 1,
      name: "Apex Tech Distribution",
      contactPerson: "Robert Chang",
      email: "robert@apextech.com",
      phone: "+1 (555) 234-5678",
      address: "100 Innovation Blvd, Suite 400, Austin, TX",
    },
    {
      id: 2,
      name: "Global Silicon Partners",
      contactPerson: "Elena Rostova",
      email: "elena@globalsilicon.io",
      phone: "+1 (555) 876-5432",
      address: "42 Enterprise Way, San Jose, CA",
    },
    {
      id: 3,
      name: "OfficePrime Wholesale",
      contactPerson: "Marcus Vance",
      email: "orders@officeprime.com",
      phone: "+1 (555) 345-6789",
      address: "78 Commerce Park, Chicago, IL",
    },
    {
      id: 4,
      name: "NexGen Peripherals Co.",
      contactPerson: "Priya Sharma",
      email: "sales@nexgenperi.com",
      phone: "+1 (555) 901-2345",
      address: "210 Tech Boulevard, Seattle, WA",
    },
  ],
  products: [
    { id: 1, name: "ThinkPad Pro 16 Laptop", sku: "LAP-TP16-01", categoryId: 1, categoryName: "Laptops & Computers", price: "1250.00", costPrice: "950.00", stockQuantity: 12, reorderLevel: 5, description: "Intel Core Ultra 7, 32GB RAM, 1TB SSD, 16-inch IPS", createdAt: "2025-01-02T00:00:00.000Z", updatedAt: "2025-01-02T00:00:00.000Z" },
    { id: 2, name: "Dell UltraSharp 27 4K Monitor", sku: "MON-DL27-02", categoryId: 3, categoryName: "Monitors & Displays", price: "580.00", costPrice: "420.00", stockQuantity: 3, reorderLevel: 5, description: "27-inch 4K UHD IPS display, USB-C hub 90W delivery", createdAt: "2025-01-02T00:00:00.000Z", updatedAt: "2025-01-02T00:00:00.000Z" },
    { id: 3, name: "Logitech MX Master 3S Mouse", sku: "ACC-MX3S-03", categoryId: 2, categoryName: "Computer Accessories", price: "99.00", costPrice: "65.00", stockQuantity: 28, reorderLevel: 10, description: "Quiet clicks, 8K DPI sensor, ergonomic design", createdAt: "2025-01-02T00:00:00.000Z", updatedAt: "2025-01-02T00:00:00.000Z" },
    { id: 4, name: "Keychron K2 Mechanical Keyboard", sku: "ACC-KCK2-04", categoryId: 2, categoryName: "Computer Accessories", price: "85.00", costPrice: "52.00", stockQuantity: 2, reorderLevel: 6, description: "Wireless mechanical keyboard, hot-swappable Gateron switches", createdAt: "2025-01-02T00:00:00.000Z", updatedAt: "2025-01-02T00:00:00.000Z" },
    { id: 5, name: "Samsung 990 PRO 2TB NVMe SSD", sku: "STR-S990-05", categoryId: 4, categoryName: "Storage & Memory", price: "185.00", costPrice: "135.00", stockQuantity: 15, reorderLevel: 8, description: "PCIe 4.0 M.2 2280 up to 7450 MB/s read speed", createdAt: "2025-01-02T00:00:00.000Z", updatedAt: "2025-01-02T00:00:00.000Z" },
    { id: 6, name: "Cisco Catalyst 8-Port PoE+ Switch", sku: "NET-CS08-06", categoryId: 5, categoryName: "Networking Gear", price: "340.00", costPrice: "240.00", stockQuantity: 4, reorderLevel: 5, description: "Gigabit Ethernet managed switch with 120W PoE budget", createdAt: "2025-01-02T00:00:00.000Z", updatedAt: "2025-01-02T00:00:00.000Z" },
    { id: 7, name: "Corsair Vengeance 32GB DDR5 RAM", sku: "STR-CR32-07", categoryId: 4, categoryName: "Storage & Memory", price: "115.00", costPrice: "80.00", stockQuantity: 22, reorderLevel: 8, description: "6000MHz CL30 AMD EXPO / Intel XMP ready kit", createdAt: "2025-01-02T00:00:00.000Z", updatedAt: "2025-01-02T00:00:00.000Z" },
    { id: 8, name: "ErgoMax Adjustable Office Chair", sku: "OFC-ERGO-08", categoryId: 6, categoryName: "Office Supplies", price: "299.00", costPrice: "190.00", stockQuantity: 8, reorderLevel: 4, description: "Breathable mesh, lumbar support, 3D armrests", createdAt: "2025-01-02T00:00:00.000Z", updatedAt: "2025-01-02T00:00:00.000Z" },
    { id: 9, name: "Anker USB-C 10-in-1 Hub", sku: "ACC-ANK1-09", categoryId: 2, categoryName: "Computer Accessories", price: "65.00", costPrice: "38.00", stockQuantity: 1, reorderLevel: 5, description: "4K HDMI, Gigabit Ethernet, 100W PD, SD card slot", createdAt: "2025-01-02T00:00:00.000Z", updatedAt: "2025-01-02T00:00:00.000Z" },
    { id: 10, name: "Ubiquiti UniFi U6 Pro AP", sku: "NET-UB6P-10", categoryId: 5, categoryName: "Networking Gear", price: "160.00", costPrice: "115.00", stockQuantity: 14, reorderLevel: 6, description: "Wi-Fi 6 dual-band ceiling mount access point", createdAt: "2025-01-02T00:00:00.000Z", updatedAt: "2025-01-02T00:00:00.000Z" },
  ],
  purchases: [
    { id: 1, purchaseNumber: "PO-2025-001", supplierId: 1, supplierName: "Apex Tech Distribution", purchaseDate: "2025-01-06T00:00:00.000Z", totalAmount: "14250.00", status: "Completed", notes: "Q1 Bulk order for laptops and docking stations", createdAt: "2025-01-06T00:00:00.000Z" },
    { id: 2, purchaseNumber: "PO-2025-002", supplierId: 2, supplierName: "Global Silicon Partners", purchaseDate: "2025-01-09T00:00:00.000Z", totalAmount: "4130.00", status: "Completed", notes: "Restock fast-moving SSDs and RAM", createdAt: "2025-01-09T00:00:00.000Z" },
  ],
  sales: [
    { id: 1, invoiceNumber: "INV-2025-001", customerName: "Acme Corporation", customerEmail: "procurement@acme.com", saleDate: "2025-01-08T14:00:00.000Z", totalAmount: "4047.00", paymentMethod: "Bank Transfer", status: "Completed", notes: "Engineering workstations upgrade package", createdAt: "2025-01-08T14:00:00.000Z" },
    { id: 2, invoiceNumber: "INV-2025-002", customerName: "Vertex Media Labs", customerEmail: "tech@vertexmedia.com", saleDate: "2025-01-10T14:00:00.000Z", totalAmount: "1345.00", paymentMethod: "Credit Card", status: "Completed", notes: "Editing suite monitor and storage expansion", createdAt: "2025-01-10T14:00:00.000Z" },
    { id: 3, invoiceNumber: "INV-2025-003", customerName: "GreenLight Innovations", customerEmail: "accounts@greenlight.io", saleDate: "2025-01-12T09:00:00.000Z", totalAmount: "855.00", paymentMethod: "UPI", status: "Completed", notes: "Front desk accessories & network gear", createdAt: "2025-01-12T09:00:00.000Z" },
  ],
  transactions: [
    { id: 1, productId: 1, productName: "ThinkPad Pro 16 Laptop", sku: "LAP-TP16-01", transactionType: "INITIAL", quantityChange: 12, previousStock: 0, newStock: 12, referenceId: "INITIAL-STOCK", createdAt: "2025-01-02T00:00:00.000Z" },
    { id: 2, productId: 2, productName: "Dell UltraSharp 27 4K Monitor", sku: "MON-DL27-02", transactionType: "INITIAL", quantityChange: 5, previousStock: 0, newStock: 5, referenceId: "INITIAL-STOCK", createdAt: "2025-01-02T00:00:00.000Z" },
    { id: 3, productId: 3, productName: "Logitech MX Master 3S Mouse", sku: "ACC-MX3S-03", transactionType: "INITIAL", quantityChange: 28, previousStock: 0, newStock: 28, referenceId: "INITIAL-STOCK", createdAt: "2025-01-02T00:00:00.000Z" },
    { id: 4, productId: 4, productName: "Keychron K2 Mechanical Keyboard", sku: "ACC-KCK2-04", transactionType: "INITIAL", quantityChange: 2, previousStock: 0, newStock: 2, referenceId: "INITIAL-STOCK", createdAt: "2025-01-02T00:00:00.000Z" },
    { id: 5, productId: 5, productName: "Samsung 990 PRO 2TB NVMe SSD", sku: "STR-S990-05", transactionType: "INITIAL", quantityChange: 15, previousStock: 0, newStock: 15, referenceId: "INITIAL-STOCK", createdAt: "2025-01-02T00:00:00.000Z" },
    { id: 6, productId: 6, productName: "Cisco Catalyst 8-Port PoE+ Switch", sku: "NET-CS08-06", transactionType: "INITIAL", quantityChange: 4, previousStock: 0, newStock: 4, referenceId: "INITIAL-STOCK", createdAt: "2025-01-02T00:00:00.000Z" },
    { id: 7, productId: 7, productName: "Corsair Vengeance 32GB DDR5 RAM", sku: "STR-CR32-07", transactionType: "INITIAL", quantityChange: 22, previousStock: 0, newStock: 22, referenceId: "INITIAL-STOCK", createdAt: "2025-01-02T00:00:00.000Z" },
    { id: 8, productId: 8, productName: "ErgoMax Adjustable Office Chair", sku: "OFC-ERGO-08", transactionType: "INITIAL", quantityChange: 8, previousStock: 0, newStock: 8, referenceId: "INITIAL-STOCK", createdAt: "2025-01-02T00:00:00.000Z" },
    { id: 9, productId: 9, productName: "Anker USB-C 10-in-1 Hub", sku: "ACC-ANK1-09", transactionType: "INITIAL", quantityChange: 1, previousStock: 0, newStock: 1, referenceId: "INITIAL-STOCK", createdAt: "2025-01-02T00:00:00.000Z" },
    { id: 10, productId: 10, productName: "Ubiquiti UniFi U6 Pro AP", sku: "NET-UB6P-10", transactionType: "INITIAL", quantityChange: 14, previousStock: 0, newStock: 14, referenceId: "INITIAL-STOCK", createdAt: "2025-01-02T00:00:00.000Z" },
    { id: 11, productId: 2, productName: "Dell UltraSharp 27 4K Monitor", sku: "MON-DL27-02", transactionType: "SALE_OUT", quantityChange: -2, previousStock: 5, newStock: 3, referenceId: "INV-2025-002", createdAt: "2025-01-10T14:00:00.000Z" },
    { id: 12, productId: 5, productName: "Samsung 990 PRO 2TB NVMe SSD", sku: "STR-S990-05", transactionType: "PURCHASE_IN", quantityChange: 20, previousStock: 15, newStock: 35, referenceId: "PO-2025-002", createdAt: "2025-01-09T00:00:00.000Z" },
  ],
};

export async function loadDemoData(): Promise<any> {
  try {
    const filePath = join(process.cwd(), "public", "demo-data.json");
    const fileContents = await readFile(filePath, "utf8");
    const parsed = JSON.parse(fileContents);
    if (!parsed || typeof parsed !== "object") {
      return fallbackDemoData;
    }
    return {
      ...fallbackDemoData,
      ...parsed,
      categories: parsed.categories ?? fallbackDemoData.categories,
      suppliers: parsed.suppliers ?? fallbackDemoData.suppliers,
      products: parsed.products ?? fallbackDemoData.products,
      purchases: parsed.purchases ?? fallbackDemoData.purchases,
      sales: parsed.sales ?? fallbackDemoData.sales,
      transactions: parsed.transactions ?? fallbackDemoData.transactions,
    };
  } catch {
    return fallbackDemoData;
  }
}
