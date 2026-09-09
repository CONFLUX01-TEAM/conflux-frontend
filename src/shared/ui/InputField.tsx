import { forwardRef } from 'react'
import type { InputFieldProps } from '@/shared/types/ui'

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      label,
      className = '',
      wrapperClassName = '',
      error,
      errorMessage,
      icon,
      onIconClick,
      id,
      ...props
    },
    ref,
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className={`w-full ${label ? 'mt-2 sm:mt-3' : ''} ${wrapperClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="font-sans text-sm font-semibold text-black block mb-2 text-left"
          >
            {label} {props.required && <span className="text-[#EF4444]">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            id={inputId}
            ref={ref}
            className={`w-full px-4 py-3 rounded-md border bg-white text-[0.88rem] text-black placeholder:text-[#9D9D9D] transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:border-transparent ${error || errorMessage ? 'border-[#EF4444] focus:ring-[#EF4444]/20' : 'border-gray-200 focus:border-[#0D2D54] focus:ring-[#0D2D54]/20 hover:border-gray-300'} disabled:cursor-not-allowed ${icon ? 'pr-12' : ''} ${className}`}
            {...props}
          />
          {icon && (
            <div
              className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer"
              onClick={onIconClick}
            >
              {icon}
            </div>
          )}
        </div>
        {errorMessage && (
          <span className="text-[0.75rem] text-[#EF4444] mt-1 block font-inter">
            {errorMessage}
          </span>
        )}
      </div>
    )
  },
)

InputField.displayName = 'InputField'

export default InputField
