import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import zhCommon from './locales/zh/common.json';
import zhWizard from './locales/zh/wizard.json';
import jaCommon from './locales/ja/common.json';
import jaWizard from './locales/ja/wizard.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      zh: { common: zhCommon, wizard: zhWizard },
      ja: { common: jaCommon, wizard: jaWizard },
    },
    lng: 'zh',
    fallbackLng: 'zh',
    defaultNS: 'common',
    ns: ['common', 'wizard'],
    interpolation: { escapeValue: false },
  });

export default i18n;
