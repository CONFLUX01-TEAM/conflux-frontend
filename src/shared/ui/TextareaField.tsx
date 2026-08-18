import { forwardRef } from 'react'
import type { TextareaFieldProps } from '@/shared/types/ui'

const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  (
    {
      label,
      id,
      className = '',
      error,
      errorMessage,
      showCharCount = true,
      maxLength,
      value,
      ...props
    },
    ref,
  ) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
    const currentLength = typeof value === 'string' ? value.length : 0

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="block text-sm sm:text-base text-black mb-2">
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          value={value}
          maxLength={maxLength}
          className={`w-full py-[1rem] px-[1.2rem] border rounded-[0.5rem] outline-none resize-none h-[9rem] font-sans text-[0.88rem] text-black placeholder:text-[#9D9D9D] transition-colors ${
            error || errorMessage
              ? 'border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/20'
              : 'border-[#E6E6E6] focus:border-[#0D2D54]'
          } ${className}`}
          {...props}
        />
        {(errorMessage || (showCharCount && maxLength)) && (
          <div className="flex justify-between items-center mt-1 min-h-[1.25rem]">
            {errorMessage ? (
              <span className="text-red-500 text-[0.8rem] font-medium font-inter" role="alert">
                {errorMessage}
              </span>
            ) : (
              <span />
            )}
            {showCharCount && maxLength && (
              <span className="text-[0.75rem] text-[#9D9D9D] font-inter">
                {currentLength}/{maxLength}
              </span>
            )}
          </div>
        )}
      </div>
    )
  },
)

TextareaField.displayName = 'TextareaField'

export default TextareaField
