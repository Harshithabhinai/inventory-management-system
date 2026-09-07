import { pgTable, serial, text, varchar, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  role: varchar("role", { length: 50 }).notNull().default("Admin"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 150 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  contactPerson: varchar("contact_person", { length: 255 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  sku: varchar("sku", { length: 100 }).notNull().unique(),
  categoryId: integer("category_id").references(() => categories.id, { onDelete: "set null" }),
  price: numeric("price", { precision: 12, scale: 2 }).notNull().default("0.00"),
  costPrice: numeric("cost_price", { precision: 12, scale: 2 }).notNull().default("0.00"),
  stockQuantity: integer("stock_quantity").notNull().default(0),
  reorderLevel: integer("reorder_level").notNull().default(5),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  purchaseNumber: varchar("purchase_number", { length: 100 }).notNull().unique(),
  supplierId: integer("supplier_id").references(() => suppliers.id, { onDelete: "restrict" }).notNull(),
  purchaseDate: timestamp("purchase_date").defaultNow().notNull(),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull().default("0.00"),
  status: varchar("status", { length: 50 }).notNull().default("Completed"), // 'Completed', 'Pending'
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const purchaseItems = pgTable("purchase_items", {
  id: serial("id").primaryKey(),
  purchaseId: integer("purchase_id").references(() => purchases.id, { onDelete: "cascade" }).notNull(),
  productId: integer("product_id").references(() => products.id, { onDelete: "restrict" }).notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  totalPrice: numeric("total_price", { precision: 12, scale: 2 }).notNull(),
});

export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  invoiceNumber: varchar("invoice_number", { length: 100 }).notNull().unique(),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerEmail: varchar("customer_email", { length: 255 }),
  saleDate: timestamp("sale_date").defaultNow().notNull(),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull().default("0.00"),
  paymentMethod: varchar("payment_method", { length: 50 }).notNull().default("Cash"), // 'Cash', 'Credit Card', 'Bank Transfer', 'UPI'
  status: varchar("status", { length: 50 }).notNull().default("Completed"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const saleItems = pgTable("sale_items", {
  id: serial("id").primaryKey(),
  saleId: integer("sale_id").references(() => sales.id, { onDelete: "cascade" }).notNull(),
  productId: integer("product_id").references(() => products.id, { onDelete: "restrict" }).notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  totalPrice: numeric("total_price", { precision: 12, scale: 2 }).notNull(),
});

export const stockTransactions = pgTable("stock_transactions", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id, { onDelete: "cascade" }).notNull(),
  transactionType: varchar("transaction_type", { length: 50 }).notNull(), // 'PURCHASE_IN', 'SALE_OUT', 'ADJUSTMENT'
  quantityChange: integer("quantity_change").notNull(),
  previousStock: integer("previous_stock").notNull(),
  newStock: integer("new_stock").notNull(),
  referenceId: varchar("reference_id", { length: 100 }), // PO number, Invoice number, or Adjustment reason
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  purchaseItems: many(purchaseItems),
  saleItems: many(saleItems),
  stockTransactions: many(stockTransactions),
}));

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  purchases: many(purchases),
}));

export const purchasesRelations = relations(purchases, ({ one, many }) => ({
  supplier: one(suppliers, {
    fields: [purchases.supplierId],
    references: [suppliers.id],
  }),
  items: many(purchaseItems),
}));

export const purchaseItemsRelations = relations(purchaseItems, ({ one }) => ({
  purchase: one(purchases, {
    fields: [purchaseItems.purchaseId],
    references: [purchases.id],
  }),
  product: one(products, {
    fields: [purchaseItems.productId],
    references: [products.id],
  }),
}));

export const salesRelations = relations(sales, ({ many }) => ({
  items: many(saleItems),
}));

export const saleItemsRelations = relations(saleItems, ({ one }) => ({
  sale: one(sales, {
    fields: [saleItems.saleId],
    references: [sales.id],
  }),
  product: one(products, {
    fields: [saleItems.productId],
    references: [products.id],
  }),
}));

export const stockTransactionsRelations = relations(stockTransactions, ({ one }) => ({
  product: one(products, {
    fields: [stockTransactions.productId],
    references: [products.id],
  }),
}));
