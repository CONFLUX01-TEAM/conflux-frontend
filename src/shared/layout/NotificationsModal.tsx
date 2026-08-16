import React, { useEffect, useRef } from 'react'

export interface NotificationItem {
  id: string
  title: string
  description: string
  time: string
  color: string
  isRead: boolean
}

interface NotificationsModalProps {
  isOpen: boolean
  onClose: () => void
  notifications: NotificationItem[]
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
}

const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
}) => {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (target.closest('#notification-button')) {
        return
      }
      if (modalRef.current && !modalRef.current.contains(target)) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop overlay */}
      <div className="fixed inset-0 bg-black/33 z-[9998] backdrop-blur-[1px] animate-fade-in" />

      {/* Card container positioned directly under the button */}
      <div
        ref={modalRef}
        className="absolute right-0 mt-2.5 w-[34rem] bg-[#FFFFFF] rounded-[12px] shadow-2xl z-[9999]"
      >
        {/* Absolute Close Button above the top-right of the card */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-0 -right-7 text-white hover:text-gray-200 transition-colors cursor-pointer"
          aria-label="Close notifications"
        >
          <img
            src="/x-icon.svg"
            alt="close"
            className="size-3.5 invert hover:opacity-80 transition-opacity"
          />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between gap-2.5 px-10 py-6 border-b border-[#E6E6E6] leading-[100%]">
          <span className="text-[20px] font-sans font-medium text-[#000000]">Notification</span>
          <button
            type="button"
            onClick={onMarkAllAsRead}
            className="text-[0.9375rem] font-sans font-medium text-[#062DF6] hover:text-[#003bbb] transition-colors cursor-pointer"
          >
            Mark all as read
          </button>
        </div>

        {/* List */}
        <div
          className="max-h-[22.5rem] flex flex-col overflow-y-auto gap-6 px-6 py-4"
          style={{ scrollbarWidth: 'thin' }}
        >
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-xs font-sans text-gray-400 italic">
              No new notifications
            </div>
          ) : (
            notifications.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onMarkAsRead(item.id)}
                className="w-full flex items-center justify-between pb-4 cursor-pointer transition-colors text-left border-b-[0.5px] border-[#E6E6E6] last:border-b-0 cursor-pointer"
              >
                <div className="flex items-center gap-3.25">
                  <div
                    className="w-[4px] h-10 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex flex-col gap-1.75">
                    <h5 className="text-[1rem] font-sans font-medium text-[#000000] leading-[100%]">
                      {item.title}
                    </h5>
                    <p className="text-[15px] font-sans font-normal text-[#848484] leading-[100%]">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 ml-4">
                  <span className="text-[14px] font-sans text-[#848484] font-normal leading-[100%]">
                    {item.time}
                  </span>
                  {!item.isRead && <span className="size-2.5 rounded-full bg-[#062DF6] shrink-0" />}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-center items-center border-t border-[#E6E6E6] gap-2.5 text-center py-5">
          <button
            type="button"
            onClick={onClose}
            className="text-[1rem] font-sans font-medium text-[#062DF6] hover:text-[#0041cc] transition-colors cursor-pointer"
          >
            View all activities
          </button>
        </div>
      </div>
    </>
  )
}

export default NotificationsModal
