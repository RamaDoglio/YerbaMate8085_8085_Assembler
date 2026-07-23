'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import es from './es.json'
import en from './en.json'

type Messages = typeof es
export type Locale = 'es' | 'en'

const messages: Record<Locale, Messages> = { es, en }

function getNested(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part]
    }
    return undefined
  }, obj)
}

export function translate(locale: Locale, key: string, ...args: (string | number)[]): string {
  let val = getNested(messages[locale], key)
  if (val === undefined) val = getNested(messages.es, key)
  if (typeof val !== 'string') return key
  return val.replace(/\{(\d+)\}/g, (_, num) => {
    const idx = parseInt(num, 10)
    return idx < args.length ? String(args[idx]) : `{${num}}`
  })
}

interface LanguageContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, ...args: (string | number)[]) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('es')

  useEffect(() => {
    const saved = localStorage.getItem('locale') as Locale | null
    if (saved === 'es' || saved === 'en') setLocale(saved)
  }, [])

  useEffect(() => {
    localStorage.setItem('locale', locale)
    document.documentElement.lang = locale
  }, [locale])

  const tFn = useCallback((key: string, ...args: (string | number)[]) => {
    return translate(locale, key, ...args)
  }, [locale])

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t: tFn }}>
      {children}
    </LanguageContext.Provider>
  )
}
