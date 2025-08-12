import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { useI18n } from '../../hooks/useI18n';

type Language = 'fr' | 'en';

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useGameStore();
  const { t } = useI18n();

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleLanguageChange('fr')}
        className={`px-3 py-1 rounded font-comic text-sm transition-colors ${
          language === 'fr'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        {t('home.french')}
      </button>
      <button
        onClick={() => handleLanguageChange('en')}
        className={`px-3 py-1 rounded font-comic text-sm transition-colors ${
          language === 'en'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        {t('home.english')}
      </button>
    </div>
  );
};