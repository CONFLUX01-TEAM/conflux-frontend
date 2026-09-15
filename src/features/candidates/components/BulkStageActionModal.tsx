import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Button from '@/shared/ui/Button'
import usePresence from '@/shared/hooks/usePresence'
import type { BulkStageActionRequest } from '../hooks/useBulkStageAction'
import { pluralizeCandidates } from '../utils/bulkStageAction'
import StageTransitionTrack from './StageTransitionTrack'
import './bulkStageAction.css'

/** Matches the longest `data-state='closed'` animation in bulkStageAction.css. */
const EXIT_MS = 280
/** Matches `.bsa-leaving` in bulkStageAction.css. */
const PHASE_SWAP_MS = 220

const order = (i: number) => ({ '--i': i }) as React.CSSProperties

interface BulkStageActionModalProps {
  request: BulkStageActionRequest | null
  onCancel: () => void
  onConfirm: () => void
}

/**
 * BulkStageActionModal
 * Confirmation → processing modal for bulk "Advance stage" / "Reject candidates".
 * The card morphs between phases in place, and stays mounted long enough to animate out.
 */
export const BulkStageActionModal: React.FC<BulkStageActionModalProps> = ({
  request,
  onCancel,
  onConfirm,
}) => {
  const { rendered, isClosing } = usePresence(request, EXIT_MS)

  if (!rendered || typeof document === 'undefined') return null

  return createPortal(
    <ModalSurface
      request={rendered}
      isClosing={isClosing}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />,
    document.body,
  )
}

interface ModalSurfaceProps {
  request: BulkStageActionRequest
  isClosing: boolean
  onCancel: () => void
  onConfirm: () => void
}

const ModalSurface: React.FC<ModalSurfaceProps> = ({ request, isClosing, onCancel, onConfirm }) => {
  const titleId = useId()
  const descriptionId = useId()
  const cardRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number>()

  // Keep the outgoing phase on screen briefly so it can lift away during the morph.
  const [previous, setPrevious] = useState(request)
  const [leaving, setLeaving] = useState<BulkStageActionRequest | null>(null)
  if (request !== previous) {
    if (request.phase !== previous.phase) setLeaving(previous)
    setPrevious(request)
  }

  useEffect(() => {
    if (!leaving) return
    const timeout = window.setTimeout(() => setLeaving(null), PHASE_SWAP_MS)
    return () => window.clearTimeout(timeout)
  }, [leaving])

  // Pin the card to its content's height so phase changes animate the resize.
  useLayoutEffect(() => {
    const content = contentRef.current
    if (!content || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(() => setHeight(content.offsetHeight))
    observer.observe(content)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalOverflow
      previouslyFocused?.focus?.({ preventScroll: true })
    }
  }, [])

  useEffect(() => {
    const target =
      request.phase === 'confirm'
        ? contentRef.current?.querySelector<HTMLElement>('[data-autofocus]')
        : cardRef.current
    target?.focus({ preventScroll: true })
  }, [request.phase])

  const canDismiss = request.phase === 'confirm' && !isClosing

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.stopPropagation()
      if (canDismiss) onCancel()
      return
    }

    if (event.key !== 'Tab') return

    const focusables = Array.from(
      contentRef.current?.querySelectorAll<HTMLElement>('button:not([disabled])') ?? [],
    )
    if (focusables.length === 0) {
      event.preventDefault()
      return
    }

    // Wrap focus at either end (or pull it back in from the card itself).
    const index = focusables.indexOf(document.activeElement as HTMLElement)
    const lastIndex = focusables.length - 1
    if (event.shiftKey && index <= 0) {
      event.preventDefault()
      focusables[lastIndex].focus()
    } else if (!event.shiftKey && (index === -1 || index === lastIndex)) {
      event.preventDefault()
      focusables[0].focus()
    }
  }

  return (
    <div
      className="bsa-motion bsa-modal fixed inset-0 z-[9998] flex items-center justify-center p-4"
      data-state={isClosing ? 'closed' : 'open'}
      onKeyDown={handleKeyDown}
    >
      <div
        className="bsa-backdrop absolute inset-0"
        aria-hidden
        onMouseDown={canDismiss ? onCancel : undefined}
      />

      <div
        ref={cardRef}
        role={request.phase === 'confirm' ? 'alertdialog' : 'dialog'}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        aria-busy={request.phase === 'processing' || undefined}
        tabIndex={-1}
        className="bsa-card relative w-full max-w-[30rem] overflow-hidden rounded-2xl bg-white outline-none"
        style={height === undefined ? undefined : { height }}
      >
        <div ref={contentRef}>
          <div key={request.phase} className="bsa-phase" data-phase={request.phase}>
            <PhaseContent
              request={request}
              titleId={titleId}
              descriptionId={descriptionId}
              onCancel={onCancel}
              onConfirm={onConfirm}
            />
          </div>
        </div>

        {leaving && (
          <div className="bsa-leaving absolute inset-x-0 top-0" aria-hidden inert>
            <div className="bsa-phase" data-phase={leaving.phase}>
              <PhaseContent request={leaving} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface PhaseContentProps {
  request: BulkStageActionRequest
  titleId?: string
  descriptionId?: string
  onCancel?: () => void
  onConfirm?: () => void
}

const PhaseContent: React.FC<PhaseContentProps> = (props) =>
  props.request.phase === 'confirm' ? (
    <ConfirmContent {...props} />
  ) : (
    <ProcessingContent {...props} />
  )

const trackLabels = ({ fromLabel, toLabel, kind }: BulkStageActionRequest) => ({
  from: fromLabel ?? 'Multiple stages',
  to: toLabel ?? (kind === 'reject' ? 'Rejected' : 'Next stage'),
})

const ConfirmContent: React.FC<PhaseContentProps> = ({
  request,
  titleId,
  descriptionId,
  onCancel,
  onConfirm,
}) => {
  const { kind, count, fromLabel, toLabel, toAccent } = request
  const isReject = kind === 'reject'
  const candidates = pluralizeCandidates(count)
  const labels = trackLabels(request)

  const title = isReject ? 'Reject candidates?' : 'Advance candidates?'
  const lead = isReject
    ? `Are you sure you want to reject ${candidates}`
    : fromLabel && toLabel
      ? `You’re about to move ${candidates} from ${fromLabel} to ${toLabel}`
      : `You’re about to move ${candidates} to their next stage`
  const detail = isReject
    ? `${count === 1 ? 'This candidate' : 'These candidates'} will be removed from the active hiring pipeline. You can still view them under Rejected`
    : toLabel
      ? `They’ll appear in the ${toLabel} stage and the current stage will be updated`
      : 'They’ll appear in their next stages and the current stages will be updated'

  return (
    <div className="px-6 pt-8 pb-9 text-center sm:px-8">
      <IconBadge kind={kind} />

      <h2
        id={titleId}
        className="bsa-item mt-4 font-sans text-2xl leading-8 font-semibold text-[#111827]"
        style={order(1)}
      >
        {title}
      </h2>
      <p
        id={descriptionId}
        // Widths reproduce the design's line breaks: the reject question sits on one line.
        className={`bsa-item mx-auto mt-3 font-inter text-base leading-6 text-[#6C757D] ${
          isReject ? 'max-w-[24rem]' : 'max-w-[20rem]'
        }`}
        style={order(2)}
      >
        {lead}
      </p>
      <p
        className="bsa-item mx-auto mt-5 max-w-[20rem] font-inter text-base leading-6 text-[#9AA0A6]"
        style={order(3)}
      >
        {detail}
      </p>

      <StageTransitionTrack
        phase="confirm"
        fromLabel={labels.from}
        toLabel={labels.to}
        accent={toAccent}
        className="bsa-item mt-9 sm:px-6"
        style={order(4)}
      />

      <div className="bsa-item mt-14 grid grid-cols-[2fr_3fr] gap-4" style={order(5)}>
        <Button
          type="button"
          onClick={onCancel}
          data-autofocus={isReject || undefined}
          className="h-11 rounded-lg border border-[#DEE2E6] bg-white font-inter text-sm font-medium text-[#21252A] hover:border-[#CED4DA] hover:bg-[#F8F9FA] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D2D54]"
          label="Cancel"
        />
        <Button
          type="button"
          onClick={onConfirm}
          data-autofocus={!isReject || undefined}
          className={`h-11 rounded-lg font-inter text-sm font-medium text-white active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 ${
            isReject
              ? 'bg-[#EF4444] hover:bg-[#DC2626] focus-visible:outline-[#EF4444]'
              : 'bg-[#0D2D54] hover:bg-[#0A2342] focus-visible:outline-[#0D2D54]'
          }`}
          label={`${isReject ? 'Reject' : 'Advance'} ${pluralizeCandidates(count, 'Candidate')}`}
        />
      </div>
    </div>
  )
}

const ProcessingContent: React.FC<PhaseContentProps> = ({ request, titleId, descriptionId }) => {
  const { kind, count, toLabel, toAccent } = request
  const isReject = kind === 'reject'
  const labels = trackLabels(request)
  const destination = isReject ? 'Rejected' : (toLabel?.toLowerCase() ?? 'their next stages')

  return (
    <div className="px-6 pt-9 pb-13 text-center sm:px-8" aria-live="polite">
      <div
        className={`bsa-spinner mx-auto size-12 ${isReject ? 'text-[#EF4444]' : 'text-[#0D2D54]'}`}
        aria-hidden
      >
        <svg className="size-12" viewBox="0 0 48 48" fill="none">
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            pathLength={100}
          />
        </svg>
      </div>

      <h2
        id={titleId}
        className="bsa-item mt-7 font-sans text-2xl leading-8 font-semibold text-[#111827]"
        style={order(1)}
      >
        {isReject ? 'Rejecting candidates' : 'Advancing candidates'}
      </h2>
      <p
        id={descriptionId}
        className="bsa-item mx-auto mt-3 max-w-[16rem] font-inter text-base leading-6 text-[#9AA0A6]"
        style={order(2)}
      >
        Please wait while we move {pluralizeCandidates(count)} to {destination}
      </p>

      <StageTransitionTrack
        phase="processing"
        fromLabel={labels.from}
        toLabel={labels.to}
        accent={toAccent}
        className="bsa-item mt-15 sm:px-6"
        style={order(3)}
      />
    </div>
  )
}

const IconBadge: React.FC<{ kind: BulkStageActionRequest['kind'] }> = ({ kind }) => (
  <div
    data-tone={kind}
    className={`bsa-badge relative mx-auto flex size-20 items-center justify-center rounded-full ${
      kind === 'reject' ? 'bg-[#FDECEC] text-[#F5A3A3]' : 'bg-[#DEEBFA] text-[#8DB6EC]'
    }`}
    aria-hidden
  >
    {kind === 'reject' ? (
      <svg className="bsa-badge-glyph size-8 text-[#EF4444]" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 3 4.75 5.75v5.6c0 4.5 3.05 8.2 7.25 9.4 4.2-1.2 7.25-4.9 7.25-9.4v-5.6L12 3Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M12 8.5v4.25M12 15.9h.01"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ) : (
      // Same glyph as /arrow-right.svg (used on the "Advance stage" button), turned to point up-right.
      <svg className="bsa-badge-glyph size-8 text-[#0D2D54]" viewBox="0 0 16 16" fill="none">
        <path
          d="M2.5 8H13M9.5 12L13.5 8L9.5 4"
          transform="rotate(-45 8 8)"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )}
  </div>
)

export default BulkStageActionModal
