import { useState } from 'react'
import { getToken } from '@/services/auth.service'

interface User {
  name: string
  email: string
  profileImage?: string
}

const getUser = (): User | null => {
  const token = getToken()
  return token ? { name: 'User', email: 'user@example.com' } : null
}

interface HeaderButton {
  id: string
  ariaLabel: string
  iconSrc: string
  hasBadge: boolean
  onClick: () => void
}

const HEADER_BUTTONS: HeaderButton[] = [
  {
    id: 'notifications',
    ariaLabel: 'Notifications',
    iconSrc: '/notification-icon.svg',
    hasBadge: true,
    onClick: () => {
      console.log('notification')
      alert('notification')
    },
  },
  {
    id: 'help',
    ariaLabel: 'Help',
    iconSrc: '/help-icon.svg',
    hasBadge: false,
    onClick: () => {
      console.log('help me')
      alert('help me')
    },
  },
]

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const user = getUser()

  return (
    <header className="flex w-full items-center justify-end border-b border-[#DDDDDD] bg-[#FFFFFF] px-4 sm:px-10 py-3 sm:py-5">
      <div className="flex w-full max-w-[47.1875rem] items-center justify-between gap-4 lg:gap-[4.6875rem]">
        {/* Search Bar */}
        <div className="flex flex-1 max-w-[31.25rem] items-center gap-2.5 rounded-[0.625rem] bg-[#F5F5F5] px-4 sm:px-[2.6875rem] py-2 sm:py-4.5">
          <img src="/search-icon.svg" alt="search-icon" className="size-5.5 shrink-0" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border-none bg-transparent font-inter font-light text-base tracking-[0.05em] text-[#222222] placeholder:text-[#5F5F5F] leading-none outline-none focus:ring-0"
          />
        </div>

        <div className="flex items-center gap-5 shrink-0">
          {HEADER_BUTTONS.map((btn) => (
            <button
              key={btn.id}
              type="button"
              aria-label={btn.ariaLabel}
              onClick={btn.onClick}
              className="relative flex h-[3.75rem] w-[3.75rem] shrink-0 items-center justify-center rounded-full border-[0.6px] border-[#DFDFDF] bg-white text-[#222222] transition-colors hover:bg-gray-50 cursor-pointer"
            >
              <img src={btn.iconSrc} alt="" className="shrink-0" />
              {btn.hasBadge && (
                <span className="absolute top-3.5 right-[1.0625rem] h-3 w-3 rounded-full border border-white bg-[#062DF6]" />
              )}
            </button>
          ))}

          {/* User Profile Avatar */}
          <div className="h-[3.75rem] w-[3.75rem] shrink-0 overflow-hidden rounded-full bg-[#D9D9D9]">
            <img
              src={user?.profileImage || '/avatar.png'}
              alt={user?.name || 'User Profile'}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
