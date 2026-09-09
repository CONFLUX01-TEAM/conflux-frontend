import { useEffect, useState } from 'react'

interface PublishingProcessingScreenProps {
  estimatedDurationMs?: number
}

interface AssemblyStep {
  id: number
  title: string
  detail: string
}

const ASSEMBLY_STEPS: AssemblyStep[] = [
  {
    id: 1,
    title: 'Consolidating role specifications',
    detail: 'Validating role identity, compensation, and requirements',
  },
  {
    id: 2,
    title: 'Configuring assessment pipeline',
    detail: 'Setting up interview stages and AI evaluation criteria',
  },
  {
    id: 3,
    title: 'Generating candidate application portal',
    detail: 'Building form elements, CV parser, and custom questions',
  },
  {
    id: 4,
    title: 'Publishing role live to talent network',
    detail: 'Deploying public link and indexing in active search',
  },
]

export const PublishingProcessingScreen = ({
  estimatedDurationMs = 2800,
}: PublishingProcessingScreenProps) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0)

  useEffect(() => {
    const stepDuration = estimatedDurationMs / 4

    const interval = setInterval(() => {
      setActiveStepIndex((prev) => {
        if (prev < 3) {
          return prev + 1
        }
        return prev
      })
    }, stepDuration)

    return () => {
      clearInterval(interval)
    }
  }, [estimatedDurationMs])

  const progressPercent = Math.min(100, Math.round(((activeStepIndex + 1) / 4) * 100))

  return (
    <div className="w-full max-w-[42rem] mx-auto py-8 sm:py-12 flex flex-col items-center text-center animate-in fade-in duration-300">
      {/* ── Brand Logo Container in White with /favicon.svg ─────────── */}
      <div className="relative mb-6">
        <div className="size-20 sm:size-24 rounded-2xl bg-white border border-[#E5E7EB] flex items-center justify-center shadow-lg ring-8 ring-[#0D2D54]/5 transition-transform duration-300">
          <img src="/favicon.svg" alt="Conflux" className="size-10 sm:size-12 object-contain" />
        </div>
        <div className="absolute -inset-2 rounded-2xl bg-[#0D2D54]/5 animate-ping pointer-events-none -z-10" />
      </div>

      {/* ── Heading & Subtitle ───────────────────────────────────── */}
      <h1 className="font-sans text-2xl sm:text-3xl font-bold text-[#111827] leading-tight">
        Putting everything together...
      </h1>
      <p className="font-inter text-sm sm:text-base text-[#6B7280] mt-2 max-w-lg">
        We're assembling all your form configurations, pipeline assessments, and application portal.
      </p>

      {/* ── Progress Bar ─────────────────────────────────────────── */}
      <div className="w-full max-w-[28rem] mt-8 mb-8 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-inter font-semibold text-[#0D2D54]">
          <span>Processing Step {Math.min(4, activeStepIndex + 1)} of 4</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-[#E5E7EB] overflow-hidden">
          <div
            className="h-full bg-[#0D2D54] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* ── Assembling Steps List ─────────────────────────────────── */}
      <div className="w-full max-w-[32rem] bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-xs text-left divide-y divide-[#F3F4F6]">
        {ASSEMBLY_STEPS.map((step, idx) => {
          const isDone = activeStepIndex > idx
          const isCurrent = activeStepIndex === idx
          return (
            <div key={step.id} className="py-3.5 first:pt-1 last:pb-1 flex items-start gap-3.5">
              <div className="mt-0.5 shrink-0">
                {isDone ? (
                  <div className="size-5 rounded-full bg-[#0D2D54] text-white flex items-center justify-center">
                    <svg
                      className="size-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : isCurrent ? (
                  <div className="size-5 rounded-full border-2 border-[#0D2D54] border-t-transparent animate-spin" />
                ) : (
                  <div className="size-5 rounded-full border border-[#D1D5DB] bg-gray-50" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4
                  className={`font-sans text-xs sm:text-sm font-semibold transition-colors ${
                    isDone || isCurrent ? 'text-[#111827]' : 'text-[#9CA3AF]'
                  }`}
                >
                  {step.title}
                </h4>
                <p className="font-inter text-[11px] text-[#6B7280] mt-0.5">{step.detail}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default PublishingProcessingScreen
