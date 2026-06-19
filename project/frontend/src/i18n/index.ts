import { createI18n } from 'vue-i18n';
import pt from '../locales/pt.json';
import es from '../locales/es.json';
import en from '../locales/en.json';

const messages = {
  pt,
  es,
  en
};

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('inmovel_lang') || 'pt',
  fallbackLocale: 'pt',
  messages,
});

export default i18n;
