# Pawn Broking Management System (MERN)

A comprehensive real-time Pawn Broking Management System built with the MERN stack (MongoDB, Express, React, Node.js).

## Features
- **Role-Based Access**: Admin & Staff Dashboards.
- **Pledge Entry**: Calculate loan eligibility dynamically based on live gold rates and schemes.
- **Customer Management**: KYC uploads and history.
- **Masters**: Admin control over Gold Rates and Loan Schemes.
- **Automated Overdue Check**: Cron job runs daily to mark overdue loans.

## Tech Stack
- **Frontend**: Vite + React, TailwindCSS, Lucide Icons, Axios.
- **Backend**: Node.js, Express, Mongoose, JWT, Multer.
- **Database**: MongoDB.

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally on default port 27017)

### Installation

1. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Create .env file (already provided in sample)
   npm start
   ```
   Server runs on `http://localhost:5000`.

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Client runs on `http://localhost:5173`.

### Initial Setup (Important)

1. **Register Admin User**
   Since the database is empty, you need to create the first user using Postman or Curl:
   `POST http://localhost:5000/api/auth/register`
   ```json
   {
     "username": "admin",
     "password": "password123",
     "fullName": "System Admin",
     "role": "admin"
   }
   ```

2. **Login**
   Use the above credentials to login on the frontend.

3. **Setup Masters**
   - Go to Masters (Admin only).
   - Add a Scheme (e.g., "Standard Gold Loan", Interest: 1.5%, Tenure: 12 months, Max Loan: 75%).
   - Add Today's Gold Rate (e.g., 22k: 5500, 24k: 6000).

4. **Start Pledging**
   - Create a Customer.
   - Go to Pledge Entry.
   - Upload Photos and Generate Loan.

## Directory Structure
- `backend/src`: Models, Controllers, Routes, Jobs.
- `frontend/src`: Components, Pages, Context, Layouts.
