import React from 'react'
import type { PipelineStageDetail, PipelineCandidate } from '../types/candidates.types'
import PipelineCandidateCard from './PipelineCandidateCard'

interface PipelineStageColumnProps {
  stage: PipelineStageDetail
  onCandidateClick?: (candidate: PipelineCandidate) => void
  isBulkMode?: boolean
  selectedCandidateIds?: string[]
  onToggleSelectCandidate?: (candidateId: string) => void
}

/**
 * PipelineStageColumn
 * Renders a single Kanban stage column with header accents, counters, and candidate cards stack.
 */
export const PipelineStageColumn: React.FC<PipelineStageColumnProps> = ({
  stage,
  onCandidateClick,
  isBulkMode = false,
  selectedCandidateIds = [],
  onToggleSelectCandidate,
}) => {
  const { label, count, newTodayCount, accentColor, candidates } = stage

  return (
    <div className="w-[340px] shrink-0 bg-[#FFFFFF] rounded-xl border border-[#E9ECEF] p-4 sm:p-5 flex flex-col shadow-2xs">
      {/* Column Header */}
      <div className="flex items-stretch gap-2 mb-7 ml-3.75 mt-3.5">
        {/* Full-height vertical accent line spanning title + subtitle */}
        <span className="w-1 rounded-full shrink-0" style={{ backgroundColor: accentColor }} />

        <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
          {/* Stage Name & Count Badge */}
          <div className="flex items-center gap-5.5">
            <h3 className="font-semibold font-sans text-base sm:text-[20px] text-[#000000] tracking-[0%] leading-[100%]">
              {label}
            </h3>
            <span className="inline-flex items-center justify-center px-3 py-1 gap-2.5 rounded-full bg-[#E0E0E0] text-[#000000] text-[15px] font-medium font-sans leading-[100%] tracking-[0%]">
              {count}
            </span>
          </div>

          {/* Subtitle */}
          <p className="text-xs font-medium font-sans text-[#868E96] tracking-[0%] leading-[100%]">
            {newTodayCount} new today
          </p>
        </div>
      </div>

      {/* Candidate Cards Stack */}
      <div className="space-y-2 flex-1 min-h-[120px]">
        {candidates.map((candidate) => (
          <PipelineCandidateCard
            key={candidate.id}
            candidate={candidate}
            onClick={() => onCandidateClick?.(candidate)}
            isBulkMode={isBulkMode}
            isSelected={selectedCandidateIds.includes(candidate.id)}
            onToggleSelect={onToggleSelectCandidate}
          />
        ))}

        {candidates.length === 0 && (
          <div className="p-6 border border-dashed border-[#DEE2E6] rounded-2xl text-center text-xs text-[#868E96] bg-slate-50/50">
            No candidates in this stage
          </div>
        )}
      </div>
    </div>
  )
}

export default PipelineStageColumn
