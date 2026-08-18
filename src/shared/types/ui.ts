import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string
  icon?: ReactNode
  isLoading?: boolean
}

export interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: boolean
  errorMessage?: string
  icon?: ReactNode
  onIconClick?: () => void
}

export type PasswordInputProps = Omit<InputFieldProps, 'type' | 'icon' | 'onIconClick'>

export interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: boolean
  errorMessage?: string
  showCharCount?: boolean
}

export interface SpinnerProps {
  className?: string
  wrapperClassName?: string
}
