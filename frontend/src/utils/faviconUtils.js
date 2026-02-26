/**
 * Utility untuk dynamically set favicon dari logo di database
 */

export const setDynamicFavicon = (imageUrl) => {
  if (!imageUrl) return;

  // Remove existing favicon links
  const existingFavicons = document.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]');
  existingFavicons.forEach(el => {
    if (!el.href.includes('favicon.svg') && !el.href.includes('favicon.ico')) {
      el.remove();
    }
  });

  // Create new favicon link with cache busting
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/jpeg';
  link.href = `${imageUrl}?v=${Date.now()}`;
  
  document.head.appendChild(link);

  // Also set for Apple devices
  const appleLink = document.createElement('link');
  appleLink.rel = 'apple-touch-icon';
  appleLink.href = `${imageUrl}?v=${Date.now()}`;
  
  document.head.appendChild(appleLink);
};

export const fetchAndSetFavicon = async (apiUrl = '/api/site-settings') => {
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    if (data.success && data.data?.settings?.logo) {
      setDynamicFavicon(data.data.settings.logo);
      return data.data.settings.logo;
    }
  } catch (error) {
    console.warn('Failed to load dynamic favicon:', error);
  }
  
  return null;
};
