import { ru } from './translations/ru';
import { en } from './translations/en';

export type TranslationKey = keyof typeof ru;
export type Translations = typeof ru;

export const translations = {
  ru,
  en,
} as const;

export type Language = keyof typeof translations;
