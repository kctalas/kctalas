import type { Language } from '../i18n'
import { routeHref } from '../routes'
import { FACEBOOK_URL, INSTAGRAM_URL } from '../siteLinks'

const rawSiteUrl = import.meta.env.VITE_SITE_URL
const normalizedSiteUrl =
  typeof rawSiteUrl === 'string' && rawSiteUrl.length > 0
    ? rawSiteUrl.replace(/\/+$/, '')
    : 'https://kctalas.com'

export const SITE_URL = normalizedSiteUrl
export const SITE_NAME = 'Kulturni centar Talas'
export const DEFAULT_OG_IMAGE = '/home/banner.png'

const OG_LOCALE: Record<Language, string> = {
  en: 'en_US',
  sr: 'sr_RS',
}

export function ogLocale(lang: Language) {
  return OG_LOCALE[lang]
}

export function absoluteUrl(pathOrUrl: string) {
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl
  }
  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`
  return `${SITE_URL}${path}`
}

export function localizedCanonical(lang: Language, path: string) {
  return absoluteUrl(routeHref(lang, path))
}

export function truncateDescription(text: string, maxLength = 160) {
  const collapsed = text.replace(/\s+/g, ' ').trim()
  if (collapsed.length <= maxLength) return collapsed
  return `${collapsed.slice(0, maxLength - 1).trimEnd()}…`
}

export function seoImageUrl(image?: string) {
  if (!image) return absoluteUrl(DEFAULT_OG_IMAGE)
  return absoluteUrl(image)
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl('/logo.svg'),
    sameAs: [FACEBOOK_URL, INSTAGRAM_URL],
  }
}

export function blogPostingJsonLd(options: {
  headline: string
  description: string
  url: string
  image?: string
  datePublished?: string | null
  authorName?: string
}) {
  const author = options.authorName
    ? {
        '@type': 'Person',
        name: options.authorName,
      }
    : undefined

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: options.headline,
    description: truncateDescription(options.description),
    url: options.url,
    image: seoImageUrl(options.image),
    datePublished: options.datePublished ?? undefined,
    author,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl('/logo.svg'),
      },
    },
  }
}

export function creativeWorkJsonLd(options: {
  headline: string
  description: string
  url: string
  image?: string
  datePublished?: string | null
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: options.headline,
    description: truncateDescription(options.description),
    url: options.url,
    image: seoImageUrl(options.image),
    datePublished: options.datePublished ?? undefined,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl('/logo.svg'),
      },
    },
  }
}