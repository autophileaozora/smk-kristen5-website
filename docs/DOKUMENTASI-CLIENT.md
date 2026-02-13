# Dokumentasi Website SMK Kristen 5 Klaten

> Panduan lengkap penggunaan dan pengelolaan website sekolah

---

## Daftar Isi

1. [Panduan Umum](#1-panduan-umum)
2. [Panduan Admin Panel](#2-panduan-admin-panel)
3. [Panduan Konten Homepage](#3-panduan-konten-homepage)
4. [Panduan SEO](#4-panduan-seo)
5. [Panduan Upload Media](#5-panduan-upload-media)
6. [Fitur Website Publik](#6-fitur-website-publik)
7. [Spesifikasi Teknis](#7-spesifikasi-teknis)
8. [FAQ & Troubleshooting](#8-faq--troubleshooting)
9. [Keyboard Shortcuts](#9-keyboard-shortcuts)
10. [Changelog](#10-changelog)

---

## 1. Panduan Umum

### 1.1 Tentang Website

Website SMK Kristen 5 Klaten (KRISMA) adalah platform digital sekolah yang terdiri dari:
- **Website Publik** — Halaman yang bisa diakses semua pengunjung (homepage, jurusan, artikel, kontak, dll)
- **Admin Panel** — Dashboard pengelolaan konten yang hanya bisa diakses admin dan staff

### 1.2 Cara Login

1. Buka halaman `/login`
2. Masukkan **email** dan **password** yang telah didaftarkan
3. Klik tombol **Masuk**
4. Anda akan diarahkan ke Admin Dashboard

### 1.3 Peran Pengguna

| Peran | Akses |
|-------|-------|
| **Administrator** | Akses penuh ke semua fitur admin panel (9 menu) |
| **Staff** | Hanya bisa menulis artikel sendiri (menu: Dashboard, Artikel Saya) |

### 1.4 Navigasi Admin Panel

Admin panel memiliki **9 menu utama**:

| # | Menu | Deskripsi |
|---|------|-----------|
| 1 | Dashboard | Statistik dan ringkasan aktivitas |
| 2 | Artikel | Manajemen artikel dan kategori |
| 3 | Halaman Kustom | Buat halaman dinamis dengan page builder |
| 4 | Jurusan & Mapel | Kelola program keahlian dan mata pelajaran |
| 5 | Kesiswaan | Ekskul, prestasi, alumni, dan fasilitas |
| 6 | Kegiatan & Agenda | Kegiatan sekolah dan agenda acara |
| 7 | Homepage | Kelola konten halaman utama |
| 8 | Pengaturan | Konfigurasi website dan informasi sekolah |
| 9 | User & Log | Manajemen pengguna dan audit aktivitas |

---

## 2. Panduan Admin Panel

### 2.1 Dashboard

Dashboard menampilkan ringkasan data website secara real-time.

**Statistik yang ditampilkan:**
- Total Pengguna (admin only)
- Total Artikel (termasuk jumlah draft)
- Total Prestasi
- Total Alumni
- Jumlah Jurusan
- Jumlah Ekskul (aktif dari total)
- Video Hero (aktif dari maksimal 3)
- Running Text (aktif)

**Aktivitas Terbaru:**
- 5 aktivitas terakhir ditampilkan dengan timestamp relatif
- Bisa difilter berdasarkan tipe (artikel, prestasi, alumni)

**Tombol Aksi Cepat:**
- Buat Artikel — Langsung ke form pembuatan artikel
- Buat Halaman — Langsung ke page builder
- Lihat Website — Buka website publik di tab baru

---

### 2.2 Artikel

**Route:** `/admin/articles`

Menu ini memiliki **2 tab**:

#### Tab: Semua Artikel
Mengelola semua artikel/berita yang dipublikasikan di website.

**Fitur:**
- Tabel daftar artikel dengan judul, kategori, status, tanggal
- Filter berdasarkan status (Draft, Pending, Published, Rejected)
- Pencarian artikel
- Buat artikel baru
- Edit dan hapus artikel
- Approve/reject artikel (untuk admin)

**Status Artikel:**
| Status | Keterangan |
|--------|-----------|
| Draft | Masih dalam proses penulisan |
| Pending | Menunggu persetujuan admin |
| Published | Sudah dipublikasikan |
| Rejected | Ditolak oleh admin (dengan alasan) |

**Cara Membuat Artikel:**
1. Klik tombol **Buat Artikel**
2. Isi judul artikel
3. Pilih kategori Jurusan (opsional) dan/atau kategori Topik (opsional)
4. Upload gambar utama (featured image)
5. Tulis konten menggunakan rich text editor
6. Tambahkan tags jika diperlukan
7. Pilih status: **Draft** (simpan dulu) atau **Publish** (langsung terbit)
8. Klik **Simpan**

> **Tips:** Slug URL artikel otomatis dibuat dari judul. Ringkasan (excerpt) otomatis diambil dari 300 karakter pertama konten.

#### Tab: Kategori
Mengelola kategori topik untuk artikel.

**Fitur:**
- Tambah kategori baru (nama)
- Edit nama kategori
- Hapus kategori (jika tidak ada artikel terkait)

---

### 2.3 Halaman Kustom

**Route:** `/admin/custom-pages`

Fitur page builder untuk membuat halaman dinamis tanpa coding.

**Fitur:**
- Buat halaman baru dengan drag-and-drop block editor
- Edit halaman yang sudah ada
- Publish/unpublish halaman
- URL halaman otomatis: `/page/[slug]`

**Jenis Block yang Tersedia:**
- Teks (heading, paragraf, list)
- Gambar (single, gallery, grid)
- Video (embed YouTube/video)
- Kolom (layout multi-kolom)
- Tombol (button/CTA)
- Spacer (jarak antar elemen)
- Dan lainnya

**Cara Membuat Halaman:**
1. Klik **Buat Halaman Baru**
2. Editor akan terbuka dalam mode full-screen
3. Isi judul halaman
4. Tambahkan block-block sesuai kebutuhan
5. Atur urutan block dengan drag-and-drop
6. Preview halaman
7. Klik **Publish** untuk menerbitkan

---

### 2.4 Jurusan & Mapel

**Route:** `/admin/akademik`

Menu ini memiliki **2 tab**:

#### Tab: Jurusan
Mengelola program keahlian/kompetensi sekolah.

**Informasi per Jurusan:**
- Nama dan kode jurusan (contoh: TKJ, TKRO, TBSM, AKL, MPLB)
- Deskripsi singkat dan deskripsi lengkap
- Visi dan Misi jurusan
- Kepala Program (nama)
- Logo dan gambar latar
- Kompetensi keahlian
- Prospek karir
- Galeri foto
- Layout kustom (menggunakan page builder)

**Fitur Tambahan:**
- Setiap jurusan punya halaman detail sendiri di `/jurusan/[slug]`
- Bisa mengatur urutan tampilan (display order)
- Status aktif/nonaktif

#### Tab: Mata Pelajaran
Mengelola daftar mata pelajaran per jurusan.

**Informasi per Mata Pelajaran:**
- Nama mata pelajaran
- Deskripsi
- Semester (1-6)
- Jam per minggu
- Kategori

---

### 2.5 Kesiswaan

**Route:** `/admin/kesiswaan`

Menu ini memiliki **4 tab**:

#### Tab: Ekskul
Mengelola ekstrakurikuler sekolah.

**Informasi per Ekskul:**
- Nama ekskul
- Deskripsi
- Gambar/foto
- Jadwal kegiatan
- Pembina
- Status aktif/nonaktif

#### Tab: Prestasi
Mengelola prestasi dan penghargaan siswa/sekolah.

**Informasi per Prestasi:**
- Judul prestasi
- Deskripsi
- Tingkat (Kabupaten/Kota/Provinsi/Nasional/Internasional)
- Nama event/lomba
- Gambar/foto
- Tanggal
- Status aktif/nonaktif

#### Tab: Alumni
Mengelola data dan testimoni alumni.

**Informasi per Alumni:**
- Nama alumni
- Foto
- Tahun lulus
- Jurusan saat sekolah
- Pekerjaan/profesi saat ini
- Perusahaan/tempat kerja
- Testimoni
- Status published/draft

#### Tab: Fasilitas
Mengelola fasilitas sekolah.

**Informasi per Fasilitas:**
- Nama fasilitas
- Deskripsi
- Gambar/foto
- Kategori (Akademik, Olahraga, dll)
- Lokasi
- Kapasitas

---

### 2.6 Kegiatan & Agenda

**Route:** `/admin/kegiatan`

Menu ini memiliki **2 tab**:

#### Tab: Kegiatan
Mengelola kegiatan/aktivitas sekolah yang ditampilkan di homepage.

**Informasi per Kegiatan:**
- Judul kegiatan
- Deskripsi
- Gambar-gambar (carousel)
- Kategori tab (BELAJAR, BERAKSI, BERPENGALAMAN)
- Urutan tampil

#### Tab: Agenda
Mengelola jadwal acara/event sekolah.

**Informasi per Agenda:**
- Judul acara
- Deskripsi
- Tanggal dan waktu mulai
- Tanggal dan waktu selesai
- Lokasi
- Kategori (Akademik, Non Akademik)
- Status

---

### 2.7 Homepage

**Route:** `/admin/homepage`

Menu ini memiliki **5 tab** untuk mengelola konten halaman utama:

#### Tab: Hero Slides
Mengelola carousel/slider gambar di bagian atas homepage.

**Informasi per Slide:**
- Gambar slide
- Judul (heading)
- Subtitle/deskripsi
- Tombol CTA (teks dan URL)
- Urutan tampil
- Status aktif/nonaktif

#### Tab: Video Hero
Mengelola video di seksi hero homepage.

**Informasi per Video:**
- URL video (YouTube embed)
- Judul
- Thumbnail
- Status aktif/nonaktif
- Maksimal 3 video aktif

#### Tab: CTA (Call-to-Action)
Mengelola bagian ajakan bertindak di homepage.

**Informasi:**
- Judul CTA
- Deskripsi
- Gambar latar
- Tombol primer (teks dan URL) — contoh: "DAFTAR SEKARANG"
- Tombol sekunder (teks dan URL) — contoh: "LAYANAN INFORMASI"

#### Tab: Partner
Mengelola logo perusahaan/organisasi mitra.

**Informasi per Partner:**
- Nama partner
- Logo (gambar)
- URL website (opsional)
- Urutan tampil

#### Tab: Running Text
Mengelola teks berjalan (marquee) di homepage.

**Informasi per Running Text:**
- Teks pengumuman
- Status aktif/nonaktif
- Urutan tampil

---

### 2.8 Pengaturan

**Route:** `/admin/pengaturan`

Menu ini memiliki **5 tab**:

#### Tab: Website
Pengaturan umum website.

**Sub-tab di dalamnya:**
- **Umum** — Nama situs, tagline, logo, logo terang
- **Beranda** — Teks-teks di setiap seksi homepage (Why Section, Accelerate, Testimonials, News, Events)
- **Kontak** — Email, telepon, WhatsApp, alamat
- **SEO** — Meta title, meta description, meta keywords, Google Analytics ID
- **Footer** — Teks footer, deskripsi footer

> **Penting:** Perubahan di tab Website langsung mempengaruhi seluruh website. Pastikan data sudah benar sebelum menyimpan.

#### Tab: Info Sekolah
Mengelola informasi tentang sekolah.

**Sub-tab di dalamnya:**
- **Tentang** — Sejarah sekolah, visi & misi, sambutan kepala sekolah
- **Kontak** — Alamat, telepon, email, WhatsApp, jam operasional, peta Google Maps, sosial media, foto hero, logo sekolah, info kepala sekolah

#### Tab: Navbar
Mengelola menu navigasi website publik.

**Fitur:**
- Tambah/edit/hapus item menu
- Atur urutan menu (drag-and-drop)
- Menu dropdown (sub-menu)
- URL internal atau eksternal

#### Tab: Footer
Mengelola konten footer website publik.

**Fitur:**
- Kolom-kolom footer
- Link-link di setiap kolom
- Informasi kontak di footer
- Copyright text

#### Tab: Sosial Media
Mengelola link sosial media yang ditampilkan di website.

**Platform yang didukung:**
- Instagram
- Facebook
- YouTube
- Twitter/X
- TikTok
- Dan lainnya

---

### 2.9 User & Log

**Route:** `/admin/sistem`

Menu ini memiliki **2 tab**:

#### Tab: Manajemen User
Mengelola akun pengguna admin panel.

**Fitur:**
- Daftar semua pengguna
- Tambah pengguna baru (nama, email, password, role)
- Edit data pengguna
- Nonaktifkan/hapus pengguna
- Reset password

**Role yang tersedia:**
- Administrator — Akses penuh
- Staff — Hanya bisa menulis artikel

#### Tab: Audit Log
Melihat riwayat aktivitas admin panel.

**Informasi yang tercatat:**
- Siapa yang melakukan aksi
- Jenis aksi (create, update, delete)
- Target aksi (artikel, jurusan, pengguna, dll)
- Waktu aksi
- Detail perubahan

> **Tips:** Audit log berguna untuk melacak siapa yang mengubah konten terakhir kali, terutama jika ada beberapa admin.

---

## 3. Panduan Konten Homepage

Homepage website terdiri dari beberapa seksi yang bisa dikelola melalui admin panel:

### 3.1 Struktur Homepage

Dari atas ke bawah, homepage menampilkan:

| # | Seksi | Sumber Data | Cara Mengelola |
|---|-------|------------|----------------|
| 1 | Running Text | Running Text | Homepage → Running Text |
| 2 | Hero Slider | Hero Slides | Homepage → Hero Slides |
| 3 | Why Choose Us | SiteSettings + Partner + Statistik | Pengaturan → Website → Beranda |
| 4 | Accelerate | SiteSettings + Mascot 3D | Pengaturan → Website → Beranda |
| 5 | Program Keahlian | Jurusan | Jurusan & Mapel → Jurusan |
| 6 | Kegiatan | Activities | Kegiatan & Agenda → Kegiatan |
| 7 | Testimoni Alumni | Alumni | Kesiswaan → Alumni |
| 8 | Berita | Artikel | Artikel → Semua Artikel |
| 9 | Agenda Acara | Events | Kegiatan & Agenda → Agenda |
| 10 | CTA | CTA | Homepage → CTA |

### 3.2 Mengubah Teks Homepage

Untuk mengubah teks-teks di homepage (judul seksi, deskripsi, tombol):

1. Buka **Pengaturan** → tab **Website**
2. Klik sub-tab **Beranda**
3. Edit teks yang diinginkan:
   - **Why Section** — Judul, heading, deskripsi, teks tombol
   - **Tahun Berdiri** — Digunakan untuk menghitung "XX Tahun Melayani" secara otomatis
   - **Accelerate** — Judul dan deskripsi
   - **Testimoni** — Judul, deskripsi, teks tombol
   - **Berita** — Judul "Top 5 Berita" dan "Berita Utama"
   - **Agenda** — Judul, deskripsi, teks tombol
4. Klik **Simpan**

### 3.3 Mengubah Hero Slider

1. Buka **Homepage** → tab **Hero Slides**
2. Untuk menambah slide: klik **Tambah Slide**
3. Upload gambar, isi judul dan subtitle
4. Atur urutan slide
5. Aktifkan/nonaktifkan slide sesuai kebutuhan

### 3.4 Mengubah Partner/Mitra

1. Buka **Homepage** → tab **Partner**
2. Klik **Tambah Partner**
3. Upload logo partner
4. Isi nama dan URL website (opsional)
5. Simpan

### 3.5 Mengubah CTA

1. Buka **Homepage** → tab **CTA**
2. Edit judul, deskripsi, dan gambar latar
3. Atur tombol primer dan sekunder (teks dan URL)
4. Simpan

---

## 4. Panduan SEO

### 4.1 Pengaturan SEO Dasar

1. Buka **Pengaturan** → tab **Website** → sub-tab **SEO**
2. Isi field berikut:
   - **Meta Title** — Judul yang tampil di tab browser dan hasil pencarian Google (maks 60 karakter)
   - **Meta Description** — Deskripsi singkat di hasil pencarian Google (maks 160 karakter)
   - **Meta Keywords** — Kata kunci utama, dipisah koma
   - **Google Analytics ID** — ID tracking Google Analytics (format: G-XXXXXXXXXX)

### 4.2 SEO untuk Artikel

Setiap artikel yang dipublish otomatis memiliki:
- URL SEO-friendly dari judul (slug)
- Meta description dari excerpt (300 karakter pertama)
- Gambar featured image untuk social sharing

**Tips Menulis Artikel SEO-Friendly:**
- Gunakan judul yang mengandung kata kunci utama
- Tulis paragraf pembuka yang menjelaskan inti artikel
- Gunakan heading (H2, H3) untuk struktur konten
- Sertakan gambar dengan deskripsi
- Panjang minimal 500 kata untuk artikel informatif

### 4.3 SEO untuk Jurusan

Setiap halaman jurusan memiliki URL sendiri (`/jurusan/[slug]`) yang bisa diindeks Google. Pastikan:
- Deskripsi jurusan lengkap dan informatif
- Gambar jurusan memiliki kualitas baik
- Kompetensi dan prospek karir diisi lengkap

---

## 5. Panduan Upload Media

### 5.1 Format yang Didukung

| Tipe | Format | Ukuran Maks |
|------|--------|-------------|
| Gambar | JPG, PNG, WebP, GIF | 5 MB |

### 5.2 Rekomendasi Ukuran Gambar

| Penggunaan | Ukuran Rekomendasi | Rasio |
|------------|-------------------|-------|
| Hero Slide | 1920 x 800 px | 12:5 |
| Featured Image Artikel | 1200 x 630 px | ~2:1 |
| Logo Partner | 200 x 100 px | 2:1 |
| Foto Alumni | 400 x 400 px | 1:1 |
| Gambar Jurusan | 800 x 600 px | 4:3 |
| Gambar Fasilitas | 800 x 600 px | 4:3 |
| Gambar Ekskul | 800 x 600 px | 4:3 |
| Logo Sekolah | 200 x 200 px | 1:1 |

### 5.3 Penyimpanan Gambar

Semua gambar disimpan di **Cloudinary** (layanan cloud storage). Keuntungan:
- Gambar otomatis dioptimasi untuk kecepatan loading
- Tersedia di CDN global (loading cepat dari mana saja)
- Tidak membebani server hosting

### 5.4 Cara Upload Gambar

1. Klik tombol upload/area upload pada form yang tersedia
2. Pilih file gambar dari komputer
3. Tunggu proses upload selesai (indikator loading)
4. Gambar akan tampil sebagai preview
5. Simpan form

> **Tips:** Kompres gambar sebelum upload menggunakan tools seperti [TinyPNG](https://tinypng.com) atau [Squoosh](https://squoosh.app) untuk hasil optimal.

---

## 6. Fitur Website Publik

### 6.1 Halaman yang Tersedia

| Halaman | URL | Deskripsi |
|---------|-----|-----------|
| Homepage | `/` | Halaman utama dengan semua seksi |
| Jurusan | `/jurusan` | Daftar program keahlian (tampilan accordion horizontal) |
| Detail Jurusan | `/jurusan/[slug]` | Detail lengkap per jurusan (5 tab) |
| Artikel | `/artikel` | Daftar artikel dengan filter dan pencarian |
| Detail Artikel | `/artikel/[slug]` | Baca artikel lengkap |
| Kontak | `/kontak` | Informasi kontak dan formulir pesan |
| Tentang | `/tentang` | Sejarah, Visi Misi, Sambutan (tabbed) |
| Sejarah | `/sejarah` | Halaman sejarah sekolah |
| Visi Misi | `/visi-misi` | Halaman visi dan misi |
| Sambutan | `/sambutan` | Sambutan kepala sekolah |
| Fasilitas | `/fasilitas` | Daftar fasilitas sekolah |
| Pencarian | `/search` | Pencarian global semua konten |
| Halaman Kustom | `/page/[slug]` | Halaman dinamis dari page builder |

### 6.2 Fitur Interaktif

**Pencarian Global:**
- Cari semua konten (jurusan, artikel, ekskul, fasilitas, prestasi, alumni, agenda)
- Hasil muncul real-time saat mengetik
- Kata kunci yang disarankan tersedia

**Carousel & Slider:**
- Hero slider dengan auto-rotate
- Carousel kegiatan dengan navigasi dot
- Carousel alumni testimoni
- Semua carousel mendukung swipe/sentuh di mobile

**Filter Artikel:**
- Filter berdasarkan periode waktu (7 hari, 30 hari, 90 hari, 1 tahun)
- Filter berdasarkan kategori jurusan
- Filter berdasarkan kategori topik
- Pencarian teks

**Halaman Jurusan Detail:**
- 5 tab: Informasi, Mata Pelajaran, Fasilitas, Prestasi, Galeri
- Sidebar dengan artikel terkait dan testimoni alumni

**Formulir Kontak:**
- Validasi real-time
- Notifikasi sukses/error

**Sharing Artikel:**
- Bagikan via Instagram, Facebook, WhatsApp
- Salin link artikel

### 6.3 Responsif Mobile

Website otomatis menyesuaikan tampilan untuk semua ukuran layar:
- **Desktop** (> 1024px) — Layout penuh dengan sidebar
- **Tablet** (768px - 1024px) — Layout menyesuaikan
- **Mobile** (< 768px) — Layout satu kolom, menu hamburger

---

## 7. Spesifikasi Teknis

### 7.1 Teknologi yang Digunakan

| Komponen | Teknologi |
|----------|-----------|
| Frontend | React 18 + Vite + TailwindCSS |
| Backend | Node.js + Express.js |
| Database | MongoDB (via Mongoose ODM) |
| Penyimpanan Gambar | Cloudinary |
| Routing | React Router v6 |
| Rich Text Editor | React Quill |
| Ikon | Lucide React |
| SEO | React Helmet Async |

### 7.2 Arsitektur

```
Browser (Pengunjung/Admin)
    ↓
Frontend (React SPA) — Port 5173 (dev)
    ↓
Backend API (Express) — Port 5000 (dev)
    ↓
MongoDB (Database) + Cloudinary (Gambar)
```

### 7.3 API Endpoints

Website memiliki 28 endpoint API:

| Endpoint | Fungsi |
|----------|--------|
| `/api/auth` | Login, register, logout |
| `/api/users` | Manajemen pengguna |
| `/api/articles` | CRUD artikel |
| `/api/categories` | CRUD kategori |
| `/api/jurusan` | CRUD jurusan |
| `/api/mata-pelajaran` | CRUD mata pelajaran |
| `/api/ekskul` | CRUD ekstrakurikuler |
| `/api/prestasi` | CRUD prestasi |
| `/api/alumni` | CRUD alumni |
| `/api/fasilitas` | CRUD fasilitas |
| `/api/activities` | CRUD kegiatan |
| `/api/events` | CRUD agenda |
| `/api/hero-slides` | CRUD hero slider |
| `/api/video-hero` | CRUD video hero |
| `/api/cta` | CRUD call-to-action |
| `/api/partners` | CRUD partner |
| `/api/running-text` | CRUD running text |
| `/api/site-settings` | Pengaturan website |
| `/api/contact` | Info kontak |
| `/api/about` | Info sekolah |
| `/api/navbar` | Menu navigasi |
| `/api/footer` | Konten footer |
| `/api/social-media` | Link sosial media |
| `/api/custom-pages` | Halaman kustom |
| `/api/upload` | Upload gambar |
| `/api/dashboard` | Statistik dashboard |
| `/api/audit-logs` | Log audit |
| `/api/homepage` | Data homepage gabungan (optimized) |

### 7.4 Optimasi Performa

- **Combined API Endpoint** — Homepage memuat semua data dalam 1 request (bukan 17 terpisah)
- **Lazy Loading** — Halaman admin dimuat secara dinamis saat dibutuhkan
- **Image Lazy Loading** — Gambar di bawah fold dimuat saat mendekati viewport
- **Cloudinary CDN** — Gambar disajikan dari server terdekat
- **Preconnect** — Koneksi ke Cloudinary dibuka lebih awal

---

## 8. FAQ & Troubleshooting

### Umum

**Q: Lupa password admin?**
A: Minta administrator lain untuk mereset password Anda melalui menu **User & Log** → **Manajemen User**.

**Q: Gambar tidak muncul setelah upload?**
A: Pastikan:
1. Format gambar sesuai (JPG, PNG, WebP)
2. Ukuran file tidak melebihi 5 MB
3. Koneksi internet stabil saat upload
4. Tunggu hingga proses upload selesai (loading indicator hilang)

**Q: Artikel sudah dipublish tapi tidak muncul di website?**
A: Periksa:
1. Status artikel harus **Published** (bukan Draft atau Pending)
2. Refresh halaman website (Ctrl+F5)
3. Artikel terbaru muncul di halaman `/artikel`

**Q: Perubahan di admin tidak langsung terlihat di website?**
A: Bersihkan cache browser dengan Ctrl+F5 atau buka di mode Incognito untuk melihat perubahan terbaru.

### Editor & Konten

**Q: Format teks hilang saat paste dari Word?**
A: Gunakan **Ctrl+Shift+V** (Paste tanpa format) untuk menghindari format Word yang tidak kompatibel, lalu format ulang menggunakan toolbar editor.

**Q: Bagaimana menambahkan link di artikel?**
A: Di rich text editor, seleksi teks yang ingin dijadikan link, klik ikon link di toolbar, masukkan URL.

**Q: Bagaimana mengatur urutan item (slide, partner, dll)?**
A: Setiap item memiliki field "urutan" atau bisa diatur melalui drag-and-drop (jika tersedia). Angka lebih kecil = tampil lebih dulu.

### Halaman Kustom

**Q: Halaman kustom tidak muncul di navigasi?**
A: Halaman kustom harus ditambahkan secara manual ke navbar. Buka **Pengaturan** → **Navbar**, tambahkan menu baru dengan URL `/page/[slug-halaman]`.

**Q: Bisa buat halaman kustom untuk jurusan?**
A: Ya! Di halaman edit jurusan, ada opsi untuk menggunakan layout kustom (page builder). Klik "Edit Layout" pada jurusan yang diinginkan.

### Teknis

**Q: Website lambat loadingnya?**
A: Kemungkinan penyebab:
1. Gambar terlalu besar — kompres sebelum upload
2. Terlalu banyak hero slide aktif — batasi 3-5 slide
3. Koneksi internet pengunjung lambat

**Q: Error 404 saat akses halaman admin?**
A: Pastikan URL benar. Semua halaman admin diawali `/admin/`. Jika masih error, coba login ulang.

**Q: Bagaimana backup data?**
A: Data tersimpan di MongoDB cloud dan gambar di Cloudinary. Kedua layanan memiliki mekanisme backup sendiri. Untuk backup manual, hubungi developer.

---

## 9. Keyboard Shortcuts

### Admin Panel

| Shortcut | Fungsi |
|----------|--------|
| `Ctrl + K` | Buka Command Palette (pencarian cepat) |
| `↑` `↓` | Navigasi item di Command Palette |
| `Enter` | Pilih item di Command Palette |
| `Esc` | Tutup Command Palette / modal |

### Command Palette

Tekan `Ctrl + K` untuk membuka command palette, lalu ketik untuk mencari:

| Ketik | Navigasi ke |
|-------|------------|
| "Dashboard" | Dashboard |
| "Artikel" | Halaman artikel |
| "Kategori" | Tab kategori di halaman artikel |
| "Halaman" / "Custom" | Halaman kustom |
| "Jurusan" | Tab jurusan di halaman akademik |
| "Mata Pelajaran" / "Mapel" | Tab mata pelajaran |
| "Ekskul" | Tab ekskul di halaman kesiswaan |
| "Prestasi" | Tab prestasi |
| "Alumni" | Tab alumni |
| "Fasilitas" | Tab fasilitas |
| "Kegiatan" | Tab kegiatan |
| "Agenda" | Tab agenda |
| "Hero" | Tab hero slides di halaman homepage |
| "Video" | Tab video hero |
| "CTA" | Tab CTA |
| "Partner" | Tab partner |
| "Running Text" | Tab running text |
| "Pengaturan" / "Settings" | Pengaturan website |
| "Info Sekolah" | Info sekolah |
| "Navbar" | Pengaturan navbar |
| "Footer" | Pengaturan footer |
| "Sosial Media" | Pengaturan sosial media |
| "User" | Manajemen user |
| "Audit" / "Log" | Audit log |
| "Buat Artikel" | Form artikel baru |
| "Buat Halaman" | Page builder baru |
| "Lihat Website" | Buka website publik |

### Rich Text Editor (Artikel)

| Shortcut | Fungsi |
|----------|--------|
| `Ctrl + B` | Bold (tebal) |
| `Ctrl + I` | Italic (miring) |
| `Ctrl + U` | Underline (garis bawah) |
| `Ctrl + Z` | Undo (batalkan) |
| `Ctrl + Y` | Redo (ulangi) |
| `Ctrl + Shift + V` | Paste tanpa format |

---

## 10. Changelog

### Versi Terkini (Februari 2026)

**Fitur Baru:**
- Reorganisasi admin panel dari 22 menu menjadi 9 menu dengan sistem tab
- Command Palette (Ctrl+K) untuk navigasi cepat
- Combined homepage API endpoint (loading 2-3x lebih cepat)
- Touch/swipe support untuk semua carousel
- Halaman pencarian global
- Page builder untuk halaman kustom dan layout jurusan
- Audit log untuk melacak aktivitas admin
- Lazy loading gambar untuk performa lebih baik

**Peningkatan:**
- Optimasi performa homepage (17 API → 1 API)
- Tampilan admin panel lebih rapi dan terorganisir
- Sidebar yang lebih bersih dan mudah dinavigasi
- Responsive design yang lebih baik di semua perangkat

---

> **Butuh bantuan?** Hubungi developer untuk pertanyaan teknis atau masalah yang tidak tercakup dalam dokumentasi ini.
