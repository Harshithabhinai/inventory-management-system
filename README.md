# 📦 Inventory Management System

A full-stack **Inventory Management System** developed using **Angular** and **ASP.NET Core Web API**. The application helps businesses efficiently manage products, stock levels, suppliers, and inventory transactions through a simple and responsive web interface.

## 🚀 Features

* 🔐 User Registration and Login
* 📦 Add, Update, Delete, and View Products
* 🏷️ Manage product categories
* 📊 Track available stock and inventory levels
* ➕ Record stock additions
* ➖ Record stock reductions
* 🔎 Search and filter products
* ⚠️ Low-stock identification
* 📋 View inventory transaction history
* 📱 Responsive and user-friendly interface
* 🔒 Secure API communication

## 🛠️ Technologies Used

### Frontend

* Angular
* TypeScript
* HTML5
* CSS3
* Bootstrap
* Angular Reactive Forms
* Angular Router
* HTTP Client

### Backend

* ASP.NET Core Web API
* C#
* Entity Framework Core
* RESTful APIs
* JWT Authentication

### Database

* Microsoft SQL Server

### Development Tools

* Visual Studio / Visual Studio Code
* SQL Server Management Studio
* Git & GitHub
* Postman

## 🏗️ Project Architecture

```text
InventoryManagementSystem/
│
├── frontend/
│   └── Angular Application
│       ├── components/
│       ├── services/
│       ├── models/
│       ├── guards/
│       └── interceptors/
│
├── backend/
│   └── ASP.NET Core Web API
│       ├── Controllers/
│       ├── Models/
│       ├── DTOs/
│       ├── Services/
│       ├── Data/
│       └── Migrations/
│
└── database/
    └── SQL Server Database
```

## 🔄 Application Flow

```text
User
  ↓
Angular Frontend
  ↓
HTTP Requests
  ↓
ASP.NET Core Web API
  ↓
Entity Framework Core
  ↓
SQL Server
  ↓
API Response
  ↓
Angular UI
```

## 📋 Main Modules

### 1. Authentication

Users can register and log in securely. JWT authentication is used to protect authorized API endpoints.

### 2. Product Management

Users can:

* Add new products
* Update product information
* Delete products
* View product details
* Search products

### 3. Inventory Management

The system maintains current stock quantities and allows users to record stock-in and stock-out operations.

### 4. Category Management

Products can be organized into categories for easier searching and management.

### 5. Stock Monitoring

The system identifies products with low stock levels so that inventory can be replenished on time.

### 6. Transaction History

Inventory changes are recorded so users can track stock additions and reductions.

## 🗄️ Database Design

The main database entities include:

```text
Users
  │
  └── Authentication

Categories
  │
  └── Products
          │
          └── InventoryTransactions
```

### Example Tables

**Users**

* Id
* Name
* Email
* PasswordHash
* Role

**Categories**

* Id
* Name
* Description

**Products**

* Id
* Name
* Description
* Price
* Quantity
* MinimumStock
* CategoryId

**InventoryTransactions**

* Id
* ProductId
* TransactionType
* Quantity
* TransactionDate

## ⚙️ Installation & Setup

### Prerequisites

Make sure the following are installed:

* .NET SDK
* Node.js
* Angular CLI
* SQL Server
* Visual Studio or Visual Studio Code

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/inventory-management-system.git
cd inventory-management-system
```

### 2. Configure the Database

Update the SQL Server connection string in:

```text
appsettings.json
```

Example:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=YOUR_SERVER;Database=InventoryDB;Trusted_Connection=True;TrustServerCertificate=True;"
}
```

### 3. Apply Entity Framework Migrations

Navigate to the backend project:

```bash
dotnet ef database update
```

### 4. Run the Backend

```bash
dotnet run
```

The ASP.NET Core API will start on the configured localhost port.

### 5. Install Angular Dependencies

Navigate to the frontend directory:

```bash
npm install
```

### 6. Run Angular Application

```bash
ng serve
```

Open the application in your browser:

```text
http://localhost:4200
```

## 🔌 API Examples

| Method | Endpoint                   | Description       |
| ------ | -------------------------- | ----------------- |
| POST   | `/api/auth/register`       | Register user     |
| POST   | `/api/auth/login`          | Login user        |
| GET    | `/api/products`            | Get all products  |
| GET    | `/api/products/{id}`       | Get product by ID |
| POST   | `/api/products`            | Add product       |
| PUT    | `/api/products/{id}`       | Update product    |
| DELETE | `/api/products/{id}`       | Delete product    |
| GET    | `/api/categories`          | Get categories    |
| POST   | `/api/inventory/stock-in`  | Add stock         |
| POST   | `/api/inventory/stock-out` | Remove stock      |

## 🔒 Security

The application uses:

* JWT-based authentication
* Password hashing
* Authorization for protected API endpoints
* Angular route guards
* HTTP interceptor for attaching JWT tokens
* Server-side validation

## 📸 Screenshots

Add screenshots of your application here:

```text
Login Page
Dashboard
Product Management
Add Product
Inventory Transactions
Low Stock Products
```

Example:

```markdown
![Login Page](screenshots/login.png)
![Dashboard](screenshots/dashboard.png)
![Products](screenshots/products.png)
```

## 🎯 Future Enhancements

* 📈 Inventory analytics dashboard
* 📊 Stock reports and charts
* 📧 Low-stock email notifications
* 👥 Role-based access control
* 📄 Export inventory reports to PDF/Excel
* 🔍 Advanced product filtering
* ☁️ Cloud deployment

## 💡 Learning Outcomes

This project demonstrates practical experience with:

* Angular component development
* Angular services and routing
* Reactive forms
* REST API development
* ASP.NET Core Web API
* Entity Framework Core
* SQL Server database integration
* JWT authentication
* CRUD operations
* Frontend-backend integration
* Git and GitHub

## 👨‍💻 Author

**Harshith Abhinai**

Developed as a full-stack project to demonstrate skills in **Angular, ASP.NET Core, C#, Entity Framework Core, and SQL Server**.

## ⭐ Support

If you find this project useful, consider giving the repository a ⭐ on GitHub.
