import React from 'react'
import Button from '@/shared/ui/Button'
import type { CandidateDetailData } from '../types/candidates.types'

interface EmailPreviewViewProps {
  candidate: CandidateDetailData
  stageName: string
  onBack: () => void
  onClose: () => void
  onSendAndAdvance: () => void
  isSubmitting?: boolean
}

/**
 * EmailPreviewView
 * Displays the application status email preview panel (Figma Screen 3).
 * Consumes reusable Button.
 */
export const EmailPreviewView: React.FC<EmailPreviewViewProps> = ({
  candidate,
  stageName,
  onBack,
  onClose,
  onSendAndAdvance,
  isSubmitting = false,
}) => {
  return (
    <div className="flex flex-col h-full bg-white animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-[#F1F3F5]">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#111827] hover:text-[#1C61B6] transition-colors cursor-pointer"
        >
          <svg
            className="size-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          <span>Email preview</span>
        </button>

        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
          aria-label="Close"
        >
          <img src="/x-icon.svg" alt="" className="size-3.5" />
        </button>
      </div>

      {/* Main Email Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        <div>
          <h3 className="text-base font-bold text-[#111827] font-sans">
            New step in your application
          </h3>
          <div className="mt-3 space-y-1 text-xs text-[#6B7280] font-inter">
            <p>
              <span className="text-[#374151] font-medium">To:</span>{' '}
              {candidate.email || 'candidate@email.com'}
            </p>
            <p>
              <span className="text-[#374151] font-medium">Subject:</span> Next step in your
              application{stageName ? ` - ${stageName}` : ''}
            </p>
          </div>
        </div>

        {/* Rendered Email Paper Card */}
        <div className="bg-white rounded-2xl border border-[#E9ECEF] p-6 shadow-2xs space-y-5">
          {/* Conflux Branding */}
          <div className="flex items-center gap-2.5">
            <img src="/company-logo.svg" alt="Conflux" className="h-6 w-auto" />
          </div>

          {/* Email Body */}
          <p className="text-xs text-[#495057] leading-relaxed font-inter">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam aliquet faucibus
            condimentum. Aliquam ultrices eros nec posuere tincidunt. Vestibulum erat augue,
            eleifend aliquet commodo et, suscipit et turpis. Sed luctus est turpis, sed lacinia arcu
            suscipit ut. Vivamus id pretium neque. Nunc et mollis augue, at venenatis velit. Integer
            consequat lacus nec gravida dapibus. In nisl risus, lobortis a mauris et, rutrum iaculis
            nulla. Donec consectetur nisl sed dolor mollis, ac dignissim metus convallis. Curabitur
            in ipsum mattis velit fringilla sagittis sit amet ut ligula.
          </p>

          {/* Signoff */}
          <div className="pt-2 text-xs text-[#495057] font-inter space-y-0.5">
            <p>Best regards</p>
            <p className="font-medium text-[#212529]">Pepsi Co, Development team</p>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action */}
      <div className="p-4 sm:p-5 border-t border-[#F1F3F5] bg-white">
        <Button
          onClick={onSendAndAdvance}
          isLoading={isSubmitting}
          className="bg-[#0D2D54] hover:bg-[#0A2342] text-white rounded-xl h-11 sm:h-12 py-0 text-xs sm:text-sm font-semibold font-sans shadow-2xs w-full"
          label="Send email & advance"
        />
      </div>
    </div>
  )
}

export default EmailPreviewView
