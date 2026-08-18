import { forwardRef, useState } from 'react'
import type { PasswordInputProps } from '@/shared/types/ui'
import InputField from '@/shared/ui/InputField'

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label = 'Password', placeholder = '******', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)

    return (
      <InputField
        ref={ref}
        label={label}
        type={showPassword ? 'text' : 'password'}
        placeholder={placeholder}
        icon={
          <img
            src={showPassword ? '/show-password.svg' : '/hide-password.svg'}
            alt={showPassword ? 'Hide password' : 'Show password'}
            className="size-[1.25rem]"
          />
        }
        onIconClick={() => setShowPassword((prev) => !prev)}
        {...props}
      />
    )
  },
)

PasswordInput.displayName = 'PasswordInput'

export default PasswordInput
