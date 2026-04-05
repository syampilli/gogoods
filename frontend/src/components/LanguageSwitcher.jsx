import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'EN', name: 'English'  },
  { code: 'te', label: 'తె', name: 'తెలుగు'   },
  { code: 'hi', label: 'हि', name: 'हिंदी'    },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
   const current  = i18n.language?.slice(0, 2) || 'en';

  const change = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('i18nextLng', code);  // ← manually persist
  };

  return (
    <div className="flex items-center gap-1 px-2 py-1.5 bg-gray-100
                    dark:bg-gray-800 rounded-xl">
      <Languages size={14} className="text-gray-400 mr-1"/>
      {LANGUAGES.map(lang => (
        <button
          key={lang.code}
          onClick={() => i18n.changeLanguage(lang.code)}
          title={lang.name}
          className={`px-2 py-1 rounded-lg text-xs font-bold transition-all
            ${i18n.language === lang.code
              ? 'bg-blue-600 text-white'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
          {lang.label}
        </button>
      ))}
    </div>
  );
}