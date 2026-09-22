import React, { useState } from 'react'
import Modal from '@/shared/ui/Modal'
import Button from '@/shared/ui/Button'

interface RejectCandidatesModalProps {
  isOpen: boolean
  onClose: () => void
  candidateCount: number
  sourceStageName?: string
  onConfirm: () => Promise<void> | void
}

/**
 * RejectCandidatesModal
 * Renders the confirmation modal and processing state when rejecting
 * candidates in the pipeline (matching Figma screens).
 * Consumes reusable Modal, Button, and Spinner components.
 */
export const RejectCandidatesModal: React.FC<RejectCandidatesModalProps> = ({
  isOpen,
  onClose,
  candidateCount,
  sourceStageName = 'Applied',
  onConfirm,
}) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const isModalProcessing = isProcessing && isOpen

  const handleClose = () => {
    if (isModalProcessing) return
    setIsProcessing(false)
    onClose()
  }

  const handleReject = async () => {
    try {
      setIsProcessing(true)
      // Visual transition delay matching Figma processing state
      await new Promise((resolve) => setTimeout(resolve, 1500))
      await onConfirm()
    } finally {
      setIsProcessing(false)
      onClose()
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      position="center"
      showCloseButton={!isModalProcessing}
      closeButtonPosition="inside"
      className="max-w-[480px] sm:max-w-[500px] rounded-3xl p-8 sm:p-10 text-center shadow-2xl border border-[#F1F3F5]"
    >
      <div className="flex flex-col items-center">
        {/* Top Icon */}
        {!isModalProcessing ? (
          <div className="size-20 rounded-full bg-[#FDECEC] flex items-center justify-center mb-6">
            <svg
              className="size-9 text-[#EF4444]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
        ) : (
          <div className="mb-6 flex items-center justify-center">
            <div className="size-16 rounded-full border-[3.5px] border-red-100 border-t-[#EF4444] animate-spin" />
          </div>
        )}

        {/* Title */}
        <h3 className="font-sans font-bold text-2xl sm:text-[28px] text-[#111827] leading-tight">
          {isModalProcessing
            ? candidateCount === 1
              ? 'Rejecting candidate?'
              : 'Rejecting candidates?'
            : candidateCount === 1
              ? 'Reject candidate?'
              : 'Reject candidates?'}
        </h3>

        {/* Subtitle & Description */}
        {!isModalProcessing ? (
          <>
            <p className="font-inter text-sm sm:text-base text-[#495057] mt-3 leading-relaxed">
              Are you sure you want to reject{' '}
              <span className="font-semibold text-[#111827]">
                {candidateCount} candidate{candidateCount === 1 ? '' : 's'}
              </span>
              ?
            </p>
            <p className="font-inter text-xs sm:text-sm text-[#868E96] mt-2 leading-relaxed max-w-[360px]">
              {candidateCount === 1
                ? 'This candidate will be removed from the active hiring pipeline. You can still view them under Rejected'
                : 'These candidates will be removed from the active hiring pipeline. You can still view them under Rejected'}
            </p>
          </>
        ) : (
          <p className="font-inter text-sm sm:text-base text-[#6B7280] mt-2 mb-2 leading-relaxed">
            Please wait while we move {candidateCount} candidate{candidateCount === 1 ? '' : 's'} to
            Rejected
          </p>
        )}

        {/* Stage Progression Track */}
        <div className="flex items-center justify-center gap-3 w-full max-w-[340px] my-7 px-4 py-3 bg-slate-50/80 rounded-xl border border-slate-100">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-[#0D2D54] shrink-0" />
            <span className="font-sans text-xs sm:text-sm font-medium text-[#21252A] capitalize truncate max-w-[90px]">
              {sourceStageName}
            </span>
          </div>

          <div className="flex-1 flex items-center px-2">
            <svg
              className="w-full h-3 text-[#CBD5E1]"
              viewBox="0 0 100 8"
              fill="none"
              preserveAspectRatio="none"
            >
              <line x1="0" y1="4" x2="94" y2="4" stroke="currentColor" strokeWidth="1.5" />
              <polyline
                points="90 1, 95 4, 90 7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-[#EF4444] shrink-0" />
            <span className="font-sans text-xs sm:text-sm font-medium text-[#EF4444] truncate max-w-[90px]">
              Rejected
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        {!isModalProcessing && (
          <div className="flex items-center gap-3.5 w-full mt-2">
            <Button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-white border border-[#E9ECEF] hover:bg-slate-50 text-[#495057] font-inter font-medium text-sm sm:text-[15px] py-3.5 rounded-xl shadow-2xs transition-colors"
              label="Cancel"
            />
            <Button
              type="button"
              onClick={handleReject}
              className="flex-1 bg-[#EF4444] hover:bg-[#DC2626] text-white font-inter font-medium text-sm sm:text-[15px] py-3.5 rounded-xl shadow-2xs transition-colors"
              label={`Reject ${candidateCount} Candidate${candidateCount === 1 ? '' : 's'}`}
            />
          </div>
        )}
      </div>
    </Modal>
  )
}

export default RejectCandidatesModal
