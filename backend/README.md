# SMK Kristen 5 Klaten - Backend API

Backend API untuk Website SMK Kristen 5 Klaten.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
```

Edit `.env` dengan credentials Anda:
- MongoDB URI (dari MongoDB Atlas)
- JWT Secret (generate dengan: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- Cloudinary credentials
- Gmail SMTP (App Password)

### 3. Seed Database
```bash
npm run seed
```

### 4. Run Server
```bash
npm run dev
```

Server akan berjalan di: http://localhost:5000

## 📋 Login Credentials (Setelah Seed)

**Administrator:**
- Email: admin@smk.com
- Password: Admin123!

**Admin Siswa:**
- Email: siswa1@smk.com - siswa7@smk.com
- Password: Siswa123!

## 📂 Structure

```
backend/
├── src/
│   ├── config/         # Database & Cloudinary config
│   ├── models/         # MongoDB schemas (10 models)
│   ├── middleware/     # Auth, role check, upload validation
│   ├── utils/          # Email service, logger, seed data
│   ├── routes/         # API routes (Phase 3+)
│   ├── app.js          # Express config
│   └── server.js       # Server entry point
├── logs/               # Application logs
├── .env                # Environment variables (create from .env.example)
├── .env.example        # Environment template
├── package.json        # Dependencies
└── README.md
```

## 🔧 Available Scripts

- `npm start` - Production mode
- `npm run dev` - Development mode (nodemon)
- `npm run seed` - Seed database

## 📚 Documentation

Full documentation: [PHASE_1-2_REPORT.md](../PHASE_1-2_REPORT.md)
