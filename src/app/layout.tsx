import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "StockFlow Pro — Inventory Management System",
  description: "Real-world Inventory Management System demonstrating CRUD, stock calculation, ACID purchases, sales stock validation, reporting, and Angular + ASP.NET Core Web API architecture.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-100 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
