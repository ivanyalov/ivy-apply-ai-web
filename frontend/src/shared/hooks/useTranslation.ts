import { useLanguage } from './useLanguage';
import { translations } from '../i18n';

export const useTranslation = () => {
  const { language } = useLanguage();
  
  const t = translations[language];
  
  return { t, language };
};
