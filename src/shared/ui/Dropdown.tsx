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
}: DropdownProps<T>) => {
  const [isOpen, setIsOpen] = useState(false)
  const [internalValue, setInternalValue] = useState<T | undefined>(defaultValue)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isControlled = value !== undefined
  const currentValue = isControlled ? value : internalValue

  // Close dropdown on outside clicks
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
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

  // Default trigger rendering if no custom renderTrigger is provided
  const renderDefaultTrigger = () => {
    const resolved = selectedItem ? resolveItem(selectedItem) : null
    return (
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-1.5 px-3 py-1.5 border border-[#E4E4E7] bg-white rounded-[0.375rem] font-inter text-xs text-[#27272A] hover:bg-gray-50 transition-colors select-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#0D2D54]/20 ${triggerClassName}`}
      >
        <span>{resolved ? resolved.label : placeholder}</span>
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
        <ul
          role="listbox"
          className={`absolute ${alignmentClass} mt-1 w-max min-w-full bg-white border border-[#EAEAEA] rounded-[0.375rem] shadow-[0_4px_12px_rgba(0,0,0,0.06)] z-20 py-1 font-inter text-xs text-[#27272A] focus:outline-none max-h-60 overflow-y-auto ${menuClassName}`}
        >
          {items.map((item, idx) => {
            const resolved = resolveItem(item)
            const isSelected = resolved.value === currentValue

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
      )}
    </div>
  )
}

export default Dropdown
