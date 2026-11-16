import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { isLanguage, type Language } from '../i18n'
import { formatProjectDate } from '../lib/formatDate'
import { contentImageUrl } from '../lib/contentImages'
import { coverObjectPosition } from '../lib/coverPosition'
import { loadPublishedBlog } from '../lib/loadPublicBlogs'
import type { PublicBlogDetail } from '../lib/loadPublicBlogs'
import type { PublicContentBlock } from '../lib/projects'
import { authorDisplayName, projectDescription, projectTitle } from '../lib/projects'
import { blogPostingJsonLd, localizedCanonical } from '../lib/seo'
import { normalizeTipTapDoc } from '../lib/tiptapDoc'
import { RichTextContent } from './RichTextContent'
import { Seo } from './Seo'
import { Skeleton } from './Skeleton'

function blockAlt(block: PublicContentBlock, language: Language) {
  return language === 'sr' ? (block.alt_sr ?? '') : (block.alt_en ?? '')
}

function blockBody(block: PublicContentBlock, language: Language) {
  const raw = language === 'sr' ? block.body_sr : block.body_en
  return normalizeTipTapDoc(raw)
}

export function PublicBlogPage() {
  const { t } = useTranslation()
  const { slug } = useParams()
  const { lang } = useParams()
  const language: Language = isLanguage(lang) ? lang : 'en'
  const seoPath = slug ? `blog/${slug}` : 'blog'
  const [blog, setBlog] = useState<PublicBlogDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) {
      setNotFound(true)
      setLoading(false)
      return
    }

    let cancelled = false
    void (async () => {
      setLoading(true)
      setError(null)
      setNotFound(false)
      const { blog: row, error: fetchError } = await loadPublishedBlog(slug)
      if (cancelled) return
      if (fetchError) {
        setError(fetchError)
        setBlog(null)
      } else if (!row) {
        setNotFound(true)
        setBlog(null)
      } else {
        setBlog(row)
      }
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [slug])

  if (loading) {
    return (
      <>
        <Seo title={t('blog')} description={t('seo.blog.description')} path={seoPath} />
        <Skeleton className="h-[40svh] max-h-[40svh] w-full rounded-none" />
        <main className="public-page-x py-8 sm:py-10">
          <Skeleton className="h-10 w-2/3 max-w-xl" />
          <Skeleton className="mt-2 h-5 w-40" />
          <div className="mt-8 space-y-6">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </main>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Seo title={t('blog')} description={t('seo.blog.description')} path={seoPath} />
        <main className="public-page-x py-8 sm:py-10">
          <h1 className="font-display text-2xl leading-tight text-blue-800 sm:text-3xl lg:text-4xl">
            {t('blog')}
          </h1>
          <p className="mt-6 text-red-700">{t('postLoadError')}</p>
        </main>
      </>
    )
  }

  if (notFound || !blog) {
    return (
      <>
        <Seo
          title={t('blog')}
          description={t('seo.blog.description')}
          path={seoPath}
          noindex
        />
        <main className="public-page-x py-8 sm:py-10">
          <h1 className="font-display text-2xl leading-tight text-blue-800 sm:text-3xl lg:text-4xl">
            {t('blog')}
          </h1>
          <p className="mt-6 text-black">{t('postNotFound')}</p>
        </main>
      </>
    )
  }

  const title = projectTitle(blog, language)
  const description = projectDescription(blog, language)
  const date = formatProjectDate(blog.published_at, language)
  const author = authorDisplayName(blog.author)
  const coverUrl = blog.cover_image_path ? contentImageUrl(blog.cover_image_path) : undefined
  const canonicalUrl = localizedCanonical(language, `blog/${blog.slug}`)

  return (
    <>
      <Seo
        title={title}
        description={description}
        path={`blog/${blog.slug}`}
        image={coverUrl}
        type="article"
        publishedTime={blog.published_at ?? undefined}
        jsonLd={blogPostingJsonLd({
          headline: title,
          description,
          url: canonicalUrl,
          image: coverUrl,
          datePublished: blog.published_at,
          authorName: author || undefined,
        })}
      />
      {blog.cover_image_path ? (
        <div className="h-[40svh] w-full overflow-hidden bg-blue-800/10">
          <img
            src={contentImageUrl(blog.cover_image_path)}
            alt=""
            className="block h-full w-full object-cover"
            style={{ objectPosition: coverObjectPosition(blog.cover_banner_position) }}
          />
        </div>
      ) : null}
      <main className="public-page-x py-8 sm:py-10">
        <h1 className="font-display text-2xl leading-tight text-blue-800 sm:text-3xl lg:text-4xl">
          {title}
        </h1>
        {date || author ? (
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-base text-black">
            {date ? (
              <time dateTime={blog.published_at ?? undefined}>{date}</time>
            ) : null}
            {author ? <span>{author}</span> : null}
          </p>
        ) : null}
        <div className="mt-8 flex w-full flex-col gap-8">
          {blog.blocks.map((block) => {
            if (block.block_type === 'text') {
              return (
                <div key={block.id} className="w-full">
                  <RichTextContent
                    content={blockBody(block, language)}
                    className="leading-relaxed"
                  />
                </div>
              )
            }
            if (!block.image_path) return null
            return (
              <figure key={block.id} className="w-full">
                <img
                  src={contentImageUrl(block.image_path)}
                  alt={blockAlt(block, language)}
                  className="block h-auto w-full"
                />
              </figure>
            )
          })}
        </div>
      </main>
    </>
  )
}