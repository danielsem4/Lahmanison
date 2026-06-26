import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import enCommon from '@/locales/en/common.json'
import enAuth from '@/locales/en/auth.json'
import enItems from '@/locales/en/items.json'
import enSettings from '@/locales/en/settings.json'
import heCommon from '@/locales/he/common.json'
import heAuth from '@/locales/he/auth.json'
import heItems from '@/locales/he/items.json'
import heSettings from '@/locales/he/settings.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: enCommon, auth: enAuth, items: enItems, settings: enSettings },
      he: { common: heCommon, auth: heAuth, items: heItems, settings: heSettings },
    },
    fallbackLng: 'he',
    defaultNS: 'common',
    ns: ['common', 'auth', 'items', 'settings'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  })

// Set document direction on language change
function updateDirection(lng: string) {
  const dir = lng === 'he' ? 'rtl' : 'ltr'
  document.documentElement.dir = dir
  document.documentElement.lang = lng
}

updateDirection(i18n.language)
i18n.on('languageChanged', updateDirection)

export default i18n
