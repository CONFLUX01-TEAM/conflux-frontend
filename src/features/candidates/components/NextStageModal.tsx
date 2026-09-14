import React from 'react'
import Button from '@/shared/ui/Button'

interface NextStageModalProps {
  isOpen: boolean
  onClose: () => void
  stageName: string
  onPreviewEmail: () => void
  onConfirmAdvance: () => void
}

/**
 * NextStageModal
 * Modal popover rendered when advancing an individual candidate (Figma Screen 2).
 * Consumes the reusable Button component.
 */
export const NextStageModal: React.FC<NextStageModalProps> = ({
  isOpen,
  onClose,
  stageName,
  onPreviewEmail,
  onConfirmAdvance,
}) => {
  if (!isOpen) return null

  return (
    <div className="absolute inset-x-4 bottom-20 z-50 bg-white rounded-2xl p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
      {/* Header with Title and Close 'X' */}
      <div className="flex items-center justify-between pb-1">
        <h4 className="text-base font-bold text-[#111827] font-sans">Next stage: {stageName}</h4>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1 cursor-pointer"
          aria-label="Close"
        >
          <img src="/x-icon.svg" alt="" className="size-3.5" />
        </button>
      </div>

      <p className="text-xs text-[#6B7280] font-inter mt-1 mb-5">
        This action will send the candidate a mail
      </p>

      {/* Actions */}
      <div className="flex flex-col gap-2.5">
        {/* Preview Email Button */}
        <Button
          onClick={onPreviewEmail}
          className="bg-white hover:bg-slate-50 text-[#1C61B6] border border-[#CBD5E1] rounded-lg py-2.5 text-xs font-semibold font-inter shadow-2xs"
          icon={
            <svg
              className="size-4 text-[#1C61B6]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          }
          label="Preview email"
        />

        {/* Move & Send Email Button */}
        <Button
          onClick={onConfirmAdvance}
          className="bg-[#0D2D54] hover:bg-[#092240] text-white rounded-lg py-2.5 text-xs font-semibold font-inter shadow-2xs"
          label={`Move to ${stageName.toLowerCase()} & send email`}
        />
      </div>
    </div>
  )
}

export default NextStageModal
