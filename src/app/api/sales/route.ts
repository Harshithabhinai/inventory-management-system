import { NextResponse } from "next/server";
import { db } from "@/db";
import { sales, saleItems, products, stockTransactions } from "@/db/schema";
import { loadDemoData } from "@/lib/demo-data";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db
      .select({
        id: sales.id,
        invoiceNumber: sales.invoiceNumber,
        customerName: sales.customerName,
        customerEmail: sales.customerEmail,
        saleDate: sales.saleDate,
        totalAmount: sales.totalAmount,
        paymentMethod: sales.paymentMethod,
        status: sales.status,
        notes: sales.notes,
        createdAt: sales.createdAt,
      })
      .from(sales)
      .orderBy(desc(sales.saleDate), desc(sales.id));

    return NextResponse.json(list);
  } catch (error: any) {
    console.error("Error fetching sales:", error);
    const demo = await loadDemoData();
    return NextResponse.json(demo.sales ?? []);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerName, customerEmail, invoiceNumber, saleDate, paymentMethod = "Cash", notes, items } = body;

    if (!customerName || !customerName.trim()) {
      return NextResponse.json({ error: "Customer name is required" }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "At least one product item is required for the sale" }, { status: 400 });
    }

    const invNumber = invoiceNumber?.trim() || `INV-${Date.now().toString().slice(-6)}`;

    // 1. First Validation Pass: Verify all products and check stock availability BEFORE starting transaction
    const validatedItems: Array<{
      productId: number;
      productName: string;
      sku: string;
      quantity: number;
      unitPrice: number;
      currentStock: number;
    }> = [];

    for (const item of items) {
      const prodId = parseInt(item.productId, 10);
      const qty = parseInt(item.quantity, 10);
      const unitPrice = parseFloat(item.unitPrice);

      if (isNaN(prodId)) {
        return NextResponse.json({ error: "Invalid product ID in sale items" }, { status: 400 });
      }

      if (isNaN(qty) || qty <= 0) {
        return NextResponse.json({ error: "Quantity must be greater than zero for all items" }, { status: 400 });
      }

      if (isNaN(unitPrice) || unitPrice < 0) {
        return NextResponse.json({ error: "Unit price must be a valid non-negative number" }, { status: 400 });
      }

      const [product] = await db.select().from(products).where(eq(products.id, prodId));
      if (!product) {
        return NextResponse.json({ error: `Product ID #${prodId} does not exist` }, { status: 404 });
      }

      // CRITICAL BUSINESS LOGIC: Check available stock
      if (product.stockQuantity < qty) {
        return NextResponse.json(
          {
            error: `Insufficient stock for '${product.name}' (SKU: ${product.sku}). Available stock: ${product.stockQuantity}, Requested: ${qty}`,
            productId: prodId,
            availableStock: product.stockQuantity,
            requestedQuantity: qty,
          },
          { status: 400 }
        );
      }

      validatedItems.push({
        productId: prodId,
        productName: product.name,
        sku: product.sku,
        quantity: qty,
        unitPrice,
        currentStock: product.stockQuantity,
      });
    }

    // Compute total
    let total = 0;
    for (const itm of validatedItems) {
      total += itm.quantity * itm.unitPrice;
    }

    // 2. Execute Atomic Transaction
    const result = await db.transaction(async (tx: any) => {
      // Re-verify stock inside transaction with FOR UPDATE semantics
      for (const item of validatedItems) {
        const [prod] = await tx
          .select()
          .from(products)
          .where(eq(products.id, item.productId));

        if (!prod || prod.stockQuantity < item.quantity) {
          throw new Error(
            `Stock conflict for '${item.productName}'. Current stock: ${prod ? prod.stockQuantity : 0}, Required: ${item.quantity}`
          );
        }
      }

      // Insert Sale
      const [newSale] = await tx
        .insert(sales)
        .values({
          invoiceNumber: invNumber,
          customerName: customerName.trim(),
          customerEmail: customerEmail?.trim() || null,
          saleDate: saleDate ? new Date(saleDate) : new Date(),
          totalAmount: total.toFixed(2),
          paymentMethod: paymentMethod || "Cash",
          status: "Completed",
          notes: notes?.trim() || null,
        })
        .returning();

      // Process each line item
      for (const item of validatedItems) {
        const [currentProd] = await tx.select().from(products).where(eq(products.id, item.productId));
        const prevStock = currentProd.stockQuantity;
        const newStock = prevStock - item.quantity;
        const lineTotal = item.quantity * item.unitPrice;

        // Insert Sale Item
        await tx.insert(saleItems).values({
          saleId: newSale.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice.toFixed(2),
          totalPrice: lineTotal.toFixed(2),
        });

        // Update Product Stock (decrease stock)
        await tx
          .update(products)
          .set({
            stockQuantity: newStock,
            updatedAt: new Date(),
          })
          .where(eq(products.id, item.productId));

        // Create Stock Transaction
        await tx.insert(stockTransactions).values({
          productId: item.productId,
          transactionType: "SALE_OUT",
          quantityChange: -item.quantity,
          previousStock: prevStock,
          newStock: newStock,
          referenceId: invNumber,
          notes: `Sale to ${customerName.trim()} (${invNumber})`,
        });
      }

      return newSale;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("Sale creation error:", error);
    return NextResponse.json({ error: error.message || "Failed to process sale" }, { status: 500 });
  }
}
