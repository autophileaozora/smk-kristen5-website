# ⚡ Quick Start - Deploy Website dalam 15 Menit

## 📋 Checklist Sebelum Mulai

- ✅ MongoDB Atlas sudah ada (connection string tersedia)
- ✅ Cloudinary sudah ada (credentials tersedia)
- ✅ Email Gmail sudah ada (app password tersedia)
- 📝 Akun GitHub (buat di https://github.com jika belum punya)
- 📝 Akun Render (buat di https://render.com jika belum punya)
- 📝 Akun Netlify (buat di https://netlify.com jika belum punya)

---

## 🚀 Langkah Deploy (Copy-Paste Command)

### Step 1: Push Code ke GitHub (5 menit)

Buka **Command Prompt** atau **Git Bash**, jalankan:

```bash
# Masuk ke folder project
cd c:\Users\aozora\Music\project

# Initialize Git
git init

# Add semua file
git add .

# Commit
git commit -m "Initial commit - SMK Kristen 5 Website"
```

Sekarang buat repository di GitHub:
1. Buka https://github.com/new
2. Nama: `smk-kristen5-website`
3. Public/Private (terserah)
4. JANGAN centang "Initialize with README"
5. Klik **Create repository**

Setelah repository dibuat, copy command yang muncul, atau jalankan:

```bash
# Ganti YOUR_USERNAME dengan username GitHub Anda
git remote add origin https://github.com/YOUR_USERNAME/smk-kristen5-website.git
git branch -M main
git push -u origin main
```

✅ **Step 1 Done!** Code sudah ada di GitHub

---

### Step 2: Deploy Backend di Render (5 menit)

1. Buka https://dashboard.render.com/login
2. Login dengan GitHub
3. Klik **New +** → **Web Service**
4. Klik **Connect** di repository `smk-kristen5-website`
5. Isi form:
   - **Name:** `smk-kristen5-backend`
   - **Region:** `Singapore`
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`

6. Klik **Advanced** → **Add Environment Variable**

Copy-paste semua variable ini (SATU PER SATU):

```
NODE_ENV=production
```
```
PORT=5001
```
```
MONGODB_URI=mongodb+srv://smkadmin:llASVw6t0ne1TSot@cluster0.q3nsc8a.mongodb.net/
```
```
JWT_SECRET=e306ea9de5c5e324d6e5c846a32819bd79ea924bae66154e9da06a52c6575527
```
```
JWT_EXPIRE=7d
```
```
CLOUDINARY_CLOUD_NAME=drszo9bl2
```
```
CLOUDINARY_API_KEY=655933234672663
```
```
CLOUDINARY_API_SECRET=azdMIKT382EqxYGiRcmUG7Slsxw
```
```
EMAIL_HOST=smtp.gmail.com
```
```
EMAIL_PORT=587
```
```
EMAIL_USER=andrian.imanuel.sinaga17@gmail.com
```
```
EMAIL_PASSWORD=stkc rlkw fhzr yiri
```
```
EMAIL_FROM=SMK Kristen 5 Klaten <andrian.imanuel.sinaga17@gmail.com>
```
```
MAX_IMAGE_SIZE=5242880
```
```
MAX_VIDEO_SIZE=52428800
```

7. Klik **Create Web Service**

8. **TUNGGU** sampai status berubah jadi **Live** (hijau) - sekitar 5 menit

9. **COPY URL BACKEND** (contoh: `https://smk-kristen5-backend.onrender.com`)

10. Setelah Live, klik **Environment** di sidebar kiri

11. **Tambahkan 2 variable lagi:**

```
BASE_URL=https://smk-kristen5-backend.onrender.com
```
*(Ganti dengan URL backend Anda)*

```
FRONTEND_URL=https://temporary-url.netlify.app
```
*(Ini sementara, nanti akan diupdate setelah frontend jadi)*

12. Klik **Save Changes**

✅ **Step 2 Done!** Backend sudah live!

**Test:** Buka `https://smk-kristen5-backend.onrender.com/health` di browser
Harus muncul: `{"success":true,"message":"Server is running",...}`

---

### Step 3: Deploy Frontend di Netlify (5 menit)

1. **Update .env frontend dulu:**

Buka file `c:\Users\aozora\Music\project\frontend\.env`

Ganti isinya dengan:
```
VITE_API_URL=https://smk-kristen5-backend.onrender.com
```
*(Ganti dengan URL backend dari Step 2)*

2. **Commit perubahan:**

```bash
cd c:\Users\aozora\Music\project
git add .
git commit -m "Update API URL untuk production"
git push
```

3. **Deploy di Netlify:**

- Buka https://app.netlify.com/start
- Klik **Import from Git** → **GitHub**
- Authorize Netlify
- Pilih repository `smk-kristen5-website`
- Isi form:
  - **Base directory:** `frontend`
  - **Build command:** `npm run build`
  - **Publish directory:** `frontend/dist`

4. Klik **Show advanced** → **New variable:**
```
Key: VITE_API_URL
Value: https://smk-kristen5-backend.onrender.com
```
*(Ganti dengan URL backend Anda)*

5. Klik **Deploy site**

6. **TUNGGU** sampai deploy selesai (2-5 menit)

7. **COPY URL FRONTEND** (contoh: `https://magnificent-squirrel-abc123.netlify.app`)

8. **Update nama site (optional):**
   - Klik **Site settings**
   - Klik **Change site name**
   - Ubah jadi: `smk-kristen5`
   - URL jadi: `https://smk-kristen5.netlify.app`

✅ **Step 3 Done!** Frontend sudah live!

---

### Step 4: Update Backend dengan Frontend URL (1 menit)

1. Balik ke Render Dashboard: https://dashboard.render.com
2. Klik service backend
3. Klik **Environment**
4. Edit variable `FRONTEND_URL`:
```
FRONTEND_URL=https://smk-kristen5.netlify.app
```
*(Ganti dengan URL Netlify Anda)*

5. Klik **Save Changes** (auto-redeploy)

✅ **Step 4 Done!** CORS sudah benar!

---

## 🎉 SELESAI! Website Sudah Live!

### Test Website:

1. **Test Homepage:**
   - Buka: `https://smk-kristen5.netlify.app`
   - Harus muncul homepage

2. **Test Admin Login:**
   - Buka: `https://smk-kristen5.netlify.app/login`
   - Login dengan:
     - Email: `admin@smkkristen5.sch.id`
     - Password: `admin123`
   - Harus bisa masuk dashboard

3. **Test Upload Gambar:**
   - Di dashboard admin, buka "Artikel"
   - Klik "Tambah Artikel"
   - Upload gambar
   - Harus bisa upload ke Cloudinary

---

## 📱 Share URLs

Sekarang website bisa diakses dari mana saja!

- 🌐 **Public Website:** https://smk-kristen5.netlify.app
- 👨‍💼 **Admin Panel:** https://smk-kristen5.netlify.app/admin
- 🔧 **API Backend:** https://smk-kristen5-backend.onrender.com

---

## ⚠️ PENTING - Render Free Tier

Render free tier akan "sleep" setelah 15 menit tidak ada request.

**Dampak:**
- Request pertama setelah sleep akan lambat (20-30 detik)
- Request berikutnya normal (cepat)

**Solusi:**
- Upgrade ke Render paid plan: $7/bulan (no sleep)
- Atau gunakan uptime monitor gratis: https://uptimerobot.com

---

## 🔄 Auto-Deploy

Sekarang setiap kali Anda push code ke GitHub:
- Backend akan auto-deploy di Render
- Frontend akan auto-deploy di Netlify

Untuk update website:
```bash
cd c:\Users\aozora\Music\project
git add .
git commit -m "Update fitur baru"
git push
```

---

## 🆘 Troubleshooting

### Frontend tidak bisa connect ke Backend
1. Cek CORS: `FRONTEND_URL` di Render harus sesuai dengan URL Netlify
2. Cek API URL: `VITE_API_URL` di Netlify harus sesuai dengan URL Render
3. Cek logs di Render Dashboard

### Upload gambar gagal
1. Cek Cloudinary credentials di Render environment variables
2. Cek quota Cloudinary (free: 25 credits/month)

### MongoDB error
1. Buka MongoDB Atlas: https://cloud.mongodb.com
2. Klik "Network Access"
3. Pastikan IP Whitelist: `0.0.0.0/0` (allow all)

---

## 📞 Butuh Bantuan?

Email: andrian.imanuel.sinaga17@gmail.com

---

**Selamat! Website SMK Kristen 5 Klaten sudah live! 🎉**
