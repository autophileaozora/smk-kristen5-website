// Auto-translate component for dynamic content from database
// Usage: <T>{someTextFromDB}</T>
// When language is 'en', automatically translates from Indonesian to English
// Caches results in localStorage for instant subsequent loads

import { useState, useEffect, memo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { translateText } from '../utils/translate';

const T = memo(({ children, as: Tag, className, html = false }) => {
  const { language } = useLanguage();
  const [translated, setTranslated] = useState(children);

  useEffect(() => {
    if (!children || typeof children !== 'string') {
      setTranslated(children);
      return;
    }

    if (language === 'id') {
      setTranslated(children);
      return;
    }

    // Start translation
    let cancelled = false;
    translateText(children, language).then((result) => {
      if (!cancelled) setTranslated(result);
    });

    return () => { cancelled = true; };
  }, [children, language]);

  if (!children) return null;

  // If rendering as HTML (for rich text content)
  if (html && Tag) {
    return <Tag className={className} dangerouslySetInnerHTML={{ __html: translated }} />;
  }

  if (Tag) {
    return <Tag className={className}>{translated}</Tag>;
  }

  return translated;
});

T.displayName = 'T';

export default T;
