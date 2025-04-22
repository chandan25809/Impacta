# 🌟 Impacta - Crowdfunding for Small Causes

Impacta is a crowdfunding platform designed to help individuals contribute to **meaningful causes**, ensuring transparency and ease of donation.

## 🚀 Project Overview

Impacta connects **donors** with **verified causes**, providing a **seamless donation experience** and real-time tracking of contributions.


---

## 💂️ Project Structure

```
Impacta/
│── backend/           # Backend API (Go, PostgreSQL)
│   ├── controllers/   # API Controllers
│   ├── models/        # Database Models
│   ├── routes/        # API Routes
│   ├── middleware/    # Auth & Role-Based Access
│   ├── config/        # Environment Configurations
│   ├── migrate/       # Database Migrations
│   ├── utils/         # Utility functions (JWT, DB)
│   └── main.go        # Go App Entry Point
│
│── frontend/          # Frontend (React, Vite, Ant Design)
│   ├── src/
│   │   ├── components/  # Reusable Components
│   │   ├── pages/       # Page Views (Login, Register, Dashboard, etc.)
│   │   ├── styles/      # CSS Modules for Scoped Styling
│   │   ├── App.jsx      # Main React App Component
│   │   ├── main.jsx     # Entry Point
│   │   └── vite.config.js  # Vite Configuration
│
└── README.md          # Project Documentation
```

---

## 🛠️ Tech Stack

### **Frontend:**

- **React** (Vite)
- **Ant Design** (UI Library)
- **Axios** (API Requests)
- **CSS Modules** (Scoped Styling)

### **Backend:**

- **Go (Golang)** (Gin Framework)
- **PostgreSQL** (Database Management)
- **JWT Authentication** (Secure User Access)
- **Role-Based Access Control (RBAC)**

---

## 🏠 Setup Instructions

### **Frontend Setup**

```bash
cd frontend
npm install
npm run dev
```

### **Backend Setup**

## 🐳 Run with Docker (Recommended)

```bash
docker-compose up --build backend
```

✅ This command will:  
- Build and run the Go backend server  
- Connect to the PostgreSQL container (configured in `docker-compose.yml`)  

> Make sure your `.env` values are set correctly before running.

---

## ⚠️ Database Migration (Required)

Before running the backend, apply DB migrations to initialize tables.

### 🛠 Steps:

1. In `main.go`, **uncomment this line**:  
   ```go
   // migrate.RunMigrations()  // ← remove slashes to enable
   ```
2. Set your database connection string in `utils/db.go`:  
   ```go
   dsn := "host=localhost user=your_user password=your_password dbname=your_db port=5432 sslmode=disable"
   ```
3. Run the app via Docker or locally; migrations will execute at startup.

> After applying once, re-comment the migration line to avoid duplicate execution.

---

## 💻 Local Development (Optional if there is an issue with the docker)

```bash
cd backend
go mod tidy
go run main.go
```

🔹 Ensure PostgreSQL is running locally  
🔹 DB config should match your setup (`dsn` or `.env`)

## **Members**
### **Frontend Team**
- **Deepthi Nidasanametla** (GitHub: [Deepthi-04](https://github.com/Deepthi-04))
- **Vennela** (GitHub: [vennela0743](https://github.com/vennela0743))

### **Backend Team**
- **Shruthi Reddy** (GitHub: [Shruthirdy](https://github.com/Shruthirdy))
- **Chandan** (GitHub: [chandan25809](https://github.com/chandan25809))

