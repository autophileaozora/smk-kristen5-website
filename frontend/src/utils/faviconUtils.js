/**
 * Utility untuk dynamically set favicon dari logo di database
 */

export const setDynamicFavicon = (imageUrl) => {
  if (!imageUrl) {
    console.warn('No image URL provided for favicon');
    return;
  }

  console.log('Setting dynamic favicon to:', imageUrl);

  // Remove existing dynamic favicon links (keep static SVG/ICO)
  const existingDynamicFavicons = document.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]');
  existingDynamicFavicons.forEach(el => {
    const href = el.href || '';
    // Remove only if it's a cloudinary or uploaded logo (not static fallback)
    if (!href.includes('favicon.svg') && !href.includes('favicon.ico') && !href.includes('icon-')) {
      el.remove();
    }
  });

  // Detect image type from URL
  let imageType = 'image/png'; // Default
  if (imageUrl.includes('.jpg') || imageUrl.includes('.jpeg')) {
    imageType = 'image/jpeg';
  } else if (imageUrl.includes('.png')) {
    imageType = 'image/png';
  } else if (imageUrl.includes('.webp')) {
    imageType = 'image/webp';
  } else if (imageUrl.includes('.gif')) {
    imageType = 'image/gif';
  }

  // Create new favicon link with cache busting
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = imageType;
  const faviconUrl = imageUrl.includes('?') 
    ? `${imageUrl}&v=${Date.now()}` 
    : `${imageUrl}?v=${Date.now()}`;
  link.href = faviconUrl;
  
  document.head.appendChild(link);
  console.log('Favicon updated to:', link.href);

  // Also set for Apple devices
  const appleLink = document.createElement('link');
  appleLink.rel = 'apple-touch-icon';
  appleLink.href = faviconUrl;
  
  document.head.appendChild(appleLink);
};

export const fetchAndSetFavicon = async (apiUrl = '/api/site-settings') => {
  try {
    console.log('🔄 Fetching favicon from:', apiUrl);
    const response = await fetch(apiUrl, { 
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-cache'
    });
    const data = await response.json();
    
    console.log('📦 Site settings response:', data);
    
    if (data.success && data.data?.settings) {
      const { settings } = data.data;
      const logo = settings.logo || settings.favicon;
      
      if (logo && logo.trim().length > 0) {
        console.log('✅ Found logo in settings:', logo);
        setDynamicFavicon(logo);
        return logo;
      } else {
        console.warn('⚠️ Logo field is empty in settings. Using fallback SVG.');
      }
    } else {
      console.warn('⚠️ Invalid response structure:', data);
    }
  } catch (error) {
    console.error('❌ Failed to load dynamic favicon:', error);
  }
  
  return null;
};
