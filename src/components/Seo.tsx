import { useParams } from 'react-router'
import { isLanguage, languages, type Language } from '../i18n'
import {
  localizedCanonical,
  ogLocale,
  seoImageUrl,
  SITE_NAME,
  truncateDescription,
} from '../lib/seo'

type JsonLd = Record<string, unknown> | Record<string, unknown>[]

export type SeoProps = {
  title: string
  description?: string
  /** Public route path without language prefix (e.g. `about`, `projects/slug`). */
  path: string
  image?: string
  type?: 'website' | 'article'
  publishedTime?: string
  noindex?: boolean
  jsonLd?: JsonLd
  /** Home page uses the site name as the sole document title. */
  homePage?: boolean
}

export function Seo({
  title,
  description,
  path,
  image,
  type = 'website',
  publishedTime,
  noindex = false,
  jsonLd,
  homePage = false,
}: SeoProps) {
  const { lang } = useParams()
  const language: Language = isLanguage(lang) ? lang : 'en'

  const documentTitle = homePage ? SITE_NAME : `${title} | ${SITE_NAME}`
  const metaDescription = description ? truncateDescription(description) : undefined
  const canonical = localizedCanonical(language, path)
  const ogImage = seoImageUrl(image)
  const ogTitle = homePage ? SITE_NAME : title

  const jsonLdPayload = jsonLd
    ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd])
    : null

  return (
    <>
      <title>{documentTitle}</title>
      {metaDescription ? <meta name="description" content={metaDescription} /> : null}
      {noindex ? <meta name="robots" content="noindex,nofollow" /> : null}
      <link rel="canonical" href={canonical} />
      {languages.map((altLang) => (
        <link
          key={altLang}
          rel="alternate"
          hrefLang={altLang}
          href={localizedCanonical(altLang, path)}
        />
      ))}
      <link rel="alternate" hrefLang="x-default" href={localizedCanonical('en', path)} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={ogTitle} />
      {metaDescription ? <meta property="og:description" content={metaDescription} /> : null}
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content={type} />
      <meta property="og:locale" content={ogLocale(language)} />
      {type === 'article' && publishedTime ? (
        <meta property="article:published_time" content={publishedTime} />
      ) : null}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={ogTitle} />
      {metaDescription ? <meta name="twitter:description" content={metaDescription} /> : null}
      <meta name="twitter:image" content={ogImage} />
      {jsonLdPayload?.map((entry, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(entry)}
        </script>
      ))}
    </>
  )
}
