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
        console.log('🔍 [useContact] Fetching contact info...');
        const response = await api.get('/api/contact');
        console.log('✅ [useContact] Response received:', response.data);
        console.log('📸 [useContact] School Logo URL:', response.data.data?.schoolLogo);
        setContactInfo(response.data.data);
        setError(null);
      } catch (err) {
        console.error('❌ [useContact] Error fetching contact info:', err);
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

  console.log('🎨 [useSchoolLogo] contactInfo:', contactInfo);
  console.log('🎨 [useSchoolLogo] contactInfo?.schoolLogo:', contactInfo?.schoolLogo);

  const logo = contactInfo?.schoolLogo || '/logo.svg';
  console.log('🎨 [useSchoolLogo] Final logo URL:', logo);

  return {
    logo,
    loading,
    error
  };
};
