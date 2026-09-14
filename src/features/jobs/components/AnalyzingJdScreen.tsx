import { useEffect, useState } from 'react'

interface AnalyzingJdScreenProps {
  onComplete?: () => void
  estimatedDurationMs?: number
}

interface AnalysisStep {
  id: number
  title: string
}

const ANALYSIS_STEPS: AnalysisStep[] = [
  { id: 1, title: 'Reading document structure' },
  { id: 2, title: 'Extracting role information' },
  { id: 3, title: 'Identifying skills & competencies' },
  { id: 4, title: 'Detecting responsibilities' },
]

export const AnalyzingJdScreen = ({
  onComplete,
  estimatedDurationMs = 2400,
}: AnalyzingJdScreenProps) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0) // 0, 1, 2, 3, 4 (4 = all done)
  const [secondsRemaining, setSecondsRemaining] = useState(Math.ceil(estimatedDurationMs / 1000))

  useEffect(() => {
    const stepDuration = estimatedDurationMs / 4

    const interval = setInterval(() => {
      setActiveStepIndex((prev) => {
        if (prev < 4) {
          return prev + 1
        }
        return prev
      })
    }, stepDuration)

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 1 ? prev - 1 : 1))
    }, 1000)

    const completeTimeout = setTimeout(() => {
      setActiveStepIndex(4)
      onComplete?.()
    }, estimatedDurationMs + 300)

    return () => {
      clearInterval(interval)
      clearInterval(timer)
      clearTimeout(completeTimeout)
    }
  }, [estimatedDurationMs, onComplete])

  const progressPercent = Math.min(100, Math.round(((activeStepIndex + 1) / 4) * 100))
  const currentStepNumber = Math.min(4, activeStepIndex + 1)
  const currentStepTitle =
    ANALYSIS_STEPS[Math.min(3, activeStepIndex)]?.title || 'Finalizing analysis'

  return (
    <div className="w-full max-w-[40rem] mx-auto py-4 sm:py-8 flex flex-col items-center text-center animate-in fade-in duration-300">
      {/* ── Brand Logo Mark (White container with /favicon.svg) ──── */}
      <div className="relative mb-6">
        <div className="size-20 sm:size-24 rounded-2xl bg-white border border-[#E5E7EB] flex items-center justify-center shadow-md ring-8 ring-[#0D2D54]/5 transition-transform duration-300">
          <img src="/favicon.svg" alt="Conflux" className="size-10 sm:size-12 object-contain" />
        </div>
        {/* Subtle active pulse ring */}
        <div className="absolute -inset-1.5 rounded-2xl bg-[#0D2D54]/5 animate-ping pointer-events-none -z-10" />
      </div>

      {/* ── Heading & Subtitle ───────────────────────────────────── */}
      <h1 className="font-sans text-2xl sm:text-[1.75rem] font-bold text-[#111827] leading-tight">
        Analyzing Job Description
      </h1>
      <p className="font-inter text-sm sm:text-base text-[#6B7280] mt-2 max-w-[32rem]">
        Conflux Intelligence is deconstructing your document to generate a structured role profile.
      </p>

      {/* ── Linear Progress Bar & Step X of 4 ────────────────────── */}
      <div className="w-full max-w-[28rem] mt-6 mb-8 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-inter font-semibold text-[#0D2D54]">
          <span>
            Step {currentStepNumber} of 4 ·{' '}
            <span className="font-normal text-[#6B7280]">{currentStepTitle}</span>
          </span>
          <span className="font-mono">{progressPercent}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-[#E5E7EB] overflow-hidden">
          <div
            className="h-full bg-[#0D2D54] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* ── 4 Step Status Cards (2x2 Grid) ────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full text-left">
        {ANALYSIS_STEPS.map((step, idx) => {
          const isCompleted = activeStepIndex > idx
          const isProcessing = activeStepIndex === idx
          const isQueued = activeStepIndex < idx

          return (
            <div
              key={step.id}
              className={`p-4 rounded-xl border transition-all duration-300 flex items-center justify-between gap-3 ${
                isCompleted
                  ? 'bg-white border-[#E5E7EB] shadow-xs'
                  : isProcessing
                    ? 'bg-[#F0F7FF] border-[#0D2D54] shadow-sm ring-1 ring-[#0D2D54]/20'
                    : 'bg-[#FAFAFA] border-[#E5E7EB]/80 opacity-60'
              }`}
            >
              <div className="flex flex-col min-w-0 pr-2">
                <span
                  className={`font-sans text-xs sm:text-sm font-semibold truncate ${
                    isCompleted
                      ? 'text-[#111827]'
                      : isProcessing
                        ? 'text-[#0D2D54]'
                        : 'text-[#6B7280]'
                  }`}
                >
                  {step.title}
                </span>

                {/* State Tag */}
                <div className="mt-1 flex items-center gap-1.5">
                  {isCompleted && (
                    <span className="font-inter text-[10px] sm:text-[11px] font-bold tracking-wider text-[#0D2D54]">
                      COMPLETED
                    </span>
                  )}
                  {isProcessing && (
                    <span className="font-inter text-[10px] sm:text-[11px] font-bold tracking-wider text-[#0D2D54] flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-[#0D2D54] animate-ping" />
                      PROCESSING…
                    </span>
                  )}
                  {isQueued && (
                    <span className="font-inter text-[10px] sm:text-[11px] font-semibold tracking-wider text-[#9D9D9D]">
                      QUEUED
                    </span>
                  )}
                </div>
              </div>

              {/* Status Icon */}
              <div className="shrink-0 flex items-center justify-center">
                {isCompleted && (
                  <div className="size-8 rounded-full bg-[#0D2D54] text-white flex items-center justify-center shadow-xs">
                    <svg
                      className="size-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                {isProcessing && (
                  <div className="size-8 rounded-full bg-white border-2 border-[#0D2D54] text-[#0D2D54] flex items-center justify-center shadow-xs">
                    <svg
                      className="size-4 animate-spin text-[#0D2D54]"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  </div>
                )}
                {isQueued && (
                  <div className="size-8 rounded-full bg-[#F3F4F6] text-[#9D9D9D] flex items-center justify-center">
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
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Bottom Estimated Time Remaining ──────────────────────── */}
      <div className="mt-8 flex items-center justify-center gap-1.5 text-xs font-inter font-semibold tracking-wider text-[#6B7280] uppercase">
        <svg
          className="size-4 text-[#9D9D9D]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>
          Estimated: {secondsRemaining} {secondsRemaining === 1 ? 'second' : 'seconds'} remaining
        </span>
      </div>
    </div>
  )
}
export default AnalyzingJdScreen
