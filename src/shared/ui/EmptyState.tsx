import type { ReactNode } from 'react'

interface EmptyStateProps {
  /** Path to the illustration image (e.g. `/empty-state.svg`). */
  imgIcon: string
  /** Main heading text (e.g. "No Available Roles"). */
  title: string
  /** Supporting description text below the title. */
  content: string
  /** Optional call-to-action rendered below the description. */
  action?: ReactNode
  /** Optional alt text for the image. Defaults to the title. */
  imgAlt?: string
  /** Optional extra class names on the outer container. */
  className?: string
}

/** Reusable empty-state placeholder for pages with no data yet. */
const EmptyState = ({
  imgIcon,
  title,
  content,
  action,
  imgAlt,
  className = '',
}: EmptyStateProps) => (
  <div
    className={`flex flex-1 flex-col items-center justify-center text-center px-4 py-16 ${className}`}
  >
    <img
      src={imgIcon}
      alt={imgAlt ?? title}
      className="w-[16.88rem] max-w-full h-auto mb-6 select-none pointer-events-none"
    />
    <h2 className="font-sans text-xl sm:text-2xl font-semibold text-[#222222] leading-tight">
      {title}
    </h2>
    <p className="font-inter text-sm sm:text-base text-[#9D9D9D] mt-2 max-w-[26rem] leading-relaxed">
      {content}
    </p>
    {action && <div className="mt-6">{action}</div>}
  </div>
)

export default EmptyState
