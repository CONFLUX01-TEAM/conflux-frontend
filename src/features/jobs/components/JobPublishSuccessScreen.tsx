import { useState } from 'react'
import { toast } from 'sonner'
import Button from '@/shared/ui/Button'

export interface JobPublishSuccessData {
  roleTitle: string
  department: string
  location: string
  workModel: string
  salaryCompensation?: string
  minSalary?: string
  maxSalary?: string
  shareableUrl?: string
  slug?: string
}

interface JobPublishSuccessScreenProps {
  data: JobPublishSuccessData
  onViewPipeline: () => void
  onDownloadJd?: () => void
}

export const JobPublishSuccessScreen = ({
  data,
  onViewPipeline,
  onDownloadJd,
}: JobPublishSuccessScreenProps) => {
  const [copied, setCopied] = useState(false)

  // Use the backend shareableUrl when available, or derive cleanly
  const slug =
    data.slug ||
    (data.roleTitle || 'role')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  const shareUrl = data.shareableUrl || `https://conflux.ai/careers/share/${slug || 'role'}`

  const salaryDisplay =
    data.minSalary && data.maxSalary
      ? `$${data.minSalary} - $${data.maxSalary}`
      : data.salaryCompensation || '$145k - $180k'

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success('Shareable link copied to clipboard!')
      setTimeout(() => setCopied(false), 2500)
    } catch {
      toast.info('Link ready to share: ' + shareUrl)
    }
  }

  const handleShareTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=We're hiring a ${encodeURIComponent(
        data.roleTitle || 'new role',
      )} at Conflux! Apply here:&url=${encodeURIComponent(shareUrl)}`,
      '_blank',
    )
  }

  const handleShareLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      '_blank',
    )
  }

  return (
    <div className="w-full max-w-[56rem] mx-auto py-6 sm:py-10 flex flex-col items-center animate-in fade-in zoom-in-95 duration-400">
      {/* ── Big Success Checkmark Icon ─────────────────────────────── */}
      <div className="relative mb-6">
        <div className="size-20 sm:size-24 rounded-full bg-[#0D2D54] text-white flex items-center justify-center shadow-lg ring-8 ring-[#0D2D54]/10">
          <svg
            className="size-10 sm:size-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="absolute -inset-2 rounded-full bg-[#0D2D54]/5 animate-ping pointer-events-none -z-10" />
      </div>

      {/* ── Title & Subtitle ───────────────────────────────────────── */}
      <h1 className="font-sans text-3xl sm:text-4xl font-extrabold text-[#111827] text-center tracking-tight">
        Your role is live!
      </h1>
      <p className="font-inter text-sm sm:text-base text-[#6B7280] text-center mt-3 max-w-xl leading-relaxed">
        The <span className="font-semibold text-[#111827]">{data.roleTitle || 'Role'}</span>{' '}
        position has been successfully published to your active pipeline. You can now share it with
        candidates.
      </p>

      {/* ── 2-Column Cards Grid ───────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-10 items-stretch">
        {/* Left Card: Shareable Link */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#E5E7EB] shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-sans font-bold text-lg text-[#111827]">Shareable Link</h3>
            <p className="font-inter text-xs sm:text-sm text-[#6B7280] mt-1.5 leading-relaxed">
              Distribute this link directly to candidates or post it on external job boards.
            </p>

            {/* Copy Link Input Group in Brand Colors */}
            <div className="mt-5 flex items-center p-1.5 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] focus-within:border-[#0D2D54] focus-within:ring-2 focus-within:ring-[#0D2D54]/10 transition-all">
              <span className="font-inter text-xs text-[#374151] px-3 truncate flex-1 select-all font-medium">
                {shareUrl}
              </span>
              <Button
                type="button"
                onClick={handleCopyLink}
                label={copied ? '✓ COPIED' : 'COPY'}
                className="!w-auto px-4 py-2 bg-[#0D2D54] hover:opacity-90 active:scale-95 text-white rounded-lg text-xs font-inter font-bold tracking-wider uppercase transition-all shrink-0 cursor-pointer shadow-xs"
              />
            </div>
          </div>

          {/* Social Network Share Buttons */}
          <div className="mt-8 pt-5 border-t border-[#F3F4F6]">
            <span className=" text-center font-sans text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] block mb-3">
              Share on social networks
            </span>
            <div className="flex justify-center items-center gap-3">
              <Button
                type="button"
                onClick={handleShareTwitter}
                icon={
                  <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                }
                title="Share on X / Twitter"
                className="!w-10 !h-10 rounded-xl border border-[#E5E7EB] hover:border-[#0D2D54] bg-white hover:bg-gray-50 flex items-center justify-center text-[#4B5563] hover:text-[#0D2D54] transition-colors cursor-pointer shadow-2xs p-0"
              />
              <Button
                type="button"
                onClick={handleShareLinkedIn}
                icon={
                  <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                  </svg>
                }
                title="Share on LinkedIn"
                className="!w-10 !h-10 rounded-xl border border-[#E5E7EB] hover:border-[#0D2D54] bg-white hover:bg-gray-50 flex items-center justify-center text-[#4B5563] hover:text-[#0D2D54] transition-colors cursor-pointer shadow-2xs p-0"
              />
              <Button
                type="button"
                onClick={handleCopyLink}
                icon={
                  <svg
                    className="size-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                }
                title="Copy Link to Web"
                className="!w-10 !h-10 rounded-xl border border-[#E5E7EB] hover:border-[#0D2D54] bg-white hover:bg-gray-50 flex items-center justify-center text-[#4B5563] hover:text-[#0D2D54] transition-colors cursor-pointer shadow-2xs p-0"
              />
            </div>
          </div>
        </div>

        {/* Right Card: Open-Graph Card in Brand Navy */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden flex flex-col justify-between">
          {/* Card Top Artwork */}
          <div className="p-7 bg-[#0D2D54] text-white relative overflow-hidden flex-1 flex flex-col justify-start min-h-[13rem]">
            {/* Background Grid Pattern */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)',
                backgroundSize: '16px 16px',
              }}
            />

            {/* Brand Logo in Preview */}
            <div className="flex items-center gap-2 relative z-10 mb-4">
              <img src="/favicon.svg" alt="Conflux" className="size-5 brightness-0 invert" />
              <span className="font-sans font-bold text-xs uppercase tracking-widest text-white/90">
                Conflux
              </span>
            </div>

            {/* Job Title & Details */}
            <div className="relative z-10">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/20 text-white mb-2 backdrop-blur-xs">
                Hiring Now
              </span>
              <h3 className="font-sans font-bold text-xl text-white leading-snug">
                {data.roleTitle || 'Senior Technical Product Manager'}
              </h3>
              <p className="font-inter text-xs text-white/80 mt-1.5">
                {data.workModel || 'Remote'} · {data.location || 'San Francisco, CA'} ·{' '}
                {salaryDisplay}
              </p>
            </div>
          </div>

          {/* Card Footer Meta */}
          <div className="p-4 px-6 bg-white border-t border-[#F3F4F6] flex items-center justify-between">
            <div>
              <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] block">
                Preview
              </span>
              <span className="font-sans font-bold text-xs text-[#111827]">Open-Graph Card</span>
            </div>
            <svg
              className="size-4 text-[#9CA3AF]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* ── Bottom Box: Job Description PDF & View Pipeline ─────────── */}
      <div className="w-full mt-6 p-5 sm:p-6 rounded-2xl border-2 border-dashed border-[#D1D5DB] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-xl bg-[#0D2D54]/10 text-[#0D2D54] flex items-center justify-center shrink-0 border border-[#0D2D54]/20">
            <svg
              className="size-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div>
            <h4 className="font-sans font-bold text-sm sm:text-base text-[#111827]">
              Job Description PDF
            </h4>
            <p className="font-inter text-xs text-[#6B7280]">
              Finalized spec for offline distribution.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center flex-wrap">
          <Button
            type="button"
            onClick={onDownloadJd || (() => toast.success('Downloading finalized JD PDF...'))}
            label="Download JD"
            icon={
              <svg
                className="size-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            }
            className="!w-auto px-5 py-2.5 bg-white hover:bg-gray-50 border border-[#0D2D54] text-[#0D2D54] text-xs sm:text-sm font-semibold rounded-lg shadow-2xs cursor-pointer transition-colors"
          />

          <Button
            type="button"
            onClick={onViewPipeline}
            label="View Pipeline"
            className="!w-auto px-6 py-2.5 bg-[#0D2D54] hover:opacity-90 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm cursor-pointer transition-opacity"
          />
        </div>
      </div>
    </div>
  )
}

export default JobPublishSuccessScreen
