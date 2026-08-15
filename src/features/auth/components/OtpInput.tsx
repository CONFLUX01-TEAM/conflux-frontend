import { useRef } from 'react'

export const OTP_LENGTH = 6

interface OtpInputProps {
  /** Current digits, one entry per box (length {@link OTP_LENGTH}). */
  value: string[]
  onChange: (digits: string[]) => void
  disabled?: boolean
}

/** Six-box one-time-code input with auto-advance, backspace focus, and paste support. */
const OtpInput = ({ value, onChange, disabled }: OtpInputProps) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (index: number, digit: string) => {
    if (!/^\d*$/.test(digit)) return
    if (digit.length > 1) digit = digit.slice(-1)

    const next = [...value]
    next[index] = digit
    onChange(next)

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (!digits) return
    e.preventDefault()
    const next = [...value]
    for (let i = 0; i < digits.length; i++) next[i] = digits[i]
    onChange(next)
    inputRefs.current[Math.min(digits.length, OTP_LENGTH - 1)]?.focus()
  }

  return (
    <div className="grid grid-cols-6 gap-1.5 sm:gap-2 md:gap-4 w-full max-w-[26.63rem] mx-auto px-1">
      {value.map((digit, index) => (
        <div key={index} className="relative aspect-square w-full min-w-0">
          <input
            ref={(el) => {
              inputRefs.current[index] = el
            }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
            maxLength={1}
            value={digit}
            disabled={disabled}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className="absolute inset-0 w-full h-full border-[0.06rem] border-[#E6E6E6] rounded-[0.5rem] text-center text-lg sm:text-xl md:text-[2rem] font-medium text-[#222222] focus:border-[#0D2D54] focus:outline-none focus:ring-1 focus:ring-[#0D2D54] transition-colors bg-transparent z-10 disabled:opacity-60"
          />
          {!digit && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-[#E6E6E6] text-lg sm:text-xl md:text-[2rem]">
              _
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default OtpInput
