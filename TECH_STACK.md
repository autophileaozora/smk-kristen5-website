# Tech Stack — SMK Kristen 5 Klaten Website

## Frontend

| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| **React** | 18.2 | UI library utama |
| **Vite** | 5.0 | Build tool & dev server |
| **TailwindCSS** | 3.3 | Styling utility-first |
| **React Router DOM** | 6.20 | Client-side routing (SPA) |
| **Axios** | 1.6 | HTTP request ke backend API |
| **Zustand** | 4.4 | State management (auth, global state) |
| **Framer Motion** | 12 | Animasi & transisi halaman |
| **React Quill** | 2.0 | Rich text editor (penulisan artikel) |
| **React Helmet Async** | 2.0 | SEO meta tags & structured data dinamis |
| **Lucide React** | 0.563 | Icon library |
| **UUID** | 13 | Generate ID unik untuk page builder |
| **@tailwindcss/typography** | 0.5 | Styling konten HTML dari Quill editor |

## Backend

| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| **Node.js** | 18+ | JavaScript runtime server |
| **Express** | 4.18 | Web framework & REST API |
| **Mongoose** | 8.0 | ODM (Object Document Mapper) untuk MongoDB |
| **jsonwebtoken** | 9.0 | Autentikasi berbasis JWT token |
| **bcryptjs** | 2.4 | Hash & verifikasi password |
| **Multer** | 1.4 | Handle upload file (multipart/form-data) |
| **Cloudinary SDK** | 1.41 | Upload, simpan & transformasi gambar |
| **Nodemailer** | 6.9 | Kirim email dari form kontak (via Gmail SMTP) |
| **Helmet** | 7.1 | Keamanan HTTP headers |
| **CORS** | 2.8 | Izinkan akses lintas domain dari frontend |
| **express-rate-limit** | 7.1 | Batasi jumlah request (anti spam/brute force) |
| **express-mongo-sanitize** | 2.2 | Cegah serangan NoSQL injection |
| **express-validator** | 7.3 | Validasi & sanitasi input request |
| **Winston** | 3.11 | Logging sistem (error, info, audit) |
| **Mammoth** | 1.6 | Konversi file DOCX/DOC → HTML |
| **dotenv** | 16 | Baca environment variables dari file `.env` |
| **nodemon** | 3.0 | Auto-restart server saat development |

## Database & Storage

| Layanan | Fungsi |
|---------|--------|
| **MongoDB Atlas** | Database cloud NoSQL (document-based) |
| **Cloudinary** | Penyimpanan, kompresi & optimasi gambar/video |

## Deployment

| Bagian | Platform | Keterangan |
|--------|----------|------------|
| **Frontend** | Exabyte Shared Hosting | Upload folder `dist/` ke `public_html/` |
| **Backend** | Render (Web Service) | Free tier, Node.js, auto-deploy dari GitHub |
| **Database** | MongoDB Atlas | Free tier (512MB), cloud |
| **Gambar** | Cloudinary | Free tier (25GB), CDN global |
| **Domain** | smkkrisma.sch.id | DNS diarahkan ke Exabyte |

## Arsitektur

```
Browser
  └── React SPA
        └── Vite build → static files (Exabyte public_html)
              │
              └── Axios → REST API /api/*
                    └── Express (Render)
                          ├── Mongoose → MongoDB Atlas
                          ├── Cloudinary → gambar & video
                          └── Nodemailer → Gmail SMTP
```

## Pola & Konvensi Kode

| Pola | Keterangan |
|------|------------|
| **Singleton model** | `SiteSettings`, `Contact`, `HeroSettings` pakai `getSettings()` static method |
| **JWT Auth** | Middleware `protect` + `isAdministrator` untuk route admin |
| **API prefix** | Semua endpoint di `/api/` |
| **Audit log** | Model `AuditLog` mencatat setiap aksi admin |
| **Lazy loading** | Route React di-load on-demand untuk performa |
| **Structured Data** | JSON-LD Schema.org di setiap halaman publik untuk SEO |
| **Image optimization** | Cloudinary transformasi otomatis: WebP, max-width per konteks, quality auto:good |
| **FormData upload** | Field name wajib `image` untuk semua upload middleware |

## Optimasi Gambar (Cloudinary)

Upload otomatis dikompresi sesuai konteks:

| Konteks | Lebar Maks | Dipakai untuk |
|---------|-----------|---------------|
| `thumbnail` | 400px | Logo partner, foto alumni |
| `medium` | 800px | Gambar artikel, prestasi, ekskul |
| `large` (default) | 1200px | Hero, fasilitas, jurusan, galeri |

Format output: **WebP/AVIF otomatis** (`fetch_format: auto`) — lebih kecil 30–80% dari JPG/PNG.
Batas upload: **2MB** per file.

## Struktur Folder

```
smk-kristen5-website/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── public/        # Halaman publik (Home, Artikel, Jurusan, dll)
│   │   │   └── admin/         # Halaman admin (CMS)
│   │   ├── components/
│   │   │   ├── blocks/        # Komponen page builder
│   │   │   └── SEO.jsx        # Wrapper react-helmet-async
│   │   └── utils/
│   ├── public/
│   │   ├── robots.txt
│   │   └── sitemap.xml        # Static fallback (sitemap dinamis di backend)
│   └── netlify/
│       └── edge-functions/
│           └── og-preview.js  # Bot detection untuk OG meta dinamis
│
└── backend/
    └── src/
        ├── models/            # Mongoose schema
        ├── routes/            # Express router per fitur
        ├── middleware/        # auth, upload, validate
        ├── config/
        │   └── cloudinary.js  # Konfigurasi & uploadImage()
        └── utils/
            └── cloudinaryUpload.js  # uploadToCloudinary() — dipakai mayoritas route
```
