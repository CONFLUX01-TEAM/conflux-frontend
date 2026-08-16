import type { InputHTMLAttributes } from 'react'

export interface SearchBarProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

const SearchBar = ({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
  ...props
}: SearchBarProps) => {
  return (
    <div
      className={`flex items-center gap-2.5 rounded-[0.625rem] bg-[#FFFFFF] border border-[#E6E6E6] px-4 sm:px-[1.625rem] py-2 sm:py-4.5 transition-colors duration-200 hover:border-gray-300 focus-within:border-[#0D2D54] ${className}`}
    >
      <img src="/search-icon.svg" alt="search" className="size-5.5 shrink-0" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border-none bg-transparent font-inter font-light text-base tracking-[0.05em] text-[#222222] placeholder:text-[#5F5F5F] leading-none outline-none focus:ring-0 p-0"
        {...props}
      />
    </div>
  )
}

SearchBar.displayName = 'SearchBar'

export default SearchBar
