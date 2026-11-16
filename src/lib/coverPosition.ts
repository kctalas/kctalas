export type CoverPosition = {
  x: number
  y: number
}

export const COVER_POSITION_CENTER: CoverPosition = { x: 50, y: 50 }

export function clampCoverAxis(value: number) {
  if (!Number.isFinite(value)) return 50
  return Math.min(100, Math.max(0, Math.round(value * 10) / 10))
}

export function coverPosition(x: number | null | undefined, y: number | null | undefined): CoverPosition {
  return {
    x: clampCoverAxis(x ?? COVER_POSITION_CENTER.x),
    y: clampCoverAxis(y ?? COVER_POSITION_CENTER.y),
  }
}

export function coverObjectPosition(position: CoverPosition | null | undefined) {
  const point = position ?? COVER_POSITION_CENTER
  return `${point.x}% ${point.y}%`
}

export type CoverPositionColumns = {
  cover_banner_x: number
  cover_banner_y: number
  cover_card_x: number
  cover_card_y: number
}

export function withCoverPositions<
  T extends {
    cover_banner_x?: number | null
    cover_banner_y?: number | null
    cover_card_x?: number | null
    cover_card_y?: number | null
  },
>(row: T) {
  const { cover_banner_x, cover_banner_y, cover_card_x, cover_card_y, ...rest } = row
  return {
    ...rest,
    ...coverPositionsFromRow({ cover_banner_x, cover_banner_y, cover_card_x, cover_card_y }),
  }
}

export function coverPositionsFromRow(row: {
  cover_banner_x?: number | null
  cover_banner_y?: number | null
  cover_card_x?: number | null
  cover_card_y?: number | null
}) {
  return {
    cover_banner_position: coverPosition(row.cover_banner_x, row.cover_banner_y),
    cover_card_position: coverPosition(row.cover_card_x, row.cover_card_y),
  }
}

export function coverPositionColumns(
  banner: CoverPosition,
  card: CoverPosition,
): CoverPositionColumns {
  return {
    cover_banner_x: banner.x,
    cover_banner_y: banner.y,
    cover_card_x: card.x,
    cover_card_y: card.y,
  }
}

/** Shift a stored object-position by a pixel drag inside a cover frame. */
export function coverPositionAfterDrag(
  start: CoverPosition,
  dx: number,
  dy: number,
  frameWidth: number,
  frameHeight: number,
  image: { naturalWidth: number; naturalHeight: number } | null,
): CoverPosition {
  if (frameWidth <= 0 || frameHeight <= 0) return start

  const naturalWidth = image?.naturalWidth ?? 0
  const naturalHeight = image?.naturalHeight ?? 0
  if (naturalWidth <= 0 || naturalHeight <= 0) {
    return {
      x: clampCoverAxis(start.x - (dx / frameWidth) * 100),
      y: clampCoverAxis(start.y - (dy / frameHeight) * 100),
    }
  }

  const scale = Math.max(frameWidth / naturalWidth, frameHeight / naturalHeight)
  const overflowX = naturalWidth * scale - frameWidth
  const overflowY = naturalHeight * scale - frameHeight

  return {
    x: overflowX > 1 ? clampCoverAxis(start.x - (dx / overflowX) * 100) : start.x,
    y: overflowY > 1 ? clampCoverAxis(start.y - (dy / overflowY) * 100) : start.y,
  }
}
