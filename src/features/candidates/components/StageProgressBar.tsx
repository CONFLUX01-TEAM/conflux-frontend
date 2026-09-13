import React from 'react'
import type { StageMetric, ProgressBarColor } from '../types/candidates.types'

interface StageProgressBarProps {
  stage: StageMetric
  /** Benchmark max count to calculate proportional width. Defaults to 160 */
  benchmarkMax?: number
}

const COLOR_MAP: Record<ProgressBarColor, string> = {
  navy: 'bg-[#175095]',
  blue: 'bg-[#3C86E1]',
  lightBlue: 'bg-[#7DAEEB]',
}

/**
 * Renders an individual pipeline stage with label, styled horizontal progress bar, and candidate count.
 */
export const StageProgressBar: React.FC<StageProgressBarProps> = ({
  stage,
  benchmarkMax = 122,
}) => {
  const { label, count, colorVariant = 'navy' } = stage

  // Calculate proportional bar width with a minimum width for visual clarity
  const percentage = Math.min(
    100,
    Math.max(count > 0 ? 10 : 0, Math.round((count / benchmarkMax) * 100)),
  )

  const barColorClass = COLOR_MAP[colorVariant] || 'bg-[#0D2D54]'

  return (
    <div className="flex items-center justify-between text-xs sm:text-sm py-1">
      {/* Stage Name */}
      <span className="w-20 sm:w-24 shrink-0 font-medium font-sans text-[#495057] truncate">
        {label}
      </span>

      {/* Progress Track */}
      <div className="flex-1 mx-2.5 sm:mx-3 h-3 bg-[#E9ECEF] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${barColorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Count */}
      <span className="w-8 shrink-0 text-right font-semibold text-[16px] text-[#21252A] font-sans">
        {count}
      </span>
    </div>
  )
}

export default StageProgressBar
