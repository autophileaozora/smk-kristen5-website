# Image Optimization Guide - SMK Kristen 5 Klaten

## ✅ Apa yang Sudah Diimplementasikan

### 1. **Lazy Loading**
Semua gambar sudah menggunakan `loading="lazy"` attribute:
- ✅ Gambar kepala sekolah
- ✅ Gambar artikel
- ✅ Gambar prestasi
- ✅ Foto alumni
- ✅ Logo partners
- ✅ Gambar di modal

**Manfaat:**
- Gambar hanya dimuat saat hampir terlihat di viewport
- Menghemat bandwidth
- Mempercepat initial page load
- Meningkatkan Google PageSpeed score

### 2. **SEO-Optimized Alt Text**
Semua gambar sudah memiliki alt text yang SEO-friendly dengan keywords:

**Format Alt Text:**
```html
<!-- Logo -->
<img alt="Logo SMK Kristen 5 Klaten - SMK Krisma" />

<!-- Kepala Sekolah -->
<img alt="[Nama] - Kepala Sekolah SMK Kristen 5 Klaten" />

<!-- Artikel -->
<img alt="[Judul Artikel] - SMK Krisma Klaten" />

<!-- Prestasi -->
<img alt="[Judul Prestasi] - Prestasi SMK Kristen 5 Klaten" />

<!-- Alumni -->
<img alt="[Nama] - Alumni SMK Krisma Klaten" />

<!-- Partners -->
<img alt="Logo [Nama Partner] - Partner SMK Kristen 5 Klaten" />
```

**Keywords yang digunakan:**
- SMK Kristen 5 Klaten
- SMK Krisma
- Krisma Klaten

### 3. **LazyImage Component**
Komponen custom `<LazyImage />` telah dibuat di [LazyImage.jsx](frontend/src/components/LazyImage.jsx):
- Menggunakan Intersection Observer API
- Progressive loading dengan fade-in effect
- Fallback placeholder saat loading
- Automatic disconnect setelah loaded

**Cara Menggunakan:**
```jsx
import LazyImage from '../components/LazyImage';

<LazyImage
  src="/path/to/image.jpg"
  alt="Deskripsi SEO-friendly"
  className="w-full h-full object-cover"
/>
```

---

## 🚀 Rekomendasi untuk Production

### 1. **Compress Images**

Sebelum upload ke Cloudinary atau server, compress images:

**Tools Recommended:**
- **TinyPNG/TinyJPG**: https://tinypng.com/
- **Squoosh**: https://squoosh.app/
- **ImageOptim** (Mac)
- **GIMP** (Free, cross-platform)

**Target Size:**
- Logo: < 50 KB
- Foto kepala sekolah: < 200 KB
- Gambar artikel: < 300 KB
- Hero images: < 500 KB
- Gambar prestasi: < 300 KB

### 2. **Use Modern Image Formats**

**WebP Format** (Google recommended):
- 25-35% lebih kecil dari JPEG
- Kualitas sama atau lebih baik
- Support di semua modern browsers

**Cloudinary Auto-Format:**
```javascript
// Update Cloudinary upload config di backend
cloudinary.uploader.upload(file, {
  quality: 'auto',
  fetch_format: 'auto', // Auto convert to WebP
  width: 1200,
  crop: 'limit'
});
```

**HTML Implementation:**
```html
<picture>
  <source srcset="image.webp" type="image/webp" />
  <source srcset="image.jpg" type="image/jpeg" />
  <img src="image.jpg" alt="SEO-friendly description" />
</picture>
```

### 3. **Responsive Images**

Gunakan srcset untuk berbagai ukuran layar:

```html
<img
  src="image-800.jpg"
  srcset="
    image-400.jpg 400w,
    image-800.jpg 800w,
    image-1200.jpg 1200w
  "
  sizes="(max-width: 600px) 400px, (max-width: 900px) 800px, 1200px"
  alt="Deskripsi SEO"
  loading="lazy"
/>
```

### 4. **Image CDN Configuration**

**Cloudinary Optimization Parameters:**
```javascript
// Auto quality & format
${cloudinaryUrl}/q_auto,f_auto/v1/${publicId}

// Resize dengan aspect ratio
${cloudinaryUrl}/w_800,c_limit,q_auto,f_auto/v1/${publicId}

// Lazy load placeholder (blur)
${cloudinaryUrl}/w_50,e_blur:1000,q_auto,f_auto/v1/${publicId}
```

**Update backend upload handler:**
```javascript
// backend/src/routes/upload.js
const result = await cloudinary.uploader.upload(file.path, {
  folder: 'smk-krisma',
  quality: 'auto:good', // Auto quality optimization
  fetch_format: 'auto', // Auto convert to best format
  responsive_breakpoints: [
    { max_width: 400, max_images: 1 },
    { max_width: 800, max_images: 1 },
    { max_width: 1200, max_images: 1 }
  ]
});
```

### 5. **Preload Critical Images**

Untuk gambar above-the-fold (hero image, logo):

```html
<!-- Add to index.html <head> -->
<link rel="preload" as="image" href="/logo.png" />
<link rel="preload" as="image" href="/hero-background.jpg" />
```

Di React (homepage):
```jsx
useEffect(() => {
  // Preload hero image
  const img = new Image();
  img.src = data.videoHero?.thumbnail || heroImage;
}, []);
```

### 6. **Image Dimensions**

Selalu set width & height untuk prevent layout shift:

```html
<img
  src="image.jpg"
  alt="Description"
  width="800"
  height="600"
  loading="lazy"
/>
```

Di Tailwind:
```jsx
<img
  src={image}
  alt="Description"
  className="w-full h-auto aspect-[4/3]"
  loading="lazy"
/>
```

---

## 📊 Performance Metrics

### Target Google PageSpeed Score:
- **Mobile**: > 90
- **Desktop**: > 95

### Key Metrics:
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### How to Test:
1. https://pagespeed.web.dev/
2. Input your website URL
3. Check recommendations

---

## 🔧 Implementation Checklist

### Before Launch:
- [ ] Compress all uploaded images
- [ ] Enable Cloudinary auto-format
- [ ] Add responsive breakpoints
- [ ] Preload critical images
- [ ] Set proper image dimensions
- [ ] Test with PageSpeed Insights
- [ ] Verify lazy loading works
- [ ] Check alt text for all images

### After Launch:
- [ ] Monitor bandwidth usage
- [ ] Check loading times in Analytics
- [ ] A/B test image formats
- [ ] Optimize based on real data

---

## 📱 Mobile Optimization

### Specific for Mobile:
```jsx
<img
  src={image}
  alt="Description"
  srcset={`${image}?w=400 400w, ${image}?w=800 800w`}
  sizes="(max-width: 768px) 400px, 800px"
  loading="lazy"
/>
```

### Touch Gestures:
Images in carousels (prestasi, testimoni) sudah support:
- ✅ Touch drag
- ✅ Swipe gesture
- ✅ Auto-pause on interaction

---

## 🎯 SEO Impact

### Current Implementation Benefits:
1. **Alt Text dengan Keywords**
   - Google dapat index gambar
   - Muncul di Google Images search
   - Accessibility untuk screen readers

2. **Lazy Loading**
   - Faster page load = Better SEO
   - Lower bounce rate
   - Higher user engagement

3. **Proper File Names**
   - Gunakan descriptive names
   - Include keywords
   - Use hyphens, bukan spaces

**Example:**
```
❌ IMG_1234.jpg
❌ photo1.jpg
✅ kepala-sekolah-smk-kristen-5-klaten.jpg
✅ prestasi-siswa-smk-krisma-juara-nasional.jpg
```

---

## 🔍 Monitoring & Analytics

### Track Image Performance:
```javascript
// Add to Google Analytics
gtag('event', 'image_load', {
  image_name: 'hero-image',
  load_time: performance.now()
});
```

### Monitor with Cloudinary:
- Usage stats
- Bandwidth consumption
- Transformation efficiency
- Cache hit rate

---

## 📚 Resources

- [Google Image SEO Best Practices](https://developers.google.com/search/docs/appearance/google-images)
- [Web.dev Image Optimization](https://web.dev/fast/#optimize-your-images)
- [Cloudinary Image Optimization](https://cloudinary.com/documentation/image_optimization)
- [WebP Format Guide](https://developers.google.com/speed/webp)

---

*Last updated: December 2024*
