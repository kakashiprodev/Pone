import { createI18n } from 'vue-i18n';
import de from './lang/de';

export default createI18n({
  legacy: false,
  locale: 'de',
  fallbackLocale: 'de',
  warnHtmlMessage: false, // html is only required for <sub> tags with hardcoded translation string, therefor not a risk
  messages: {
    de,
  },
});
