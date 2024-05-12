
import { createI18n } from 'vue-i18n';
import de from './lang/de';

export default createI18n({
  legacy: false,
  locale: 'de',
  fallbackLocale: 'de',
  messages: {
    de,
  },
});