import { useState, useRef, useEffect } from 'react'
import type { ReactNode } from 'react'

export interface DropdownItemObject<T> {
  value: T
  label: string
  disabled?: boolean
  className?: string
}

export type DropdownItemType<T> = DropdownItemObject<T> | T

export interface DropdownProps<T> {
  items: DropdownItemType<T>[]
  value?: T
  defaultValue?: T
  onChange?: (value: T) => void
  placeholder?: string
  renderItem?: (item: DropdownItemType<T>, isSelected: boolean) => ReactNode
  renderTrigger?: (selected: DropdownItemType<T> | undefined, isOpen: boolean) => ReactNode
  className?: string
  triggerClassName?: string
  menuClassName?: string
  itemClassName?: string
  align?: 'left' | 'right'
  allowCustom?: boolean
  customPlaceholder?: string
  onAddCustom?: (value: string) => void
}

const resolveItem = <T,>(
  item: DropdownItemType<T>,
): { value: T; label: string; disabled: boolean } => {
  if (item && typeof item === 'object' && 'value' in item && 'label' in item) {
    const obj = item as unknown as DropdownItemObject<T>
    return {
      value: obj.value,
      label: obj.label,
      disabled: !!obj.disabled,
    }
  }
  return {
    value: item as T,
    label: String(item),
    disabled: false,
  }
}

const Dropdown = <T,>({
  items,
  value,
  defaultValue,
  onChange,
  placeholder = 'Select...',
  renderItem,
  renderTrigger,
  className = '',
  triggerClassName = '',
  menuClassName = '',
  itemClassName = '',
  align = 'right',
  allowCustom = false,
  customPlaceholder = 'Add custom option...',
  onAddCustom,
}: DropdownProps<T>) => {
  const [isOpen, setIsOpen] = useState(false)
  const [internalValue, setInternalValue] = useState<T | undefined>(defaultValue)
  const [isAddingCustom, setIsAddingCustom] = useState(false)
  const [customText, setCustomText] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isControlled = value !== undefined
  const currentValue = isControlled ? value : internalValue

  // Close dropdown on outside clicks
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setIsAddingCustom(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [])

  // Find the currently selected item object
  const selectedItem = items.find((item) => {
    const resolved = resolveItem(item)
    return resolved.value === currentValue
  })

  const handleSelect = (item: DropdownItemType<T>) => {
    const resolved = resolveItem(item)
    if (resolved.disabled) return

    if (!isControlled) {
      setInternalValue(resolved.value)
    }
    onChange?.(resolved.value)
    setIsOpen(false)
  }

  const handleCreateCustom = (e: React.FormEvent | React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const trimmed = customText.trim()
    if (!trimmed) return

    if (onAddCustom) {
      onAddCustom(trimmed)
    } else {
      onChange?.(trimmed as unknown as T)
    }
    setCustomText('')
    setIsAddingCustom(false)
    setIsOpen(false)
  }

  // Default trigger rendering if no custom renderTrigger is provided
  const renderDefaultTrigger = () => {
    const resolved = selectedItem ? resolveItem(selectedItem) : null
    const hasValue = resolved && resolved.value !== '' && resolved.value !== undefined
    return (
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-1.5 px-3 py-1.5 border border-[#E4E4E7] bg-white rounded-[0.375rem] font-inter text-xs text-[#27272A] hover:bg-gray-50 transition-colors select-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#0D2D54]/20 ${triggerClassName}`}
      >
        <span className={hasValue ? 'text-[#111827]' : 'text-[#9D9D9D]'}>
          {hasValue ? resolved.label : placeholder}
        </span>
        <img
          src="/dropdown_arrow-icon.svg"
          alt="arrow"
          className={`size-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
    )
  }

  const alignmentClass = align === 'left' ? 'left-0' : 'right-0'

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      {renderTrigger ? (
        <div onClick={() => setIsOpen(!isOpen)} className={`cursor-pointer ${triggerClassName}`}>
          {renderTrigger(selectedItem, isOpen)}
        </div>
      ) : (
        renderDefaultTrigger()
      )}

      {isOpen && (
        <div
          role="listbox"
          className={`absolute ${alignmentClass} mt-1 w-max min-w-full bg-white border border-[#EAEAEA] rounded-[0.375rem] shadow-[0_4px_12px_rgba(0,0,0,0.06)] z-20 py-1 font-inter text-xs text-[#27272A] focus:outline-none max-h-64 flex flex-col ${menuClassName}`}
        >
          <ul className="overflow-y-auto max-h-48 flex-1">
            {items.map((item, idx) => {
              const resolved = resolveItem(item)
              const isSelected = resolved.value === currentValue && resolved.value !== ''

              return (
                <li
                  key={idx}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(item)}
                  className={`px-3.5 py-2 hover:bg-gray-50 flex items-center justify-between cursor-pointer select-none transition-colors ${
                    resolved.disabled ? 'opacity-50 cursor-not-allowed' : ''
                  } ${isSelected ? 'bg-gray-50 font-medium text-[#111111]' : 'text-[#27272A]'} ${itemClassName}`}
                >
                  {renderItem ? renderItem(item, isSelected) : <span>{resolved.label}</span>}
                  {isSelected && !renderItem && (
                    <svg
                      className="size-3 text-[#0D2D54] ml-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </li>
              )
            })}
          </ul>

          {allowCustom && (
            <div className="border-t border-[#EAEAEA] mt-1 pt-1 px-2 pb-1 shrink-0 bg-white">
              {isAddingCustom ? (
                <div className="flex items-center gap-1.5 p-1" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateCustom(e)
                      if (e.key === 'Escape') setIsAddingCustom(false)
                    }}
                    placeholder={customPlaceholder}
                    className="flex-1 px-2.5 py-1.5 border border-[#0D2D54]/40 rounded-md text-xs font-inter text-black focus:outline-none focus:ring-1 focus:ring-[#0D2D54]"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleCreateCustom}
                    className="bg-[#0D2D54] text-white px-2.5 py-1.5 rounded-md text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingCustom(false)}
                    className="text-gray-400 hover:text-gray-600 px-1 py-1 text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsAddingCustom(true)
                  }}
                  className="w-full text-left px-2.5 py-1.5 text-xs font-medium text-[#0D2D54] hover:bg-[#0D2D54]/[0.04] rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="text-sm font-bold leading-none">+</span>
                  <span>{customPlaceholder}</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Dropdown
