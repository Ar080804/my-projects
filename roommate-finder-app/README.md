# 🏠 Roommate Finder

A full-stack web application designed to connect Tenants with Landlords. It features a robust PostgreSQL/Express backend and a beautiful glassmorphic React frontend.

## 🗂️ Project Structure
This project is split into two main directories:
* `/roommate-finder`: The Node.js + Express + PostgreSQL Backend.
* `/frontend`: The React + Vite Frontend.

---

## 🛠️ 1. Backend Setup

The backend handles JWT Authentication, Property listings, and Tenant compatibility scoring. 
It requires **PostgreSQL** to be installed on your machine.

### Database Schema
On startup, the backend automatically creates two tables if they don't exist:
1. `users`: `id, name, email, password, role ('tenant' or 'landlord'), city, budget, sleep_schedule, cleanliness, smoking`
2. `properties`: `id, landlord_id, title, description, city, price, available`

### How to Run
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd roommate-finder
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   node index.js
   ```
*The backend will run on `http://localhost:3000`.*

---

## 💻 2. Frontend Setup

The frontend is built with React and Vite. It connects directly to the REST API on port 3000 and uses `AuthContext` to attach JWT Bearer tokens to all requests automatically.

### How to Run
1. Open a **second** terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
*The frontend will run on `http://localhost:5173`.*

---

## 🔌 API Endpoints Reference

### Auth
* `POST /api/auth/register` (Returns JWT token)
* `POST /api/auth/login` (Returns JWT token)

### Properties
* `GET /api/properties` (Filters via query params: `?city=X&minBudget=Y&maxBudget=Z`)
* `GET /api/properties/:id` 
* `POST /api/properties` (Auth Required. Landlord only)
* `PUT /api/properties/:id` (Auth Required. Landlord only)
* `DELETE /api/properties/:id` (Auth Required. Landlord only)

### Tenants
* `PUT /api/profile` (Auth Required. Updates Tenant preferences: city, budget, sleep schedule, etc)
* `GET /api/compatibility/:tenantId` (Auth Required. Compares the logged-in user to another Tenant ID and returns a 0-100% score).
