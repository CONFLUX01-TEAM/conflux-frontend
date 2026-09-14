import { useState } from 'react'
import { toast } from 'sonner'
import Button from '@/shared/ui/Button'
import Tag from '@/shared/ui/Tag'
import InputField from '@/shared/ui/InputField'
import * as jobsService from '@/features/jobs/services/jobs.service'
import type { PipelineStageDto } from '@/features/jobs/types/jobs.types'

export interface PipelineStage {
  id: string
  title: string
  tags: Array<{ label: string; variant: 'required' | 'review' | 'neutral' }>
  description: string
  duration: string
  notice: string
  enabled: boolean
  iconType: 'document' | 'online' | 'technical' | 'portfolio' | 'custom'
  durationDays?: number
  isMandatory?: boolean
  uiType?: string
}

interface AssessmentPipelineScreenProps {
  jobId?: string | null
  initialStages?: PipelineStageDto[]
  initialEstTimeToHire?: number | null
  onBack: () => void
  onContinue: (selectedStages: PipelineStageDto[], estTimeToHire: number) => void
}

const getIconTypeForStage = (
  stageType: string,
): 'document' | 'online' | 'technical' | 'portfolio' | 'custom' => {
  switch (stageType?.toUpperCase()) {
    case 'APPLICATION_REVIEW':
      return 'document'
    case 'AUTOMATED_INTERVIEW':
      return 'online'
    case 'TECHNICAL_ASSESSMENT':
      return 'technical'
    case 'TEAM_FIT':
      return 'portfolio'
    default:
      return 'custom'
  }
}

const mapDtoToUiStage = (dto: PipelineStageDto): PipelineStage => {
  return {
    id: dto.id || dto.stageType || Math.random().toString(),
    title: dto.name || 'Stage',
    tags: [
      {
        label: dto.isMandatory ? 'Required' : 'Optional',
        variant: dto.isMandatory ? 'required' : 'neutral',
      },
      {
        label: (dto.stageType || 'CUSTOM').replace(/_/g, ' '),
        variant: 'review',
      },
    ],
    description: dto.description || '',
    duration: `${dto.durationDays || 3} business days`,
    notice: 'Auto-scheduled upon completion of prior step',
    enabled: dto.enabled ?? true,
    iconType: getIconTypeForStage(dto.stageType || ''),
    durationDays: dto.durationDays,
    isMandatory: dto.isMandatory,
    uiType: dto.stageType,
  }
}

export const AssessmentPipelineScreen = ({
  jobId,
  initialStages = [],
  initialEstTimeToHire,
  onBack,
  onContinue,
}: AssessmentPipelineScreenProps) => {
  const [stages, setStages] = useState<PipelineStage[]>(() => {
    if (initialStages && initialStages.length > 0) {
      return initialStages.map(mapDtoToUiStage)
    }
    return []
  })
  const [estTimeDays, setEstTimeDays] = useState<number>(initialEstTimeToHire || 28)
  const [prevInitialStages, setPrevInitialStages] = useState(initialStages)
  const [prevInitialEstTimeToHire, setPrevInitialEstTimeToHire] = useState(initialEstTimeToHire)

  if (initialStages !== prevInitialStages) {
    setPrevInitialStages(initialStages)
    if (initialStages && initialStages.length > 0) {
      setStages(initialStages.map(mapDtoToUiStage))
    }
  }

  if (initialEstTimeToHire !== prevInitialEstTimeToHire) {
    setPrevInitialEstTimeToHire(initialEstTimeToHire)
    if (initialEstTimeToHire) {
      setEstTimeDays(initialEstTimeToHire)
    }
  }

  const [isAddingStage, setIsAddingStage] = useState(false)
  const [newStageTitle, setNewStageTitle] = useState('')
  const [newStageDesc, setNewStageDesc] = useState('')
  const [isResetting, setIsResetting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleToggleStage = (id: string) => {
    setStages((prev) =>
      prev.map((stage) => {
        if (stage.id === id) {
          if (stage.isMandatory && stage.enabled) {
            toast.info(`${stage.title} is required and cannot be disabled.`)
            return stage
          }
          return { ...stage, enabled: !stage.enabled }
        }
        return stage
      }),
    )
  }

  const handleResetToTemplate = async () => {
    if (!jobId) {
      toast.error('No job draft found.')
      return
    }
    setIsResetting(true)
    try {
      const res = await jobsService.resetJobPipeline(jobId)
      if (res.data.stages) {
        setStages(res.data.stages.map(mapDtoToUiStage))
      }
      if (res.data.estTimeToHireDays) {
        setEstTimeDays(res.data.estTimeToHireDays)
      }
      toast.success('Pipeline reset to default template.')
    } catch (err) {
      console.error('Reset pipeline error:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to reset pipeline.')
    } finally {
      setIsResetting(false)
    }
  }

  const handleAddCustomStage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newStageTitle.trim()) return

    const newStage: PipelineStage = {
      id: `custom-${Date.now()}`,
      title: newStageTitle.trim(),
      tags: [{ label: 'Custom', variant: 'neutral' }],
      description:
        newStageDesc.trim() ||
        'Custom evaluation stage configured for this specific hiring process.',
      duration: '1–3 days',
      notice: 'Candidates will be invited to participate during this stage.',
      enabled: true,
      iconType: 'custom',
      durationDays: 3,
      isMandatory: false,
      uiType: 'custom',
    }

    setStages((prev) => [...prev, newStage])
    setNewStageTitle('')
    setNewStageDesc('')
    setIsAddingStage(false)
  }

  const handleProceed = async () => {
    const hasEnabledStage = stages.some((s) => s.enabled)
    if (!hasEnabledStage) {
      toast.error('At least one pipeline stage must be enabled.')
      return
    }

    const dtoArray: PipelineStageDto[] = stages.map((s, idx) => ({
      id: s.id,
      name: s.title,
      description: s.description,
      durationDays: s.durationDays || 3,
      order: idx + 1,
      enabled: s.enabled,
      isMandatory: s.isMandatory || false,
      uiType: s.uiType || s.iconType || 'custom',
    }))

    setIsSaving(true)
    try {
      await onContinue(dtoArray, estTimeDays)
    } finally {
      setIsSaving(false)
    }
  }

  const renderIcon = (type: PipelineStage['iconType']) => {
    const containerClasses =
      'size-10 sm:size-11 rounded-xl bg-white border border-[#E5E7EB] text-[#0D2D54] shadow-2xs flex items-center justify-center shrink-0'

    switch (type) {
      case 'document':
        return (
          <div className={containerClasses}>
            <svg
              className="size-5.5"
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
        )
      case 'online':
        return (
          <div className={containerClasses}>
            <svg
              className="size-5.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="12" cy="12" r="9" strokeWidth={2} />
              <circle cx="12" cy="12" r="5" strokeWidth={2} />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            </svg>
          </div>
        )
      case 'technical':
        return (
          <div className={containerClasses}>
            <svg
              className="size-5.5"
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
        )
      case 'portfolio':
        return (
          <div className={containerClasses}>
            <svg
              className="size-5.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )
      default:
        return (
          <div className={containerClasses}>
            <svg
              className="size-5.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        )
    }
  }

  return (
    <div className="w-full mx-auto py-1 animate-in fade-in duration-300">
      {/* ── Header Row ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex-1 min-w-0 pr-2">
          <h1 className="font-sans text-2xl sm:text-[1.75rem] font-bold text-[#111827] leading-tight">
            Assessment & Pipeline
          </h1>
          <p className="font-inter text-sm sm:text-base text-[#6B7280] mt-1.5">
            Configure each hiring stage. Toggle optional stages on or off, reorder, or add custom
            ones.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
          <Button
            type="button"
            onClick={handleResetToTemplate}
            isLoading={isResetting}
            label={isResetting ? 'Resetting...' : 'Reset to template'}
            className="!w-auto px-3.5 py-2 rounded-lg border border-[#E5E7EB] bg-white hover:bg-gray-50 text-xs font-inter font-medium text-[#4B5563] shadow-2xs cursor-pointer transition-colors shrink-0"
          />
          <Button
            type="button"
            onClick={() => setIsAddingStage(!isAddingStage)}
            label="Add Stage"
            icon={<span className="text-sm font-bold leading-none text-[#0D2D54]">+</span>}
            className="!w-auto px-4 py-2 rounded-lg border border-[#D1D5DB] bg-white hover:bg-gray-50 text-xs font-inter font-semibold text-[#111827] shadow-2xs cursor-pointer transition-colors shrink-0"
          />
        </div>
      </div>

      {/* ── Add Custom Stage Form Modal / Drawer (Inline) ─────────── */}
      {isAddingStage && (
        <form
          onSubmit={handleAddCustomStage}
          className="p-5 rounded-2xl border border-[#0D2D54]/20 bg-[#0D2D54]/[0.02] shadow-xs mb-6"
        >
          <h4 className="font-sans font-bold text-sm text-[#111827] mb-3">
            Add Custom Hiring Stage
          </h4>
          <div className="space-y-3">
            <InputField
              type="text"
              placeholder="Stage Title (e.g. Executive Interview, Panel Presentation)"
              value={newStageTitle}
              onChange={(e) => setNewStageTitle(e.target.value)}
              autoFocus
              required
              className="!mt-0"
            />
            <textarea
              placeholder="Brief description of what happens during this stage..."
              value={newStageDesc}
              onChange={(e) => setNewStageDesc(e.target.value)}
              rows={2}
              className="w-full px-3.5 py-2 bg-white border border-[#D1D5DB] rounded-lg text-sm font-inter text-black focus:outline-none focus:ring-2 focus:ring-[#0D2D54]/20 focus:border-[#0D2D54]"
            />
          </div>
          <div className="flex items-center justify-end gap-3 mt-4">
            <Button
              type="button"
              onClick={() => setIsAddingStage(false)}
              label="Cancel"
              className="!w-auto px-3.5 py-1.5 text-xs font-medium text-[#4B5563] bg-transparent hover:bg-gray-100 rounded-lg transition-colors"
            />
            <Button
              type="submit"
              label="Save Stage"
              className="!w-auto px-4 py-1.5 bg-[#0D2D54] text-white rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity"
            />
          </div>
        </form>
      )}

      {/* ── Stages List ───────────────────────────────────────────── */}
      <div className="space-y-4 mb-10">
        {stages.map((stage) => (
          <div
            key={stage.id}
            className={`p-5 sm:p-6 rounded-2xl border transition-all duration-200 bg-white ${
              stage.enabled ? 'border-[#E5E7EB] shadow-xs' : 'border-[#E5E7EB]/80 opacity-90'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              {/* Left Side: Icon + Details */}
              <div className="flex items-start gap-4">
                {renderIcon(stage.iconType)}

                <div className="min-w-0">
                  {/* Title & Badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-sans font-bold text-base sm:text-lg text-[#111827]">
                      {stage.title}
                    </h3>
                    {stage.tags.map((tag, idx) => (
                      <Tag key={idx} label={tag.label} variant={tag.variant} size="sm" />
                    ))}
                  </div>

                  {/* Description */}
                  <p className="font-inter text-xs sm:text-sm text-[#4B5563] mt-1.5 max-w-2xl leading-relaxed">
                    {stage.description}
                  </p>

                  {/* Metadata Indicators */}
                  <div className="flex items-center gap-4 sm:gap-6 mt-3.5 flex-wrap text-xs font-inter text-[#6B7280]">
                    <div className="flex items-center gap-1.5">
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
                      <span>{stage.duration}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
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
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      <span>{stage.notice}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Toggle Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={stage.enabled}
                onClick={() => handleToggleStage(stage.id)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#0D2D54]/20 ${
                  stage.enabled ? 'bg-[#0D2D54]' : 'bg-[#E5E7EB]'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                    stage.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Bottom Action Navigation ──────────────────────────────── */}
      <div className="flex items-center justify-between pt-8 border-t border-[#E5E7EB]">
        <Button
          type="button"
          onClick={onBack}
          label="Back"
          className="!w-auto bg-white hover:bg-gray-50 text-[#374151] border border-[#D1D5DB] py-2.5 px-6 rounded-lg text-sm font-medium transition-colors cursor-pointer"
        />
        <Button
          type="button"
          onClick={handleProceed}
          isLoading={isSaving}
          disabled={isSaving}
          label={isSaving ? 'Saving Pipeline...' : 'Continue'}
          className="!w-auto bg-[#0D2D54] hover:opacity-90 text-white py-2.5 px-8 rounded-lg text-sm font-medium shadow-sm transition-opacity cursor-pointer"
        />
      </div>
    </div>
  )
}

export default AssessmentPipelineScreen
