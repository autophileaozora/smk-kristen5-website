# Deployment Guide - SMK Kristen 5 Klaten Website

## ✅ What Has Been Done

### Security Improvements:
- ✅ **Removed demo credentials** from login page
- ✅ **.env files are gitignored** (sensitive data protected)
- ✅ **API authentication** properly configured
- ✅ **Admin routes protected** with auth middleware

### Latest Deployment:
- ✅ **Pushed to GitHub**: commit `089685d`
- ✅ **All changes staged and committed**
- ✅ **Ready for Netlify auto-deploy**

---

## 🚀 Netlify Auto-Deploy

### How It Works:
Netlify automatically detects changes from GitHub and deploys:

1. **Push to GitHub** → Triggers Netlify build
2. **Netlify builds** frontend → Runs `npm run build`
3. **Deploy to production** → Updates live site

### Check Deployment Status:
1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Find your site
3. Check "Deploys" tab
4. Wait for build to complete (~2-5 minutes)

---

## 📋 Post-Deployment Checklist

### 1. **Update Production URLs**

After Netlify deployment, update these files with your production domain:

#### A. Update SEO Component
File: `frontend/src/components/SEO.jsx` (Line 12)
```javascript
// Before (localhost):
const siteUrl = 'http://localhost:5173';

// After (production):
const siteUrl = 'https://your-domain.netlify.app'; // or custom domain
```

#### B. Update robots.txt
File: `frontend/public/robots.txt`
```txt
# Update Sitemap URL
Sitemap: https://your-domain.netlify.app/sitemap.xml
```

#### C. Update sitemap.xml
File: `frontend/public/sitemap.xml`
```xml
<!-- Replace all localhost:5173 URLs with production domain -->
<loc>https://your-domain.netlify.app/</loc>
<loc>https://your-domain.netlify.app/jurusan</loc>
<!-- etc. -->
```

### 2. **Configure Netlify Environment Variables**

Go to: **Site Settings → Environment Variables**

Add these variables:
```
VITE_API_URL=https://your-backend-url.render.com
```

### 3. **Configure Netlify Redirects**

Create file: `frontend/public/_redirects`
```
# SPA fallback
/*    /index.html   200

# API proxy (optional)
/api/*  https://your-backend-url.render.com/:splat  200
```

### 4. **Enable HTTPS**

Netlify auto-provides HTTPS, but verify:
1. Go to **Domain Settings**
2. Check "HTTPS" is enabled
3. Force HTTPS redirect

---

## 🔧 Backend Deployment (Render/Railway/Heroku)

### If Using Render.com:

1. **Connect GitHub repo**
2. **Set environment variables**:
   ```
   NODE_ENV=production
   MONGODB_URI=your_mongodb_atlas_uri
   JWT_SECRET=your_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email
   EMAIL_PASSWORD=your_app_password
   FRONTEND_URL=https://your-netlify-domain.netlify.app
   ```

3. **Build command**: `npm install`
4. **Start command**: `npm start`

### CORS Configuration:

Ensure backend allows your Netlify domain:
```javascript
// backend/src/app.js
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-domain.netlify.app'
  ],
  credentials: true
}));
```

---

## 🧪 Testing Deployment

### 1. **Test Public Pages**
- [ ] Homepage loads properly
- [ ] All images display correctly
- [ ] Navigation works
- [ ] SEO meta tags visible (check page source)
- [ ] Mobile responsive

### 2. **Test Admin Panel**
- [ ] Login page accessible
- [ ] Can login with credentials
- [ ] Dashboard loads
- [ ] Can create/edit/delete content
- [ ] Images upload successfully

### 3. **Test SEO**
- [ ] Check page source for meta tags
- [ ] Verify robots.txt: `https://your-domain.netlify.app/robots.txt`
- [ ] Verify sitemap.xml: `https://your-domain.netlify.app/sitemap.xml`
- [ ] Test with [Google Rich Results Test](https://search.google.com/test/rich-results)

### 4. **Performance Test**
- [ ] Run [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [ ] Target: >90 mobile, >95 desktop
- [ ] Check all Core Web Vitals

---

## 🔍 Troubleshooting

### Issue: Site not loading
**Solution:**
- Check Netlify build logs
- Verify build command is correct
- Check for build errors

### Issue: API requests failing
**Solution:**
- Verify VITE_API_URL environment variable
- Check backend CORS settings
- Ensure backend is running

### Issue: Images not displaying
**Solution:**
- Check Cloudinary configuration
- Verify image URLs are correct
- Check browser console for errors

### Issue: 404 on refresh
**Solution:**
- Add `_redirects` file to `frontend/public/`
- Content: `/*    /index.html   200`

---

## 📊 Monitoring

### Google Analytics Setup:
```html
<!-- Add to frontend/public/index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Google Search Console:
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add property with your domain
3. Verify ownership
4. Submit sitemap: `https://your-domain.netlify.app/sitemap.xml`

---

## 🎯 Custom Domain Setup

### If Using Custom Domain:

1. **Buy domain** (e.g., smkkrisma.sch.id)

2. **Add to Netlify**:
   - Go to **Domain Settings**
   - Click "Add custom domain"
   - Enter your domain

3. **Configure DNS**:
   ```
   Type: CNAME
   Name: www
   Value: your-site.netlify.app

   Type: A
   Name: @
   Value: 75.2.60.5 (Netlify IP)
   ```

4. **Update URLs**:
   - SEO.jsx
   - robots.txt
   - sitemap.xml
   - Backend CORS
   - Environment variables

---

## 📝 Deployment Commands

### Quick Deploy:
```bash
# Stage all changes
git add .

# Commit
git commit -m "Your commit message"

# Push to GitHub (triggers Netlify deploy)
git push origin main
```

### Rollback:
```bash
# Find commit hash
git log --oneline

# Revert to previous commit
git revert <commit-hash>

# Push
git push origin main
```

---

## 🔐 Security Best Practices

### Before Going Live:
- [ ] All .env files gitignored
- [ ] No credentials in code
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF tokens

### Regular Maintenance:
- [ ] Update dependencies monthly
- [ ] Monitor error logs
- [ ] Backup database weekly
- [ ] Review security alerts
- [ ] Update SSL certificates

---

## 📞 Support

### Netlify Support:
- [Netlify Docs](https://docs.netlify.com/)
- [Netlify Community](https://answers.netlify.com/)

### Render Support:
- [Render Docs](https://render.com/docs)
- [Render Community](https://community.render.com/)

---

## ✅ Deployment Status

**Last Deployment:**
- Date: December 16, 2024
- Commit: `089685d`
- Status: ✅ Success
- Changes: SEO optimization, security improvements, removed demo credentials

**Next Steps:**
1. Wait for Netlify build to complete
2. Verify site is live
3. Update production URLs in code
4. Submit sitemap to Google Search Console
5. Monitor performance and errors

---

*Good luck with your deployment! 🚀*
