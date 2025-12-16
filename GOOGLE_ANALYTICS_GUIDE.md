# Google Analytics Guide - SMK Kristen 5 Klaten

## ✅ Installation Complete!

Google Analytics 4 (GA4) tracking code sudah terinstall di website Anda!
- **Tracking ID**: `G-3V8BSCXGZ6`
- **Location**: `frontend/index.html` (line 8-15)
- **Status**: ✅ Active

---

## 📊 Apa itu Google Analytics?

Google Analytics adalah **tool gratis dari Google** untuk monitoring website traffic dan user behavior.

### Manfaat Utama:

#### 1. **Track Pengunjung Website** 📈
- Berapa banyak orang yang mengunjungi website
- Pengunjung baru vs returning visitors
- Peak hours (jam ramai pengunjung)
- Growth trend dari waktu ke waktu

#### 2. **Understand User Behavior** 👥
- Halaman mana yang paling populer
- Berapa lama mereka stay di website
- Path yang mereka ambil (homepage → jurusan → kontak)
- Bounce rate (% yang langsung keluar)

#### 3. **Track Traffic Sources** 🔍
- **Organic Search**: Dari Google search (INI YANG PENTING UNTUK SEO!)
- **Direct**: Langsung ketik URL
- **Social**: Dari Facebook, Instagram, dll
- **Referral**: Dari website lain

#### 4. **Geographic Data** 🌍
- Dari kota/kabupaten mana pengunjung berasal
- Identifikasi target market terbesar
- Fokuskan marketing ke area dengan traffic tinggi

#### 5. **Device Information** 📱
- Berapa % menggunakan mobile vs desktop
- Browser apa yang digunakan
- Screen resolution
- Optimize untuk device yang paling banyak

#### 6. **SEO Performance** 🎯
- **Keywords** yang digunakan untuk menemukan website
- Ranking position di Google
- Click-through rate (CTR)
- **Ini PENTING untuk monitor target keyword: "SMK di Klaten", "SMK Krisma"**

#### 7. **Conversions** 💰
- Berapa banyak yang klik tombol "Pendaftaran"
- Berapa banyak yang submit form kontak
- Goal completions (custom goals)

---

## 🚀 How to Access Google Analytics

### 1. **Login to Google Analytics**
1. Buka [Google Analytics](https://analytics.google.com/)
2. Login dengan akun Google yang sama yang Anda gunakan untuk setup
3. Pilih property "SMK Kristen 5 Klaten" (atau nama yang Anda set)

### 2. **Main Dashboard**
Anda akan melihat overview:
- **Real-time**: Pengunjung yang sedang online SEKARANG
- **Users**: Total pengunjung dalam periode tertentu
- **Sessions**: Berapa kali website dikunjungi
- **Bounce Rate**: % yang langsung keluar
- **Average Session Duration**: Berapa lama rata-rata mereka stay

---

## 📈 Key Metrics to Monitor

### 1. **Total Users** (Pengunjung)
**Location**: Home → Reports → Acquisition → Traffic acquisition

**What to Look For:**
- **Trend**: Apakah naik atau turun?
- **Target**: +10-20% growth per bulan
- **Action**: Jika turun, tingkatkan SEO & content marketing

### 2. **Organic Search Traffic**
**Location**: Home → Reports → Acquisition → Traffic acquisition → Filter by "Organic Search"

**What to Look For:**
- Berapa % traffic dari Google search
- **Target**: 50-70% dari organic search (SEO success)
- **Keywords**: Apa keywords yang membawa traffic

**Ini PALING PENTING untuk SEO!** Jika traffic dari organic search meningkat = SEO berhasil!

### 3. **Top Pages**
**Location**: Home → Reports → Engagement → Pages and screens

**What to Look For:**
- Halaman mana yang paling banyak dikunjungi
- Average engagement time per page
- **Action**: Focus pada content yang popular

### 4. **Bounce Rate**
**Location**: Home → Reports → Engagement

**What to Look For:**
- **Good**: < 50% (pengunjung explore website)
- **Bad**: > 70% (langsung keluar)
- **Action**: Improve content & UX jika bounce rate tinggi

### 5. **Device Breakdown**
**Location**: Home → Reports → Tech → Tech details

**What to Look For:**
- Berapa % mobile vs desktop
- **Action**: Optimize untuk device yang dominan

### 6. **Geographic Location**
**Location**: Home → Reports → User → Demographic details

**What to Look For:**
- Kota/kabupaten mana yang paling banyak
- **Target**: Klaten & sekitarnya (local SEO)
- **Action**: Target marketing ke area dengan traffic tinggi

---

## 🎯 Goals & Conversions Setup

### Important Goals to Track:

#### 1. **Contact Form Submission**
Track berapa banyak yang submit form kontak:
1. Go to: **Admin → Events → Create event**
2. Event name: `contact_form_submit`
3. Parameters: Set condition when contact form submitted

#### 2. **CTA Button Click**
Track klik tombol "Pendaftaran":
1. Event name: `cta_click`
2. Trigger: When CTA button clicked

#### 3. **Article Views**
Track artikel yang dibaca:
1. Event name: `article_view`
2. Automatic (GA4 tracks page views)

#### 4. **Jurusan Page Views**
Track interest dalam jurusan tertentu:
1. Event name: `jurusan_view`
2. Parameter: Jurusan name

---

## 📊 Custom Reports

### Create SEO Performance Report:

1. **Go to**: Explore → Create new exploration
2. **Dimensions**:
   - Source/Medium
   - Landing Page
   - City
3. **Metrics**:
   - Users
   - Sessions
   - Bounce Rate
   - Average Engagement Time
4. **Filter**: Source = "google" (organic only)

### Weekly Report to Monitor:
- New users this week
- Top 5 pages visited
- Organic search traffic %
- Conversions (contact form, CTA clicks)

---

## 🔍 SEO Keyword Tracking

### How to See Keywords:

**Problem**: Google hides most keyword data (shows as "not provided")

**Solution**: Link Google Analytics with Google Search Console!

### Steps to Link:
1. Go to **Admin → Property Settings → Product Links**
2. Click "Link Search Console"
3. Select your Search Console property
4. Save

**Now you can see:**
- Exact keywords that brought traffic
- Position in search results
- Click-through rate (CTR)
- Impressions

**Monitor your target keywords:**
- "SMK di Klaten"
- "SMK Kristen 5"
- "SMK Krisma"
- "Krisma"

---

## 📱 Mobile App (Optional)

Install Google Analytics mobile app:
- [iOS App](https://apps.apple.com/app/google-analytics/id881599038)
- [Android App](https://play.google.com/store/apps/details?id=com.google.android.apps.giant)

**Benefits:**
- Check real-time visitors
- Get daily/weekly reports
- Monitor performance on the go
- Alerts for traffic spikes/drops

---

## 🎓 Learning Resources

### Google Analytics Academy (FREE):
- [Google Analytics for Beginners](https://analytics.google.com/analytics/academy/)
- [Advanced Google Analytics](https://analytics.google.com/analytics/academy/)

### Key Topics to Learn:
1. Understanding basic metrics
2. Setting up goals & conversions
3. Custom reports
4. E-commerce tracking (for future)
5. Integration with other Google tools

---

## 📅 Regular Monitoring Schedule

### Daily (5 minutes):
- Check real-time users
- Any traffic spikes/drops?
- Top pages today

### Weekly (15 minutes):
- Total users this week
- Organic search traffic
- Top performing content
- Device breakdown

### Monthly (30 minutes):
- Monthly growth vs last month
- SEO keyword performance
- Goal completions
- Geographic analysis
- Create report for stakeholders

---

## 🚨 Alerts & Notifications

### Set Up Alerts:

1. **Traffic Drop Alert**:
   - Alert if daily users < 50% of normal
   - Action: Investigate issue immediately

2. **Traffic Spike Alert**:
   - Alert if traffic suddenly 2x normal
   - Opportunity: Identify what's working

3. **Goal Completion Alert**:
   - Alert when someone submits contact form
   - Action: Quick response

**How to Set:**
Go to **Admin → Custom Alerts → Create Custom Alert**

---

## 💡 Pro Tips

### 1. **Check Analytics Weekly**
Don't just install and forget! Regular monitoring = better decisions.

### 2. **Compare Periods**
Always compare with previous period:
- This week vs last week
- This month vs last month
- Year-over-year growth

### 3. **Focus on Trends, Not Absolute Numbers**
It's not about "500 visitors today" but "Is it growing?"

### 4. **Combine with Search Console**
GA4 + Search Console = Complete SEO picture

### 5. **Use Data for Content Strategy**
- Popular pages → Create more similar content
- High bounce rate → Improve content quality
- Low traffic pages → Optimize or remove

### 6. **Track Competitors**
Use tools like SimilarWeb to compare your traffic with competitor SMK schools.

---

## 🎯 Success Metrics for SMK Website

### Month 1 (Baseline):
- Total Users: [Record baseline]
- Organic Search %: [Record baseline]
- Top Pages: [Record baseline]

### Month 3 Target:
- Total Users: +50% from baseline
- Organic Search: >30% of traffic
- Keywords ranking: "SMK di Klaten" in top 20

### Month 6 Target:
- Total Users: +150% from baseline
- Organic Search: >50% of traffic
- Keywords ranking: "SMK di Klaten" in top 5
- Contact form: 20+ submissions/month

### Month 12 Target:
- Total Users: +300% from baseline
- Organic Search: >70% of traffic
- Keywords ranking: **"SMK di Klaten" #1**
- Contact form: 50+ submissions/month
- Conversion rate: >5%

---

## 🔐 Privacy & GDPR Compliance

Google Analytics is compliant with privacy laws when configured correctly.

### Best Practices:
1. **Add Privacy Policy** to website
2. **Anonymize IP addresses** (GA4 does this by default)
3. **Cookie Consent** (optional in Indonesia, but good practice)
4. **Data Retention**: Set to 14 months

### Privacy Policy:
Add page `/privacy-policy` with:
- What data you collect
- How you use it
- How users can opt-out
- Contact info

---

## 📞 Support

### If You Need Help:
1. **Google Analytics Help**: https://support.google.com/analytics
2. **Community Forum**: https://support.google.com/analytics/community
3. **YouTube Tutorials**: Search "Google Analytics 4 tutorial"

---

## ✅ Quick Checklist

After deployment:
- [ ] Verify tracking code is working (check Real-time report)
- [ ] Set up goals (contact form, CTA clicks)
- [ ] Link Google Search Console
- [ ] Create custom SEO report
- [ ] Set up alerts
- [ ] Schedule weekly review
- [ ] Install mobile app
- [ ] Learn basic metrics
- [ ] Share access with team members

---

## 🎉 You're All Set!

Your Google Analytics is now tracking your website!

**What happens now:**
1. ✅ Every visitor is tracked automatically
2. 📊 Data accumulates over time
3. 📈 You can monitor SEO success
4. 🎯 Make data-driven decisions

**Check your dashboard in 24 hours** to see your first data!

---

*Last updated: December 16, 2024*
*Tracking ID: G-3V8BSCXGZ6*
