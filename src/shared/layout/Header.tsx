import { useState } from 'react'
import { getToken } from '@/services/auth.service'
import NotificationsModal from './NotificationsModal'
import type { NotificationItem } from './NotificationsModal'

interface User {
  name: string
  email: string
  profileImage?: string
}

const getUser = (): User | null => {
  const token = getToken()
  return token ? { name: 'User', email: 'user@example.com' } : null
}

export interface HeaderProps {
  isSidebarCollapsed?: boolean
  onToggleSidebar?: () => void
}

const Header = ({ isSidebarCollapsed, onToggleSidebar }: HeaderProps) => {
  const user = getUser()
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: 'New job posted',
      description: 'Product designer',
      time: '10:30 AM',
      color: '#0A3D74',
      isRead: false,
    },
    {
      id: '2',
      title: 'Interview scheduled',
      description: 'Sefa Mamu',
      time: '10:30 AM',
      color: '#CA8C26',
      isRead: false,
    },
    {
      id: '3',
      title: 'Assessment completed',
      description: 'by 10 candidates',
      time: '10:30 AM',
      color: '#7265BE',
      isRead: false,
    },
    {
      id: '4',
      title: 'Tunde Asorona',
      description: 'moved to hired',
      time: '10:30 AM',
      color: '#629F61',
      isRead: false,
    },
    {
      id: '5',
      title: 'New candidate added',
      description: 'Emeka Agu',
      time: '10:30 AM',
      color: '#1F755A',
      isRead: false,
    },
  ])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })))
  }

  const markAsRead = (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
  }

  return (
    <header className="flex w-full items-center justify-between lg:justify-end border-b border-[#DDDDDD] bg-[#FFFFFF] px-3 sm:px-6 lg:px-10 py-2.5 sm:py-4 lg:py-5">
      {/* Mobile Sidebar Toggle Button using collapse-icon.svg */}
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="lg:hidden transition-opacity hover:opacity-80 cursor-pointer"
      >
        <img
          src="/dashboard/collapse-icon.svg"
          alt=""
          className={`w-7 h-7 sm:w-8 sm:h-8 ${isSidebarCollapsed ? 'rotate-180' : ''} transition-transform duration-200 cursor-pointer`}
        />
      </button>

      <div className="flex items-center gap-2 sm:gap-3 lg:gap-5">
        {/* Notifications Button */}
        <div className="relative">
          <button
            id="notification-button"
            type="button"
            aria-label="Notifications"
            onClick={() => setIsNotificationOpen((prev) => !prev)}
            className="relative flex h-10 w-10 sm:h-12 sm:w-12 lg:h-[3.75rem] lg:w-[3.75rem] shrink-0 items-center justify-center rounded-full border-[0.6px] border-[#DFDFDF] bg-white text-[#222222] transition-colors hover:bg-gray-50 cursor-pointer"
          >
            <div className="relative flex items-center justify-center">
              <img
                src="/notification-icon.svg"
                alt=""
                className="size-4.5 sm:size-5 lg:size-6 shrink-0"
              />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex size-3.5 sm:size-4 items-center justify-center rounded-full bg-[#EF4444] text-[#FFFFFF] text-[9px] sm:text-[10px] font-inter font-medium leading-[100%]">
                  {unreadCount}
                </span>
              )}
            </div>
          </button>

          {/* Notifications Modal */}
          <NotificationsModal
            isOpen={isNotificationOpen}
            onClose={() => setIsNotificationOpen(false)}
            notifications={notifications}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
          />
        </div>

        {/* Help Button */}
        <button
          type="button"
          aria-label="Help"
          onClick={() => alert('help me')}
          className="relative flex h-10 w-10 sm:h-12 sm:w-12 lg:h-[3.75rem] lg:w-[3.75rem] shrink-0 items-center justify-center rounded-full border-[0.6px] border-[#DFDFDF] bg-white text-[#222222] transition-colors hover:bg-gray-50 cursor-pointer"
        >
          <img src="/help-icon.svg" alt="" className="size-4.5 sm:size-5 lg:size-6 shrink-0" />
        </button>

        {/* User Profile Avatar */}
        <div className="h-10 w-10 sm:h-12 sm:w-12 lg:h-[3.75rem] lg:w-[3.75rem] shrink-0 overflow-hidden rounded-full bg-[#D9D9D9]">
          <img
            src={user?.profileImage || '/avatar.png'}
            alt={user?.name || 'User Profile'}
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </header>
  )
}

export default Header
