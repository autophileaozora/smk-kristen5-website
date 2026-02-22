import { useSchoolProfile } from '../contexts/SchoolProfileContext';

export const useContact = () => {
  const { contact, loading } = useSchoolProfile();
  return { contactInfo: contact, loading, error: null };
};

export const useSchoolLogo = () => {
  const { contact, loading } = useSchoolProfile();
  return { logo: contact?.schoolLogo || '/logo.svg', loading, error: null };
};
