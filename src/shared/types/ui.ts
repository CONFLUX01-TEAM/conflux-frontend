import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string
  icon?: ReactNode
  /** Swaps the icon for a spinner and blocks input; the label stays put. */
  loading?: boolean
}

export interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: boolean
  errorMessage?: string
  icon?: ReactNode
  onIconClick?: () => void
}

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  wrapperClassName?: string
}
