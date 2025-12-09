import { useState, useEffect } from 'react';
import api from '../services/api';

export const useContact = () => {
  const [contactInfo, setContactInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContact = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/contact');
        setContactInfo(response.data.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching contact info:', err);
        setError(err.response?.data?.message || 'Gagal memuat informasi kontak');
      } finally {
        setLoading(false);
      }
    };

    fetchContact();
  }, []);

  return { contactInfo, loading, error };
};

export const useSchoolLogo = () => {
  const { contactInfo, loading, error } = useContact();

  return {
    logo: contactInfo?.schoolLogo || '/logo.svg', // fallback to default logo
    loading,
    error
  };
};
