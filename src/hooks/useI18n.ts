import { useGameStore } from '../store/gameStore';
import frTranslations from '../i18n/locales/fr.json';
import enTranslations from '../i18n/locales/en.json';

export const useI18n = () => {
  const { language } = useGameStore();
  
  const translations = {
    fr: frTranslations,
    en: enTranslations
  };

  const t = (key: string, variables?: Record<string, string>) => {
    const currentTranslations = translations[language as keyof typeof translations] || translations.fr;
    
    // Handle nested keys like 'rules.title' or 'rules.food_chain.rule1'
    const keys = key.split('.');
    let value: any = currentTranslations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return the key if translation not found
      }
    }
    
    // Handle variable substitution like {{color}} or {{wizard}}
    if (typeof value === 'string' && variables) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
        return variables[varName] || match;
      });
    }
    
    return typeof value === 'string' ? value : key;
  };

  return { t, loading: false, language };
};