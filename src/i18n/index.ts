import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import frTranslations from './locales/fr.json';
import enTranslations from './locales/en.json';

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    resources: {
      fr: {
        translation: frTranslations
      },
      en: {
        translation: enTranslations
      }
    },
    lng: 'fr', // Default language (French as specified)
    fallbackLng: 'fr',
    
    // Enable variable substitution for game messages
    interpolation: {
      escapeValue: false, // React already escapes values
      // Custom format for game variables like $Couleur_active
      format: (value, format, lng) => {
        if (format === 'lowercase') return value.toLowerCase();
        if (format === 'uppercase') return value.toUpperCase();
        return value;
      }
    }
  });

export default i18n;