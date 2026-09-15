import React from 'react'
import type { BulkStageActionPhase } from '../hooks/useBulkStageAction'

interface StageTransitionTrackProps {
  fromLabel: string
  toLabel: string
  /** Colour the destination dot lights up in while candidates are moving. */
  accent: string
  phase: BulkStageActionPhase
  className?: string
  style?: React.CSSProperties
}

/**
 * StageTransitionTrack
 * "● Applied ────→ ● Screening" route shown in the bulk action modal. Draws itself
 * on confirm, then animates candidates travelling to the destination while processing.
 */
export const StageTransitionTrack: React.FC<StageTransitionTrackProps> = ({
  fromLabel,
  toLabel,
  accent,
  phase,
  className = '',
  style,
}) => (
  <div
    data-phase={phase}
    className={`bsa-track flex items-center font-inter text-sm leading-5 ${className}`}
    style={{ '--bsa-accent': accent, ...style } as React.CSSProperties}
    aria-label={`From ${fromLabel} to ${toLabel}`}
    role="img"
  >
    <span className="bsa-track-dot bsa-track-from size-3 shrink-0 rounded-full" />
    <span className="bsa-track-label-from ml-2 shrink-0">{fromLabel}</span>

    <span className="bsa-track-lane relative mx-4 h-2.5 min-w-8 flex-1">
      <span className="bsa-track-line absolute inset-x-0 top-1/2 h-px -translate-y-1/2" />
      <span className="bsa-track-fill absolute inset-x-0 top-1/2 h-px -translate-y-1/2" />
      <span className="bsa-track-glint absolute left-0 top-1/2 h-[3px] w-9 -translate-y-1/2 rounded-full" />
      <svg
        className="bsa-track-arrow absolute -right-px top-1/2 h-2.5 w-1.5"
        viewBox="0 0 6 10"
        fill="none"
        aria-hidden
      >
        <path
          d="M1 1l4 4-4 4"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>

    <span className="bsa-track-dot bsa-track-to size-3 shrink-0 rounded-full" />
    <span className="bsa-track-label-to ml-2 shrink-0">{toLabel}</span>
  </div>
)

export default StageTransitionTrack
