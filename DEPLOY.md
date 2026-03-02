# Panduan Deploy VPS — SMK Kristen 5 Klaten

> **Asumsi:**
> - VPS: Ubuntu 22.04 (Exabyte)
> - Domain: `smkkrisma.sch.id` dan `api.smkkrisma.sch.id`
> - IP VPS: `103.100.200.50` *(ganti dengan IP asli)*
> - Akses SSH: `root@103.100.200.50`

---

## Daftar Isi

1. [Persiapan di Laptop](#1-persiapan-di-laptop)
2. [Setting DNS](#2-setting-dns)
3. [Masuk ke VPS & Setup Awal](#3-masuk-ke-vps--setup-awal)
4. [Install Dependensi](#4-install-dependensi)
5. [Deploy Backend](#5-deploy-backend)
6. [Deploy Frontend](#6-deploy-frontend)
7. [Setup Nginx](#7-setup-nginx)
8. [SSL Gratis dengan Certbot](#8-ssl-gratis-dengan-certbot)
9. [Verifikasi](#9-verifikasi)
10. [Update di Masa Depan](#10-update-di-masa-depan)

---

## 1. Persiapan di Laptop

Sebelum menyentuh server, siapkan semua di laptop terlebih dahulu.

### 1.1 Update file `.env` frontend

Buka file `frontend/.env` dan pastikan isinya:

```env
VITE_API_URL=https://api.smkkrisma.sch.id
VITE_SITE_URL=https://smkkrisma.sch.id
```

### 1.2 Siapkan isi `.env` backend untuk production

Buka file `backend/.env` yang ada di laptop. Catat semua nilainya karena nanti akan diketik ulang di VPS. Pastikan bagian ini sudah benar:

```env
NODE_ENV=production
PORT=5000
BASE_URL=https://api.smkkrisma.sch.id
FRONTEND_URL=https://smkkrisma.sch.id

# Sisanya (MongoDB, Cloudinary, dll) tetap sama dengan yang di lokal
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### 1.3 Build frontend

Buka terminal di folder project, jalankan:

```bash
cd frontend
npm run build
```

Pastikan muncul tulisan `dist/` folder berhasil dibuat. Tidak ada error.

---

## 2. Setting DNS

Langkah ini dilakukan di **dua tempat**: panel Exabyte dan pengelola domain `.sch.id`.

### 2.1 Catat IP VPS

Masuk ke dashboard Exabyte → klik VPS kamu → catat **IP Address**.
Contoh: `103.100.200.50`

### 2.2 Tambah DNS Record di Exabyte

Masuk ke Exabyte → **DNS Manager** → pilih domain `smkkrisma.sch.id` → **Add Record**:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | `@` | `103.100.200.50` | 3600 |
| A | `www` | `103.100.200.50` | 3600 |
| A | `api` | `103.100.200.50` | 3600 |

> `@` artinya domain utama (`smkkrisma.sch.id`)
> `api` artinya subdomain (`api.smkkrisma.sch.id`)

### 2.3 Arahkan domain ke Nameserver Exabyte

Di pengelola domain `.sch.id` (tempat domain terdaftar), ubah **Nameserver** ke:

```
ns1.exabyte.id
ns2.exabyte.id
```

> ⏳ **Tunggu 1–24 jam** untuk propagasi DNS.
> Sambil menunggu, lanjutkan setup VPS di langkah berikutnya.

### 2.4 Cek apakah DNS sudah aktif

Buka situs [dnschecker.org](https://dnschecker.org) → ketik `smkkrisma.sch.id` → cek apakah sudah menunjuk ke IP VPS kamu.

---

## 3. Masuk ke VPS & Setup Awal

### 3.1 Masuk via SSH

Buka terminal di laptop, ketik:

```bash
ssh root@103.100.200.50
```

Masukkan password VPS dari email Exabyte. Kalau berhasil, tampilan berubah jadi:

```
root@vps-exabyte:~#
```

### 3.2 Update sistem

```bash
apt update && apt upgrade -y
```

Tunggu hingga selesai (bisa 2–5 menit).

### 3.3 Buat folder project

```bash
mkdir -p /var/www/smkkrisma/frontend
mkdir -p /var/www/smkkrisma/backend
```

---

## 4. Install Dependensi

### 4.1 Install Node.js 18

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
```

Verifikasi:
```bash
node -v    # harus muncul: v18.x.x
npm -v     # harus muncul: versi npm
```

### 4.2 Install PM2

PM2 adalah process manager — menjaga backend tetap berjalan meski terminal ditutup.

```bash
npm install -g pm2
```

### 4.3 Install Nginx

Nginx adalah web server — mengarahkan request ke frontend atau backend.

```bash
apt install -y nginx
systemctl start nginx
systemctl enable nginx
```

Verifikasi — buka browser, akses `http://103.100.200.50` → harus muncul halaman "Welcome to Nginx".

### 4.4 Install Certbot (untuk SSL/HTTPS)

```bash
apt install -y certbot python3-certbot-nginx
```

---

## 5. Deploy Backend

### 5.1 Upload kode backend dari laptop

Buka terminal **baru di laptop** (jangan tutup SSH), ketik:

```bash
cd d:/smk-kristen5-website

rsync -avz --exclude='node_modules' --exclude='.env' --exclude='logs' \
  backend/ root@103.100.200.50:/var/www/smkkrisma/backend/
```

> `rsync` akan upload semua file backend kecuali `node_modules`, `.env`, dan `logs`.

### 5.2 Kembali ke SSH VPS, install dependencies

```bash
cd /var/www/smkkrisma/backend
npm install --production
```

### 5.3 Buat file `.env` backend di VPS

```bash
nano /var/www/smkkrisma/backend/.env
```

Ketik isi `.env` production (sesuai yang sudah disiapkan di langkah 1.2):

```env
NODE_ENV=production
PORT=5000
BASE_URL=https://api.smkkrisma.sch.id
FRONTEND_URL=https://smkkrisma.sch.id
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smk-kristen5?retryWrites=true&w=majority
JWT_SECRET=isi_dengan_string_acak_panjang_minimal_64_karakter
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=isi_dari_dashboard_cloudinary
CLOUDINARY_API_KEY=isi_dari_dashboard_cloudinary
CLOUDINARY_API_SECRET=isi_dari_dashboard_cloudinary
```

Simpan: tekan **Ctrl+X** → **Y** → **Enter**

### 5.4 Test backend berjalan

```bash
node index.js
```

Harus muncul:
```
✅ Server running in production mode
🚀 Server listening on port 5000
```

Tekan **Ctrl+C** untuk hentikan (ini hanya test).

### 5.5 Jalankan backend dengan PM2

```bash
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup
```

Perintah `pm2 startup` akan menampilkan satu perintah lagi — **copy dan jalankan perintah itu**.

Cek status:
```bash
pm2 status
```

Harus muncul: `smkkrisma-backend | online`

---

## 6. Deploy Frontend

### 6.1 Upload hasil build dari laptop

Di terminal laptop:

```bash
scp -r frontend/dist/* root@103.100.200.50:/var/www/smkkrisma/frontend/
```

### 6.2 Verifikasi file terupload

Di SSH VPS:

```bash
ls /var/www/smkkrisma/frontend/
```

Harus muncul file seperti: `index.html`, `assets/`, dll.

---

## 7. Setup Nginx

### 7.1 Upload config Nginx dari laptop

```bash
scp nginx.conf root@103.100.200.50:/etc/nginx/sites-available/smkkrisma
```

### 7.2 Aktifkan config di VPS

```bash
ln -s /etc/nginx/sites-available/smkkrisma /etc/nginx/sites-enabled/
```

Hapus config default Nginx yang tidak diperlukan:

```bash
rm /etc/nginx/sites-enabled/default
```

Test config:

```bash
nginx -t
```

Harus muncul:
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

Reload Nginx:

```bash
systemctl reload nginx
```

### 7.3 Test (sebelum SSL)

Buka browser → akses `http://smkkrisma.sch.id` → harus muncul website.
Akses `http://api.smkkrisma.sch.id/health` → harus muncul JSON `{"success":true}`.

> Kalau DNS belum propagasi, akses lewat IP dulu: `http://103.100.200.50`

---

## 8. SSL Gratis dengan Certbot

Jalankan satu perintah ini:

```bash
certbot --nginx -d smkkrisma.sch.id -d www.smkkrisma.sch.id -d api.smkkrisma.sch.id
```

Ikuti langkahnya:
1. Masukkan email → Enter
2. Agree to terms → **A** → Enter
3. Share email? → **N** → Enter
4. Redirect HTTP ke HTTPS? → **2** → Enter *(pilih redirect)*

Selesai. Certbot otomatis update config Nginx untuk HTTPS.

Verifikasi:
```bash
nginx -t && systemctl reload nginx
```

---

## 9. Verifikasi

Cek semua sudah berjalan:

| URL | Yang Diharapkan |
|-----|-----------------|
| `https://smkkrisma.sch.id` | Website SMK tampil normal |
| `https://www.smkkrisma.sch.id` | Redirect ke atas |
| `https://api.smkkrisma.sch.id/health` | `{"success":true,"message":"Server is running"}` |
| `https://api.smkkrisma.sch.id/og-image` | Redirect ke gambar logo sekolah |
| `https://api.smkkrisma.sch.id/favicon` | Redirect ke gambar favicon |

Cek PM2 tetap berjalan:
```bash
pm2 status
pm2 logs smkkrisma-backend --lines 20
```

---

## 10. Update di Masa Depan

Kalau ada perubahan kode, cukup jalankan dari laptop:

```bash
# Ganti IP dengan IP VPS asli dulu di deploy.sh
bash deploy.sh
```

Atau manual:

```bash
# Upload backend
rsync -avz --exclude='node_modules' --exclude='.env' --exclude='logs' \
  backend/ root@103.100.200.50:/var/www/smkkrisma/backend/

# SSH ke VPS lalu restart
ssh root@103.100.200.50 "cd /var/www/smkkrisma/backend && npm install --production && pm2 restart smkkrisma-backend"

# Upload frontend (build dulu)
cd frontend && npm run build
scp -r dist/* root@103.100.200.50:/var/www/smkkrisma/frontend/
```

---

## Troubleshooting Cepat

| Masalah | Solusi |
|---------|--------|
| Website tidak muncul | `systemctl status nginx` — cek error |
| API error 502 | `pm2 status` — cek backend online |
| Backend mati | `pm2 restart smkkrisma-backend` |
| SSL expired | `certbot renew` (auto-renew harusnya aktif) |
| Lihat log error backend | `pm2 logs smkkrisma-backend` |
| Nginx tidak reload | `nginx -t` dulu, cek syntax error |

---

*Dibuat untuk deployment SMK Kristen 5 Klaten ke VPS Exabyte.*
