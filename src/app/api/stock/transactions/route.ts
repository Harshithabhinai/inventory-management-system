import { NextResponse } from "next/server";

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

export async function GET(request: Request) {
  try {
    try {
      const [{ db }, { stockTransactions, products }, drizzleOrm] = await Promise.all([
        import("@/db"),
        import("@/db/schema"),
        import("drizzle-orm"),
      ]);
      const { eq, desc } = drizzleOrm as any;

      const { searchParams } = new URL(request.url);
      const productId = searchParams.get("productId");
      const type = searchParams.get("type");

      let query = db
        .select({
          id: stockTransactions.id,
          productId: stockTransactions.productId,
          productName: products.name,
          sku: products.sku,
          transactionType: stockTransactions.transactionType,
          quantityChange: stockTransactions.quantityChange,
          previousStock: stockTransactions.previousStock,
          newStock: stockTransactions.newStock,
          referenceId: stockTransactions.referenceId,
          notes: stockTransactions.notes,
          createdAt: stockTransactions.createdAt,
        })
        .from(stockTransactions)
        .leftJoin(products, eq(stockTransactions.productId, products.id))
        .orderBy(desc(stockTransactions.createdAt));

      const all = await query;
      let filtered = all;

      if (productId) {
        const pid = parseInt(productId, 10);
        filtered = filtered.filter((t: any) => t.productId === pid);
      }

      if (type && type !== "ALL") {
        filtered = filtered.filter((t: any) => t.transactionType === type);
      }

      return NextResponse.json(filtered.slice(0, 100));
    } catch (err) {
      // DB not available — return sample transactions
      return NextResponse.json(sampleTransactions.slice(0, 100));
    }
  } catch (error: any) {
    console.error("Error fetching stock transactions:", error);
    return NextResponse.json({ error: "Failed to fetch stock transactions" }, { status: 500 });
  }
}
