# SMK Kristen 5 Klaten - Frontend

Dashboard admin untuk mengelola website SMK Kristen 5 Klaten.

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- Backend server running on port 5001

### Installation

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev
```

Server akan jalan di: http://localhost:5173

### Login Credentials

**Administrator:**
- Email: admin@smk.com
- Password: Admin123!

**Admin Siswa:**
- Email: siswa1@smk.com
- Password: Siswa123!

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/      # Reusable components
│   │   └── Sidebar.jsx
│   ├── layouts/         # Layout components
│   │   └── DashboardLayout.jsx
│   ├── pages/           # Page components
│   │   ├── Login.jsx
│   │   └── Dashboard.jsx
│   ├── store/           # Zustand state management
│   │   └── authStore.js
│   ├── utils/           # Utilities
│   │   └── api.js       # Axios instance
│   ├── App.jsx          # Main app with routing
│   ├── main.jsx         # Entry point
│   └── index.css        # Tailwind CSS
├── public/              # Static assets
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## 🛠️ Tech Stack

- **React 18** - UI library
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Utility-first CSS
- **React Router v6** - Routing
- **Zustand** - State management
- **Axios** - HTTP client

## ✨ Features

- ✅ JWT Authentication
- ✅ Role-based navigation (Admin vs Siswa)
- ✅ Responsive sidebar with mobile menu
- ✅ Protected routes
- ✅ Auto token refresh
- ✅ Global state management
- ✅ Dashboard with statistics
- ✅ Modern UI with Tailwind

## 📝 Available Scripts

```bash
npm run dev      # Start dev server (port 5173)
npm run build    # Build for production
npm run preview  # Preview production build
```

## 🔐 Authentication Flow

1. User enters email/password
2. Frontend calls `/api/auth/login`
3. Backend returns JWT token
4. Token saved to localStorage
5. Token auto-added to all API requests
6. Protected routes check authentication

## 📊 Phase Status

- ✅ Phase 7-9: Dashboard Layout (DONE)
- 🔄 Phase 10-12: User Management UI (Next)
- ⏳ Phase 13-27: Content Management (Future)

## 🎯 Next Steps

After Phase 7-9:
1. User Management UI (CRUD users)
2. Article Management UI
3. Running Text Management
4. Other content modules

## 📞 Support

Check main project documentation for more details.
