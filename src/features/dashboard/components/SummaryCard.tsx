import type { Metric } from '../types'

interface SummaryCardProps {
  metric: Metric
}

const SummaryCard = ({ metric }: SummaryCardProps) => {
  const { title, value, percentageChange, isIncrease, iconType } = metric

  // Determine styles based on icon type
  let iconBg = 'bg-[#EBF3FF]'
  let iconPath = ''

  switch (iconType) {
    case 'briefcase':
      iconBg = 'bg-[#EAF2FF]'
      iconPath = '/dashboard/blue_briefcase-icon.svg'
      break
    case 'user':
      iconBg = 'bg-[#E0F7FA]'
      iconPath = '/dashboard/users-icon.svg'
      break
    case 'clipboard':
      iconBg = 'bg-[#EDE7F6]'
      iconPath = '/dashboard/checklist-icon.svg'
      break
    case 'video':
      iconBg = 'bg-[#FFF8E7]'
      iconPath = '/dashboard/videocamera-icon.svg'
      break
    case 'briefcase_green':
      iconBg = 'bg-[#EAF9F1]'
      iconPath = '/dashboard/green_briefcase-icon.svg'
      break
  }

  return (
    <div className="flex flex-col justify-between p-4 sm:py-[17px] sm:p-[10px] bg-[#FFFFFF] border-[0.5px] border-[#B5B5B5] rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.02)] min-h-[7.5rem] w-full">
      {/* Top row: Title and Icon */}
      <div className="flex items-start justify-between gap-2 w-full">
        <span className="font-sans text-xs sm:text-[1rem] text-[#3B3B3B] font-medium leading-[120%]">
          {title}
        </span>

        <div
          className={`flex items-center justify-center p-2 rounded-[0.375rem] ${iconBg} shrink-0`}
        >
          {iconPath && <img src={iconPath} alt="" className="size-[1.75rem] object-contain" />}
        </div>
      </div>

      {/* Middle row: Large count value */}
      <div>
        <span className="font-sans text-2xl sm:text-[2rem] font-medium text-[#000000] leading-[100%]">
          {value.toLocaleString()}
        </span>
      </div>

      {/* Bottom row: Trend percentage */}
      <div className="flex items-center flex-wrap gap-y-1 font-sans mt-4 font-medium text-[0.75rem] sm:text-[0.875rem]">
        <span
          className={`mr-1 flex items-center gap-0.5 shrink-0 ${isIncrease ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}
        >
          <img
            src="/dashboard/arrow-up-icon.svg"
            alt=""
            className={`size-[17px] object-contain ${isIncrease ? '' : 'rotate-180'}`}
          />
          {percentageChange}%
        </span>
        <span className="text-[#9D9D9D]">from last month</span>
      </div>
    </div>
  )
}

export default SummaryCard
