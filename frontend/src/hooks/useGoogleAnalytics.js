import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSchoolProfile } from '../contexts/SchoolProfileContext';

const loadGA = (id) => {
  if (document.getElementById('ga-script')) return;

  const script = document.createElement('script');
  script.id = 'ga-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', id, { send_page_view: false });
};

export const useGoogleAnalytics = () => {
  const { googleAnalyticsId: gaId } = useSchoolProfile();
  const location = useLocation();

  useEffect(() => {
    if (!gaId) return;
    loadGA(gaId);
  }, [gaId]);

  useEffect(() => {
    if (!gaId || !window.gtag) return;
    window.gtag('config', gaId, { page_path: location.pathname + location.search });
  }, [gaId, location]);
};
