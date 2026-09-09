import { useRef, useState } from 'react'
import { toast } from 'sonner'
import Tag from './Tag'

interface TagInputFieldProps {
  label: string
  required?: boolean
  helperText?: string
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  className?: string
  error?: string
}

const TagInputField = ({
  label,
  required = false,
  helperText,
  tags,
  onChange,
  placeholder = 'Type and press enter.',
  className = '',
  error,
}: TagInputFieldProps) => {
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleAddTag = (rawTag: string) => {
    const trimmed = rawTag.trim().replace(/^,+|,+$/g, '')
    if (!trimmed) return

    // Duplicate check validation (case-insensitive)
    const isDuplicate = tags.some((t) => t.toLowerCase() === trimmed.toLowerCase())
    if (isDuplicate) {
      toast.error(`"${trimmed}" has already been added.`)
      setInputValue('')
      return
    }

    onChange([...tags, trimmed])
    setInputValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      handleAddTag(inputValue)
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      onChange(tags.slice(0, -1))
    }
  }

  const handleRemoveTag = (indexToRemove: number) => {
    onChange(tags.filter((_, idx) => idx !== indexToRemove))
  }

  return (
    <div className={`w-full flex flex-col ${className}`}>
      {/* Label and Helper Header */}
      <div>
        <label className="font-sans text-sm font-semibold text-black flex items-center gap-1">
          {label}
          {required && <span className="text-[#EF4444]">*</span>}
        </label>
        {helperText && <p className="font-inter text-xs text-[#9D9D9D] mt-0.5">{helperText}</p>}
      </div>

      {/* Tag Input Box */}
      <div
        onClick={() => inputRef.current?.focus()}
        className={`mt-2 min-h-[5.5rem] w-full p-3 rounded-lg border bg-white flex flex-col justify-start cursor-text transition-colors duration-200 ${
          error
            ? 'border-[#EF4444] ring-1 ring-[#EF4444]/20'
            : 'border-[#E6E6E6] focus-within:border-[#0D2D54] focus-within:ring-2 focus-within:ring-[#0D2D54]/10 hover:border-gray-300'
        }`}
      >
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => inputValue && handleAddTag(inputValue)}
          placeholder={tags.length === 0 ? placeholder : 'Add another skill...'}
          className="w-full font-inter text-sm text-[#222222] placeholder:text-[#9D9D9D] focus:outline-none bg-transparent py-0.5"
        />

        {/* Tag Pills */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {tags.map((tag, idx) => (
              <Tag
                key={`${tag}-${idx}`}
                label={tag}
                onRemove={() => handleRemoveTag(idx)}
                variant="outline"
              />
            ))}
          </div>
        )}
      </div>

      {error && <span className="text-[0.75rem] text-[#EF4444] mt-1 font-inter">{error}</span>}
    </div>
  )
}

export default TagInputField
