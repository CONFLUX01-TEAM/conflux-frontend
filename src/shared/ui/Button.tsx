import type { ButtonProps } from '@/shared/types/ui'

const Button = ({ children, label, icon, className = '', disabled, ...props }: ButtonProps) => {
  return (
    <button
      className={`w-full inline-flex items-center justify-center gap-2 transition-all duration-200 ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="flex items-center">{icon}</span>}
      {label || children}
    </button>
  )
}

export default Button
