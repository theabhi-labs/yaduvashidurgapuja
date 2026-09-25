# यदुवंशी दुर्गा पूजा कपूरिपुर | Digital Memory Archive
**Official Domain:** `yaduvashidurgapujakapooripur.online`  
**Philosophy:** *"Memory, not popularity"* — Pure archival, dignified community preservation without social media popularity metrics (no likes, comments, follower counts, reactions, or view counts).

---

## 🌟 Overview

This repository contains the complete full-stack MERN (MongoDB, Express, React, Node.js) web application for **Yaduvashi Durga Puja, Kapoori Pur**.

### ✨ Core Features
1. **Preserve Durga Puja Memories:** High-quality photo archival with caption, year metadata, and devotee attribution.
2. **Sharp Image Optimization Pipeline:** Auto-converts to WebP, creates thumbnails, and strips all EXIF/GPS geolocation metadata for privacy.
3. **Committee Members Directory:** Leadership & organizers showcase with portraits and designations.
4. **Canonical Memory Sharing:** Dedicated canonical URLs (`/memories/:id`), WhatsApp pre-formatted emotional Hindi text, and native Web Share API with clipboard fallback.
5. **Community Content Moderation:** Flagging system for inappropriate content with duplicate report prevention.
6. **Full-Featured Admin Panel (`/admin`):** Dashboard metrics, memory moderation (publish/hide/delete), user suspension controls, committee member CRUD & drag-order, and report resolution.
7. **Security & Privacy First:** HTTP-only JWT cookies, bcrypt password hashing, Helmet CSP, strict CORS, express-rate-limit, Zod schemas, zero password/email leakage.

---

## 📁 Repository Structure

```
durgapujakapooripur/
├── client/                     # Vite + React + TypeScript + Tailwind CSS
│   ├── public/                 # Static assets, favicon, robots.txt, sitemap.xml
│   ├── src/
│   │   ├── components/         # Common UI, Layout, Memory, and Committee components
│   │   ├── context/            # AuthContext & ToastContext
│   │   ├── hooks/              # useAuth, useDebounce
│   │   ├── layouts/            # MainLayout & AdminLayout
│   │   ├── pages/              # Public, Devotee, and Admin pages
│   │   ├── routes/             # AppRoutes, ProtectedRoute, AdminRoute
│   │   ├── services/           # Axios API services (auth, memory, committee, admin, report)
│   │   ├── types/              # TypeScript definitions
│   │   ├── utils/              # Constants and helpers
│   │   ├── App.tsx             # Root component with Providers
│   │   ├── index.css           # Global Tailwind CSS & custom typography
│   │   └── main.tsx            # React DOM entrypoint
│   ├── package.json
│   └── vite.config.ts
│
├── server/                     # Node.js + Express + TypeScript + MongoDB
│   ├── src/
│   │   ├── config/             # Environment variables and DB connection
│   │   ├── controllers/        # Auth, Memory, Committee, Report, Admin controllers
│   │   ├── middleware/         # Auth, Admin, Upload (Multer), RateLimiter, ErrorHandler, Zod
│   │   ├── models/             # Mongoose schemas (User, Memory, CommitteeMember, Report)
│   │   ├── routes/             # Express API routes
│   │   ├── services/           # Sharp ImageService, Token generation
│   │   ├── utils/              # ApiResponse, Logger, Database Seeder
│   │   ├── validators/         # Zod schemas
│   │   ├── app.ts              # Express App setup
│   │   └── server.ts           # Server bootstrap
│   ├── uploads/                # Processed images (memories, thumbnails, committee)
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18+ (tested on v22.19.0)
- **MongoDB**: Local MongoDB instance or MongoDB Atlas URI

### 1. Backend Setup
```bash
cd server
npm install
cp .env.example .env

# Optional: Seed realistic demo data and assets (creates Admin & historical memories)
npm run seed

# Run Backend Development Server
npm run dev
```
Backend runs at `http://localhost:5000`.  
Health check: `http://localhost:5000/api/health`

### 2. Frontend Setup
```bash
cd ../client
npm install

# Run Frontend Development Server
npm run dev
```
Frontend runs at `http://localhost:5173`.

---

## 🔑 Default Credentials (After Seeding)

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@kapooripur.online` | `DurgaPuja@2026` |
| **Devotee** | `abhishek@kapooripur.online` | `DurgaPuja@2026` |
| **Devotee** | `priya@kapooripur.online` | `DurgaPuja@2026` |

---

## 🛡️ Security Architecture
- **No Social Ranking**: Pure archival design with no like counters, reaction metrics, comments, or algorithmic ranking.
- **HTTP-Only Cookies**: JWT authentication is transmitted via secure HTTP-Only cookies to protect against token theft via XSS.
- **Image Sanitization**: Uploaded images are passed through Sharp to strip EXIF & GPS location metadata, convert to efficient WebP, and reject non-image file formats.
- **Rate Limiting**: Brute-force protection on authentication, upload endpoints, and general API.
- **Centralized Error Shielding**: Production responses never leak stack traces or database internals.
