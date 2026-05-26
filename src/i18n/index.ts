import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { z } from 'zod/v4'

import pl from './locales/pl.json'
import en from './locales/en.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      pl: { translation: pl },
      en: { translation: en },
    },
    fallbackLng: 'pl',
    supportedLngs: ['pl', 'en'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['querystring', 'localStorage'],
      lookupQuerystring: 'lang',
      caches: ['localStorage'],
    },
  })

// Simple custom error map to translate Zod errors using i18next
export const customErrorMap = (issue: any, ctx: any) => {
  let message = ctx?.defaultError || issue?.message || 'Invalid value'
  
  // If the issue message is a translation key (no spaces), use it
  if (issue.message && !issue.message.includes(' ')) {
    message = i18n.t(`validation.${issue.message}`, {
      defaultValue: issue.message,
      min: issue.minimum || 0,
    })
  } else if (issue.code === z.ZodIssueCode.too_small) {
    if (issue.origin === 'string' || issue.type === 'string') {
      message = i18n.t('validation.tooSmallString', { min: issue.minimum, defaultValue: `Minimum ${issue.minimum} characters required` })
    }
  } else if (issue.code === z.ZodIssueCode.invalid_type) {
    if (issue.expected === 'string') {
      message = i18n.t('validation.required', { defaultValue: 'Field is required' })
    }
  }
  
  return { message }
}

z.setErrorMap(customErrorMap as any)

export default i18n
