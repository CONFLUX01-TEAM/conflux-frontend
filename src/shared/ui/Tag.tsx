import React from 'react'

export type TagVariant =
  | 'navy'
  | 'outline'
  | 'neutral'
  | 'subtle'
  | 'high'
  | 'warning'
  | 'missing'
  | 'required'
  | 'review'
  | 'success'
  | 'inactive'

export interface TagProps {
  label: string
  onRemove?: () => void
  variant?: TagVariant
  size?: 'sm' | 'md' | 'lg'
  dot?: boolean
  rounded?: 'full' | 'xl'
  className?: string
}

export const Tag: React.FC<TagProps> = ({
  label,
  onRemove,
  variant = 'outline',
  size = 'md',
  dot = false,
  rounded = 'full',
  className = '',
}) => {
  const variantStyles: Record<TagVariant, string> = {
    navy: 'bg-[#0D2D54] text-white border-transparent shadow-2xs font-medium',
    outline:
      'bg-white text-[#0D2D54] border-[#CBD5E1] hover:border-[#0D2D54]/40 hover:bg-[#0D2D54]/[0.02] shadow-2xs font-normal',
    neutral: 'bg-white text-[#0D2D54] border-[#CBD5E1] shadow-2xs font-normal',
    subtle: 'bg-[#0D2D54]/5 text-[#0D2D54] border-[#0D2D54]/10 font-medium',
    high: 'bg-[#0D2D54]/10 text-[#0D2D54] border-[#0D2D54]/20 font-semibold',
    warning: 'bg-[#0D2D54]/5 text-[#0D2D54] border-[#0D2D54]/20 font-semibold',
    missing: 'bg-rose-50 text-rose-700 border-rose-200/90 font-semibold',
    required: 'bg-[#F3F4F6] text-[#4B5563] border-transparent font-medium',
    review: 'bg-blue-50 text-blue-700 border-blue-200/80 font-medium',
    success: 'bg-[#EBF8EC] text-[#22C55E] border-transparent font-medium',
    inactive: 'bg-slate-100 text-slate-600 border-transparent font-medium',
  }

  const dotStyles: Record<TagVariant, string> = {
    navy: 'bg-white',
    outline: 'bg-[#0D2D54]',
    neutral: 'bg-[#6B7280]',
    subtle: 'bg-[#0D2D54]',
    high: 'bg-[#0D2D54]',
    warning: 'bg-[#0D2D54]/40',
    missing: 'bg-rose-500',
    required: 'bg-[#6B7280]',
    review: 'bg-blue-600',
    success: 'bg-[#22C55E]',
    inactive: 'bg-slate-400',
  }

  const sizeStyles = {
    sm: 'px-2.5 py-0.5 text-[11px] gap-1.5',
    md: 'px-3.5 py-1 text-xs gap-1.5',
    lg: 'px-4 py-1.5 text-sm gap-2',
  }[size]

  const showDot = dot

  return (
    <span
      className={`inline-flex items-center ${rounded === 'xl' ? 'rounded-xl' : 'rounded-full'} font-inter border select-none transition-all duration-150 ${variantStyles[variant]} ${sizeStyles} ${className}`}
    >
      {showDot && !onRemove && (
        <span className={`size-1.5 rounded-full shrink-0 ${dotStyles[variant]}`} />
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="group/tag-btn hover:text-[#0D2D54] focus:outline-none cursor-pointer flex items-center justify-center -ml-0.5 leading-none shrink-0 transition-colors"
          aria-label={`Remove ${label}`}
        >
          <svg
            className={`size-3 transition-colors ${
              variant === 'navy'
                ? 'text-white/80 group-hover/tag-btn:text-white group-hover/tag-btn:scale-110'
                : 'text-[#64748B] group-hover/tag-btn:text-[#0D2D54] group-hover/tag-btn:scale-110'
            }`}
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="3" x2="9" y2="9" />
            <line x1="9" y1="3" x2="3" y2="9" />
          </svg>
        </button>
      )}
      <span>{label}</span>
    </span>
  )
}

export default Tag
