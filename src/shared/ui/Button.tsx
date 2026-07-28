import type { ButtonProps } from '@/shared/types/ui'
import Spinner from '@/shared/ui/Spinner'

const Button = ({
  children,
  label,
  icon,
  loading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={`w-full inline-flex items-center justify-center gap-2 transition-all duration-200 ${loading ? 'cursor-progress' : ''} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {/* One busy treatment everywhere: the designed label stays put and the
          spinner takes the icon slot, inheriting the button's own colour. */}
      {loading ? (
        <Spinner size="sm" className="text-current" />
      ) : (
        icon && <span className="flex items-center">{icon}</span>
      )}
      {label || children}
    </button>
  )
}

export default Button
