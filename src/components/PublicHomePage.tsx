import { useTranslation } from 'react-i18next'
import { organizationJsonLd } from '../lib/seo'
import { HomeBlog } from './HomeBlog'
import { HomeHero } from './HomeHero'
import { HomeProjects } from './HomeProjects'
import { Seo } from './Seo'

export function PublicHomePage() {
  const { t } = useTranslation()

  return (
    <>
      <Seo
        homePage
        title={t('homeTitle')}
        description={t('seo.home.description')}
        path=""
        jsonLd={organizationJsonLd()}
      />
      <main>
        <HomeHero />
        <HomeProjects />
        <HomeBlog />
      </main>
    </>
  )
}
