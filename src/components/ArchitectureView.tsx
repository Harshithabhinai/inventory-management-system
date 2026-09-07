"use client";

import React, { useState } from "react";
import { Code2, Server, Database, Layers, Copy, Check, FileCode, CheckCircle2 } from "lucide-react";
import { useToast } from "./Toast";

export function ArchitectureView() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<"overview" | "dotnet" | "angular" | "sql">("overview");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast("Code snippet copied to clipboard!", "success");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const dotnetControllerCode = `// InventoryManagement.API/Controllers/PurchasesController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using InventoryManagement.API.Data;
using InventoryManagement.API.Models;
using InventoryManagement.API.DTOs;

namespace InventoryManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PurchasesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PurchasesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PurchaseDto>>> GetPurchases()
        {
            return await _context.Purchases
                .Include(p => p.Supplier)
                .Include(p => p.PurchaseItems)
                .OrderByDescending(p => p.PurchaseDate)
                .Select(p => new PurchaseDto
                {
                    Id = p.Id,
                    PurchaseNumber = p.PurchaseNumber,
                    SupplierName = p.Supplier.Name,
                    PurchaseDate = p.PurchaseDate,
                    TotalAmount = p.TotalAmount,
                    ItemCount = p.PurchaseItems.Count
                })
                .ToListAsync();
        }

        [HttpPost]
        public async Task<IActionResult> CreatePurchase([FromBody] CreatePurchaseDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            // ACID Database Transaction for stock update + purchase persistence
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var purchase = new Purchase
                {
                    PurchaseNumber = dto.PurchaseNumber,
                    SupplierId = dto.SupplierId,
                    PurchaseDate = DateTime.UtcNow,
                    TotalAmount = dto.Items.Sum(i => i.Quantity * i.UnitPrice),
                    Notes = dto.Notes
                };

                _context.Purchases.Add(purchase);
                await _context.SaveChangesAsync();

                foreach (var item in dto.Items)
                {
                    var product = await _context.Products.FindAsync(item.ProductId);
                    if (product == null)
                    {
                        await transaction.RollbackAsync();
                        return NotFound($"Product ID {item.ProductId} not found");
                    }

                    int previousStock = product.StockQuantity;
                    product.StockQuantity += item.Quantity; // STOCK INCREASES
                    product.CostPrice = item.UnitPrice;

                    // Add purchase line item
                    _context.PurchaseItems.Add(new PurchaseItem
                    {
                        PurchaseId = purchase.Id,
                        ProductId = item.ProductId,
                        Quantity = item.Quantity,
                        UnitPrice = item.UnitPrice,
                        TotalPrice = item.Quantity * item.UnitPrice
                    });

                    // Add audit transaction
                    _context.StockTransactions.Add(new StockTransaction
                    {
                        ProductId = product.Id,
                        TransactionType = "PURCHASE_IN",
                        QuantityChange = item.Quantity,
                        PreviousStock = previousStock,
                        NewStock = product.StockQuantity,
                        ReferenceId = purchase.PurchaseNumber,
                        CreatedAt = DateTime.UtcNow
                    });
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return CreatedAtAction(nameof(GetPurchases), new { id = purchase.Id }, purchase);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"Purchase transaction failed: {ex.Message}");
            }
        }
    }
}`;

  const salesControllerCode = `// InventoryManagement.API/Controllers/SalesController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using InventoryManagement.API.Data;
using InventoryManagement.API.Models;
using InventoryManagement.API.DTOs;

namespace InventoryManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SalesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SalesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> CreateSale([FromBody] CreateSaleDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // CRITICAL BUSINESS LOGIC: Check stock availability
                foreach (var item in dto.Items)
                {
                    var product = await _context.Products.FindAsync(item.ProductId);
                    if (product == null) return NotFound($"Product #{item.ProductId} not found");

                    if (product.StockQuantity < item.Quantity)
                    {
                        return BadRequest(new {
                            error = $"Insufficient stock for {product.Name}. Available: {product.StockQuantity}, Requested: {item.Quantity}"
                        });
                    }
                }

                var sale = new Sale
                {
                    InvoiceNumber = dto.InvoiceNumber,
                    CustomerName = dto.CustomerName,
                    CustomerEmail = dto.CustomerEmail,
                    PaymentMethod = dto.PaymentMethod,
                    SaleDate = DateTime.UtcNow,
                    TotalAmount = dto.Items.Sum(i => i.Quantity * i.UnitPrice)
                };

                _context.Sales.Add(sale);
                await _context.SaveChangesAsync();

                foreach (var item in dto.Items)
                {
                    var product = await _context.Products.FindAsync(item.ProductId);
                    int previousStock = product!.StockQuantity;
                    product.StockQuantity -= item.Quantity; // STOCK DECREASES

                    _context.SaleItems.Add(new SaleItem
                    {
                        SaleId = sale.Id,
                        ProductId = item.ProductId,
                        Quantity = item.Quantity,
                        UnitPrice = item.UnitPrice,
                        TotalPrice = item.Quantity * item.UnitPrice
                    });

                    _context.StockTransactions.Add(new StockTransaction
                    {
                        ProductId = product.Id,
                        TransactionType = "SALE_OUT",
                        QuantityChange = -item.Quantity,
                        PreviousStock = previousStock,
                        NewStock = product.StockQuantity,
                        ReferenceId = sale.InvoiceNumber,
                        CreatedAt = DateTime.UtcNow
                    });
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(sale);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, ex.Message);
            }
        }
    }
}`;

  const angularServiceCode = `// src/app/core/services/product.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, CreateProductDto } from '../models/product.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = \`\${environment.apiUrl}/products\`;

  getProducts(search?: string, categoryId?: number, lowStock?: boolean): Observable<Product[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (categoryId) params = params.set('categoryId', categoryId.toString());
    if (lowStock) params = params.set('lowStock', 'true');

    return this.http.get<Product[]>(this.apiUrl, { params });
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(\`\${this.apiUrl}/\${id}\`);
  }

  createProduct(dto: CreateProductDto): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, dto);
  }

  updateProduct(id: number, dto: Partial<CreateProductDto>): Observable<Product> {
    return this.http.put<Product>(\`\${this.apiUrl}/\${id}\`, dto);
  }

  deleteProduct(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(\`\${this.apiUrl}/\${id}\`);
  }
}`;

  const angularInterceptorCode = `// src/app/core/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    const cloned = req.clone({
      headers: req.headers.set('Authorization', \`Bearer \${token}\`)
    });
    return next(cloned);
  }

  return next(req);
};`;

  const sqlServerSchemaCode = `-- SQL Server Database DDL Script
CREATE DATABASE InventoryManagementDb;
GO
USE InventoryManagementDb;
GO

CREATE TABLE Categories (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(150) NOT NULL UNIQUE,
    Description NVARCHAR(MAX) NULL,
    CreatedAt DATETIME2 DEFAULT SYSUTCDATETIME()
);

CREATE TABLE Suppliers (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(255) NOT NULL,
    ContactPerson NVARCHAR(255) NULL,
    Email NVARCHAR(255) NULL,
    Phone NVARCHAR(50) NULL,
    Address NVARCHAR(MAX) NULL,
    CreatedAt DATETIME2 DEFAULT SYSUTCDATETIME()
);

CREATE TABLE Products (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(255) NOT NULL,
    SKU NVARCHAR(100) NOT NULL UNIQUE,
    CategoryId INT NULL FOREIGN KEY REFERENCES Categories(Id) ON DELETE SET NULL,
    Price DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    CostPrice DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    StockQuantity INT NOT NULL DEFAULT 0,
    ReorderLevel INT NOT NULL DEFAULT 5,
    Description NVARCHAR(MAX) NULL,
    CreatedAt DATETIME2 DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 DEFAULT SYSUTCDATETIME()
);

CREATE TABLE Purchases (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    PurchaseNumber NVARCHAR(100) NOT NULL UNIQUE,
    SupplierId INT NOT NULL FOREIGN KEY REFERENCES Suppliers(Id),
    PurchaseDate DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    TotalAmount DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    Status NVARCHAR(50) NOT NULL DEFAULT 'Completed',
    Notes NVARCHAR(MAX) NULL,
    CreatedAt DATETIME2 DEFAULT SYSUTCDATETIME()
);

CREATE TABLE PurchaseItems (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    PurchaseId INT NOT NULL FOREIGN KEY REFERENCES Purchases(Id) ON DELETE CASCADE,
    ProductId INT NOT NULL FOREIGN KEY REFERENCES Products(Id),
    Quantity INT NOT NULL,
    UnitPrice DECIMAL(18,2) NOT NULL,
    TotalPrice DECIMAL(18,2) NOT NULL
);

CREATE TABLE Sales (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    InvoiceNumber NVARCHAR(100) NOT NULL UNIQUE,
    CustomerName NVARCHAR(255) NOT NULL,
    CustomerEmail NVARCHAR(255) NULL,
    SaleDate DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    TotalAmount DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    PaymentMethod NVARCHAR(50) NOT NULL DEFAULT 'Credit Card',
    Status NVARCHAR(50) NOT NULL DEFAULT 'Completed',
    Notes NVARCHAR(MAX) NULL,
    CreatedAt DATETIME2 DEFAULT SYSUTCDATETIME()
);

CREATE TABLE SaleItems (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    SaleId INT NOT NULL FOREIGN KEY REFERENCES Sales(Id) ON DELETE CASCADE,
    ProductId INT NOT NULL FOREIGN KEY REFERENCES Products(Id),
    Quantity INT NOT NULL,
    UnitPrice DECIMAL(18,2) NOT NULL,
    TotalPrice DECIMAL(18,2) NOT NULL
);

CREATE TABLE StockTransactions (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ProductId INT NOT NULL FOREIGN KEY REFERENCES Products(Id) ON DELETE CASCADE,
    TransactionType NVARCHAR(50) NOT NULL, -- PURCHASE_IN, SALE_OUT, ADJUSTMENT, INITIAL
    QuantityChange INT NOT NULL,
    PreviousStock INT NOT NULL,
    NewStock INT NOT NULL,
    ReferenceId NVARCHAR(100) NULL,
    Notes NVARCHAR(MAX) NULL,
    CreatedAt DATETIME2 DEFAULT SYSUTCDATETIME()
);
GO`;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Angular + ASP.NET Core + SQL Server Architecture
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Resume Blueprints
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete architectural blueprints, folder hierarchies, Entity Framework Core transactions, and Angular standalone components
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
            activeTab === "overview"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Architecture & Business Flow</span>
        </button>

        <button
          onClick={() => setActiveTab("dotnet")}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
            activeTab === "dotnet"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Server className="w-4 h-4" />
          <span>ASP.NET Core Web API (C#)</span>
        </button>

        <button
          onClick={() => setActiveTab("angular")}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
            activeTab === "angular"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Angular Frontend (TypeScript)</span>
        </button>

        <button
          onClick={() => setActiveTab("sql")}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
            activeTab === "sql"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Database className="w-4 h-4" />
          <span>SQL Server Schema (DDL)</span>
        </button>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Flow Diagram */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">End-to-End Business Lifecycle Flow</h3>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center">
              <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 flex flex-col justify-between">
                <span className="text-xs font-bold text-indigo-700">1. Suppliers</span>
                <p className="text-[11px] text-slate-600 mt-2">
                  Vendor partners provide equipment, prices, and terms.
                </p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex flex-col justify-between">
                <span className="text-xs font-bold text-emerald-700">2. Purchase (Stock In)</span>
                <p className="text-[11px] text-slate-600 mt-2">
                  Atomic transaction: saves PO, increments product stock, writes audit log.
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex flex-col justify-between">
                <span className="text-xs font-bold text-blue-700">3. Sale (Stock Out)</span>
                <p className="text-[11px] text-slate-600 mt-2">
                  Stock verification: rejects if deficient. Deducts inventory, logs audit.
                </p>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex flex-col justify-between">
                <span className="text-xs font-bold text-amber-700">4. Low-Stock Alerts</span>
                <p className="text-[11px] text-slate-600 mt-2">
                  Triggered when stock &le; reorderLevel with 1-click reorder PO shortcut.
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 flex flex-col justify-between">
                <span className="text-xs font-bold text-purple-700">5. Reports & Analytics</span>
                <p className="text-[11px] text-slate-600 mt-2">
                  Valuation (Qty &times; Price), profit margin, velocity, CSV exports.
                </p>
              </div>
            </div>
          </div>

          {/* Resume Tech Stack Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Backend Highlights (ASP.NET Core)</h3>
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Entity Framework Core:</strong> Code-First Migrations, Relationships, and LINQ queries</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>ACID Database Transactions:</strong> <code>BeginTransactionAsync()</code> guarantees stock and PO consistency</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Stock Calculation Business Rules:</strong> Automated rejection of sales exceeding real-time on-hand inventory</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>JWT Authentication:</strong> Secure bearer tokens, role-based authorization (Admin, Manager, Sales)</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">Frontend Highlights (Angular 18/19)</h3>
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Standalone Components:</strong> Modern Angular architecture without NgModule bloat</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Reactive Forms with FormArray:</strong> Dynamic multi-row invoice item line items</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>HttpInterceptorFn:</strong> Automatic JWT bearer header injection on every outgoing API request</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Angular Material:</strong> MatTable, MatDialog, MatPaginator, and responsive drawer navigation</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ASP.NET CORE CODE TAB */}
      {activeTab === "dotnet" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  PurchasesController.cs (ACID Stock In Logic)
                </h3>
                <p className="text-xs text-slate-500">
                  Wraps purchase creation and stock increments in an atomic EF Core transaction
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(dotnetControllerCode, "po-ctrl")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                {copiedKey === "po-ctrl" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === "po-ctrl" ? "Copied!" : "Copy C#"}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-900 text-emerald-300 font-mono text-xs rounded-xl overflow-x-auto max-h-96">
              {dotnetControllerCode}
            </pre>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  SalesController.cs (Stock Out & Insufficient Stock Guard)
                </h3>
                <p className="text-xs text-slate-500">
                  Verifies stock availability and aborts if order exceeds current balance
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(salesControllerCode, "sale-ctrl")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                {copiedKey === "sale-ctrl" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === "sale-ctrl" ? "Copied!" : "Copy C#"}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-900 text-emerald-300 font-mono text-xs rounded-xl overflow-x-auto max-h-96">
              {salesControllerCode}
            </pre>
          </div>
        </div>
      )}

      {/* ANGULAR CODE TAB */}
      {activeTab === "angular" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  product.service.ts (Angular HttpClient Service)
                </h3>
                <p className="text-xs text-slate-500">
                  Standalone service with RxJS Observables and typed DTOs
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(angularServiceCode, "ang-serv")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                {copiedKey === "ang-serv" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === "ang-serv" ? "Copied!" : "Copy TypeScript"}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-900 text-emerald-300 font-mono text-xs rounded-xl overflow-x-auto max-h-96">
              {angularServiceCode}
            </pre>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  auth.interceptor.ts (Functional HttpInterceptorFn)
                </h3>
                <p className="text-xs text-slate-500">
                  Appends JWT authorization bearer header on every outbound request
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(angularInterceptorCode, "ang-int")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                {copiedKey === "ang-int" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === "ang-int" ? "Copied!" : "Copy TypeScript"}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-900 text-emerald-300 font-mono text-xs rounded-xl overflow-x-auto max-h-96">
              {angularInterceptorCode}
            </pre>
          </div>
        </div>
      )}

      {/* SQL SERVER DDL TAB */}
      {activeTab === "sql" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  SQL Server Schema & Foreign Key Constraints
                </h3>
                <p className="text-xs text-slate-500">
                  Complete T-SQL script for Users, Categories, Products, Suppliers, Purchases, Sales, and Audit Transactions
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(sqlServerSchemaCode, "sql-ddl")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                {copiedKey === "sql-ddl" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === "sql-ddl" ? "Copied!" : "Copy T-SQL"}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-900 text-emerald-300 font-mono text-xs rounded-xl overflow-x-auto max-h-[500px]">
              {sqlServerSchemaCode}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
