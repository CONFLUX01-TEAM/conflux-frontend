import type { ButtonProps } from '@/shared/types/ui'
import Spinner from '@/shared/ui/Spinner'

const Button = ({
  children,
  label,
  icon,
  isLoading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) => {
  const renderedIcon = isLoading ? (
    <Spinner className="text-white h-4 w-4" wrapperClassName="bg-transparent p-0" />
  ) : (
    icon
  )

  return (
    <button
      className={`w-full inline-flex items-center justify-center gap-2 transition-all duration-200 ${className}`}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {renderedIcon && <span className="flex items-center">{renderedIcon}</span>}
      {label || children}
    </button>
  )
}

export default Button
