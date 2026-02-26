import React from 'react';
import { useSchoolProfile } from '../contexts/SchoolProfileContext';

export const useContact = () => {
  const { contact, loading } = useSchoolProfile();
  return { contactInfo: contact, loading, error: null };
};

export const useSchoolLogo = () => {
  const { contact, loading } = useSchoolProfile();
  // Return both local schoolLogo (fallback) and indicate to fetch from SiteSettings
  return { 
    logo: contact?.schoolLogo || '/logo.svg', 
    loading, 
    error: null,
    note: 'Logo should be fetched from /api/site-settings for latest version'
  };
};

// New hook to fetch logo from SiteSettings
export const useSiteSettingsLogo = () => {
  const [logo, setLogo] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await fetch('/api/site-settings');
        const data = await response.json();
        if (data.success && data.data?.settings?.logo) {
          setLogo(data.data.settings.logo);
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogo();
  }, []);

  return { logo, loading, error };
};
