# 🏠 HouseHunt Rental Platform (Indian Region)

HouseHunt is a full-stack MERN property rental platform localized specifically for the **Indian region** (INR `₹` currency scales, major Indian metropolitan locations like Mumbai, Bangalore, Delhi, Pune, Hyderabad, and Chennai).

It features multi-role authorization (Tenant, Landlord, Admin), real-time booking overlap validation, interactive availability calendars, landlord analytics dashboards, and an audited security backend.

---

## 🚀 Key Features

* **Indian Regionalization**: Prices in Rupees (`₹`), city filtering, and Indian property contexts.
* **Role-Based Access Control (RBAC)**:
  * 👤 **Customers**: Browse approved properties, pick booking dates with overlap protection, view booking history, and cancel reservations.
  * 🏠 **Landlords**: Post property listings, track live revenue analytics & total bookings, edit existing properties (triggers re-moderation), and manage incoming tenant bookings.
  * 🛡️ **Admins**: Review pending property listings and approve/reject them in real time.
* **Security Audited**: Built with `helmet` HTTP headers, `express-rate-limit` protection, JWT auth in `sessionStorage`, input sanitization, and Mongoose indexing.

---

## 🛠️ Tech Stack

* **Frontend**: React 18, Vite, React Router 7, Bootstrap 5, Bootstrap Icons, Axios
* **Backend**: Node.js, Express.js, JWT, Helmet, Express-Rate-Limit, Cors
* **Database**: MongoDB, Mongoose ODM

---

## 📁 Repository Structure

```
├── backend/
│   ├── config/          # MongoDB database connection configuration
│   ├── middleware/      # Auth & role-checking middlewares
│   ├── models/          # User, Property, and Booking Mongoose schemas
│   ├── routes/          # Auth, Property, and Booking Express API routes
│   ├── seed.js          # Database seeder with Indian properties & demo users
│   ├── test_api.js      # E2E integration test suite
│   └── server.js        # Express application entrypoint
├── frontend/
│   ├── src/
│   │   ├── components/  # Navbar, DashboardStats, and modular UI components
│   │   ├── context/     # AuthContext (sessionStorage authentication state)
│   │   ├── pages/       # Home, PropertyDetails, Login, Register, Dashboard, Privacy
│   │   ├── App.jsx      # App routing & footer wrapper
│   │   └── main.jsx     # Vite entrypoint
├── README.md            # Master repository documentation
└── .gitignore           # Git ignore exclusions

```

---

## ⚡ Quick Start Guide

### 1. Prerequisites
* **Node.js** (v18 or higher)
* **MongoDB** (Running locally on `mongodb://127.0.0.1:27017` or via MongoDB Atlas URI)

### 2. Environment Configuration
Copy the sample environment configuration file in the `backend` directory:
```bash
cp backend/.env.example backend/.env
```
Ensure your `backend/.env` contains the required keys:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/househunt
JWT_SECRET=your_jwt_secret_key_here_minimum_32_characters
FRONTEND_URL=http://localhost:5173
```

### 3. Database Seeding & Development Servers

#### Start Backend:
```bash
cd backend
npm install
npm run seed  # Seeds MongoDB with Indian properties & demo accounts
npm run dev   # Starts API server at http://localhost:5000/
```

#### Start Frontend:
```bash
cd frontend
npm install
npm run dev   # Starts Vite dev server at http://localhost:5173/
```

---

## 🔑 Demo Login Accounts

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@househunt.com` | `admin123` | Moderate pending properties, approve/reject listings |
| **Landlord** | `rajesh@househunt.com` | `landlord123` | Post listings, view revenue stats, edit properties |
| **Customer** | `priya@househunt.com` | `tenant123` | Reserve properties, check dates, manage bookings |

---

## 🧪 Testing & Verification

Run the automated integration test suite to verify backend security, auth controls, booking pricing, date overlap checks, and role enforcement:

```bash
cd backend
node test_api.js
```

---

## 🛡️ Security Audit Summary

This repository has completed a full 18-phase Security Audit & Remediation Cycle:
* **Total Findings**: 22
* **Remediated**: 22 (100% Resolved)
* **Status**: **GO** for Production

> [!IMPORTANT]
> Detailed audit reports, vulnerability threat models, and fix logs are kept locally in the `audit-reports/` directory and are ignored in version control (`.gitignore`) to prevent exposing internal security architectures, dependency scans, or sensitive reports to public repositories.

