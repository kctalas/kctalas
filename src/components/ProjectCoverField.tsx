import { useEffect, useMemo, useRef, useState, type PointerEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { contentImageUrl } from '../lib/contentImages'
import { COVER_POSITION_CENTER, type CoverPosition } from '../lib/coverPosition'
import { CoverPositionFrame, coverOverlayButtonClass } from './CoverPositionFrame'
import { Dialog } from './Dialog'

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif'

type ProjectCoverFieldProps = {
  coverPath: string | null
  pendingFile: File | null
  bannerPosition: CoverPosition
  cardPosition: CoverPosition
  onPendingFileChange: (file: File | null) => void
  onBannerPositionChange: (position: CoverPosition) => void
  onCardPositionChange: (position: CoverPosition) => void
}

function stopDrag(event: PointerEvent<HTMLButtonElement>) {
  event.stopPropagation()
}

export function ProjectCoverField({
  coverPath,
  pendingFile,
  bannerPosition,
  cardPosition,
  onPendingFileChange,
  onBannerPositionChange,
  onCardPositionChange,
}: ProjectCoverFieldProps) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const [thumbnailOpen, setThumbnailOpen] = useState(false)

  const pendingCoverUrl = useMemo(
    () => (pendingFile ? URL.createObjectURL(pendingFile) : null),
    [pendingFile],
  )
  useEffect(() => {
    return () => {
      if (pendingCoverUrl) URL.revokeObjectURL(pendingCoverUrl)
    }
  }, [pendingCoverUrl])

  const displayUrl =
    pendingCoverUrl ?? (coverPath ? contentImageUrl(coverPath) : null)

  function openPicker() {
    inputRef.current?.click()
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          onPendingFileChange(e.target.files?.[0] ?? null)
          e.target.value = ''
        }}
      />
      {displayUrl ? (
        <CoverPositionFrame
          src={displayUrl}
          position={bannerPosition}
          onChange={onBannerPositionChange}
          label={t('coverPositionBanner')}
          className="group h-48 w-full sm:h-72"
          centerLabel={t('coverPositionCenter')}
          onCenter={() => onBannerPositionChange(COVER_POSITION_CENTER)}
        >
          <div className="pointer-events-none absolute inset-0 bg-blue-800/40 opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="pointer-events-none absolute inset-0 z-10 flex flex-wrap items-center justify-center gap-3 px-16">
            <button
              type="button"
              className={`pointer-events-auto ${coverOverlayButtonClass}`}
              onPointerDown={stopDrag}
              onClick={openPicker}
            >
              {t('replaceCoverPhoto')}
            </button>
            <button
              type="button"
              className={`pointer-events-auto ${coverOverlayButtonClass}`}
              onPointerDown={stopDrag}
              onClick={() => setThumbnailOpen(true)}
            >
              {t('adjustThumbnail')}
            </button>
          </div>
        </CoverPositionFrame>
      ) : (
        <button
          type="button"
          onClick={openPicker}
          className="group relative h-48 w-full overflow-hidden bg-blue-800/10 sm:h-72"
        >
          <span className="absolute inset-0 flex items-center justify-center bg-blue-800/0 px-4 text-center text-sm text-white opacity-0 transition group-hover:bg-blue-800/50 group-hover:opacity-100">
            {t('changeCoverPhoto')}
          </span>
        </button>
      )}

      {displayUrl ? (
        <Dialog
          open={thumbnailOpen}
          onClose={() => setThumbnailOpen(false)}
          title={t('adjustThumbnail')}
          className="max-w-3xl"
        >
          <CoverPositionFrame
            src={displayUrl}
            position={cardPosition}
            onChange={onCardPositionChange}
            label={t('adjustThumbnail')}
            className="aspect-[16/10] w-full rounded-lg"
            centerLabel={t('coverPositionCenter')}
            onCenter={() => onCardPositionChange(COVER_POSITION_CENTER)}
          />
        </Dialog>
      ) : null}
    </>
  )
}
