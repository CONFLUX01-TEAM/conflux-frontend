import React, { useEffect, useRef } from 'react'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  /** Optional title for standard modal header */
  title?: string
  /** Custom styling classes for the modal card container */
  className?: string
  /** Custom styling classes for the backdrop overlay */
  overlayClassName?: string
  /** 'center' for standard centered dialog, 'custom' for positioned flyouts/popovers */
  position?: 'center' | 'custom'
  /** Show close 'X' button */
  showCloseButton?: boolean
  /** Position of close button */
  closeButtonPosition?: 'inside' | 'outside'
  /** Target button/element ID to ignore when checking outside clicks */
  triggerId?: string
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  className = '',
  overlayClassName = '',
  position = 'center',
  showCloseButton = false,
  closeButtonPosition = 'inside',
  triggerId,
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
      if (triggerId && target.closest(`#${triggerId}`)) {
        return
      }
      if (modalRef.current && !modalRef.current.contains(target)) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)

    // Prevent background scrolling when centered modal is open
    if (position === 'center') {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        document.removeEventListener('mousedown', handleClickOutside)
        document.body.style.overflow = originalOverflow
      }
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose, position, triggerId])

  if (!isOpen) return null

  if (position === 'custom') {
    return (
      <>
        {/* Backdrop overlay */}
        <div
          className={`fixed inset-0 bg-black/33 z-[9998] backdrop-blur-[1px] animate-fade-in ${overlayClassName}`}
        />

        {/* Custom positioned container */}
        <div ref={modalRef} className={`z-[9999] ${className}`}>
          {showCloseButton && closeButtonPosition === 'outside' && (
            <button
              type="button"
              onClick={onClose}
              className="absolute top-0 -right-7 text-white hover:text-gray-200 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <img
                src="/x-icon.svg"
                alt="close"
                className="size-3.5 invert hover:opacity-80 transition-opacity"
              />
            </button>
          )}

          {showCloseButton && closeButtonPosition === 'inside' && (
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1"
              aria-label="Close modal"
            >
              <img src="/x-icon.svg" alt="close" className="size-3.5 hover:opacity-80" />
            </button>
          )}

          {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6E6E6]">
              <h4 className="text-lg font-sans font-semibold text-[#111827]">{title}</h4>
            </div>
          )}

          {children}
        </div>
      </>
    )
  }

  // Centered Dialog Modal
  return (
    <div
      className={`fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200 ${overlayClassName}`}
    >
      <div
        ref={modalRef}
        className={`relative w-full max-w-[32rem] bg-white rounded-2xl p-6 sm:p-8 shadow-2xl z-[9999] animate-in zoom-in-95 duration-200 ${className}`}
      >
        {showCloseButton && closeButtonPosition === 'outside' && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-2 -right-8 text-white hover:text-gray-200 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <img
              src="/x-icon.svg"
              alt="close"
              className="size-3.5 invert hover:opacity-80 transition-opacity"
            />
          </button>
        )}

        {showCloseButton && closeButtonPosition === 'inside' && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1.5 rounded-full hover:bg-gray-100"
            aria-label="Close modal"
          >
            <img src="/x-icon.svg" alt="close" className="size-3.5 hover:opacity-80" />
          </button>
        )}

        {title && (
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xl font-sans font-bold text-[#111827]">{title}</h4>
          </div>
        )}

        {children}
      </div>
    </div>
  )
}

export default Modal
