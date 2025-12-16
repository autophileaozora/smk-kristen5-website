# Panduan SEO - SMK Kristen 5 Klaten

## 📋 Daftar Isi
1. [Implementasi SEO Yang Sudah Dilakukan](#implementasi-seo-yang-sudah-dilakukan)
2. [Langkah Setup Google Search Console](#langkah-setup-google-search-console)
3. [Langkah Setup Google My Business](#langkah-setup-google-my-business)
4. [Optimasi Konten](#optimasi-konten)
5. [Tips Tambahan](#tips-tambahan)

---

## ✅ Implementasi SEO Yang Sudah Dilakukan

### 1. **Meta Tags & Open Graph**
Sudah ditambahkan komponen `<SEO />` dengan:
- Title tags yang SEO-friendly
- Meta descriptions
- Keywords targeting: "SMK di Klaten", "SMK Kristen 5", "SMK Krisma", "Krisma"
- Open Graph tags untuk social media sharing
- Twitter Card tags
- Geographic tags (Klaten coordinates)

### 2. **Structured Data (JSON-LD)**
Schema.org markup untuk EducationalOrganization sudah ditambahkan:
- Nama sekolah & alternatif (Krisma)
- Alamat & koordinat geografis
- Logo & deskripsi
- Link media sosial

### 3. **robots.txt**
File robots.txt sudah dibuat di `/frontend/public/robots.txt`:
- Allow akses ke semua halaman publik
- Disallow untuk /admin/ dan /login
- Sitemap declaration

### 4. **sitemap.xml**
Sitemap XML sudah dibuat di `/frontend/public/sitemap.xml` dengan prioritas:
- Homepage: Priority 1.0 (tertinggi)
- Jurusan: Priority 0.9
- Artikel: Priority 0.8
- Halaman lain: Priority 0.6-0.7

### 5. **Technical SEO**
- Lazy loading untuk performa
- Responsive design (mobile-friendly)
- Fast loading dengan code splitting
- Canonical URLs
- Language meta tag (Indonesian)

---

## 🔧 Langkah Setup Google Search Console

### Step 1: Verifikasi Domain
1. Buka [Google Search Console](https://search.google.com/search-console)
2. Login dengan Google Account
3. Klik "Add Property"
4. Pilih "Domain" atau "URL prefix"
5. Masukkan domain website Anda
6. Verifikasi dengan salah satu metode:
   - **DNS Verification** (recommended untuk domain)
   - **HTML Tag** (tambahkan meta tag di `index.html`)
   - **HTML File Upload**
   - **Google Analytics**

### Step 2: Submit Sitemap
1. Setelah verifikasi berhasil, buka menu "Sitemaps"
2. Tambahkan URL sitemap: `https://yourdomain.com/sitemap.xml`
3. Klik "Submit"
4. Google akan mulai crawling website Anda

### Step 3: Monitor Performance
1. Buka menu "Performance" untuk melihat:
   - Jumlah klik
   - Impressions
   - CTR (Click-Through Rate)
   - Posisi rata-rata di search results
2. Gunakan filter untuk melihat performa kata kunci spesifik:
   - "SMK di Klaten"
   - "SMK Kristen 5"
   - "SMK Krisma"
   - "Krisma"

### Step 4: Request Indexing
Untuk halaman penting yang baru dibuat:
1. Buka menu "URL Inspection"
2. Masukkan URL halaman
3. Klik "Request Indexing"
4. Google akan prioritas crawl halaman tersebut

---

## 🗺️ Langkah Setup Google My Business

### Step 1: Buat Profil
1. Buka [Google Business Profile](https://www.google.com/business/)
2. Klik "Manage now"
3. Masukkan nama sekolah: **SMK Kristen 5 Klaten**
4. Pilih kategori: **Vocational School** atau **High School**

### Step 2: Verifikasi Lokasi
1. Masukkan alamat lengkap sekolah
2. Tambahkan pin di Google Maps dengan koordinat yang tepat
3. Verifikasi melalui:
   - Postcard (kartu pos dikirim ke alamat)
   - Phone call
   - Email (jika tersedia)

### Step 3: Lengkapi Profil
Isi informasi lengkap:
- **Nama**: SMK Kristen 5 Klaten (Krisma)
- **Kategori**: Vocational School
- **Alamat**: [Alamat lengkap]
- **Phone**: [Nomor telepon]
- **Website**: [URL website]
- **Jam operasional**: Senin-Jumat, 07:00-15:00
- **Deskripsi**: Gunakan keywords "SMK di Klaten", "SMK Krisma"
- **Foto**: Upload foto gedung, fasilitas, kegiatan siswa

### Step 4: Optimasi Google My Business
1. **Upload foto berkualitas tinggi**:
   - Logo sekolah
   - Foto gedung depan
   - Foto kelas & fasilitas
   - Foto kegiatan siswa
   - Foto prestasi

2. **Tambahkan atribut**:
   - Aksesibilitas
   - Fasilitas yang tersedia
   - Program unggulan

3. **Posting secara rutin**:
   - Berita sekolah
   - Event & kegiatan
   - Pengumuman pendaftaran
   - Prestasi siswa

4. **Kumpulkan review**:
   - Minta alumni & orang tua siswa untuk memberikan review
   - Balas semua review (positif maupun negatif)

---

## 📝 Optimasi Konten

### 1. Keyword Strategy
Target utama untuk muncul di halaman pertama Google:

**Primary Keywords** (Target posisi #1):
- SMK di Klaten
- SMK Kristen 5
- SMK Krisma
- Krisma

**Secondary Keywords**:
- SMK terbaik Klaten
- Sekolah kejuruan Klaten
- Pendaftaran SMK Klaten
- Jurusan SMK Klaten
- SMK Kristen Klaten

### 2. Content Optimization

#### Homepage:
✅ Sudah teroptimasi dengan keywords di:
- Title tag
- Meta description
- H1 heading
- Body content
- Alt text images

#### Artikel Blog:
Buat artikel dengan keywords:
- "10 Alasan Memilih SMK di Klaten"
- "Profil Lengkap SMK Krisma"
- "Jurusan Unggulan di SMK Kristen 5 Klaten"
- "Cara Daftar SMK Krisma 2025"
- "Prestasi SMK Krisma dalam Kompetisi Nasional"

#### Jurusan Pages:
Setiap halaman jurusan harus ada:
- Deskripsi lengkap (min 300 kata)
- Keywords natural dalam konten
- Gambar dengan alt text
- Link internal ke halaman terkait

### 3. Local SEO

Tambahkan informasi lokal:
- Alamat lengkap di footer setiap halaman
- Embed Google Maps
- Nomor telepon dengan format Indonesia
- Jam operasional
- Link ke media sosial lokal

---

## 🚀 Tips Tambahan

### 1. Update Domain di Production
Ketika website sudah live dengan domain asli (bukan localhost):

**File yang perlu diupdate:**
1. `frontend/src/components/SEO.jsx`:
   ```javascript
   const siteUrl = 'https://www.smkkrisma.sch.id'; // Ganti dari localhost
   ```

2. `frontend/public/robots.txt`:
   ```
   Sitemap: https://www.smkkrisma.sch.id/sitemap.xml
   ```

3. `frontend/public/sitemap.xml`:
   - Ganti semua `http://localhost:5173` dengan domain production

### 2. Social Media Integration
Pastikan link media sosial aktif di structured data:
- Facebook: https://www.facebook.com/smkkrisma
- Instagram: https://www.instagram.com/smkkrisma
- YouTube: https://www.youtube.com/@smkkrisma

Update di `frontend/src/components/SEO.jsx` dengan URL yang benar.

### 3. Backlinks Strategy
Untuk meningkatkan ranking:
1. **Submit ke direktori sekolah**:
   - Dinas Pendidikan Klaten
   - Dikdasmen Jawa Tengah
   - Direktori sekolah nasional

2. **Partnership**:
   - Link exchange dengan sekolah lain
   - Partnership dengan perusahaan untuk prakerin
   - Kerja sama dengan universitas

3. **Media Coverage**:
   - Kirim press release ke media lokal
   - Liputan kegiatan sekolah
   - Prestasi siswa

### 4. Content Marketing
Rutin posting konten:
- **Minimal 2 artikel/minggu** di blog
- **1 video/bulan** di YouTube
- **3-5 post/minggu** di Instagram & Facebook
- Update prestasi siswa real-time

### 5. Page Speed Optimization
Pastikan website loading cepat:
- ✅ Lazy loading images (sudah diimplementasi)
- ✅ Code splitting (sudah diimplementasi)
- Compress images (gunakan WebP format)
- Enable GZIP compression di server
- Use CDN untuk static assets
- Minify CSS & JS di production

### 6. Mobile-First Approach
- ✅ Responsive design (sudah diimplementasi)
- Test di berbagai device
- Pastikan semua fitur berfungsi di mobile
- Touch-friendly buttons & navigation

### 7. Analytics & Monitoring
Install tools untuk monitoring:

**Google Analytics 4**:
```html
<!-- Tambahkan di frontend/public/index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**Monitor metrics**:
- Page views
- Bounce rate
- Average session duration
- Traffic sources
- Top performing pages

---

## 📊 Expected Timeline

### Week 1-2:
- ✅ Technical SEO setup (DONE)
- Submit ke Google Search Console
- Setup Google My Business
- Submit sitemap

### Week 3-4:
- Google mulai indexing
- Muncul di search results (posisi 20-50)

### Month 2-3:
- Konten optimization
- Backlinks building
- Naik ke posisi 10-20

### Month 4-6:
- Consistent content posting
- Review & testimonial collection
- Target posisi 3-10

### Month 6-12:
- Authority building
- Dominate local search
- **Target: Posisi #1 untuk "SMK di Klaten"**

---

## 🎯 Success Metrics

Track progress dengan KPI:
- **Organic Traffic**: +50% setiap bulan
- **Keyword Ranking**: Top 3 untuk primary keywords
- **Conversion Rate**: 5%+ (pendaftaran dari website)
- **Bounce Rate**: <50%
- **Page Load Time**: <3 seconds

---

## 📞 Support

Jika ada pertanyaan tentang SEO implementation:
1. Cek dokumentasi di file ini
2. Monitor Google Search Console
3. Analisa kompetitor
4. A/B testing untuk optimize

**Good luck! 🚀**

---

*Last updated: December 2024*
