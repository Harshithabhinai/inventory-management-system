import { db } from "./index";
import { users, categories, suppliers, products, purchases, purchaseItems, sales, saleItems, stockTransactions } from "./schema";
import { fallbackDemoData } from "@/lib/demo-data";
import { sql, eq } from "drizzle-orm";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

export async function seedDatabase() {
  const writeDemoDataFile = () => {
    const outDir = join(process.cwd(), "public");
    try { mkdirSync(outDir, { recursive: true }); } catch {}
    writeFileSync(join(outDir, "demo-data.json"), JSON.stringify(fallbackDemoData, null, 2), "utf8");
    return { success: true, message: "Wrote demo-data.json to public/" };
  };

  // If no real DATABASE_URL is configured, write demo JSON and skip DB mutations.
  if (!process.env.DATABASE_URL) {
    return writeDemoDataFile();
  }

  try {
    // Clear existing tables in correct order
    await db.delete(stockTransactions);
  await db.delete(purchaseItems);
  await db.delete(purchases);
  await db.delete(saleItems);
  await db.delete(sales);
  await db.delete(products);
  await db.delete(suppliers);
  await db.delete(categories);
  await db.delete(users);

  // 1. Users
  const [adminUser] = await db.insert(users).values([
    {
      name: "Admin User",
      email: "admin@inventory.com",
      password: "password123", // In demo app, for auth simulation
      role: "Admin",
    },
    {
      name: "Sarah Manager",
      email: "sarah@inventory.com",
      password: "password123",
      role: "Manager",
    },
    {
      name: "Alex Sales",
      email: "alex@inventory.com",
      password: "password123",
      role: "Sales",
    },
  ]).returning();

  // 2. Categories
  const insertedCategories = await db.insert(categories).values([
    { name: "Laptops & Computers", description: "Business and gaming laptops, mini PCs and desktop towers" },
    { name: "Computer Accessories", description: "Keyboards, mice, webcams, headsets and docking stations" },
    { name: "Monitors & Displays", description: "IPS, 4K, ultrawide and gaming monitors" },
    { name: "Storage & Memory", description: "NVMe SSDs, external hard drives, DDR5 RAM modules" },
    { name: "Networking Gear", description: "Routers, switches, patch panels, Cat6 cables" },
    { name: "Office Supplies", description: "Ergonomic chairs, shredders, desk organizers" },
  ]).returning();

  const catMap = Object.fromEntries(insertedCategories.map((c: any) => [c.name, c.id]));

  // 3. Suppliers
  const insertedSuppliers = await db.insert(suppliers).values([
    {
      name: "Apex Tech Distribution",
      contactPerson: "Robert Chang",
      email: "robert@apextech.com",
      phone: "+1 (555) 234-5678",
      address: "100 Innovation Blvd, Suite 400, Austin, TX",
    },
    {
      name: "Global Silicon Partners",
      contactPerson: "Elena Rostova",
      email: "elena@globalsilicon.io",
      phone: "+1 (555) 876-5432",
      address: "42 Enterprise Way, San Jose, CA",
    },
    {
      name: "OfficePrime Wholesale",
      contactPerson: "Marcus Vance",
      email: "orders@officeprime.com",
      phone: "+1 (555) 345-6789",
      address: "78 Commerce Park, Chicago, IL",
    },
    {
      name: "NexGen Peripherals Co.",
      contactPerson: "Priya Sharma",
      email: "sales@nexgenperi.com",
      phone: "+1 (555) 901-2345",
      address: "210 Tech Boulevard, Seattle, WA",
    },
  ]).returning();

  const supMap = Object.fromEntries(insertedSuppliers.map((s: any) => [s.name, s.id]));

  // 4. Products (including low-stock products to trigger alerts)
  const insertedProducts = await db.insert(products).values([
    {
      name: "ThinkPad Pro 16 Laptop",
      sku: "LAP-TP16-01",
      categoryId: catMap["Laptops & Computers"],
      price: "1250.00",
      costPrice: "950.00",
      stockQuantity: 12,
      reorderLevel: 5,
      description: "Intel Core Ultra 7, 32GB RAM, 1TB SSD, 16-inch IPS",
    },
    {
      name: "Dell UltraSharp 27 4K Monitor",
      sku: "MON-DL27-02",
      categoryId: catMap["Monitors & Displays"],
      price: "580.00",
      costPrice: "420.00",
      stockQuantity: 3, // LOW STOCK! Reorder level 5
      reorderLevel: 5,
      description: "27-inch 4K UHD IPS display, USB-C hub 90W delivery",
    },
    {
      name: "Logitech MX Master 3S Mouse",
      sku: "ACC-MX3S-03",
      categoryId: catMap["Computer Accessories"],
      price: "99.00",
      costPrice: "65.00",
      stockQuantity: 28,
      reorderLevel: 10,
      description: "Quiet clicks, 8K DPI sensor, ergonomic design",
    },
    {
      name: "Keychron K2 Mechanical Keyboard",
      sku: "ACC-KCK2-04",
      categoryId: catMap["Computer Accessories"],
      price: "85.00",
      costPrice: "52.00",
      stockQuantity: 2, // CRITICAL LOW STOCK! Reorder level 6
      reorderLevel: 6,
      description: "Wireless mechanical keyboard, hot-swappable Gateron switches",
    },
    {
      name: "Samsung 990 PRO 2TB NVMe SSD",
      sku: "STR-S990-05",
      categoryId: catMap["Storage & Memory"],
      price: "185.00",
      costPrice: "135.00",
      stockQuantity: 15,
      reorderLevel: 8,
      description: "PCIe 4.0 M.2 2280 up to 7450 MB/s read speed",
    },
    {
      name: "Cisco Catalyst 8-Port PoE+ Switch",
      sku: "NET-CS08-06",
      categoryId: catMap["Networking Gear"],
      price: "340.00",
      costPrice: "240.00",
      stockQuantity: 4, // LOW STOCK! Reorder level 5
      reorderLevel: 5,
      description: "Gigabit Ethernet managed switch with 120W PoE budget",
    },
    {
      name: "Corsair Vengeance 32GB DDR5 RAM",
      sku: "STR-CR32-07",
      categoryId: catMap["Storage & Memory"],
      price: "115.00",
      costPrice: "80.00",
      stockQuantity: 22,
      reorderLevel: 8,
      description: "6000MHz CL30 AMD EXPO / Intel XMP ready kit",
    },
    {
      name: "ErgoMax Adjustable Office Chair",
      sku: "OFC-ERGO-08",
      categoryId: catMap["Office Supplies"],
      price: "299.00",
      costPrice: "190.00",
      stockQuantity: 8,
      reorderLevel: 4,
      description: "Breathable mesh, lumbar support, 3D armrests",
    },
    {
      name: "Anker USB-C 10-in-1 Hub",
      sku: "ACC-ANK1-09",
      categoryId: catMap["Computer Accessories"],
      price: "65.00",
      costPrice: "38.00",
      stockQuantity: 1, // CRITICAL LOW STOCK! Reorder level 5
      reorderLevel: 5,
      description: "4K HDMI, Gigabit Ethernet, 100W PD, SD card slot",
    },
    {
      name: "Ubiquiti UniFi U6 Pro AP",
      sku: "NET-UB6P-10",
      categoryId: catMap["Networking Gear"],
      price: "160.00",
      costPrice: "115.00",
      stockQuantity: 14,
      reorderLevel: 6,
      description: "Wi-Fi 6 dual-band ceiling mount access point",
    },
  ]).returning();

  const prodMap = Object.fromEntries(insertedProducts.map((p: any) => [p.sku, p]));

  // Record initial stock transactions
  for (const prod of insertedProducts) {
    await db.insert(stockTransactions).values({
      productId: prod.id,
      transactionType: "INITIAL",
      quantityChange: prod.stockQuantity,
      previousStock: 0,
      newStock: prod.stockQuantity,
      referenceId: "INITIAL-STOCK",
      notes: `Initial stock setup for ${prod.name}`,
    });
  }

  // 5. Purchases
  // Purchase 1 from Apex Tech
  const [purchase1] = await db.insert(purchases).values({
    purchaseNumber: "PO-2025-001",
    supplierId: supMap["Apex Tech Distribution"],
    purchaseDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
    totalAmount: "14250.00",
    status: "Completed",
    notes: "Q1 Bulk order for laptops and docking stations",
  }).returning();

  await db.insert(purchaseItems).values([
    {
      purchaseId: purchase1.id,
      productId: prodMap["LAP-TP16-01"].id,
      quantity: 15,
      unitPrice: "950.00",
      totalPrice: "14250.00",
    },
  ]);

  // Update product stock and record transactions for purchase1
  const purchase1Items = await db.select().from(purchaseItems).where(eq(purchaseItems.purchaseId, purchase1.id));
  for (const item of purchase1Items) {
  const prodRow = await db.select({ stockQuantity: products.stockQuantity }).from(products).where(eq(products.id, item.productId)).then((r: any) => r[0]);
    const previous = Number(prodRow?.stockQuantity ?? 0);
    const newStock = previous + Number(item.quantity);
    await db.update(products).set({ stockQuantity: newStock }).where(eq(products.id, item.productId));
    await db.insert(stockTransactions).values({
      productId: item.productId,
      transactionType: "PURCHASE_IN",
      quantityChange: item.quantity,
      previousStock: previous,
      newStock: newStock,
      referenceId: purchase1.purchaseNumber,
      notes: `Purchase ${purchase1.purchaseNumber} - ${item.quantity} units`,
    });
  }

  // Purchase 2 from Global Silicon Partners
  const [purchase2] = await db.insert(purchases).values({
    purchaseNumber: "PO-2025-002",
    supplierId: supMap["Global Silicon Partners"],
    purchaseDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    totalAmount: "4130.00",
    status: "Completed",
    notes: "Restock fast-moving SSDs and RAM",
  }).returning();

  await db.insert(purchaseItems).values([
    {
      purchaseId: purchase2.id,
      productId: prodMap["STR-S990-05"].id,
      quantity: 20,
      unitPrice: "135.00",
      totalPrice: "2700.00",
    },
    {
      purchaseId: purchase2.id,
      productId: prodMap["STR-CR32-07"].id,
      quantity: 17,
      unitPrice: "84.12",
      totalPrice: "1430.00",
    },
  ]);

  // Update product stock and record transactions for purchase2
  const purchase2Items = await db.select().from(purchaseItems).where(eq(purchaseItems.purchaseId, purchase2.id));
  for (const item of purchase2Items) {
    const prodRow = await db.select({ stockQuantity: products.stockQuantity }).from(products).where(eq(products.id, item.productId)).then((r: any) => r[0]);
    const previous = Number(prodRow?.stockQuantity ?? 0);
    const newStock = previous + Number(item.quantity);
    await db.update(products).set({ stockQuantity: newStock }).where(eq(products.id, item.productId));
    await db.insert(stockTransactions).values({
      productId: item.productId,
      transactionType: "PURCHASE_IN",
      quantityChange: item.quantity,
      previousStock: previous,
      newStock: newStock,
      referenceId: purchase2.purchaseNumber,
      notes: `Purchase ${purchase2.purchaseNumber} - ${item.quantity} units`,
    });
  }

  // 6. Sales
  // Sale 1
  const [sale1] = await db.insert(sales).values({
    invoiceNumber: "INV-2025-001",
    customerName: "Acme Corporation",
    customerEmail: "procurement@acme.com",
    saleDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
    totalAmount: "4047.00",
    paymentMethod: "Bank Transfer",
    status: "Completed",
    notes: "Engineering workstations upgrade package",
  }).returning();

  await db.insert(saleItems).values([
    {
      saleId: sale1.id,
      productId: prodMap["LAP-TP16-01"].id,
      quantity: 3,
      unitPrice: "1250.00",
      totalPrice: "3750.00",
    },
    {
      saleId: sale1.id,
      productId: prodMap["ACC-MX3S-03"].id,
      quantity: 3,
      unitPrice: "99.00",
      totalPrice: "297.00",
    },
  ]);

  // Update stock and record transactions for sale1
  const sale1Items = await db.select().from(saleItems).where(eq(saleItems.saleId, sale1.id));
  for (const item of sale1Items) {
    const prodRow = await db.select({ stockQuantity: products.stockQuantity }).from(products).where(eq(products.id, item.productId)).then((r: any) => r[0]);
    const previous = Number(prodRow?.stockQuantity ?? 0);
    const newStock = previous - Number(item.quantity);
    await db.update(products).set({ stockQuantity: newStock }).where(eq(products.id, item.productId));
    await db.insert(stockTransactions).values({
      productId: item.productId,
      transactionType: "SALE_OUT",
      quantityChange: -Math.abs(Number(item.quantity)),
      previousStock: previous,
      newStock: newStock,
      referenceId: sale1.invoiceNumber,
      notes: `Sale ${sale1.invoiceNumber} - ${item.quantity} units`,
    });
  }

  // Sale 2
  const [sale2] = await db.insert(sales).values({
    invoiceNumber: "INV-2025-002",
    customerName: "Vertex Media Labs",
    customerEmail: "tech@vertexmedia.com",
    saleDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    totalAmount: "1345.00",
    paymentMethod: "Credit Card",
    status: "Completed",
    notes: "Editing suite monitor and storage expansion",
  }).returning();

  await db.insert(saleItems).values([
    {
      saleId: sale2.id,
      productId: prodMap["MON-DL27-02"].id,
      quantity: 2,
      unitPrice: "580.00",
      totalPrice: "1160.00",
    },
    {
      saleId: sale2.id,
      productId: prodMap["STR-S990-05"].id,
      quantity: 1,
      unitPrice: "185.00",
      totalPrice: "185.00",
    },
  ]);

  // Update stock and record transactions for sale2
  const sale2Items = await db.select().from(saleItems).where(eq(saleItems.saleId, sale2.id));
  for (const item of sale2Items) {
    const prodRow = await db.select({ stockQuantity: products.stockQuantity }).from(products).where(eq(products.id, item.productId)).then((r: any) => r[0]);
    const previous = Number(prodRow?.stockQuantity ?? 0);
    const newStock = previous - Number(item.quantity);
    await db.update(products).set({ stockQuantity: newStock }).where(eq(products.id, item.productId));
    await db.insert(stockTransactions).values({
      productId: item.productId,
      transactionType: "SALE_OUT",
      quantityChange: -Math.abs(Number(item.quantity)),
      previousStock: previous,
      newStock: newStock,
      referenceId: sale2.invoiceNumber,
      notes: `Sale ${sale2.invoiceNumber} - ${item.quantity} units`,
    });
  }

  // Sale 3
  const [sale3] = await db.insert(sales).values({
    invoiceNumber: "INV-2025-003",
    customerName: "GreenLight Innovations",
    customerEmail: "accounts@greenlight.io",
    saleDate: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    totalAmount: "855.00",
    paymentMethod: "UPI",
    status: "Completed",
    notes: "Front desk accessories & network gear",
  }).returning();

  await db.insert(saleItems).values([
    {
      saleId: sale3.id,
      productId: prodMap["ACC-KCK2-04"].id,
      quantity: 3,
      unitPrice: "85.00",
      totalPrice: "255.00",
    },
    {
      saleId: sale3.id,
      productId: prodMap["NET-CS08-06"].id,
      quantity: 1,
      unitPrice: "340.00",
      totalPrice: "340.00",
    },
    {
      saleId: sale3.id,
      productId: prodMap["ACC-MX3S-03"].id,
      quantity: 2,
      unitPrice: "99.00",
      totalPrice: "198.00",
    },
    {
      saleId: sale3.id,
      productId: prodMap["ACC-ANK1-09"].id,
      quantity: 1,
      unitPrice: "62.00",
      totalPrice: "62.00",
    },
  ]);

  // Update stock and record transactions for sale3
  const sale3Items = await db.select().from(saleItems).where(eq(saleItems.saleId, sale3.id));
  for (const item of sale3Items) {
    const prodRow = await db.select({ stockQuantity: products.stockQuantity }).from(products).where(eq(products.id, item.productId)).then((r: any) => r[0]);
    const previous = Number(prodRow?.stockQuantity ?? 0);
    const newStock = previous - Number(item.quantity);
    await db.update(products).set({ stockQuantity: newStock }).where(eq(products.id, item.productId));
    await db.insert(stockTransactions).values({
      productId: item.productId,
      transactionType: "SALE_OUT",
      quantityChange: -Math.abs(Number(item.quantity)),
      previousStock: previous,
      newStock: newStock,
      referenceId: sale3.invoiceNumber,
      notes: `Sale ${sale3.invoiceNumber} - ${item.quantity} units`,
    });
  }

    return { success: true, countProducts: insertedProducts.length };
  } catch (error) {
    const fallbackResult = writeDemoDataFile();
    return {
      ...fallbackResult,
      message: "Database unavailable. Sample demo data was written to public/demo-data.json.",
      fallback: true,
      error: String(error),
    };
  }
}
