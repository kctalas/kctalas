import { withCoverPositions } from './coverPosition'
import type { ContentBlockRow, ProjectListRow } from './projects'
import { supabase } from './supabase'

export type PublicProjectListRow = Pick<
  ProjectListRow,
  | 'id'
  | 'slug'
  | 'title_en'
  | 'title_sr'
  | 'description_en'
  | 'description_sr'
  | 'cover_image_path'
  | 'cover_banner_position'
  | 'cover_card_position'
>

export type PublicProjectDetail = PublicProjectListRow & {
  published_at: string | null
  blocks: ContentBlockRow[]
}

export async function loadPublishedProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select(
      'id, slug, title_en, title_sr, description_en, description_sr, cover_image_path, cover_banner_x, cover_banner_y, cover_card_x, cover_card_y',
    )
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  if (error) {
    return { projects: [] as PublicProjectListRow[], error: error.message }
  }

  return {
    projects: (data ?? []).map((row) => withCoverPositions(row) as PublicProjectListRow),
    error: null,
  }
}

export async function loadPublishedProject(slug: string) {
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select(
      'id, slug, title_en, title_sr, description_en, description_sr, cover_image_path, cover_banner_x, cover_banner_y, cover_card_x, cover_card_y, published_at',
    )
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (projectError) {
    return { project: null as PublicProjectDetail | null, error: projectError.message }
  }

  if (!project) {
    return { project: null, error: null }
  }

  const { data: blocks, error: blocksError } = await supabase
    .from('content_blocks')
    .select(
      'id, project_id, position, block_type, body_en, body_sr, image_path, alt_en, alt_sr',
    )
    .eq('project_id', project.id)
    .order('position', { ascending: true })

  if (blocksError) {
    return { project: null, error: blocksError.message }
  }

  const row = withCoverPositions(
    project as PublicProjectListRow & {
      published_at: string | null
      cover_banner_x: number
      cover_banner_y: number
      cover_card_x: number
      cover_card_y: number
    },
  )

  return {
    project: {
      ...row,
      published_at: row.published_at ?? null,
      blocks: (blocks ?? []) as ContentBlockRow[],
    },
    error: null,
  }
}
