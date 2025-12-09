# 🏫 SMK Kristen 5 Klaten - Website Official

Website resmi SMK Kristen 5 Klaten yang dibangun dengan React (Frontend) dan Node.js/Express (Backend).

## 🌟 Fitur

### Public Features
- 🏠 **Homepage** - Hero section dengan video, informasi sekolah
- 📰 **Berita & Artikel** - Berita sekolah, pengumuman
- 🏆 **Prestasi** - Pencapaian siswa dan sekolah
- 🎓 **Jurusan** - Informasi lengkap tentang jurusan
- 👥 **Alumni** - Database alumni dan testimoni
- 🎯 **Ekstrakurikuler** - Informasi ekskul yang tersedia
- 🏢 **Fasilitas** - Fasilitas sekolah
- 📞 **Kontak** - Informasi kontak dan lokasi

### Admin Features
- 🔐 **Authentication** - Login/Logout dengan JWT
- 📊 **Dashboard** - Overview statistik website
- ✏️ **Content Management** - CRUD untuk semua konten
- 🖼️ **Image Upload** - Upload gambar ke Cloudinary
- 📝 **Audit Log** - Tracking aktivitas admin
- 👤 **Profile Management** - Update profile dan password

## 🚀 Tech Stack

### Frontend
- ⚛️ React 18
- 🎨 Tailwind CSS
- 🔄 React Router v6
- 📦 Zustand (State Management)
- 🌐 Axios
- 📝 React Quill (Rich Text Editor)
- ✨ Framer Motion (Animations)

### Backend
- 🟢 Node.js
- 🚂 Express.js
- 🍃 MongoDB + Mongoose
- 🔑 JWT Authentication
- ☁️ Cloudinary (Image Storage)
- 📧 Nodemailer (Email)
- 🔒 Helmet (Security)
- 🛡️ Express Rate Limit

## 📁 Struktur Project

```
project/
├── frontend/           # React Application
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   └── App.jsx
│   ├── netlify.toml
│   └── package.json
│
├── backend/           # Express API
│   ├── src/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── server.js
│   └── package.json
│
├── DEPLOYMENT.md      # Panduan Deployment
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js v18+
- MongoDB
- Git

### 1. Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/smk-kristen5-website.git
cd smk-kristen5-website
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Buat file `.env` di folder `backend`:
```env
NODE_ENV=development
PORT=5001
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
FRONTEND_URL=http://localhost:5173
```

Jalankan backend:
```bash
npm start
```

Backend akan running di: `http://localhost:5001`

### 3. Setup Frontend
```bash
cd ../frontend
npm install
```

Buat file `.env` di folder `frontend`:
```env
VITE_API_URL=http://localhost:5001
```

Jalankan frontend:
```bash
npm run dev
```

Frontend akan running di: `http://localhost:5173`

## 🚀 Deployment

Untuk deploy ke production, ikuti panduan lengkap di [DEPLOYMENT.md](./DEPLOYMENT.md)

**Quick Summary:**
- Backend → Render (Free)
- Frontend → Netlify (Free)
- Database → MongoDB Atlas (Free)
- Images → Cloudinary (Free)

## 📝 Default Admin Account

Setelah seeding database, gunakan akun ini untuk login:

```
Email: admin@smkkristen5.sch.id
Password: admin123
```

⚠️ **PENTING:** Segera ubah password setelah login pertama kali!

## 🔒 Security Features

- ✅ JWT Authentication
- ✅ Password Hashing (bcrypt)
- ✅ Rate Limiting
- ✅ CORS Protection
- ✅ Helmet Security Headers
- ✅ MongoDB Injection Prevention
- ✅ Input Validation
- ✅ Audit Logging

## 📊 API Endpoints

### Public API
```
GET  /api/articles        # Get all articles
GET  /api/articles/:id    # Get article by ID
GET  /api/prestasi        # Get achievements
GET  /api/jurusan         # Get departments
GET  /api/alumni          # Get alumni
GET  /api/ekskul          # Get extracurriculars
GET  /api/fasilitas       # Get facilities
GET  /api/kontak          # Get contact info
```

### Admin API (Requires Authentication)
```
POST   /api/auth/login       # Admin login
GET    /api/auth/profile     # Get profile
PUT    /api/auth/profile     # Update profile
POST   /api/articles         # Create article
PUT    /api/articles/:id     # Update article
DELETE /api/articles/:id     # Delete article
# ... dan endpoint CRUD lainnya
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

- **Developer:** Your Name
- **Email:** andrian.imanuel.sinaga17@gmail.com
- **School:** SMK Kristen 5 Klaten

## 🙏 Acknowledgments

- React Team
- Express Team
- MongoDB Team
- Cloudinary
- Tailwind CSS

---

Made with ❤️ for SMK Kristen 5 Klaten
