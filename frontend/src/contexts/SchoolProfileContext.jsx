import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const SchoolProfileContext = createContext(null);

export const SchoolProfileProvider = ({ children }) => {
  const [contact, setContact] = useState(null);
  const [socialMedia, setSocialMedia] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/contact').catch(() => ({ data: { data: null } })),
      api.get('/api/social-media').catch(() => ({ data: { data: { socialMedia: [] } } })),
    ]).then(([contactRes, socialRes]) => {
      setContact(contactRes.data.data || null);
      setSocialMedia(socialRes.data.data?.socialMedia || []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <SchoolProfileContext.Provider value={{ contact, socialMedia, loading }}>
      {children}
    </SchoolProfileContext.Provider>
  );
};

export const useSchoolProfile = () => {
  const ctx = useContext(SchoolProfileContext);
  if (!ctx) throw new Error('useSchoolProfile must be used within SchoolProfileProvider');
  return ctx;
};
