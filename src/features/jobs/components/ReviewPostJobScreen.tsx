import { useState } from 'react'
import { toast } from 'sonner'
import Button from '@/shared/ui/Button'
import Tag from '@/shared/ui/Tag'
import type { PipelineStageDto, CustomQuestionDto } from '@/features/jobs/types/jobs.types'

export interface ReviewRoleData {
  roleTitle: string
  department: string
  seniorityLevel: string
  experienceLevel: string
  location: string
  workModel: string
  employmentType: string
  minSalary?: string
  maxSalary?: string
  salaryCompensation?: string
  reportsTo?: string
  roleSummary?: string
}

interface ReviewPostJobScreenProps {
  data: ReviewRoleData
  stages?: PipelineStageDto[]
  estTimeToHireDays?: number | null
  customQuestions?: CustomQuestionDto[]
  onEditRoleDetails: () => void
  onBack: () => void
  onSaveDraft?: () => void
  onPublish: () => void
  isPublishing?: boolean
  isSavingDraft?: boolean
}

export const ReviewPostJobScreen = ({
  data,
  stages = [],
  estTimeToHireDays = 28,
  customQuestions = [],
  onEditRoleDetails,
  onBack,
  onSaveDraft,
  onPublish,
  isPublishing = false,
  isSavingDraft = false,
}: ReviewPostJobScreenProps) => {
  const [isApplyingSeo, setIsApplyingSeo] = useState(false)
  const [seoApplied, setSeoApplied] = useState(false)

  const handleApplySeo = () => {
    setIsApplyingSeo(true)
    setTimeout(() => {
      setIsApplyingSeo(false)
      setSeoApplied(true)
      toast.success('SEO improvements applied to job description!')
    }, 900)
  }

  const salaryDisplay =
    data.minSalary && data.maxSalary
      ? `$${data.minSalary} — $${data.maxSalary} USD`
      : data.minSalary
        ? `$${data.minSalary} USD`
        : data.salaryCompensation || '$145,000 — $180,000 USD'

  const enabledStages = stages.filter((s) => s.enabled ?? s.isEnabled ?? true)

  return (
    <div className="w-full max-w-[68rem] mx-auto py-2 animate-in fade-in duration-300">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="font-sans text-2xl sm:text-[1.75rem] font-bold text-[#111827] leading-tight">
          Review & Post Job
        </h1>
        <p className="font-inter text-sm sm:text-base text-[#6B7280] mt-1.5">
          Review all details before making the position live to the talent pool.
        </p>
      </div>

      {/* ── 2-Column Grid (Main Review on Left, SEO Sidebar on Right) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Review Cards (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Role Details */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#F3F4F6]">
              <h3 className="font-sans font-bold text-base text-[#111827]">Role Details</h3>
              <Button
                type="button"
                onClick={onEditRoleDetails}
                label="Edit"
                icon={
                  <svg
                    className="size-3.5 text-[#0D2D54]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                }
                className="!w-auto bg-transparent hover:bg-gray-50 text-xs font-semibold text-[#0D2D54] px-2 py-1 rounded cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8">
              {/* Job Title */}
              <div>
                <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] block mb-1">
                  Job Title
                </span>
                <p className="font-sans font-bold text-base text-[#111827]">
                  {data.roleTitle || 'Senior Product Designer, Platform'}
                </p>
              </div>

              {/* Salary Range */}
              <div>
                <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] block mb-1">
                  Salary Range
                </span>
                <p className="font-sans font-bold text-base text-[#111827]">{salaryDisplay}</p>
              </div>

              {/* Department */}
              <div>
                <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] block mb-1">
                  Department
                </span>
                <p className="font-inter text-sm text-[#374151]">
                  {data.department || 'Engineering & Product'}
                </p>
              </div>

              {/* Reports To */}
              <div>
                <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] block mb-1">
                  Reports To
                </span>
                <p className="font-inter text-sm text-[#374151]">
                  {data.reportsTo || 'VP of Design'}
                </p>
              </div>

              {/* Location */}
              <div>
                <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] block mb-1">
                  Location
                </span>
                <p className="font-inter text-sm text-[#374151]">
                  {data.location || 'Remote (Global) / HQ New York'}
                </p>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-2 self-end">
                <Tag label={data.employmentType || 'Full-time'} variant="subtle" size="sm" />
                <Tag label={data.seniorityLevel || 'Level 6'} variant="subtle" size="sm" />
              </div>
            </div>
          </div>

          {/* Card 2: Recruitment Pipeline */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#F3F4F6]">
              <h3 className="font-sans font-bold text-base text-[#111827]">Recruitment Pipeline</h3>
              <div className="flex items-center gap-1.5 text-xs font-inter font-medium text-[#6B7280]">
                <svg
                  className="size-4 text-[#9CA3AF]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Est. Time-to-hire: {estTimeToHireDays || 28} Days</span>
              </div>
            </div>

            {/* Stages Vertical List with Line */}
            <div className="space-y-3 relative">
              {enabledStages.length > 0 ? (
                enabledStages.map((stage, idx) => (
                  <div key={stage.id || idx} className="flex items-center gap-3 relative">
                    {/* Left Circle Icon / Step Number */}
                    <div className="size-10 rounded-full bg-[#0D2D54] text-white flex items-center justify-center shrink-0 z-10 shadow-xs font-sans text-xs font-bold">
                      {idx + 1}
                    </div>

                    {/* Stage Card */}
                    <div className="flex-1 p-4 bg-[#F9FAFB] hover:bg-gray-100/70 border border-[#E5E7EB] rounded-xl flex items-center justify-between transition-colors">
                      <div>
                        <h4 className="font-sans font-bold text-sm text-[#111827]">{stage.name}</h4>
                        <p className="font-inter text-xs text-[#6B7280] mt-0.5">
                          {stage.description || 'Evaluation stage'}
                        </p>
                      </div>
                      <span className="font-inter text-xs font-semibold text-[#4B5563] shrink-0">
                        {stage.duration || `${stage.durationDays || 3} Days`}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#6B7280] font-inter">No pipeline stages configured.</p>
              )}
            </div>
          </div>

          {/* Card 3: Application Questionnaire */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs">
            <h3 className="font-sans font-bold text-base text-[#111827] mb-4">
              Application Questionnaire
            </h3>
            {customQuestions.length > 0 ? (
              <div className="space-y-2.5">
                {customQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[#9CA3AF] select-none text-xs">⠿</span>
                      <span className="font-inter text-xs sm:text-sm font-medium text-[#111827]">
                        {q.question} {q.required && '(Required)'}
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-inter font-bold bg-[#E5E7EB] text-[#4B5563] uppercase">
                      {q.type}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl flex items-center justify-between">
                <span className="font-inter text-xs text-[#6B7280]">
                  Standard application fields (Personal Info, CV Upload, Links).
                </span>
                <span className="px-2.5 py-0.5 rounded text-[11px] font-inter font-bold bg-[#E5E7EB] text-[#4B5563]">
                  Standard
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI SEO Sidebar Widgets (4 cols on lg) */}
        <div className="lg:col-span-4 space-y-6">
          {/* AI SEO Optimization Card */}
          <div className="bg-[#0D2D54] text-white p-6 rounded-2xl shadow-md">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base">✦</span>
              <h3 className="font-sans font-bold text-base text-white">AI SEO Optimization</h3>
            </div>

            <p className="font-inter text-xs text-white/80 leading-relaxed mb-5">
              {seoApplied
                ? 'Job description optimized! SEO score boosted to 98/100 for top candidate visibility.'
                : 'Your job description is currently scoring 84/100. We suggest minor adjustments to increase candidate quality.'}
            </p>

            <div className="space-y-3.5 mb-6">
              <div className="flex items-start gap-2.5 text-xs font-inter text-white/90">
                <svg
                  className="size-4 text-white/80 shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>"Include specific technical stack details in the first paragraph."</span>
              </div>

              <div className="flex items-start gap-2.5 text-xs font-inter text-white/90">
                <span className="font-bold text-sm leading-none text-blue-200 shrink-0 mt-0.5">
                  +
                </span>
                <span>Mention "Enterprise Design Systems" for 15% better SEO reach.</span>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleApplySeo}
              disabled={isApplyingSeo || seoApplied}
              isLoading={isApplyingSeo}
              label={seoApplied ? '✓ Improvements Applied' : 'Apply Improvements'}
              className={`w-full py-2.5 rounded-lg text-xs font-inter font-semibold transition-all shadow-xs ${
                seoApplied
                  ? 'bg-white text-[#0D2D54] opacity-90 cursor-default font-bold'
                  : 'bg-white hover:bg-gray-100 text-[#0D2D54] cursor-pointer'
              }`}
            />
          </div>

          {/* Discard Action */}
          <div className="flex justify-center">
            <Button
              type="button"
              onClick={() => {
                if (window.confirm('Are you sure you want to discard this recruitment role?')) {
                  window.location.href = '/jobs'
                }
              }}
              label="Discard this recruitment role"
              icon={
                <svg
                  className="size-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              }
              className="!w-auto text-xs font-inter font-medium text-rose-600 hover:text-rose-700 bg-transparent hover:bg-rose-50/50 py-1 px-3 rounded cursor-pointer transition-colors"
            />
          </div>
        </div>
      </div>

      {/* ── Bottom Action Navigation ──────────────────────────────── */}
      <div className="flex items-center justify-between pt-8 mt-8 border-t border-[#E5E7EB]">
        <Button
          type="button"
          onClick={onSaveDraft || onBack}
          isLoading={isSavingDraft}
          disabled={isSavingDraft || isPublishing}
          label={isSavingDraft ? 'Saving Draft...' : 'Save as Draft'}
          className="!w-auto bg-white hover:bg-gray-50 text-[#374151] border border-[#D1D5DB] py-2.5 px-6 rounded-lg text-sm font-medium transition-colors cursor-pointer"
        />
        <Button
          type="button"
          onClick={onPublish}
          isLoading={isPublishing}
          disabled={isPublishing || isSavingDraft}
          label={isPublishing ? 'Publishing Role...' : 'Publish Role'}
          className="!w-auto bg-[#0D2D54] hover:opacity-90 text-white py-2.5 px-8 rounded-lg text-sm font-medium shadow-sm transition-opacity cursor-pointer"
        />
      </div>
    </div>
  )
}

export default ReviewPostJobScreen
