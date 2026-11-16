import { useRef, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react'
import type { CoverPosition } from '../lib/coverPosition'
import { coverObjectPosition, coverPositionAfterDrag, clampCoverAxis } from '../lib/coverPosition'

export const coverOverlayButtonClass =
  'cursor-pointer rounded-md border border-blue-800 bg-white px-3 py-2 text-sm text-blue-800 shadow-sm hover:border-white hover:bg-blue-800 hover:text-white'

type CoverPositionFrameProps = {
  src: string
  position: CoverPosition
  onChange: (position: CoverPosition) => void
  label: string
  className?: string
  styleAspect?: number
  centerLabel?: string
  onCenter?: () => void
  children?: ReactNode
}

export function CoverPositionFrame({
  src,
  position,
  onChange,
  label,
  className = '',
  styleAspect,
  centerLabel,
  onCenter,
  children,
}: CoverPositionFrameProps) {
  const frameRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const dragRef = useRef<{
    pointerId: number
    x: number
    y: number
    position: CoverPosition
  } | null>(null)

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return
    dragRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      position,
    }
    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // Some pointer events cannot be captured. Drag still tracks pointermove.
    }
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    const frame = frameRef.current
    if (!drag || !frame || event.pointerId !== drag.pointerId) return
    const rect = frame.getBoundingClientRect()
    onChange(
      coverPositionAfterDrag(
        drag.position,
        event.clientX - drag.x,
        event.clientY - drag.y,
        rect.width,
        rect.height,
        imageRef.current,
      ),
    )
  }

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const step = event.shiftKey ? 10 : 2
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      onChange({ ...position, x: clampCoverAxis(position.x - step) })
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      onChange({ ...position, x: clampCoverAxis(position.x + step) })
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      onChange({ ...position, y: clampCoverAxis(position.y - step) })
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      onChange({ ...position, y: clampCoverAxis(position.y + step) })
    }
  }

  return (
    <div
      ref={frameRef}
      role="group"
      tabIndex={0}
      aria-label={label}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={onKeyDown}
      style={styleAspect ? { aspectRatio: String(styleAspect) } : undefined}
      className={`relative cursor-grab touch-none overflow-hidden bg-blue-800/10 outline-none select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 active:cursor-grabbing ${className}`}
    >
      <img
        ref={imageRef}
        src={src}
        alt=""
        draggable={false}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: coverObjectPosition(position) }}
      />
      {children}
      {onCenter ? (
        <button
          type="button"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={onCenter}
          className={`pointer-events-auto absolute top-3 right-3 z-10 ${coverOverlayButtonClass}`}
        >
          {centerLabel}
        </button>
      ) : null}
    </div>
  )
}
