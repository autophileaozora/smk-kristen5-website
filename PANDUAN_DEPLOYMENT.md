# Panduan Deploy Website SMK Kristen 5 Klaten
### Untuk: Operator/Admin Sekolah

---

## Gambaran Umum

Website ini terdiri dari dua bagian:

| Bagian | Fungsi | Hosting |
|--------|--------|---------|
| **Frontend** (tampilan) | Yang dilihat pengunjung | Exabyte Shared Hosting |
| **Backend** (mesin data) | Menyimpan & mengambil data | Render.com (gratis) |

> Klien cukup **upload file ke Exabyte** dan **isi form di Render**. Tidak perlu coding.

---

## Akun yang Harus Disiapkan Dulu

Daftarkan 4 akun berikut sebelum mulai (semua **gratis**):

| No | Layanan | Link Daftar | Fungsi |
|----|---------|-------------|--------|
| 1 | **MongoDB Atlas** | https://cloud.mongodb.com | Database |
| 2 | **Cloudinary** | https://cloudinary.com | Penyimpanan foto |
| 3 | **Render** | https://render.com | Hosting backend |
| 4 | **Gmail** | (sudah punya) | Notifikasi email kontak |

---

## LANGKAH 1 — Install Node.js di Komputer

> Diperlukan untuk build frontend. Cukup sekali.

1. Buka https://nodejs.org
2. Klik tombol **"LTS"** (yang besar di tengah)
3. Download dan install seperti biasa (Next → Next → Finish)
4. Selesai

**Cara cek berhasil:**
- Buka **Command Prompt** (tekan `Win + R`, ketik `cmd`, Enter)
- Ketik: `node -v` → harus muncul angka versi, contoh: `v18.17.0`

---

## LANGKAH 2 — Setup Database (MongoDB Atlas)

1. Login ke https://cloud.mongodb.com
2. Klik **"Build a Database"** → pilih **Free (M0)**
3. Pilih provider: **AWS**, region terdekat (Singapore)
4. Beri nama cluster: `smk-kristen5`
5. Klik **Create**

**Buat username & password database:**
6. Di menu kiri → **Database Access** → **Add New Database User**
7. Isi username: `admin-smk`
8. Isi password: buat password kuat, **simpan di tempat aman**
9. Role: **Atlas Admin** → klik **Add User**

**Izinkan akses dari mana saja:**
10. Di menu kiri → **Network Access** → **Add IP Address**
11. Klik **"Allow Access from Anywhere"** → Confirm

**Ambil Connection String:**
12. Klik **Connect** di cluster → **Connect your application**
13. Copy string yang muncul, contoh:
    ```
    mongodb+srv://admin-smk:<password>@smk-kristen5.xxxxx.mongodb.net/?retryWrites=true&w=majority
    ```
14. Ganti `<password>` dengan password tadi
15. Tambahkan nama database sebelum `?`:
    ```
    mongodb+srv://admin-smk:PASSWORD@smk-kristen5.xxxxx.mongodb.net/smk-kristen5?retryWrites=true&w=majority
    ```
16. **Simpan string ini** — akan dipakai di Langkah 4

---

## LANGKAH 3 — Setup Penyimpanan Foto (Cloudinary)

1. Login ke https://cloudinary.com
2. Masuk ke **Dashboard**
3. Catat 3 informasi berikut (ada di halaman utama dashboard):
   - **Cloud Name** (contoh: `dxyz123abc`)
   - **API Key** (contoh: `123456789012345`)
   - **API Secret** (klik "Reveal" untuk melihat)
4. **Simpan ketiganya** — akan dipakai di Langkah 4

---

## LANGKAH 4 — Setup Backend di Render

1. Login ke https://render.com
2. Klik **"New +"** → **"Web Service"**
3. Pilih **"Deploy an existing image or repository"**

   > **Jika punya GitHub:**
   > Connect GitHub → pilih repository `smk-kristen5-website`

   > **Jika tidak punya GitHub:**
   > Minta developer untuk deploy backend ke Render terlebih dahulu, lalu lanjut ke Langkah 5.

4. Isi pengaturan:
   - **Name:** `smk-kristen5-backend`
   - **Region:** Singapore
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node src/server.js`
   - **Instance Type:** Free

5. Scroll ke bawah → **Environment Variables** → klik **"Add Environment Variable"**

   Tambahkan satu per satu:

   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` |
   | `MONGODB_URI` | *(connection string dari Langkah 2)* |
   | `JWT_SECRET` | *(ketik sembarang 64+ karakter acak)* |
   | `JWT_EXPIRE` | `7d` |
   | `CLOUDINARY_CLOUD_NAME` | *(dari Langkah 3)* |
   | `CLOUDINARY_API_KEY` | *(dari Langkah 3)* |
   | `CLOUDINARY_API_SECRET` | *(dari Langkah 3)* |
   | `EMAIL_HOST` | `smtp.gmail.com` |
   | `EMAIL_PORT` | `587` |
   | `EMAIL_USER` | `email-sekolah@gmail.com` |
   | `EMAIL_PASSWORD` | *(App Password Gmail — lihat catatan di bawah)* |
   | `EMAIL_FROM` | `SMK Kristen 5 Klaten <email-sekolah@gmail.com>` |
   | `FRONTEND_URL` | `https://www.smkkrisma.sch.id` |
   | `BASE_URL` | *(akan diisi nanti setelah dapat URL Render)* |
   | `MAX_IMAGE_SIZE` | `2097152` |

6. Klik **"Create Web Service"**
7. Tunggu hingga status berubah menjadi **"Live"** (5–10 menit)
8. Catat URL backend, contoh: `https://smk-kristen5-backend.onrender.com`
9. Kembali ke **Environment** → update `BASE_URL` dengan URL tersebut

> **Cara buat Gmail App Password:**
> 1. Login Gmail → klik foto profil → **Manage your Google Account**
> 2. Tab **Security** → aktifkan **2-Step Verification** dulu
> 3. Cari **"App passwords"** → buat baru → pilih "Mail" + "Windows Computer"
> 4. Copy 16 karakter yang muncul → gunakan sebagai `EMAIL_PASSWORD`

---

## LANGKAH 5 — Build Frontend

1. Extract file zip yang diterima dari developer
2. Buka folder hasil extract
3. Masuk ke folder **`frontend`**
4. Di dalam folder `frontend`, buat file baru bernama **`.env`** (perhatikan ada titik di depan)
5. Isi file `.env` tersebut dengan:

   ```
   VITE_API_URL=https://smk-kristen5-backend.onrender.com
   VITE_SITE_URL=https://www.smkkrisma.sch.id
   ```

   > Ganti URL Render dengan URL yang didapat di Langkah 4

6. Buka **Command Prompt**, arahkan ke folder `frontend`:
   ```
   cd C:\Users\NamaAnda\Downloads\smk-kristen5-website\frontend
   ```
7. Jalankan perintah berikut satu per satu:
   ```
   npm install
   ```
   *(tunggu hingga selesai, bisa 2–5 menit)*
   ```
   npm run build
   ```
8. Setelah selesai, akan muncul folder baru bernama **`dist`** di dalam folder `frontend`
9. Folder `dist` inilah yang akan di-upload ke Exabyte

---

## LANGKAH 6 — Upload ke Exabyte (cPanel)

1. Login ke cPanel Exabyte
   - Buka: `https://cpanel.smkkrisma.sch.id` atau sesuai informasi dari Exabyte
2. Klik **"File Manager"**
3. Masuk ke folder **`public_html`**
4. Hapus semua file lama di `public_html` (jika ada)
5. Klik **Upload** → upload **semua file di dalam folder `dist`**
   > Pastikan yang diupload adalah **isi** folder `dist`, bukan folder `dist`-nya sendiri
6. Setelah upload selesai, pastikan file `index.html` ada langsung di dalam `public_html`

**Buat file `.htaccess`:**
7. Di `public_html`, klik **"+ File"** → beri nama `.htaccess`
8. Klik kanan `.htaccess` → **Edit**
9. Isi dengan teks berikut:
   ```apache
   Options -MultiViews
   RewriteEngine On
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteRule ^ index.html [QSA,L]
   ```
10. Klik **Save Changes**

---

## LANGKAH 7 — Setting DNS Domain

> Domain `smkkrisma.sch.id` harus diarahkan ke server Exabyte.

### Jika domain dikelola di Exabyte (nameserver sudah ke Exabyte):
DNS sudah otomatis terkonfigurasi. Lanjut ke Langkah 8.

### Jika domain dikelola di registrar lain (PANDI, Niagahoster, dll):

1. Login ke panel registrar domain
2. Cari menu **DNS Management** atau **DNS Records**
3. Ubah/tambahkan record berikut:

   | Type | Host | Value | TTL |
   |------|------|-------|-----|
   | **A** | `@` | *(IP server Exabyte)* | 3600 |
   | **A** | `www` | *(IP server Exabyte)* | 3600 |
   | **CNAME** | `www` | `smkkrisma.sch.id` | 3600 |

   > IP server Exabyte dapat dilihat di cPanel → **Server Information**, atau tanyakan ke support Exabyte

4. Simpan perubahan
5. Tunggu **propagasi DNS** 15 menit – 24 jam

### Cara cek nameserver Exabyte:
- Login cPanel Exabyte → cari **"Server Information"**
- Atau hubungi support Exabyte: https://www.exabyte.id/contact

---

## LANGKAH 8 — Aktifkan SSL (HTTPS)

1. Login cPanel Exabyte
2. Cari **"SSL/TLS"** atau **"Let's Encrypt"**
3. Klik **"Install Certificate"** untuk domain `smkkrisma.sch.id` dan `www.smkkrisma.sch.id`
4. Klik **Issue/Renew**
5. Tunggu beberapa menit hingga SSL aktif

---

## LANGKAH 9 — Buat Akun Admin Website

1. Buka: `https://www.smkkrisma.sch.id`
2. Cek apakah website sudah tampil dengan benar
3. Untuk login admin, buka: `https://www.smkkrisma.sch.id/admin`
4. Gunakan akun admin default (minta ke developer)

---

## Ringkasan Cepat

```
✅ Langkah 1  — Install Node.js
✅ Langkah 2  — Daftar & setup MongoDB Atlas → catat connection string
✅ Langkah 3  — Daftar Cloudinary → catat Cloud Name, API Key, API Secret
✅ Langkah 4  — Deploy backend ke Render → isi env vars → catat URL
✅ Langkah 5  — Buat .env di folder frontend → npm install → npm run build
✅ Langkah 6  — Upload isi folder dist/ ke public_html Exabyte + buat .htaccess
✅ Langkah 7  — Arahkan DNS domain ke IP Exabyte
✅ Langkah 8  — Aktifkan SSL di cPanel
✅ Langkah 9  — Buka website, cek, login admin
```

---

## Bantuan & Kontak Developer

Jika mengalami kendala, hubungi developer dengan menyertakan:
- Screenshot pesan error yang muncul
- Langkah terakhir yang berhasil dilakukan

---

*Dokumen ini dibuat untuk operator SMK Kristen 5 Klaten.*
