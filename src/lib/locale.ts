/**
 * Locale configuration for separating EN and PL data
 */

export type Locale = 'en' | 'pl'

/**
 * Get the current locale from environment
 * Santa (EN) uses 'en', Santa_PL uses 'pl'
 */
export function getLocale(): Locale {
  return (process.env.NEXT_PUBLIC_LOCALE as Locale) || 'en'
}
