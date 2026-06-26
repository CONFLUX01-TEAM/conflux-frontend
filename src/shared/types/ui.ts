import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string
  icon?: ReactNode
}

export interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: boolean
  errorMessage?: string
  icon?: ReactNode
  onIconClick?: () => void
}

export interface SpinnerProps {
  className?: string
  wrapperClassName?: string
}
