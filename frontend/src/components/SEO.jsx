import { Helmet } from 'react-helmet-async';

const SEO = ({
  title = 'SMK Kristen 5 Klaten - SMK Krisma',
  description = 'SMK Kristen 5 Klaten (Krisma) adalah sekolah menengah kejuruan terbaik di Klaten dengan berbagai jurusan unggulan. Temukan passion Anda bersama kami!',
  keywords = 'SMK di Klaten, SMK Kristen 5, SMK Krisma, Krisma, sekolah klaten, SMK terbaik klaten, jurusan SMK klaten, pendaftaran SMK klaten, SMK Kristen Klaten',
  image = null,
  url = window.location.href,
  type = 'website',
  structuredData = null,
}) => {
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://smkkrisma.sch.id';
  const fullUrl = url.startsWith('http') ? url : `${siteUrl}${url}`;
  const fullImageUrl = image ? (image.startsWith('http') ? image : `${siteUrl}${image}`) : null;

  // Default structured data for school
  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "SMK Kristen 5 Klaten",
    "alternateName": ["SMK Krisma", "Krisma Klaten"],
    "url": siteUrl,
    "logo": `${siteUrl}/logo.png`,
    "description": description,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Klaten",
      "addressRegion": "Jawa Tengah",
      "addressCountry": "ID"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "-7.7138",
      "longitude": "110.6066"
    },
    "telephone": "+62-xxx-xxx-xxxx",
    "email": "info@smkkrisma.sch.id",
    "sameAs": [
      "https://www.facebook.com/smkkrisma",
      "https://www.instagram.com/smkkrisma",
      "https://www.youtube.com/@smkkrisma"
    ]
  };

  const finalStructuredData = structuredData || defaultStructuredData;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Robots */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />

      {/* Language */}
      <meta httpEquiv="content-language" content="id" />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {fullImageUrl && <meta property="og:image" content={fullImageUrl} />}
      {fullImageUrl && <meta property="og:image:width" content="1200" />}
      {fullImageUrl && <meta property="og:image:height" content="630" />}
      <meta property="og:site_name" content="SMK Kristen 5 Klaten" />
      <meta property="og:locale" content="id_ID" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {fullImageUrl && <meta name="twitter:image" content={fullImageUrl} />}

      {/* Geographic Tags */}
      <meta name="geo.region" content="ID-JT" />
      <meta name="geo.placename" content="Klaten" />
      <meta name="geo.position" content="-7.7138;110.6066" />
      <meta name="ICBM" content="-7.7138, 110.6066" />

      {/* Additional SEO */}
      <meta name="author" content="SMK Kristen 5 Klaten" />
      <meta name="theme-color" content="#0D76BE" />

      {/* Structured Data (JSON-LD) */}
      <script type="application/ld+json">
        {JSON.stringify(finalStructuredData)}
      </script>
    </Helmet>
  );
};

export default SEO;
