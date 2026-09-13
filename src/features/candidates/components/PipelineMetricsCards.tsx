import React from 'react'
import type { RolePipelineDetail } from '../types/candidates.types'

interface PipelineMetricsCardsProps {
  metrics: RolePipelineDetail['metrics']
}

/**
 * PipelineMetricsCards
 * Displays the 4 summary metrics for the role pipeline:
 * Total candidates, New Today, Avg. Time to hire, and Active interviews.
 */
export const PipelineMetricsCards: React.FC<PipelineMetricsCardsProps> = ({ metrics }) => {
  return (
    <div className="flex items-center flex-wrap gap-y-3 gap-x-15">
      {/* Total candidates */}
      <div className="flex flex-col gap-1 pr-6 sm:pr-8 border-r border-[#E9ECEF] leading-[100%]">
        <div className="text-lg sm:text-xl font-sans font-semibold text-[#000000]">
          {metrics.totalCandidates}
        </div>
        <div className="text-xs sm:text-[14px] font-medium text-[#868E96]">Total candidates</div>
      </div>

      {/* New Today */}
      <div className="flex flex-col gap-1 pr-6 sm:pr-8 border-r border-[#E9ECEF] leading-[100%]">
        <div className="text-lg sm:text-xl font-sans font-semibold text-[#000000]">
          {metrics.newToday}
        </div>
        <div className="text-xs sm:text-[14px] font-medium text-[#868E96]">New Today</div>
      </div>

      {/* Avg. Time to hire */}
      <div className="flex flex-col gap-1 pr-6 sm:pr-8 border-r border-[#E9ECEF] leading-[100%]">
        <div className="text-lg sm:text-xl font-sans font-semibold text-[#000000]">
          {metrics.avgTimeToHire}
        </div>
        <div className="text-xs sm:text-[14px] font-medium text-[#868E96]">Avg. Time to hire</div>
      </div>

      {/* Active interviews */}
      <div className="flex flex-col gap-1 pr-6 sm:pr-8 border-r border-[#E9ECEF] leading-[100%]">
        <div className="text-lg sm:text-xl font-sans font-semibold text-[#000000]">
          {metrics.activeInterviews}
        </div>
        <div className="text-xs sm:text-[14px] font-medium text-[#868E96]">Active interviews</div>
      </div>
    </div>
  )
}

export default PipelineMetricsCards
