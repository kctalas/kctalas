import { createClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const SITE_URL = (process.env.VITE_SITE_URL ?? 'https://kctalas.com').replace(/\/+$/, '')
const LANGUAGES = ['en', 'sr']

const STATIC_PATHS = ['', 'about', 'projects', 'call', 'support', 'blog', 'contact']

function loadEnv() {
  const envPath = resolve(process.cwd(), '.env')
  try {
    const text = readFileSync(envPath, 'utf8')
    for (const line of text.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq === -1) continue
      const key = trimmed.slice(0, eq).trim()
      const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
      if (process.env[key] === undefined) process.env[key] = value
    }
  } catch {
    // optional .env
  }
}

function pageUrl(lang, path) {
  return path ? `${SITE_URL}/${lang}/${path}` : `${SITE_URL}/${lang}`
}

function urlEntry(lang, path) {
  const loc = pageUrl(lang, path)
  const alternates = [
    ...LANGUAGES.map(
      (altLang) =>
        `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${pageUrl(altLang, path)}"/>`,
    ),
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${pageUrl('en', path)}"/>`,
  ].join('\n')

  return `  <url>
    <loc>${loc}</loc>
${alternates}
  </url>`
}

async function loadDynamicPaths() {
  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) {
    console.warn('generate-sitemap: missing Supabase env; static pages only')
    return []
  }

  const supabase = createClient(url, key)
  const paths = []

  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('slug')
    .eq('status', 'published')

  if (projectsError) {
    console.warn('generate-sitemap: projects query failed', projectsError.message)
  } else {
    for (const row of projects ?? []) {
      paths.push(`projects/${row.slug}`)
    }
  }

  const { data: blogs, error: blogsError } = await supabase
    .from('blogs')
    .select('slug')
    .eq('status', 'published')

  if (blogsError) {
    console.warn('generate-sitemap: blogs query failed', blogsError.message)
  } else {
    for (const row of blogs ?? []) {
      paths.push(`blog/${row.slug}`)
    }
  }

  return paths
}

loadEnv()

const dynamicPaths = await loadDynamicPaths()
const allPaths = [...STATIC_PATHS, ...dynamicPaths]

const body = allPaths
  .flatMap((path) => LANGUAGES.map((lang) => urlEntry(lang, path)))
  .join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${body}
</urlset>
`

const out = resolve(process.cwd(), 'public/sitemap.xml')
writeFileSync(out, xml, 'utf8')
console.log(`Wrote ${out} (${allPaths.length} logical paths)`)