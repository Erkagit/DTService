# 🚛 Achir Bayron LLC - Delivery Tracking System

A modern, trilingual (MN/EN/CN) delivery tracking and logistics management system.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![Node.js](https://img.shields.io/badge/Node.js-20-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)

---

## ✨ Features

- 🌐 **Trilingual Support** - Mongolian, English, Chinese
- 📦 **Order Management** - Full order lifecycle tracking with 13 status stages
- 🚗 **Vehicle Tracking** - GPS device integration and real-time location
- 🏢 **Company Management** - Multi-tenant support with client admin roles
- 👥 **User Management** - Role-based access control (Admin, Client Admin)
- 🗺️ **Google Maps Integration** - Visual vehicle tracking on map
- 📱 **Responsive Design** - Mobile-friendly interface
- 🔐 **Secure Authentication** - JWT-based auth with bcrypt password hashing

---

## 🛠️ Tech Stack

### Frontend
- Next.js 16 (App Router)
- React 19
- Tailwind CSS v4
- React Query (TanStack)
- TypeScript

### Backend
- Node.js + Express
- Prisma ORM
- PostgreSQL
- JWT Authentication

### DevOps
- Docker & Docker Compose
- Nginx (reverse proxy)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- npm or yarn

### Development Setup

```bash
# Clone repository
git clone <repository-url>
cd DTS-monorepo

# Backend setup
cd backend
npm install
cp .env.example .env  # Configure DATABASE_URL and JWT_SECRET
npx prisma migrate dev
npx prisma db seed
npm run dev

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```

**Access:**
- Frontend: http://localhost:3000
- Backend: http://localhost:4000

### Docker Setup

```bash
# Copy environment file
cp .env.example .env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

---

## 📁 Project Structure

```
DTS-monorepo/
├── backend/
│   ├── prisma/          # Database schema & migrations
│   ├── src/
│   │   ├── middleware/  # Auth middleware
│   │   ├── routes/      # API routes
│   │   └── utils/       # JWT utilities
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/         # Next.js App Router pages
│   │   ├── components/  # Reusable UI components
│   │   ├── context/     # React contexts (Auth, Language)
│   │   └── services/    # API client
│   └── Dockerfile
├── nginx/               # Nginx configuration
├── docker-compose.yml
└── DEPLOY.md           # Deployment guide
```

---

## 📋 Order Status Flow

```
PENDING → LOADING → TRANSFER_LOADING → CN_EXPORT_CUSTOMS → MN_IMPORT_CUSTOMS
    ↓
IN_TRANSIT → ARRIVED_AT_SITE → UNLOADED → RETURN_TRIP
    ↓
MN_EXPORT_RETURN → CN_IMPORT_RETURN → TRANSFER → COMPLETED
```

---

## 🌍 Multi-Language Support

The system supports three languages:
- 🇲🇳 **Mongolian** (MN) - Default
- 🇬🇧 **English** (EN)
- 🇨🇳 **Chinese** (CN)

Language selection is saved to localStorage and persists across sessions.

---

## 📖 API Endpoints

### Authentication
- `POST /api/auth/login` - Login

### Orders
- `GET /api/orders` - List orders
- `POST /api/orders` - Create order
- `PATCH /api/orders/:id/status` - Update order status
- `DELETE /api/orders/:id` - Delete order

### Vehicles
- `GET /api/vehicles` - List vehicles
- `POST /api/vehicles` - Create vehicle
- `PUT /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Delete vehicle

### Companies
- `GET /api/companies` - List companies
- `POST /api/companies` - Create company
- `PUT /api/companies/:id` - Update company
- `DELETE /api/companies/:id` - Delete company

### Users
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

---

## 🚀 Deployment

See [DEPLOY.md](./DEPLOY.md) for detailed deployment instructions.

Quick deploy with Docker:
```bash
docker-compose --profile production up -d --build
```

---

## 📄 License

Private - Achir Bayron LLC

---

## 👥 Contact

**Achir Bayron LLC**
- 📧 info@achirbayron.mn
- 📞 +976 XXXX XXXX
