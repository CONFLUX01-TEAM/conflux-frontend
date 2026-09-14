import React from 'react'
import type { PipelineCandidate, CandidateStageStatus } from '../types/candidates.types'

interface PipelineCandidateCardProps {
  candidate: PipelineCandidate
  onClick?: () => void
  isBulkMode?: boolean
  isSelected?: boolean
  onToggleSelect?: (candidateId: string) => void
}

const STATUS_DOT_COLORS: Record<CandidateStageStatus, string> = {
  Complete: 'bg-[#08AB44]',
  Pending: 'bg-[#F59E0B]',
  'In progress': 'bg-[#062DF6]',
  'No show': 'bg-[#FC2424]',
}

/**
 * Renders an individual candidate card inside a pipeline Kanban stage column.
 */
export const PipelineCandidateCard: React.FC<PipelineCandidateCardProps> = ({
  candidate,
  onClick,
  isBulkMode = false,
  isSelected = false,
  onToggleSelect,
}) => {
  const { id, name, initials, atsScore, status, timeInStage } = candidate

  const dotColor = STATUS_DOT_COLORS[status] || 'bg-slate-400'

  const handleCardClick = () => {
    if (isBulkMode) {
      onToggleSelect?.(id)
    } else {
      onClick?.()
    }
  }

  return (
    <div
      onClick={handleCardClick}
      className="bg-[#FFFFFF] rounded-xl border border-[#F1F3F5] hover:border-slate-300 p-5 shadow-2xs hover:shadow-sm transition-all duration-200 cursor-pointer flex flex-col"
    >
      {/* Checkbox when Bulk Action Mode is Active */}
      {isBulkMode && (
        <div className="mb-3.75 -ml-2.25">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onToggleSelect?.(id)
            }}
            className={`size-4.5 rounded flex items-center justify-center transition-colors cursor-pointer ${
              isSelected
                ? 'bg-[#0D2D54] border border-[#0D2D54] text-white'
                : 'border border-[#ADB5BD] bg-white hover:border-[#868E96]'
            }`}
            aria-label={`Select ${name}`}
          >
            {isSelected && (
              <img src="/check_mark-icon.svg" alt="" className="size-2.5 brightness-0 invert" />
            )}
          </button>
        </div>
      )}

      {/* Top: Avatar + Name & ATS Match Score with Badge */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="gap-2.5 rounded-full bg-[#DEE2E6] p-5 text-[#868E96] font-semibold font-sans text-[16px] flex items-center justify-center shrink-0">
          {initials}
        </div>
        <div className="min-w-0 flex flex-col justify-center">
          <h4 className="text-sm sm:text-[15px] font-bold text-[#21252A] truncate leading-tight">
            {name}
          </h4>
          <div className="flex items-center gap-6.5">
            <span className="text-xs font-inter font-normal text-[#535353] leading-[100%] whitespace-nowrap">
              ATS match score
            </span>
            <span className="shrink-0 inline-flex items-center gap-2.5 justify-center px-3 py-1.5 rounded-lg bg-[#DEEBFA] text-[#1C61B6] text-[14px] font-sans font-medium leading-[100%] tracking-[0%]">
              {atsScore}%
            </span>
          </div>
        </div>
      </div>

      {/* Candidate Status & Time in Stage Container */}
      <div className="mt-4.5 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-[15px] font-medium font-sans text-[#000000] leading-[100%] tracking-[0%]">
          <span className={`size-3 rounded-full shrink-0 ${dotColor}`} />
          <span>{status}</span>
        </div>

        <div className="flex items-center gap-2 text-[13px] font-normal font-inter leading-[100%] text-[#495057] tracking-[0%]">
          <img src="/mage_clock-icon.svg" alt="" className="size-3.5 shrink-0" />
          <span>{timeInStage}</span>
        </div>
      </div>
    </div>
  )
}

export default PipelineCandidateCard
