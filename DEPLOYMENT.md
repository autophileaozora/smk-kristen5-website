# 🚀 Panduan Deployment SMK Kristen 5 Klaten Website

## 📋 Daftar Isi
1. [Persiapan](#persiapan)
2. [Deploy Backend ke Render](#deploy-backend-ke-render)
3. [Deploy Frontend ke Netlify](#deploy-frontend-ke-netlify)
4. [Konfigurasi Environment Variables](#konfigurasi-environment-variables)
5. [Testing Deployment](#testing-deployment)

---

## 🔧 Persiapan

### 1. Install Git (jika belum ada)
Download dan install dari: https://git-scm.com/downloads

### 2. Buat Akun yang Diperlukan
- ✅ **GitHub** - https://github.com (untuk hosting code)
- ✅ **Render** - https://render.com (untuk backend - GRATIS)
- ✅ **Netlify** - https://netlify.com (untuk frontend - GRATIS)
- ✅ **MongoDB Atlas** - Sudah ada ✓
- ✅ **Cloudinary** - Sudah ada ✓

---

## 📦 Deploy Backend ke Render

### Step 1: Push Code ke GitHub

1. **Buka terminal di folder project:**
   ```bash
   cd c:\Users\aozora\Music\project
   ```

2. **Initialize Git repository:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - SMK Kristen 5 Website"
   ```

3. **Create GitHub repository:**
   - Buka https://github.com/new
   - Nama repository: `smk-kristen5-website`
   - Pilih **Public** atau **Private**
   - Jangan centang "Initialize with README"
   - Klik **Create repository**

4. **Push ke GitHub:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/smk-kristen5-website.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy di Render

1. **Login ke Render:**
   - Buka https://dashboard.render.com
   - Klik **New +** → **Web Service**

2. **Connect GitHub repository:**
   - Klik **Connect account** untuk GitHub
   - Pilih repository `smk-kristen5-website`
   - Klik **Connect**

3. **Konfigurasi Web Service:**
   ```
   Name: smk-kristen5-backend
   Region: Singapore (terdekat dengan Indonesia)
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   Instance Type: Free
   ```

4. **Environment Variables:**
   Klik **Advanced** → **Add Environment Variable**, tambahkan:

   ```
   NODE_ENV=production
   PORT=5001
   MONGODB_URI=mongodb+srv://smkadmin:llASVw6t0ne1TSot@cluster0.q3nsc8a.mongodb.net/
   JWT_SECRET=e306ea9de5c5e324d6e5c846a32819bd79ea924bae66154e9da06a52c6575527
   JWT_EXPIRE=7d
   CLOUDINARY_CLOUD_NAME=drszo9bl2
   CLOUDINARY_API_KEY=655933234672663
   CLOUDINARY_API_SECRET=azdMIKT382EqxYGiRcmUG7Slsxw
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=andrian.imanuel.sinaga17@gmail.com
   EMAIL_PASSWORD=stkc rlkw fhzr yiri
   EMAIL_FROM=SMK Kristen 5 Klaten <andrian.imanuel.sinaga17@gmail.com>
   MAX_IMAGE_SIZE=5242880
   MAX_VIDEO_SIZE=52428800
   ```

   **PENTING:** `FRONTEND_URL` dan `BASE_URL` akan ditambahkan setelah mendapat URL dari Render dan Netlify

5. **Deploy:**
   - Klik **Create Web Service**
   - Tunggu proses deploy (5-10 menit)
   - Setelah selesai, copy URL backend (contoh: `https://smk-kristen5-backend.onrender.com`)

6. **Update Environment Variables:**
   - Di dashboard Render, klik service yang baru dibuat
   - Klik **Environment** di sidebar
   - Tambahkan/Update:
     ```
     BASE_URL=https://smk-kristen5-backend.onrender.com
     FRONTEND_URL=https://your-site.netlify.app
     ```
   - Klik **Save Changes** (akan auto-redeploy)

---

## 🌐 Deploy Frontend ke Netlify

### Step 1: Persiapan Frontend

1. **Update file `.env` di folder frontend:**
   ```bash
   cd frontend
   ```

   Edit file `.env`:
   ```
   VITE_API_URL=https://smk-kristen5-backend.onrender.com
   ```
   *(Ganti dengan URL backend dari Render)*

2. **Test build locally (optional):**
   ```bash
   npm run build
   ```

3. **Commit perubahan:**
   ```bash
   cd ..
   git add .
   git commit -m "Update API URL untuk production"
   git push
   ```

### Step 2: Deploy di Netlify

1. **Login ke Netlify:**
   - Buka https://app.netlify.com
   - Klik **Add new site** → **Import an existing project**

2. **Connect GitHub:**
   - Pilih **GitHub**
   - Pilih repository `smk-kristen5-website`
   - Klik **Authorize Netlify**

3. **Konfigurasi Build Settings:**
   ```
   Base directory: frontend
   Build command: npm run build
   Publish directory: frontend/dist
   ```

4. **Environment Variables:**
   Klik **Show advanced** → **New variable**:
   ```
   VITE_API_URL=https://smk-kristen5-backend.onrender.com
   ```
   *(Ganti dengan URL backend dari Render)*

5. **Deploy:**
   - Klik **Deploy site**
   - Tunggu proses build (2-5 menit)
   - Setelah selesai, copy URL frontend (contoh: `https://smk-kristen5.netlify.app`)

6. **Custom Domain (Optional):**
   - Di dashboard Netlify, klik **Domain settings**
   - Klik **Add custom domain**
   - Ikuti instruksi untuk setup domain

### Step 3: Update Backend dengan Frontend URL

1. **Kembali ke Render Dashboard:**
   - Buka https://dashboard.render.com
   - Pilih service backend
   - Klik **Environment**
   - Update variable:
     ```
     FRONTEND_URL=https://smk-kristen5.netlify.app
     ```
     *(Ganti dengan URL frontend dari Netlify)*
   - Klik **Save Changes**

---

## ✅ Testing Deployment

### Test Backend
1. Buka browser, akses:
   ```
   https://smk-kristen5-backend.onrender.com/health
   ```
   Harus return:
   ```json
   {
     "success": true,
     "message": "Server is running",
     "timestamp": "..."
   }
   ```

### Test Frontend
1. Buka URL frontend: `https://smk-kristen5.netlify.app`
2. Test halaman public:
   - Homepage ✓
   - Tentang ✓
   - Berita ✓
   - Kontak ✓

3. Test admin login:
   - Buka `/login`
   - Login dengan akun admin
   - Test CRUD operations

### Test Upload Gambar
1. Login sebagai admin
2. Buka salah satu form (Artikel, Prestasi, dll)
3. Upload gambar dari device
4. Pastikan gambar ter-upload ke Cloudinary

---

## 🔄 Auto-Deploy

### GitHub → Render
- Setiap push ke branch `main` akan otomatis deploy ulang backend

### GitHub → Netlify
- Setiap push ke branch `main` akan otomatis deploy ulang frontend

---

## 📝 Environment Variables Lengkap

### Backend (.env)
```env
NODE_ENV=production
PORT=5001
BASE_URL=https://smk-kristen5-backend.onrender.com
MONGODB_URI=mongodb+srv://smkadmin:llASVw6t0ne1TSot@cluster0.q3nsc8a.mongodb.net/
JWT_SECRET=e306ea9de5c5e324d6e5c846a32819bd79ea924bae66154e9da06a52c6575527
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=drszo9bl2
CLOUDINARY_API_KEY=655933234672663
CLOUDINARY_API_SECRET=azdMIKT382EqxYGiRcmUG7Slsxw
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=andrian.imanuel.sinaga17@gmail.com
EMAIL_PASSWORD=stkc rlkw fhzr yiri
EMAIL_FROM=SMK Kristen 5 Klaten <andrian.imanuel.sinaga17@gmail.com>
FRONTEND_URL=https://smk-kristen5.netlify.app
MAX_IMAGE_SIZE=5242880
MAX_VIDEO_SIZE=52428800
```

### Frontend (.env)
```env
VITE_API_URL=https://smk-kristen5-backend.onrender.com
```

---

## 🐛 Troubleshooting

### Backend tidak bisa diakses
- Cek logs di Render Dashboard
- Pastikan semua environment variables sudah benar
- Cek MongoDB connection string

### Frontend tidak bisa connect ke Backend
- Cek CORS settings di backend
- Pastikan FRONTEND_URL di backend sesuai dengan URL Netlify
- Pastikan VITE_API_URL di frontend sesuai dengan URL Render

### Upload gambar gagal
- Cek Cloudinary credentials
- Cek quota Cloudinary (free tier: 25 credits/month)
- Cek browser console untuk error

### Render Free Tier Sleep
- ⚠️ **Render free tier akan "sleep" setelah 15 menit tidak ada request**
- First request setelah sleep akan lambat (20-30 detik)
- Solusi: Upgrade ke paid plan ($7/month) atau gunakan uptime monitor

---

## 💰 Estimasi Biaya

### Free Tier (Cocok untuk Start)
- ✅ Render: Free (dengan sleep setelah 15 menit)
- ✅ Netlify: Free (100GB bandwidth/month)
- ✅ MongoDB Atlas: Free (512MB storage)
- ✅ Cloudinary: Free (25 credits/month)
- **Total: $0/bulan**

### Recommended untuk Production
- 💵 Render: $7/month (no sleep, 512MB RAM)
- ✅ Netlify: Free
- ✅ MongoDB Atlas: Free atau $9/month (2GB)
- ✅ Cloudinary: Free atau $0.0009/credit
- **Total: $7-16/bulan**

---

## 📞 Support

Jika ada masalah saat deployment:
1. Cek logs di Render/Netlify dashboard
2. Cek MongoDB Atlas network access (whitelist IP: 0.0.0.0/0)
3. Cek Cloudinary quota
4. Contact: andrian.imanuel.sinaga17@gmail.com

---

## 🎉 Selesai!

Website Anda sudah live dan bisa diakses dari internet!

**URLs:**
- 🌐 Frontend: https://smk-kristen5.netlify.app
- 🔧 Backend API: https://smk-kristen5-backend.onrender.com
- 📊 Admin Panel: https://smk-kristen5.netlify.app/admin

**Next Steps:**
1. Setup custom domain (optional)
2. Setup SSL certificate (auto di Netlify)
3. Setup monitoring/analytics
4. Setup backup database
