import type { ReactNode } from 'react'

export interface EmptyStateProps {
  /** Optional path to an illustration image (e.g. `/empty-state.svg`). */
  imgIcon?: string
  /** Custom icon or ReactNode rendered at the top (e.g. circular badge with SVG). */
  icon?: ReactNode
  /** Main heading text (e.g. "No job roles yet"). */
  title: string
  /** Supporting description text below the title. */
  content: string
  /** Optional call-to-action rendered below the description. */
  action?: ReactNode
  /** Optional alt text for the image. Defaults to the title. */
  imgAlt?: string
  /** Optional extra class names on the outer container. */
  className?: string
  /** Presentation variant: 'default' (unbordered flex column) or 'card' (white rounded bordered card). Defaults to 'default'. */
  variant?: 'default' | 'card'
}

/** Briefcase icon matching the Figma empty-state design. */
export const BriefcaseEmptyIcon = ({
  className = 'w-7 h-7 text-[#667085]',
}: {
  className?: string
}) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
)

/** Reusable empty-state placeholder for pages with no data yet. */
const EmptyState = ({
  imgIcon,
  icon,
  title,
  content,
  action,
  imgAlt,
  className = '',
  variant = 'default',
}: EmptyStateProps) => {
  const renderedIcon = icon ? (
    <div className="mb-4">{icon}</div>
  ) : imgIcon ? (
    <img
      src={imgIcon}
      alt={imgAlt ?? title}
      className="w-[16.88rem] max-w-full h-auto mb-6 select-none pointer-events-none"
    />
  ) : (
    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#F2F4F7] flex items-center justify-center mb-4 sm:mb-5 text-[#667085]">
      <BriefcaseEmptyIcon />
    </div>
  )

  const innerContent = (
    <div
      className={`flex flex-col items-center justify-center text-center px-4 ${
        variant === 'card' ? 'py-12 sm:py-20' : 'flex-1 py-16'
      } ${className}`}
    >
      {renderedIcon}
      <h2 className="font-sans text-lg sm:text-xl font-semibold text-[#101828] leading-tight">
        {title}
      </h2>
      <p className="font-inter text-sm sm:text-base text-[#667085] mt-2 max-w-[22rem] sm:max-w-[24rem] leading-relaxed">
        {content}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )

  if (variant === 'card') {
    return (
      <div className="w-full rounded-2xl border border-[#E5E7EB] bg-white min-h-[480px] sm:min-h-[540px] lg:min-h-[580px] flex items-center justify-center shadow-[0px_1px_2px_rgba(16,24,40,0.05)]">
        {innerContent}
      </div>
    )
  }

  return innerContent
}

export default EmptyState
