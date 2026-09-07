import { NextResponse } from "next/server";

function makeStatus(stock: number, reorder: number) {
  if (stock <= 0) return "OUT_OF_STOCK";
  if (stock <= reorder) return "LOW_STOCK";
  return "IN_STOCK";
}

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

export async function GET() {
  try {
    // Try to dynamically import database; if unavailable, fall back to sample data.
    try {
      const [{ db }, { products, categories }, drizzleOrm] = await Promise.all([
        import("@/db"),
        import("@/db/schema"),
        import("drizzle-orm"),
      ]);

      const { eq, asc } = drizzleOrm as any;

      const list = await db
        .select({
          id: products.id,
          name: products.name,
          sku: products.sku,
          categoryId: products.categoryId,
          categoryName: categories.name,
          price: products.price,
          costPrice: products.costPrice,
          stockQuantity: products.stockQuantity,
          reorderLevel: products.reorderLevel,
          updatedAt: products.updatedAt,
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .orderBy(asc(products.name));

      const enriched = list.map((p: any) => {
        const stock = p.stockQuantity as number;
        const reorder = p.reorderLevel as number;
        const status = makeStatus(stock, reorder);
        const totalInventoryValue = (stock * parseFloat(p.price || "0")).toFixed(2);
        const totalInventoryCost = (stock * parseFloat(p.costPrice || "0")).toFixed(2);
        return {
          ...p,
          status,
          totalInventoryValue,
          totalInventoryCost,
        };
      });

      return NextResponse.json(enriched);
    } catch (err) {
      // DB not configured or failed — return sample data
      const enriched = sampleProducts.map((p: any) => {
        const stock = p.stockQuantity;
        const reorder = p.reorderLevel;
        const status = makeStatus(stock, reorder);
        const totalInventoryValue = (stock * parseFloat(p.price || "0")).toFixed(2);
        const totalInventoryCost = (stock * parseFloat(p.costPrice || "0")).toFixed(2);
        return {
          ...p,
          status,
          totalInventoryValue,
          totalInventoryCost,
        };
      });

      return NextResponse.json(enriched);
    }
  } catch (error: any) {
    console.error("Error fetching stock:", error);
    return NextResponse.json({ error: "Failed to fetch stock" }, { status: 500 });
  }
}
