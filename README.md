# ⚡ ECHO — Real-Time Anonymous Nearby Interaction Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.0+-61DAFB?logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20.0+-339933?logo=node.js)](https://nodejs.org/)
[![Socket.io](https://img.shields.io/badge/Socket.IO-4.7+-010101?logo=socket.io)](https://socket.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-TLS-DC382D?logo=redis)](https://upstash.com/)

> **Echo** is a context-aware, real-time nearby interaction web platform designed for spontaneous local connections. Built with a Gen-Z Cyber-Glassmorphic design language, it enables users to discover nearby nodes, post temporary selfexpiring **Sparks** (intent mini-rooms), send **Secret Compliments**, and establish **Saved Connections** without compromising location privacy.

---

## ✨ Key Features

- 🛰️ **Proximity Radar Scan**: Discover active nearby users within dynamic radiuses (`~50m`, `~100m`, `~200m`) without exposing exact GPS coordinates.
- ⚡ **Temporary Sparks (Mini Rooms)**: Ignite auto-expiring intent rooms (10m, 20m, 30m, 1h) with optional 4-digit PIN passkeys for private group meetups.
- 👋 **Waves & Micro-Interactions**: Send context-aware waves and secret compliments to break the ice anonymously.
- 🔒 **Saved Connections**: Permanent, non-expiring chat rooms established only when both users mutually agree to save the connection.
- 🟢 **Real-Time Presence**: Live online/away/offline status indicators and real-time Socket.IO WebSocket messaging.
- 🛡️ **Privacy & Safety First**: Dynamic EchoIDs (`#4BH8WU`), mood controls, user blocking, and instant host-moderation controls.
- 📱 **Mobile-First Responsive Layout**: Optimized with dynamic viewport scaling (`100dvh`) for flawless mobile and desktop experience.

---

## 🛠️ Technology Stack

### **Frontend (`/client`)**
* **Framework**: React 18 + Vite + TypeScript
* **State Management**: Zustand & React Context
* **Real-time Client**: Socket.IO Client
* **Icons & UI**: Lucide React + Vanilla CSS Glassmorphism
* **Router**: React Router DOM v6

### **Backend (`/server`)**
* **Runtime**: Node.js + Express (TypeScript)
* **Real-time Engine**: Socket.IO (Persistent WebSockets)
* **Database**: MongoDB (Mongoose ORM)
* **Cache & Memory**: Redis (Upstash / Redis Cloud)
* **Validation & Security**: Zod, Helmet, CORS, JWT Auth
* **Logging**: Pino / Pino-Pretty

---

## 📂 Architecture Overview

```
Echo/
├── client/                     # Vite + React Frontend SPA
│   ├── src/
│   │   ├── components/         # Spark, Wave, Chat & Profile Modals
│   │   ├── context/            # Auth & Socket IO Context Providers
│   │   ├── pages/              # Nearby, Sparks, Saved & Onboarding Tabs
│   │   ├── services/           # Axios API Client
│   │   └── types/              # TypeScript Interfaces
│   └── vite.config.ts          # Vite proxy & build configuration
│
└── server/                     # Node.js + Express + Socket.IO Backend
    ├── src/
    │   ├── config/             # MongoDB & Redis Configs
    │   ├── modules/            # Auth, Chat, Spark & User Modules
    │   ├── socket/             # Real-time WebSocket Handlers
    │   └── server.ts           # HTTP & Server Entry Point
```

---

## ⚡ Quick Start (Local Development)

### **Prerequisites**
- Node.js `v18+`
- MongoDB Atlas cluster (or local MongoDB instance)
- Redis instance (Upstash Redis or local Redis)

### **1. Clone the repository**
```bash
git clone https://github.com/Vibhuu79/ECHO.git
cd ECHO
```

### **2. Setup & Run Backend**
```bash
cd server
npm install

# Create .env file from template
cp .env.example .env

# Start dev server
npm run dev
```

### **3. Setup & Run Frontend**
```bash
# Open a new terminal tab
cd client
npm install

# Create .env file from template
cp .env.example .env

# Start Vite dev server
npm run dev
```

Visit `http://localhost:3000` in your browser! 🚀

---

## ⚙️ Environment Variables

### Backend (`/server/.env`)
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/Echo
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_super_secret_jwt_key
```

### Frontend (`/client/.env`)
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
```

---

## 🚀 Deployment Guide

* **Frontend**: Deploy `/client` on **Vercel** or **Render (Static Site)**.
* **Backend**: Deploy `/server` on **Railway.app** or **Render (Web Service)** to support continuous Socket.IO WebSocket connections.

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).
