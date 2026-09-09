import { useRef, useState } from 'react'
import { toast } from 'sonner'
import Button from '@/shared/ui/Button'
import InputField from '@/shared/ui/InputField'
import Modal from '@/shared/ui/Modal'
import type {
  ApplicationFormResponse,
  UpdateApplicationFormPayload,
  CustomQuestionDto,
} from '@/features/jobs/types/jobs.types'

interface ApplicationFormScreenProps {
  jobId?: string | null
  roleTitle?: string
  companyName?: string
  initialFormData?: ApplicationFormResponse | null
  onBack: () => void
  onContinue: (payload: UpdateApplicationFormPayload) => void
}

interface FormElementItem {
  id: string
  label: string
  section: 'personal' | 'education' | 'links'
  icon: string
  enabled: boolean
  required: boolean
}

const DEFAULT_FORM_ELEMENTS: FormElementItem[] = [
  {
    id: 'phone',
    label: 'Phone Number',
    section: 'personal',
    icon: 'phone',
    enabled: true,
    required: true,
  },
  {
    id: 'linkedin',
    label: 'LinkedIn Profile',
    section: 'personal',
    icon: 'linkedin',
    enabled: true,
    required: false,
  },
  {
    id: 'email',
    label: 'Email Address',
    section: 'personal',
    icon: 'email',
    enabled: true,
    required: true,
  },
  {
    id: 'portfolio',
    label: 'Portfolio URL',
    section: 'education',
    icon: 'globe',
    enabled: true,
    required: false,
  },
  {
    id: 'cvUpload',
    label: 'CV / Resume',
    section: 'education',
    icon: 'shield',
    enabled: true,
    required: true,
  },
  {
    id: 'yearsOfExperience',
    label: 'Years of Experience',
    section: 'education',
    icon: 'shield',
    enabled: true,
    required: false,
  },
  {
    id: 'currentRole',
    label: 'Current Role',
    section: 'education',
    icon: 'shield',
    enabled: true,
    required: false,
  },
  {
    id: 'technicalFocus',
    label: 'Technical Focus',
    section: 'education',
    icon: 'globe',
    enabled: true,
    required: false,
  },
  {
    id: 'keyTechnologies',
    label: 'Key Technologies',
    section: 'education',
    icon: 'globe',
    enabled: true,
    required: false,
  },
  {
    id: 'github',
    label: 'GitHub Profile',
    section: 'links',
    icon: 'globe',
    enabled: true,
    required: false,
  },
]

export const ApplicationFormScreen = ({
  roleTitle = 'Backend Engineer',
  companyName = 'Uber Eats',
  initialFormData,
  onBack,
  onContinue,
}: ApplicationFormScreenProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [elements, setElements] = useState<FormElementItem[]>(() => {
    if (initialFormData?.elements) {
      return DEFAULT_FORM_ELEMENTS.map((el) => {
        const val = initialFormData.elements[el.id]
        if (typeof val === 'boolean') {
          return { ...el, enabled: val }
        } else if (val && typeof val === 'object') {
          return {
            ...el,
            enabled: val.enabled ?? el.enabled,
            required: val.required ?? el.required,
          }
        }
        return el
      })
    }
    return DEFAULT_FORM_ELEMENTS
  })

  const [customQuestions, setCustomQuestions] = useState<CustomQuestionDto[]>(() => {
    return initialFormData?.customQuestions || []
  })
  const [prevInitialFormData, setPrevInitialFormData] = useState(initialFormData)

  if (initialFormData !== prevInitialFormData) {
    setPrevInitialFormData(initialFormData)
    if (initialFormData) {
      if (initialFormData.elements) {
        setElements(
          DEFAULT_FORM_ELEMENTS.map((el) => {
            const val = initialFormData.elements[el.id]
            if (typeof val === 'boolean') {
              return { ...el, enabled: val }
            } else if (val && typeof val === 'object') {
              return {
                ...el,
                enabled: val.enabled ?? el.enabled,
                required: val.required ?? el.required,
              }
            }
            return el
          }),
        )
      }
      if (initialFormData.customQuestions) {
        setCustomQuestions(initialFormData.customQuestions)
      }
    }
  }

  const [isAddingQuestion, setIsAddingQuestion] = useState(false)
  const [newQuestionText, setNewQuestionText] = useState('')
  const [newQuestionType, setNewQuestionType] = useState<'text' | 'textarea' | 'number' | 'url'>(
    'textarea',
  )

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newQuestionText.trim()) return
    setCustomQuestions((prev) => [
      ...prev,
      {
        question: newQuestionText.trim(),
        required: true,
        type: newQuestionType,
      },
    ])
    setNewQuestionText('')
    setIsAddingQuestion(false)
  }

  const handleRemoveCustomQuestion = (index: number) => {
    setCustomQuestions((prev) => prev.filter((_, idx) => idx !== index))
  }

  const [isSaving, setIsSaving] = useState(false)

  const handleProceed = async () => {
    const elementsMap: Record<string, { enabled: boolean; required?: boolean }> = {}
    elements.forEach((el) => {
      elementsMap[el.id] = { enabled: el.enabled, required: el.required }
    })

    setIsSaving(true)
    try {
      await onContinue({
        elements: elementsMap,
        customQuestions,
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Interactive Live Preview State & Submission Modal
  const [isSubmittedModalOpen, setIsSubmittedModalOpen] = useState(false)
  const [customAnswers, setCustomAnswers] = useState<Record<number, string>>({})

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [locationType, setLocationType] = useState('')
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [isDraggingCv, setIsDraggingCv] = useState(false)

  const [yearsExperience, setYearsExperience] = useState('')
  const [currentRole, setCurrentRole] = useState('')
  const [technicalFocus, setTechnicalFocus] = useState('')
  const [keyTechnologies, setKeyTechnologies] = useState('')

  const [links, setLinks] = useState<string[]>(['https://myportfolio.com'])
  const [agreedTerms, setAgreedTerms] = useState(false)

  const handlePreviewSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const errors: Record<string, string> = {}

    if (!firstName.trim()) {
      errors.firstName = 'First name is required'
    }
    if (!lastName.trim()) {
      errors.lastName = 'Last name is required'
    }
    if (!email.trim()) {
      errors.email = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address'
    }

    const isPhoneEnabled = elements.find((el) => el.id === 'phone')?.enabled
    const isPhoneRequired = elements.find((el) => el.id === 'phone')?.required
    if (isPhoneEnabled && isPhoneRequired && !phone.trim()) {
      errors.phone = 'Phone number is required'
    }

    const isCvEnabled = elements.find((el) => el.id === 'cvUpload')?.enabled
    const isCvRequired = elements.find((el) => el.id === 'cvUpload')?.required
    if (isCvEnabled && isCvRequired && !cvFile) {
      errors.cv = 'Please upload your CV / Resume'
    }

    // Validate required custom questions
    customQuestions.forEach((q, idx) => {
      if (q.required && (!customAnswers[idx] || !customAnswers[idx].trim())) {
        errors[`custom_${idx}`] = `Please answer "${q.question}"`
      }
    })

    if (!agreedTerms) {
      errors.terms = 'Please agree to the Privacy Policy and Terms of Use'
    }

    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0]
      toast.error(firstError)
      return
    }

    setIsSubmittedModalOpen(true)
  }

  const handleToggleElement = (id: string) => {
    setElements((prev) => prev.map((el) => (el.id === id ? { ...el, enabled: !el.enabled } : el)))
  }

  const handleAddLink = () => {
    setLinks((prev) => [...prev, ''])
  }

  const handleUpdateLink = (index: number, val: string) => {
    setLinks((prev) => prev.map((item, i) => (i === index ? val : item)))
  }

  const handleRemoveLink = (index: number) => {
    setLinks((prev) => prev.filter((_, i) => i !== index))
  }

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingCv(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setCvFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0])
    }
  }

  const renderElementIcon = (icon: string) => {
    switch (icon) {
      case 'phone':
        return (
          <svg
            className="size-4 text-[#6B7280]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
        )
      case 'linkedin':
        return (
          <svg
            className="size-4 text-[#6B7280]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
        )
      case 'email':
        return (
          <svg
            className="size-4 text-[#6B7280]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
            />
          </svg>
        )
      case 'globe':
        return (
          <svg
            className="size-4 text-[#6B7280]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
            />
          </svg>
        )
      case 'shield':
        return (
          <svg
            className="size-4 text-[#6B7280]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div className="w-full max-w-[68rem] mx-auto py-2 animate-in fade-in duration-300">
      {/* ── Main 2-Column Grid (Form Elements on Left, Live Preview on Right) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Elements (4 cols on lg) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
          <h3 className="font-sans font-bold text-base text-[#111827] mb-5">Form Elements</h3>

          {/* Section: PERSONAL INFO */}
          <div className="mb-6">
            <h4 className="font-sans text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] mb-2.5">
              Personal Info
            </h4>
            <div className="space-y-2">
              {elements
                .filter((el) => el.section === 'personal')
                .map((el) => (
                  <button
                    key={el.id}
                    type="button"
                    onClick={() => handleToggleElement(el.id)}
                    className={`w-full p-3 rounded-xl border flex items-center justify-between transition-colors cursor-pointer text-left ${
                      el.enabled
                        ? 'bg-white border-[#0D2D54]/20 hover:border-[#0D2D54]/40 shadow-2xs'
                        : 'bg-[#F9FAFB] border-[#E5E7EB] opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {renderElementIcon(el.icon)}
                      <span className="font-inter text-xs sm:text-sm font-medium text-[#111827]">
                        {el.label}
                      </span>
                    </div>
                    <span className="text-[#0D2D54] text-xs font-semibold">
                      {el.enabled ? 'Active' : 'Add'}
                    </span>
                  </button>
                ))}
            </div>
          </div>

          {/* Section: EDUCATION & WORK */}
          <div className="mb-6">
            <h4 className="font-sans text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] mb-2.5">
              Education & Work
            </h4>
            <div className="space-y-2">
              {elements
                .filter((el) => el.section === 'education')
                .map((el) => (
                  <button
                    key={el.id}
                    type="button"
                    onClick={() => handleToggleElement(el.id)}
                    className={`w-full p-3 rounded-xl border flex items-center justify-between transition-colors cursor-pointer text-left ${
                      el.enabled
                        ? 'bg-white border-[#0D2D54]/20 hover:border-[#0D2D54]/40 shadow-2xs'
                        : 'bg-[#F9FAFB] border-[#E5E7EB] opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {renderElementIcon(el.icon)}
                      <span className="font-inter text-xs sm:text-sm font-medium text-[#111827]">
                        {el.label}
                      </span>
                    </div>
                    <span className="text-[#0D2D54] text-xs font-semibold">
                      {el.enabled ? 'Active' : 'Add'}
                    </span>
                  </button>
                ))}
            </div>
          </div>

          {/* Section: CUSTOM QUESTIONS */}
          <div>
            <h4 className="font-sans text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] mb-2.5">
              Custom Questions
            </h4>

            {customQuestions.map((q, idx) => (
              <div
                key={idx}
                className="p-3 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] mb-2 flex items-center justify-between text-xs font-inter text-[#111827]"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{q.question}</span>
                  <span className="text-[10px] text-[#6B7280] uppercase tracking-wider">
                    {q.type} · {q.required ? 'Required' : 'Optional'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveCustomQuestion(idx)}
                  className="text-gray-400 hover:text-red-500 cursor-pointer p-1"
                >
                  ✕
                </button>
              </div>
            ))}

            {isAddingQuestion ? (
              <form onSubmit={handleAddQuestion} className="mt-2 space-y-2">
                <InputField
                  type="text"
                  placeholder="e.g. Why do you want to join our team?"
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  className="!mt-0 !py-2 !text-xs"
                  autoFocus
                  required
                />
                <div className="flex items-center gap-2">
                  <select
                    value={newQuestionType}
                    onChange={(e) =>
                      setNewQuestionType(e.target.value as 'text' | 'textarea' | 'number' | 'url')
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-[#D1D5DB] rounded-lg text-xs font-inter text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#0D2D54]"
                  >
                    <option value="textarea">Long text (Textarea)</option>
                    <option value="text">Short text (Input)</option>
                    <option value="url">URL / Link</option>
                    <option value="number">Number</option>
                  </select>
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    type="button"
                    onClick={() => setIsAddingQuestion(false)}
                    label="Cancel"
                    className="!w-auto px-2.5 py-1 text-xs text-gray-500 bg-transparent hover:bg-gray-100 rounded cursor-pointer"
                  />
                  <Button
                    type="submit"
                    label="Add"
                    className="!w-auto px-3 py-1 bg-[#0D2D54] text-white rounded text-xs font-medium cursor-pointer"
                  />
                </div>
              </form>
            ) : (
              <Button
                type="button"
                onClick={() => setIsAddingQuestion(true)}
                label="Add Custom Question"
                icon={<span className="text-sm font-bold leading-none text-[#0D2D54]">+</span>}
                className="w-full p-3.5 border-2 border-dashed border-[#D1D5DB] hover:border-[#0D2D54]/50 rounded-xl bg-transparent hover:bg-gray-50 text-xs font-inter font-medium text-[#4B5563] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              />
            )}
          </div>
        </div>

        {/* Right Column: Live Preview (8 cols on lg) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
          {/* Header Bar with Primary Color Badge without green dots */}
          <div className="px-6 py-4 border-b border-[#E5E7EB] bg-gray-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-inter font-semibold text-[#374151]">
              <svg
                className="size-4 text-[#6B7280]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <span>Live Preview</span>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-inter font-semibold bg-[#0D2D54]/5 text-[#0D2D54] border border-[#0D2D54]/15">
              Application open
            </span>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {/* 1. Personal Information */}
            <div>
              <div className="flex items-center gap-2.5 mb-5">
                <div className="size-8 rounded-full bg-[#0D2D54]/10 text-[#0D2D54] flex items-center justify-center shrink-0">
                  <svg
                    className="size-4.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h3 className="font-sans font-bold text-base sm:text-lg text-[#111827]">
                  Personal Information
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <InputField
                    label="First name"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g Eniafe"
                    required
                    className="!mt-0 !py-2.5 !text-xs"
                  />
                </div>
                <div>
                  <InputField
                    label="Last name"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g Eniafe"
                    required
                    className="!mt-0 !py-2.5 !text-xs"
                  />
                </div>
                <div>
                  <InputField
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourmail@example.com"
                    required
                    className="!mt-0 !py-2.5 !text-xs"
                  />
                </div>
                <div>
                  <InputField
                    label="Phone number"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 800 000 0000"
                    required
                    className="!mt-0 !py-2.5 !text-xs"
                  />
                </div>
                <div>
                  <InputField
                    label="Location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Select your location"
                    required
                    className="!mt-0 !py-2.5 !text-xs"
                  />
                </div>
                <div>
                  <InputField
                    label="Current location type"
                    type="text"
                    value={locationType}
                    onChange={(e) => setLocationType(e.target.value)}
                    placeholder="Select your location"
                    required
                    className="!mt-0 !py-2.5 !text-xs"
                  />
                </div>
              </div>

              {/* Upload CV Dropzone (Fully Interactive) */}
              <div className="mt-4">
                <label className="block text-xs font-medium text-[#374151] mb-1.5">
                  Upload CV *
                </label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault()
                    setIsDraggingCv(true)
                  }}
                  onDragLeave={() => setIsDraggingCv(false)}
                  onDrop={handleFileDrop}
                  className={`p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center transition-colors ${
                    isDraggingCv
                      ? 'border-[#0D2D54] bg-[#0D2D54]/5'
                      : 'border-[#D1D5DB] bg-gray-50/50 hover:bg-gray-50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  <svg
                    className="size-8 text-[#0D2D54] mb-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="font-inter text-xs sm:text-sm font-semibold text-[#111827]">
                    {cvFile ? cvFile.name : 'Drag and drop your CV here'}
                  </p>
                  <p className="font-inter text-[11px] text-[#9CA3AF] mt-0.5 mb-3">
                    {cvFile ? `${(cvFile.size / 1024).toFixed(0)} KB` : 'PDF or DOC max 10MB'}
                  </p>
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    label="Browse files"
                    icon={
                      <svg
                        className="size-3.5 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    }
                    className="!w-auto px-3.5 py-1.5 bg-white hover:bg-gray-50 border border-[#D1D5DB] text-xs font-inter font-medium text-[#374151] rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* 2. Experience */}
            <div>
              <div className="flex items-center gap-2.5 mb-5">
                <div className="size-8 rounded-full bg-[#0D2D54]/10 text-[#0D2D54] flex items-center justify-center shrink-0">
                  <svg
                    className="size-4.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="font-sans font-bold text-base sm:text-lg text-[#111827]">
                  Experience
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#374151] mb-1.5">
                    Years of experience *
                  </label>
                  <select
                    value={yearsExperience}
                    onChange={(e) => setYearsExperience(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#D1D5DB] rounded-lg text-xs font-inter text-black focus:outline-none focus:ring-1 focus:ring-[#0D2D54] cursor-pointer"
                  >
                    <option value="">Select your experience</option>
                    <option value="0-1">0–1 years</option>
                    <option value="1-3">1–3 years</option>
                    <option value="3-5">3–5 years</option>
                    <option value="5+">5+ years</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#374151] mb-1.5">
                    Current role *
                  </label>
                  <select
                    value={currentRole}
                    onChange={(e) => setCurrentRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#D1D5DB] rounded-lg text-xs font-inter text-black focus:outline-none focus:ring-1 focus:ring-[#0D2D54] cursor-pointer"
                  >
                    <option value="">Select current role</option>
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="Fullstack Developer">Fullstack Developer</option>
                    <option value="Backend Developer">Backend Developer</option>
                    <option value="Software Engineer">Software Engineer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#374151] mb-1.5">
                    Technical focus *
                  </label>
                  <select
                    value={technicalFocus}
                    onChange={(e) => setTechnicalFocus(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#D1D5DB] rounded-lg text-xs font-inter text-black focus:outline-none focus:ring-1 focus:ring-[#0D2D54] cursor-pointer"
                  >
                    <option value="">Select focus</option>
                    <option value="React & Next.js">React & Next.js</option>
                    <option value="TypeScript & Node.js">TypeScript & Node.js</option>
                    <option value="Cloud & DevOps">Cloud & DevOps</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#374151] mb-1.5">
                    Key Technologies *
                  </label>
                  <select
                    value={keyTechnologies}
                    onChange={(e) => setKeyTechnologies(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#D1D5DB] rounded-lg text-xs font-inter text-black focus:outline-none focus:ring-1 focus:ring-[#0D2D54] cursor-pointer"
                  >
                    <option value="">Select key technologies</option>
                    <option value="React, TypeScript, TailwindCSS">
                      React, TypeScript, TailwindCSS
                    </option>
                    <option value="Node.js, PostgreSQL, Docker">Node.js, PostgreSQL, Docker</option>
                    <option value="Python, FastAPI, AWS">Python, FastAPI, AWS</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 3. Links (Interactive with Add/Remove) */}
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="size-8 rounded-full bg-[#0D2D54]/10 text-[#0D2D54] flex items-center justify-center shrink-0">
                  <svg
                    className="size-4.5"
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
                </div>
                <h3 className="font-sans font-bold text-base sm:text-lg text-[#111827]">Links</h3>
              </div>
              <p className="font-inter text-xs text-[#6B7280] mb-4">
                Add links to your Github, portfolio, Linkedin or Personal website
              </p>

              <div className="space-y-3">
                {links.map((link, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <InputField
                      type="url"
                      value={link}
                      onChange={(e) => handleUpdateLink(idx, e.target.value)}
                      placeholder="https://myportfolio.com"
                      className="!py-2.5 !text-xs"
                      wrapperClassName="flex-1"
                    />
                    {links.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLink(idx)}
                        className="px-2.5 py-2 text-gray-400 hover:text-red-500 cursor-pointer"
                        title="Remove link"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={handleAddLink}
                  label="+ Add another link"
                  className="!w-auto px-4 py-2 bg-white hover:bg-gray-50 border border-[#D1D5DB] rounded-lg text-xs font-inter font-medium text-[#374151] shrink-0 cursor-pointer transition-colors shadow-2xs"
                />
              </div>
            </div>

            {/* Custom Questions Live Preview */}
            {customQuestions.length > 0 && (
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <h3 className="font-sans font-bold text-base sm:text-lg text-[#111827]">
                    Additional Questions
                  </h3>
                </div>
                <div className="space-y-4">
                  {customQuestions.map((q, idx) => (
                    <div key={idx}>
                      <label className="block text-xs font-medium text-[#374151] mb-1.5">
                        {q.question} {q.required && <span className="text-[#EF4444]">*</span>}
                      </label>
                      {q.type === 'textarea' ? (
                        <textarea
                          placeholder="Your response..."
                          rows={3}
                          value={customAnswers[idx] || ''}
                          onChange={(e) =>
                            setCustomAnswers((prev) => ({ ...prev, [idx]: e.target.value }))
                          }
                          className="w-full px-3.5 py-2.5 bg-white border border-[#D1D5DB] rounded-lg text-xs font-inter text-black placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0D2D54]"
                        />
                      ) : (
                        <InputField
                          type={q.type === 'url' ? 'url' : q.type === 'number' ? 'number' : 'text'}
                          placeholder="Your response..."
                          value={customAnswers[idx] || ''}
                          onChange={(e) =>
                            setCustomAnswers((prev) => ({ ...prev, [idx]: e.target.value }))
                          }
                          className="!py-2.5 !text-xs"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Terms & Policy Checkbox */}
            <div className="flex items-center gap-2.5 pt-2">
              <input
                type="checkbox"
                id="preview-terms"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="size-4 rounded border-gray-300 text-[#0D2D54] focus:ring-[#0D2D54] cursor-pointer"
              />
              <label
                htmlFor="preview-terms"
                className="font-inter text-xs text-[#4B5563] cursor-pointer select-none"
              >
                I agree to the{' '}
                <span className="text-[#0D2D54] underline font-medium">Privacy Policy</span> and{' '}
                <span className="text-[#0D2D54] underline font-medium">Terms of Use</span>
              </label>
            </div>

            {/* 5. Submit Application Button Preview (Primary Color Brand Navy) */}
            <div className="pt-2">
              <Button
                type="button"
                onClick={handlePreviewSubmit}
                label="Submit Application"
                className="w-full py-3 bg-[#0D2D54] hover:opacity-90 text-white rounded-lg text-sm font-inter font-medium cursor-pointer transition-opacity shadow-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Action Navigation ──────────────────────────────── */}
      <div className="flex items-center justify-between pt-8 mt-8 border-t border-[#E5E7EB]">
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
          label={isSaving ? 'Saving Form...' : 'Continue to Review'}
          className="!w-auto bg-[#0D2D54] hover:opacity-90 text-white py-2.5 px-8 rounded-lg text-sm font-medium shadow-sm transition-opacity cursor-pointer"
        />
      </div>

      {/* ── Application Submitted Success Modal (Image 1) ─────────── */}
      <Modal
        isOpen={isSubmittedModalOpen}
        onClose={() => setIsSubmittedModalOpen(false)}
        position="center"
        className="max-w-[28rem] sm:max-w-[32rem] text-center p-8 sm:p-10 rounded-2xl"
      >
        <div className="flex flex-col items-center">
          {/* Circle Badge with Checkmark */}
          <div className="size-16 rounded-full bg-[#0D2D54] flex items-center justify-center mb-6 text-white shadow-sm">
            <svg
              className="size-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h3 className="font-sans font-bold text-2xl sm:text-[1.75rem] text-[#111827] mb-3 leading-tight">
            Application Submitted!
          </h3>

          <p className="font-inter text-sm sm:text-base text-[#6B7280] leading-relaxed mb-8">
            Thank you for applying for the{' '}
            <strong className="text-[#111827] font-semibold">
              {roleTitle || 'Backend Engineer'}
            </strong>{' '}
            position at{' '}
            <strong className="text-[#111827] font-semibold">{companyName || 'Uber Eats'}</strong>.
            Our automated screening team will review your CV shortly. You will receive an email
            update soon.
          </p>

          <Button
            type="button"
            onClick={() => setIsSubmittedModalOpen(false)}
            label="Continue"
            className="w-full py-3.5 bg-[#0D2D54] hover:opacity-90 text-white rounded-xl font-inter font-medium text-sm sm:text-base transition-opacity shadow-sm cursor-pointer"
          />
        </div>
      </Modal>
    </div>
  )
}

export default ApplicationFormScreen
