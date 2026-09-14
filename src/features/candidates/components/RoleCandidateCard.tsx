import React from 'react'
import { useNavigate } from 'react-router-dom'
import type { RoleCandidateOverview } from '../types/candidates.types'
import StageProgressBar from './StageProgressBar'
import Tag from '@/shared/ui/Tag'

interface RoleCandidateCardProps {
  role: RoleCandidateOverview
}

/**
 * RoleCandidateCard renders an individual active role with its candidate statistics,
 * hiring stage progress bars, and link to the role pipeline.
 */
export const RoleCandidateCard: React.FC<RoleCandidateCardProps> = ({ role }) => {
  const navigate = useNavigate()
  const { title, status, metrics, stages, pipelineUrl, id } = role

  const handleOpenPipeline = () => {
    if (pipelineUrl) {
      navigate(pipelineUrl)
    } else {
      navigate(`/candidates/${id}`)
    }
  }

  return (
    <div className="bg-[#FFFFFF] rounded-xl border border-[#E9ECEF] shadow-xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between">
      {/* Top Header: Title & Status Badge */}
      <div className="pt-5 px-5 sm:px-5 sm:pt-6">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-[#21252A] text-base sm:text-lg tracking-[0%] line-clamp-1">
            {title}
          </h3>
          <Tag
            label={status}
            variant={status === 'Active' ? 'success' : 'inactive'}
            rounded="xl"
            className="shrink-0 px-2.5 py-2 leading-none"
          />
        </div>

        {/* 3-Column Metrics Row with Dividers matching Figma */}
        <div className="flex items-center mt-6 mb-10">
          <div className="flex-1 flex flex-col gap-1.5 pr-3 sm:pr-4 border-r border-[#E9ECEF] leading-[100%] tracking-[0%]">
            <div className="text-base sm:text-[20px] font-sans font-semibold text-[#21252A]">
              {metrics.totalCandidates}
            </div>
            <div className="text-xs font-medium text-[#868E96] whitespace-nowrap">
              Total candidates
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-1.5 px-3 sm:px-4 border-r border-[#E9ECEF] leading-[100%] tracking-[0%]">
            <div className="text-base sm:text-[20px] font-sans font-semibold text-[#21252A]">
              {metrics.newToday}
            </div>
            <div className="text-xs font-medium text-[#868E96] whitespace-nowrap">New Today</div>
          </div>

          <div className="flex-1 flex flex-col gap-1.5 px-3 sm:px-4 border-r border-[#E9ECEF] leading-[100%] tracking-[0%]">
            <div className="text-base sm:text-[20px] font-sans font-semibold text-[#21252A]">
              {metrics.avgTimeToHire}
            </div>
            <div className="text-xs font-medium text-[#868E96] whitespace-nowrap">
              Avg. Time to hire
            </div>
          </div>

          {/* Right Spacer matching Figma layout */}
          <div className="hidden sm:block w-8 lg:w-12 shrink-0" />
        </div>

        {/* Hiring Stages Progress Breakdown */}
        <div className="space-y-2">
          {stages.map((stage) => (
            <StageProgressBar key={stage.key} stage={stage} />
          ))}
        </div>
      </div>

      {/* Card Footer: Action Button */}
      <button
        type="button"
        onClick={handleOpenPipeline}
        className="w-full mt-5 bg-[#FFFFFF] border-t border-[#F1F3F5] p-6 flex items-center justify-center gap-2.5 text-[16px] font-medium leading-[100%] tracking-[0%] text-[#062DF6] hover:text-[#1D4ED8] hover:bg-slate-50/50 transition-colors cursor-pointer group rounded-b-xl"
      >
        <span>Open pipeline</span>
        <img
          src="/arrow-right.svg"
          alt="arrow-right icon"
          className="inline-block transition-transform duration-200 group-hover:translate-x-1"
        />
      </button>
    </div>
  )
}

export default RoleCandidateCard
