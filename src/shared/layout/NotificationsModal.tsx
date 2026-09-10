import React from 'react'
import Modal from '@/shared/ui/Modal'

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
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      position="custom"
      triggerId="notification-button"
      showCloseButton
      closeButtonPosition="outside"
      className="fixed left-3 right-3 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2.5 sm:w-[34rem] bg-[#FFFFFF] rounded-[12px] shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2.5 px-4 sm:px-10 py-4 sm:py-6 border-b border-[#E6E6E6] leading-[100%]">
        <span className="text-lg sm:text-[20px] font-sans font-medium text-[#000000]">
          Notification
        </span>
        <button
          type="button"
          onClick={onMarkAllAsRead}
          className="text-xs sm:text-[0.9375rem] font-sans font-medium text-[#062DF6] hover:text-[#003bbb] transition-colors cursor-pointer"
        >
          Mark all as read
        </button>
      </div>

      {/* List */}
      <div
        className="max-h-[50vh] sm:max-h-[22.5rem] flex flex-col overflow-y-auto gap-4 sm:gap-6 px-4 sm:px-6 py-3 sm:py-4"
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
              className="w-full flex items-center justify-between pb-3 sm:pb-4 cursor-pointer transition-colors text-left border-b-[0.5px] border-[#E6E6E6] last:border-b-0"
            >
              <div className="flex items-center gap-2.5 sm:gap-3.25 min-w-0">
                <div
                  className="w-[4px] h-9 sm:h-10 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <div className="flex flex-col gap-1 sm:gap-1.75 min-w-0">
                  <h5 className="text-sm sm:text-[1rem] font-sans font-medium text-[#000000] leading-tight truncate">
                    {item.title}
                  </h5>
                  <p className="text-xs sm:text-[15px] font-sans font-normal text-[#848484] leading-tight truncate">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-4 shrink-0 ml-2 sm:ml-4">
                <span className="text-xs sm:text-[14px] font-sans text-[#848484] font-normal leading-[100%]">
                  {item.time}
                </span>
                {!item.isRead && (
                  <span className="size-2 sm:size-2.5 rounded-full bg-[#062DF6] shrink-0" />
                )}
              </div>
            </button>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-center items-center border-t border-[#E6E6E6] gap-2.5 text-center py-4 sm:py-5">
        <button
          type="button"
          onClick={onClose}
          className="text-sm sm:text-[1rem] font-sans font-medium text-[#062DF6] hover:text-[#0041cc] transition-colors cursor-pointer"
        >
          View all activities
        </button>
      </div>
    </Modal>
  )
}

export default NotificationsModal
