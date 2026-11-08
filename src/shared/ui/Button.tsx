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
  const hasWidth = /\bw-\w+/.test(className)

  return (
    <button
      className={`${hasWidth ? '' : 'w-full'} inline-flex items-center justify-center gap-2 transition-all duration-200 ${isLoading ? 'cursor-progress' : 'cursor-pointer'} ${className}`}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {/* One busy treatment everywhere: the designed label stays put and the
          spinner takes the icon slot, inheriting the button's own colour. */}
      {isLoading ? (
        <Spinner size="sm" className="text-current" />
      ) : (
        icon && <span className="flex items-center">{icon}</span>
      )}
      {label || children}
    </button>
  )
}

export default Button
