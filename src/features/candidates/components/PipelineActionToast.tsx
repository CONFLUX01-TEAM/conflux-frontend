import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import usePresence from '@/shared/hooks/usePresence'
import type { BulkStageActionToast } from '../hooks/useBulkStageAction'
import { pluralizeCandidates } from '../utils/bulkStageAction'
import './bulkStageAction.css'

export const PIPELINE_TOAST_DURATION_MS = 6000
/** Matches `.bsa-toast[data-state='closed']` in bulkStageAction.css. */
const EXIT_MS = 260

const TONES = {
  advance: {
    accent: '#22A45D',
    surface: 'border-[#BFE5CC] bg-[#EAF7EF]',
    action: 'text-[#1E9A55] hover:text-[#157A42] focus-visible:outline-[#1E9A55]',
    close: 'text-[#6C757D]',
  },
  reject: {
    accent: '#EF4444',
    surface: 'border-[#F7C9C9] bg-[#FDECEC]',
    action: 'text-[#EF4444] hover:text-[#C92A2A] focus-visible:outline-[#EF4444]',
    close: 'text-[#EF4444]',
  },
} as const

const order = (i: number) => ({ '--i': i }) as React.CSSProperties

interface PipelineActionToastProps {
  toast: BulkStageActionToast | null
  onUndo: () => void
  onDismiss: () => void
}

/**
 * PipelineActionToast
 * Undoable "4 candidates advanced / rejected" notice shown under the header once a
 * bulk stage action lands. Auto-dismisses, pausing while hovered or focused.
 */
export const PipelineActionToast: React.FC<PipelineActionToastProps> = ({
  toast,
  onUndo,
  onDismiss,
}) => {
  const { rendered, isClosing } = usePresence(toast, EXIT_MS)

  if (!rendered || typeof document === 'undefined') return null

  return createPortal(
    <div className="bsa-motion pointer-events-none fixed top-[4.8125rem] right-4 z-[9999] sm:top-[6.0625rem] sm:right-6 lg:top-[7.3125rem] lg:right-10">
      <ToastCard
        key={rendered.id}
        toast={rendered}
        isClosing={isClosing}
        onUndo={onUndo}
        onDismiss={onDismiss}
      />
    </div>,
    document.body,
  )
}

interface ToastCardProps {
  toast: BulkStageActionToast
  isClosing: boolean
  onUndo: () => void
  onDismiss: () => void
}

const ToastCard: React.FC<ToastCardProps> = ({ toast, isClosing, onUndo, onDismiss }) => {
  const [isPaused, setIsPaused] = useState(false)
  const remainingMsRef = useRef(PIPELINE_TOAST_DURATION_MS)

  useEffect(() => {
    if (isPaused || isClosing) return

    const startedAt = Date.now()
    const timeout = window.setTimeout(onDismiss, remainingMsRef.current)
    return () => {
      window.clearTimeout(timeout)
      remainingMsRef.current -= Date.now() - startedAt
    }
  }, [isPaused, isClosing, onDismiss])

  const tone = TONES[toast.kind]
  const isReject = toast.kind === 'reject'
  const title = `${pluralizeCandidates(toast.count)} ${isReject ? 'rejected' : 'advanced'}`
  const detail = `Moved to ${isReject ? 'Rejected' : (toast.toLabel ?? 'next stage')}`

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      data-state={isClosing ? 'closed' : 'open'}
      className={`bsa-toast pointer-events-auto relative w-[17.5rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[0.625rem] border py-3 pr-3 pl-4 ${tone.surface}`}
      style={{ '--bsa-accent': tone.accent } as React.CSSProperties}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="flex items-center gap-3">
        <span
          className="bsa-toast-dot relative flex size-5 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: `${tone.accent}33` }}
          aria-hidden
        >
          <span className="size-3 rounded-full" style={{ backgroundColor: tone.accent }} />
        </span>

        <div className="min-w-0 flex-1">
          <p
            className="bsa-toast-text truncate pr-5 font-inter text-sm leading-5 font-semibold text-[#21252A]"
            style={order(0)}
          >
            {title}
          </p>
          <div className="mt-0.5 flex items-center justify-between gap-3">
            <p
              className="bsa-toast-text truncate font-inter text-xs leading-4 text-[#6C757D]"
              style={order(1)}
            >
              {detail}
            </p>
            <button
              type="button"
              onClick={onUndo}
              className={`bsa-toast-text -my-1 shrink-0 cursor-pointer rounded px-1 py-1 font-inter text-xs leading-4 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 ${tone.action}`}
              style={order(2)}
            >
              Undo
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className={`absolute top-2 right-2 flex size-5 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-current ${tone.close}`}
      >
        {/* Same glyph as /x-icon.svg, drawn in currentColor so it takes the toast tone. */}
        <svg className="size-2" viewBox="0 0 10 10" fill="none" aria-hidden>
          <path
            d="M8.75 0.75L0.75 8.75M8.75 8.75L0.75 0.75"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  )
}

export default PipelineActionToast
