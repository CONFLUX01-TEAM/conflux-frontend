import { useRef, useState } from 'react'
import { toast } from 'sonner'
import Button from '@/shared/ui/Button'
import Dropdown from '@/shared/ui/Dropdown'
import InputField from '@/shared/ui/InputField'
import TagInputField from '@/shared/ui/TagInputField'
import TextareaField from '@/shared/ui/TextareaField'
import { parseDocument } from '@/features/jobs/utils/parseDocument'
import { extractJdData } from '@/features/jobs/utils/extractJdData'
import * as jobsService from '@/features/jobs/services/jobs.service'
import type {
  ParseJdResponse,
  SuggestedRole,
  ConfidenceScores,
  PipelineStageDto,
  ApplicationFormResponse,
  UpdateApplicationFormPayload,
} from '@/features/jobs/types/jobs.types'
import AnalyzingJdScreen from '@/features/jobs/components/AnalyzingJdScreen'
import JdConfidenceReview from '@/features/jobs/components/JdConfidenceReview'
import AssessmentPipelineScreen from '@/features/jobs/components/AssessmentPipelineScreen'
import ApplicationFormScreen from '@/features/jobs/components/ApplicationFormScreen'
import ReviewPostJobScreen from '@/features/jobs/components/ReviewPostJobScreen'
import PublishingProcessingScreen from '@/features/jobs/components/PublishingProcessingScreen'
import JobPublishSuccessScreen from '@/features/jobs/components/JobPublishSuccessScreen'

export type WizardStep = 1 | 2 | 3 | 4 | 5
export type JdInputMethod = 'document' | 'manual' | 'link' | null

interface StepItem {
  id: WizardStep
  title: string
}

const STEPS: StepItem[] = [
  { id: 1, title: 'JD Input' },
  { id: 2, title: 'Job Details' },
  { id: 3, title: 'Pipeline' },
  { id: 4, title: 'Application Form' },
  { id: 5, title: 'Review & Publish' },
]

const DEPARTMENTS = [
  'Software Engineering',
  'Product Design',
  'Product Management',
  'Data & Analytics',
  'Marketing',
  'Sales & Business Dev',
  'Operations',
  'Finance',
  'Human Resources',
]

const SENIORITY_LEVELS = [
  'Junior Developer',
  'Mid-Level Developer',
  'Senior Developer',
  'Lead Engineer',
  'Principal / Staff',
  'Manager / Director',
]

const EXPERIENCE_LEVELS = ['0-1 Years', '1-3 Years', '3-5 Years', '5-8 Years', '8+ Years']

const CreateRoleWizard = () => {
  const [currentStep, setCurrentStep] = useState<WizardStep>(1)
  const [selectedMethod, setSelectedMethod] = useState<JdInputMethod>(null)
  const [linkUrl, setLinkUrl] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isReadingDoc, setIsReadingDoc] = useState(false)
  const [isAnalyzingRole, setIsAnalyzingRole] = useState(false)
  const [isPublishingProcessing, setIsPublishingProcessing] = useState(false)
  const [isPublishedSuccess, setIsPublishedSuccess] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [step2Phase, setStep2Phase] = useState<'role' | 'details' | 'review'>('role')

  // Backend-persisted job reference
  const [jobId, setJobId] = useState<string | null>(null)
  const [jdFileUrl, setJdFileUrl] = useState<string | null>(null)
  const [parseConfidence, setParseConfidence] = useState<number>(0)
  const [confidenceScores, setConfidenceScores] = useState<ConfidenceScores | null>(null)
  const [publishShareableUrl, setPublishShareableUrl] = useState<string>('')
  const [publishSlug, setPublishSlug] = useState<string>('')

  // Pipeline state lifted from AssessmentPipelineScreen for backend sync
  const [pipelineStages, setPipelineStages] = useState<PipelineStageDto[]>([])
  const [estTimeToHireDays, setEstTimeToHireDays] = useState<number | null>(null)

  // Application form state lifted for backend sync
  const [appFormData, setAppFormData] = useState<ApplicationFormResponse | null>(null)

  // Step 2 Job Details Form State
  const [roleTitle, setRoleTitle] = useState('')
  const [department, setDepartment] = useState('')
  const [seniorityLevel, setSeniorityLevel] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('')
  const [requiredSkills, setRequiredSkills] = useState<string[]>([])
  const [preferredSkills, setPreferredSkills] = useState<string[]>([])
  const [responsibilities, setResponsibilities] = useState<string[]>([])
  const [salaryCompensation, setSalaryCompensation] = useState<string>('')
  const [roleSummary, setRoleSummary] = useState('')
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Job Logistics State
  const [minSalary, setMinSalary] = useState('')
  const [maxSalary, setMaxSalary] = useState('')
  const [location, setLocation] = useState('')
  const [workModel, setWorkModel] = useState<'Remote' | 'Hybrid' | 'On-site'>('Remote')
  const [employmentType, setEmploymentType] = useState('')
  const [hoursPerWeek, setHoursPerWeek] = useState('40')
  const [openings, setOpenings] = useState('1')
  const [hiringPriority, setHiringPriority] = useState<'Critical' | 'High' | 'Medium'>('High')
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [isSavingReviewDraft, setIsSavingReviewDraft] = useState(false)

  // Dropdown lists supporting user-added custom options
  const [departmentsList, setDepartmentsList] = useState<string[]>(DEPARTMENTS)
  const [seniorityList, setSeniorityList] = useState<string[]>(SENIORITY_LEVELS)
  const [experienceList, setExperienceList] = useState<string[]>(EXPERIENCE_LEVELS)

  const handleAddCustomDepartment = (custom: string) => {
    if (!departmentsList.includes(custom)) {
      setDepartmentsList((prev) => [...prev, custom])
    }
    setDepartment(custom)
    setFormErrors((prev) => ({ ...prev, department: '' }))
  }

  const handleAddCustomSeniority = (custom: string) => {
    if (!seniorityList.includes(custom)) {
      setSeniorityList((prev) => [...prev, custom])
    }
    setSeniorityLevel(custom)
    setFormErrors((prev) => ({ ...prev, seniorityLevel: '' }))
  }

  const handleAddCustomExperience = (custom: string) => {
    if (!experienceList.includes(custom)) {
      setExperienceList((prev) => [...prev, custom])
    }
    setExperienceLevel(custom)
    setFormErrors((prev) => ({ ...prev, experienceLevel: '' }))
  }

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSelectMethod = (method: JdInputMethod) => {
    setSelectedMethod(method)
    if (method === 'manual') {
      // Clear form completely for fresh manual filling
      setRoleTitle('')
      setDepartment('')
      setSeniorityLevel('')
      setExperienceLevel('')
      setRequiredSkills([])
      setPreferredSkills([])
      setRoleSummary('')
      setFormErrors({})
      setStep2Phase('role')
      toast.info('Starting manual role creation wizard.')
      setCurrentStep(2)
    }
  }

  const validateAndSetFile = (file: File) => {
    const validExtensions = ['.pdf', '.docx', '.doc', '.txt']
    const hasValidExt = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))

    if (!hasValidExt) {
      toast.error('Please upload a PDF, DOCX, or TXT file.')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds the 2 mb limit.')
      return
    }

    setUploadedFile(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      validateAndSetFile(file)
    }
    // Reset so the user can re-select or replace with any file
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      validateAndSetFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  /** Populate form state from backend parse-jd response using suggestedRole, rawText, and jdText. */
  const populateFromParseResponse = (
    res: Awaited<ReturnType<typeof jobsService.parseJobDescription>>,
  ) => {
    const data = (res.data || {}) as Partial<ParseJdResponse>
    const sr: Partial<SuggestedRole> = data.suggestedRole || {}
    const cs = data.confidenceScores || null
    const rawPc = data.parseConfidence
    const pc = rawPc !== undefined ? (rawPc <= 1 ? Math.round(rawPc * 100) : rawPc) : 0
    const fileUrl = data.jdFileUrl || null

    // Extract structured data from the response rawText / jdText
    const textToAnalyze = data.rawText || data.jdText || ''
    const extracted = textToAnalyze ? extractJdData(textToAnalyze) : null

    // 1. Role Title
    const title = sr.roleTitle || extracted?.roleTitle || ''
    setRoleTitle(title)

    // 2. Department
    const dept = sr.department || extracted?.department || ''
    if (dept) {
      setDepartment(dept)
      if (!departmentsList.includes(dept)) {
        setDepartmentsList((prev) => [...prev, dept])
      }
    } else {
      setDepartment('')
    }

    // 3. Seniority Level
    const seniority = sr.seniorityLevel || extracted?.seniorityLevel || ''
    if (seniority) {
      setSeniorityLevel(seniority)
      if (!seniorityList.includes(seniority)) {
        setSeniorityList((prev) => [...prev, seniority])
      }
    } else {
      setSeniorityLevel('')
    }

    // 4. Experience Level
    const experience = sr.experienceLevel || extracted?.experienceLevel || ''
    if (experience) {
      setExperienceLevel(experience)
      if (!experienceList.includes(experience)) {
        setExperienceList((prev) => [...prev, experience])
      }
    } else {
      setExperienceLevel('')
    }

    // 5. Skills
    const req =
      Array.isArray(sr.requiredSkills) && sr.requiredSkills.length > 0
        ? sr.requiredSkills
        : extracted?.requiredSkills || []
    setRequiredSkills(req)

    const pref =
      Array.isArray(sr.preferredSkills) && sr.preferredSkills.length > 0
        ? sr.preferredSkills
        : extracted?.preferredSkills || []
    setPreferredSkills(pref)

    // 6. Responsibilities
    const resp =
      Array.isArray(sr.responsibilities) && sr.responsibilities.length > 0
        ? sr.responsibilities
        : extracted?.responsibilities || []
    setResponsibilities(resp)

    // 7. Role Summary
    setRoleSummary(sr.roleSummary || extracted?.roleSummary || '')

    // 8. Compensation
    const minVal = sr.minSalary ?? extracted?.minSalary
    const maxVal = sr.maxSalary ?? extracted?.maxSalary
    if (minVal != null) setMinSalary(minVal.toLocaleString('en-US'))
    else setMinSalary('')
    if (maxVal != null) setMaxSalary(maxVal.toLocaleString('en-US'))
    else setMaxSalary('')

    if (minVal != null && maxVal != null) {
      setSalaryCompensation(`$${minVal.toLocaleString()} - $${maxVal.toLocaleString()} / year`)
    } else if (extracted?.salaryCompensation) {
      setSalaryCompensation(extracted.salaryCompensation)
    } else {
      setSalaryCompensation('')
    }

    // 9. Location & Work Model & Employment Type
    const loc = sr.location || extracted?.location || ''
    setLocation(loc)

    const wm = sr.workModel || extracted?.workModel
    if (wm) {
      const model = wm.toLowerCase()
      if (model.includes('hybrid')) setWorkModel('Hybrid')
      else if (model.includes('site') || model.includes('office')) setWorkModel('On-site')
      else if (model.includes('remote')) setWorkModel('Remote')
    }

    const emp = sr.employmentType || extracted?.employmentType || ''
    setEmploymentType(emp)

    setConfidenceScores(cs)
    setParseConfidence(pc || 85)
    if (fileUrl) setJdFileUrl(fileUrl)
  }

  const handleParseDocument = async () => {
    if (!uploadedFile) return
    setIsReadingDoc(true)

    try {
      // Option B: Extract raw text on the frontend first
      const text = await parseDocument(uploadedFile)

      // Send the extracted text to the backend parse-jd endpoint
      const res = await jobsService.parseJobDescription({ jdText: text })
      populateFromParseResponse(res)
      setIsReadingDoc(false)
      toast.success(
        `Parsed "${res.data?.suggestedRole?.roleTitle || uploadedFile.name.replace(/\.[^/.]+$/, '')}" successfully!`,
      )
      setStep2Phase('role')
      setCurrentStep(2)
    } catch (err) {
      console.error('Document parse error:', err)
      toast.error(
        err instanceof Error
          ? err.message
          : 'Failed to parse document. Please try a different file.',
      )
      setIsReadingDoc(false)
    }
  }

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!linkUrl.trim()) {
      toast.error('Please enter a valid job posting URL.')
      return
    }

    setIsReadingDoc(true)
    try {
      const res = await jobsService.parseJobDescription({ jdUrl: linkUrl.trim() })
      populateFromParseResponse(res)
      setIsReadingDoc(false)
      toast.success('Job link parsed successfully!')
      setStep2Phase('role')
      setCurrentStep(2)
    } catch (err) {
      console.error('Link parse error:', err)
      toast.error(
        err instanceof Error ? err.message : 'Failed to parse link. Please try a different URL.',
      )
      setIsReadingDoc(false)
    }
  }

  const validateDefineRole = () => {
    const errors: Record<string, string> = {}
    if (!roleTitle.trim()) {
      errors.roleTitle = 'Role title is required'
    }
    if (!department) {
      errors.department = 'Department is required'
    }
    if (!seniorityLevel) {
      errors.seniorityLevel = 'Seniority level is required'
    }
    if (!experienceLevel) {
      errors.experienceLevel = 'Experience level is required'
    }
    if (requiredSkills.length === 0) {
      errors.requiredSkills = 'Please add at least one core skill'
    }
    if (!roleSummary.trim()) {
      errors.roleSummary = 'Role summary is required'
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleContinueDefineRole = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateDefineRole()) {
      toast.error('Please complete all required fields.')
      return
    }
    setStep2Phase('details')
  }

  const handleNumericSalaryChange = (val: string, setter: (v: string) => void) => {
    const digits = val.replace(/[^0-9]/g, '')
    if (!digits) {
      setter('')
    } else {
      const num = Number(digits)
      setter(isNaN(num) ? '' : num.toLocaleString('en-US'))
    }
    if (formErrors.compensation) {
      setFormErrors((prev) => ({ ...prev, compensation: '' }))
    }
  }

  const validateJobDetails = () => {
    const errors: Record<string, string> = {}
    const minClean = minSalary.replace(/[^0-9]/g, '')
    const maxClean = maxSalary.replace(/[^0-9]/g, '')

    if (!minClean && !maxClean) {
      errors.compensation = 'Please enter both minimum and maximum salary'
    } else if (!minClean) {
      errors.compensation = 'Minimum salary is required'
    } else if (!maxClean) {
      errors.compensation = 'Maximum salary is required'
    } else {
      const minNum = Number(minClean)
      const maxNum = Number(maxClean)
      if (isNaN(minNum) || minNum <= 0) {
        errors.compensation = 'Minimum salary must be a valid number greater than 0'
      } else if (isNaN(maxNum) || maxNum <= 0) {
        errors.compensation = 'Maximum salary must be a valid number greater than 0'
      } else if (minNum > maxNum) {
        errors.compensation = 'Minimum salary cannot exceed maximum salary'
      }
    }
    if (!location.trim()) {
      errors.location = 'Location is required'
    }
    if (!employmentType) {
      errors.employmentType = 'Employment type is required'
    }
    if (openings !== '' && (isNaN(Number(openings)) || Number(openings) < 1)) {
      errors.openings = 'Openings must be at least 1'
    }
    if (
      hoursPerWeek !== '' &&
      (isNaN(Number(hoursPerWeek)) || Number(hoursPerWeek) < 1 || Number(hoursPerWeek) > 168)
    ) {
      errors.hoursPerWeek = 'Hours per week must be between 1 and 168'
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleContinueJobDetails = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateJobDetails()) {
      toast.error('Please complete all required fields.')
      return
    }

    // Build the comprehensive payload compatible with both flat and nested schemas
    const minClean = minSalary.replace(/[^0-9]/g, '')
    const maxClean = maxSalary.replace(/[^0-9]/g, '')
    const minNum = minClean ? Number(minClean) : null
    const maxNum = maxClean ? Number(maxClean) : null
    const payload = {
      title: roleTitle,
      category: department,
      seniority: seniorityLevel,
      requiredSkills,
      preferredSkills,
      responsibilities,
      experienceLevel,
      personsToHire: Number(openings) || 1,
      employmentType: employmentType || 'Full-time',
      location,
      salaryMin: minNum,
      salaryMax: maxNum,
      salaryCurrency: 'USD',
      workModel,
      hoursPerWeek: Number(hoursPerWeek) || 40,
      hiringPriority,
      wizardStep: 2,
      jdFileUrl,
      roleDetails: {
        roleTitle,
        department,
        seniorityLevel,
        experienceLevel,
        location,
        workModel,
        employmentType: employmentType || 'Full-time',
        minSalary: minNum,
        maxSalary: maxNum,
        currency: 'USD',
        requiredSkills,
        preferredSkills,
        responsibilities,
        roleSummary,
      },
      logistics: {
        openings: Number(openings) || 1,
        hiringPriority,
        hoursPerWeek: Number(hoursPerWeek) || 40,
        workModel,
      },
    }

    setIsSavingDraft(true)
    try {
      if (jobId) {
        await jobsService.updateJobDraft(jobId, payload)
      } else {
        const res = await jobsService.createJobDraft(payload)
        setJobId(res.data.id)
      }
      setStep2Phase('review')
    } catch (err) {
      console.error('Save draft error:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to save job draft.')
    } finally {
      setIsSavingDraft(false)
    }
  }

  return (
    <div className="w-full max-w-[62rem] mx-auto py-4 sm:py-8 flex flex-col items-center">
      {/* ── Top Stepper Progress Bar (High-Contrast) ─────────────── */}
      {!isPublishedSuccess && (
        <div className="w-full max-w-[54rem] px-4 mb-8 sm:mb-12">
          <div className="flex items-center justify-between relative">
            {/* Background Connecting Line */}
            <div className="absolute top-4 sm:top-5 left-6 right-6 h-[2px] bg-[#D1D5DB] -z-0" />

            {STEPS.map((step) => {
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id

              return (
                <div key={step.id} className="flex flex-col items-center z-10 min-w-0">
                  <div
                    className={`size-8 sm:size-10 rounded-full flex items-center justify-center font-sans text-xs sm:text-sm font-bold transition-colors duration-200 ${
                      isActive
                        ? 'bg-[#0D2D54] text-white shadow-md ring-4 ring-[#0D2D54]/10'
                        : isCompleted
                          ? 'bg-[#0D2D54] text-white'
                          : 'bg-white border-2 border-[#6B7280] text-[#374151]'
                    }`}
                  >
                    {isCompleted ? (
                      <svg
                        className="size-4 sm:size-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      step.id
                    )}
                  </div>
                  <span
                    className={`mt-2 font-inter text-[11px] sm:text-xs text-center whitespace-nowrap transition-colors duration-200 ${
                      isActive
                        ? 'font-bold text-[#0D2D54]'
                        : isCompleted
                          ? 'font-semibold text-[#111827]'
                          : 'font-medium text-[#4B5563]'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Main Content Card ────────────────────────────────────── */}
      <div className="w-full bg-white border border-[#E6E6E6] rounded-2xl p-6 sm:p-10 md:p-12 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        {/* ────────────────────────────────────────────────────────── */}
        {/* LOADING: Parsing Job Document (During Step 1 Upload)       */}
        {/* ────────────────────────────────────────────────────────── */}
        {isReadingDoc && (
          <div className="w-full max-w-[32rem] mx-auto py-12 flex flex-col items-center text-center animate-in fade-in duration-200">
            <div className="size-16 rounded-2xl bg-white border border-[#E5E7EB] text-[#0D2D54] flex items-center justify-center shadow-md mb-6 ring-8 ring-[#0D2D54]/5">
              <svg className="size-8 animate-spin text-[#0D2D54]" fill="none" viewBox="0 0 24 24">
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
            <h2 className="font-sans text-xl sm:text-2xl font-bold text-[#111827]">
              Parsing job document...
            </h2>
            <p className="font-inter text-sm text-[#6B7280] mt-2">
              Extracting text and structure from your document to build your role profile.
            </p>
          </div>
        )}

        {/* ────────────────────────────────────────────────────────── */}
        {/* PROCESSING: Analyzing Job Description (After Step 2)       */}
        {/* ────────────────────────────────────────────────────────── */}
        {isAnalyzingRole && <AnalyzingJdScreen estimatedDurationMs={2400} />}

        {/* ────────────────────────────────────────────────────────── */}
        {/* PROCESSING: Assembling & Publishing Role (After Step 5)     */}
        {/* ────────────────────────────────────────────────────────── */}
        {isPublishingProcessing && <PublishingProcessingScreen estimatedDurationMs={2800} />}

        {/* ────────────────────────────────────────────────────────── */}
        {/* SUCCESS: Your Role is Live!                                */}
        {/* ────────────────────────────────────────────────────────── */}
        {isPublishedSuccess && (
          <JobPublishSuccessScreen
            data={{
              roleTitle,
              department,
              location,
              workModel,
              minSalary,
              maxSalary,
              salaryCompensation,
              shareableUrl: publishShareableUrl,
              slug: publishSlug,
            }}
            onViewPipeline={() => {
              window.location.href = '/jobs'
            }}
            onDownloadJd={() => {
              toast.success('Downloading finalized Job Description PDF...')
            }}
          />
        )}

        {/* ────────────────────────────────────────────────────────── */}
        {/* STEP 1: Method Selection                                 */}
        {/* ────────────────────────────────────────────────────────── */}
        {!isReadingDoc &&
          !isAnalyzingRole &&
          currentStep === 1 &&
          selectedMethod !== 'document' && (
            <div>
              <div>
                <h1 className="font-sans text-2xl sm:text-[1.75rem] font-bold text-[#111827] leading-tight">
                  Start with your Job Description
                </h1>
                <p className="font-inter text-sm sm:text-base text-[#6B7280] mt-2">
                  Upload an existing JD or fill in the details manually. We'll structure everything
                  for you.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 mt-8 items-stretch">
                {/* Option 1: Upload JD Document */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSelectMethod('document')}
                  onKeyDown={(e) => e.key === 'Enter' && handleSelectMethod('document')}
                  className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-2xl border border-[#E5E7EB] hover:border-gray-300 transition-all duration-200 cursor-pointer bg-white"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="text-[#0D2D54] flex items-center justify-center">
                        <svg
                          className="size-7"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                          />
                        </svg>
                      </div>
                      <span className="bg-[#0D2D54] text-white text-[11px] font-inter font-medium px-3 py-1 rounded-full shadow-xs">
                        Recommended
                      </span>
                    </div>

                    <h2 className="font-sans font-bold text-lg text-[#111827] mt-5">
                      Upload JD Document
                    </h2>
                    <p className="font-inter text-sm text-[#6B7280] mt-2 leading-relaxed">
                      Upload a PDF or Word document. We'll parse it, validate the content, and flag
                      anything that needs your attention.
                    </p>
                  </div>

                  <div className="mt-8 pt-5 border-t border-[#E5E7EB]/70 flex flex-col gap-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {['PDF', 'DOCX', 'TXT'].map((ext) => (
                        <span
                          key={ext}
                          className="bg-[#0D2D54]/[0.06] text-[#0D2D54] text-xs px-2.5 py-0.5 rounded-md font-inter font-medium"
                        >
                          {ext}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between font-inter text-xs font-semibold text-[#0D2D54]">
                      <span>Choose document</span>
                      <span className="transition-transform duration-200 group-hover:translate-x-1">
                        →
                      </span>
                    </div>
                  </div>
                </div>

                {/* Option 2: Fill in manually */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSelectMethod('manual')}
                  onKeyDown={(e) => e.key === 'Enter' && handleSelectMethod('manual')}
                  className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-2xl border border-[#E5E7EB] hover:border-gray-300 transition-all duration-200 cursor-pointer bg-white"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="text-[#0D2D54] flex items-center justify-center">
                        <svg
                          className="size-7"
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
                      <span className="bg-[#F3F4F6] text-[#4B5563] text-[11px] font-inter font-medium px-3 py-1 rounded-full">
                        Step-by-step
                      </span>
                    </div>

                    <h2 className="font-sans font-bold text-lg text-[#111827] mt-5">
                      Fill in manually
                    </h2>
                    <p className="font-inter text-sm text-[#6B7280] mt-2 leading-relaxed">
                      Complete a structured wizard with role overview, responsibilities, and
                      required skills. Takes about 5 minutes.
                    </p>
                  </div>

                  <div className="mt-8 pt-5 border-t border-[#E5E7EB]/70 flex flex-col gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-[#6B7280] font-inter">
                      <svg
                        className="size-3.5 text-[#9D9D9D]"
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
                      <span>~5 minutes to complete</span>
                    </div>
                    <div className="flex items-center justify-between font-inter text-xs font-semibold text-[#0D2D54]">
                      <span>Start manual wizard</span>
                      <span className="transition-transform duration-200 group-hover:translate-x-1">
                        →
                      </span>
                    </div>
                  </div>
                </div>

                {/* Option 3: Import from Link (Centered, balanced width, borderless container) */}
                <div className="md:col-span-2 w-full flex justify-center">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedMethod('link')}
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedMethod('link')}
                    className="w-full max-w-[43rem] group relative flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-white transition-all duration-200 cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3 text-[#0D2D54]">
                          <svg
                            className="size-6 shrink-0"
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
                          <h2 className="font-sans font-bold text-lg text-[#111827]">
                            Import from Link
                          </h2>
                        </div>
                        <span className="bg-[#F3F4F6] text-[#4B5563] text-[11px] font-inter font-medium px-3 py-1 rounded-full">
                          Live URL
                        </span>
                      </div>

                      <p className="font-inter text-sm text-[#6B7280] mt-2 leading-relaxed">
                        Paste a link to a live job posting or careers page. We'll extract and
                        structure the details for you
                      </p>
                    </div>

                    <div className="mt-10 flex flex-col gap-3">
                      <form
                        onSubmit={handleLinkSubmit}
                        className="flex flex-row items-center gap-2.5 w-full"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <InputField
                          type="url"
                          placeholder="https://example.com/job"
                          value={linkUrl}
                          onChange={(e) => setLinkUrl(e.target.value)}
                          className="!py-2.5 !text-xs"
                          wrapperClassName="flex-1"
                        />
                        <Button
                          type="submit"
                          label="Import from link"
                          className="!w-auto shrink-0 h-10 bg-[#0D2D54] text-white px-4 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer hover:opacity-90 transition-opacity"
                        />
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* ────────────────────────────────────────────────────────── */}
        {/* STEP 1: Document Dropzone Upload View                    */}
        {/* ────────────────────────────────────────────────────────── */}
        {!isReadingDoc &&
          !isAnalyzingRole &&
          currentStep === 1 &&
          selectedMethod === 'document' && (
            <div>
              <div>
                <h1 className="font-sans text-2xl sm:text-[1.75rem] font-bold text-[#111827] leading-tight">
                  Job Descriptions
                </h1>
                <p className="font-inter text-sm sm:text-base text-[#6B7280] mt-2 max-w-[48rem]">
                  Conflux AI will analyze your job description to extract key technical skills,
                  cultural requirements, and seniority level to build a tailored assessment
                  pipeline.
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`mt-8 rounded-2xl border-2 border-dashed p-10 sm:p-14 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                  uploadedFile
                    ? 'bg-[#F4F6F9] border-[#0D2D54]/30'
                    : isDragging
                      ? 'border-[#0D2D54] bg-[#EBF5FF]'
                      : 'border-[#D1D5DB] bg-white hover:border-[#0D2D54] hover:bg-[#FAFAFA]'
                }`}
              >
                {uploadedFile ? (
                  <div className="flex flex-col items-center">
                    <div className="size-14 rounded-2xl bg-white border border-[#E5E7EB] text-[#0D2D54] flex items-center justify-center shadow-sm mb-4">
                      <svg
                        className="size-7 text-[#0D2D54]"
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
                    <h3 className="font-sans font-bold text-lg text-[#111827]">
                      {uploadedFile.name.replace(/\.[^/.]+$/, '')} - JD
                    </h3>
                    <p className="font-inter text-xs sm:text-sm text-[#6B7280] mt-1">
                      Ready to parse
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        fileInputRef.current?.click()
                      }}
                      className="mt-3 text-xs font-semibold text-[#0D2D54] hover:underline flex items-center gap-1.5 cursor-pointer bg-white px-3 py-1.5 rounded-md border border-[#E5E7EB] hover:bg-gray-50 shadow-xs transition-colors"
                    >
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
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      <span>Replace document</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="size-14 rounded-2xl bg-white border border-[#D1D5DB] text-[#0D2D54] flex items-center justify-center mb-4 shadow-sm">
                      <svg
                        className="size-7 text-[#0D2D54]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
                      </svg>
                    </div>
                    <h3 className="font-sans font-semibold text-base sm:text-lg text-[#111827]">
                      Drop your document here
                    </h3>
                    <p className="font-inter text-sm text-[#6B7280] mt-1">
                      or{' '}
                      <span className="font-semibold text-[#0D2D54] underline">
                        browse to select
                      </span>
                    </p>
                    <p className="font-inter text-xs text-[#9D9D9D] mt-3">
                      PDF, DOCX, or TXT · max 10 MB
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center gap-4 mt-8 flex-wrap">
                <Button
                  type="button"
                  onClick={() => {
                    if (uploadedFile) {
                      setUploadedFile(null)
                    } else {
                      setSelectedMethod(null)
                    }
                  }}
                  label="Cancel"
                  className="!w-auto bg-transparent hover:bg-gray-100 text-[#4B5563] border border-[#E5E7EB] py-2.5 px-6 rounded-lg text-sm font-medium transition-colors"
                />
                {/* {uploadedFile && (
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  label="Replace Document"
                  className="!w-auto bg-white hover:bg-gray-50 text-[#0D2D54] border border-[#0D2D54]/30 py-2.5 px-6 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                />
              )} */}
                <Button
                  type="button"
                  onClick={handleParseDocument}
                  disabled={!uploadedFile || isReadingDoc}
                  isLoading={isReadingDoc}
                  label={isReadingDoc ? 'Parsing Document...' : 'Parse Document'}
                  className={`!w-auto py-2.5 px-7 rounded-lg text-sm font-medium transition-all ${
                    uploadedFile
                      ? 'bg-[#0D2D54] text-white hover:opacity-90 shadow-sm cursor-pointer'
                      : 'bg-[#E5E7EB] text-[#9D9D9D] cursor-not-allowed'
                  }`}
                />
              </div>
            </div>
          )}

        {/* ────────────────────────────────────────────────────────── */}
        {/* STEP 2A: Define the Role Form                             */}
        {/* ────────────────────────────────────────────────────────── */}
        {!isReadingDoc && !isAnalyzingRole && currentStep === 2 && step2Phase === 'role' && (
          <form onSubmit={handleContinueDefineRole} className="w-full">
            {/* Header */}
            <div>
              <h1 className="font-sans text-2xl sm:text-[1.75rem] font-bold text-[#111827] leading-tight">
                Define the Role
              </h1>
              <p className="font-inter text-sm sm:text-base text-[#6B7280] mt-1.5">
                Fill in what you know we'll organise and structure everything automatically.
              </p>
            </div>

            {/* 2-Column Form Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 items-start">
              {/* Row 1: Role Title */}
              <div>
                <InputField
                  label="Role Title"
                  placeholder="e.g. Senior Product Designer"
                  value={roleTitle}
                  onChange={(e) => {
                    setRoleTitle(e.target.value)
                    if (formErrors.roleTitle) {
                      setFormErrors((prev) => ({ ...prev, roleTitle: '' }))
                    }
                  }}
                  error={!!formErrors.roleTitle}
                  errorMessage={formErrors.roleTitle}
                  required
                  className="!mt-0"
                />
              </div>

              {/* Row 1: Select Department */}
              <div className="w-full">
                <label className="font-sans text-sm font-semibold text-black block mb-2">
                  Select Department <span className="text-[#EF4444]">*</span>
                </label>
                <Dropdown<string>
                  items={departmentsList}
                  value={department}
                  placeholder="Select Department"
                  onChange={(val) => {
                    setDepartment(val)
                    if (formErrors.department) {
                      setFormErrors((prev) => ({ ...prev, department: '' }))
                    }
                  }}
                  allowCustom
                  customPlaceholder="Add custom department..."
                  onAddCustom={handleAddCustomDepartment}
                  className="w-full"
                  triggerClassName={`w-full !py-3 !px-4 !text-sm border rounded-md font-inter justify-between ${
                    formErrors.department ? 'border-[#EF4444]' : 'border-[#E6E6E6]'
                  }`}
                  menuClassName="w-full"
                />
                {formErrors.department && (
                  <span className="text-[0.75rem] text-[#EF4444] mt-1 block font-inter">
                    {formErrors.department}
                  </span>
                )}
              </div>

              {/* Row 2: Seniority Level */}
              <div className="w-full">
                <label className="font-sans text-sm font-semibold text-black block mb-2">
                  Seniority Level <span className="text-[#EF4444]">*</span>
                </label>
                <Dropdown<string>
                  items={seniorityList}
                  value={seniorityLevel}
                  placeholder="Select Seniority Level"
                  onChange={(val) => {
                    setSeniorityLevel(val)
                    if (formErrors.seniorityLevel) {
                      setFormErrors((prev) => ({ ...prev, seniorityLevel: '' }))
                    }
                  }}
                  allowCustom
                  customPlaceholder="Add custom seniority level..."
                  onAddCustom={handleAddCustomSeniority}
                  className="w-full"
                  triggerClassName={`w-full !py-3 !px-4 !text-sm border rounded-md font-inter justify-between ${
                    formErrors.seniorityLevel ? 'border-[#EF4444]' : 'border-[#E6E6E6]'
                  }`}
                  menuClassName="w-full"
                />
                {formErrors.seniorityLevel && (
                  <span className="text-[0.75rem] text-[#EF4444] mt-1 block font-inter">
                    {formErrors.seniorityLevel}
                  </span>
                )}
              </div>

              {/* Row 2: Experience Level */}
              <div className="w-full">
                <label className="font-sans text-sm font-semibold text-black block mb-2">
                  Experience Level <span className="text-[#EF4444]">*</span>
                </label>
                <Dropdown<string>
                  items={experienceList}
                  value={experienceLevel}
                  placeholder="Select Experience Level"
                  onChange={(val) => {
                    setExperienceLevel(val)
                    if (formErrors.experienceLevel) {
                      setFormErrors((prev) => ({ ...prev, experienceLevel: '' }))
                    }
                  }}
                  allowCustom
                  customPlaceholder="Add custom experience..."
                  onAddCustom={handleAddCustomExperience}
                  className="w-full"
                  triggerClassName={`w-full !py-3 !px-4 !text-sm border rounded-md font-inter justify-between ${
                    formErrors.experienceLevel ? 'border-[#EF4444]' : 'border-[#E6E6E6]'
                  }`}
                  menuClassName="w-full"
                />
                {formErrors.experienceLevel && (
                  <span className="text-[0.75rem] text-[#EF4444] mt-1 block font-inter">
                    {formErrors.experienceLevel}
                  </span>
                )}
              </div>

              {/* Row 3: Required Skills (Core) */}
              <div>
                <TagInputField
                  label="Required Skills (Core)"
                  required
                  helperText="Non-negotiables"
                  tags={requiredSkills}
                  onChange={(tags) => {
                    setRequiredSkills(tags)
                    if (formErrors.requiredSkills) {
                      setFormErrors((prev) => ({ ...prev, requiredSkills: '' }))
                    }
                  }}
                  placeholder="Type and press enter."
                  error={formErrors.requiredSkills}
                />
              </div>

              {/* Row 3: Preferred Skills */}
              <div>
                <TagInputField
                  label="Preferred Skills"
                  helperText="Nice to have"
                  tags={preferredSkills}
                  onChange={(tags) => {
                    setPreferredSkills(tags)
                    if (formErrors.preferredSkills) {
                      setFormErrors((prev) => ({ ...prev, preferredSkills: '' }))
                    }
                  }}
                  placeholder="Type and press enter."
                  error={formErrors.preferredSkills}
                />
              </div>

              {/* Row 4: Role Summary (Full Width across both columns) */}
              <div className="col-span-1 md:col-span-2">
                <TextareaField
                  label="Role Summary"
                  required
                  placeholder="Brief company description mission, culture, what makes it a great place to work..."
                  value={roleSummary}
                  onChange={(e) => {
                    setRoleSummary(e.target.value)
                    if (formErrors.roleSummary) {
                      setFormErrors((prev) => ({ ...prev, roleSummary: '' }))
                    }
                  }}
                  error={!!formErrors.roleSummary}
                  errorMessage={formErrors.roleSummary}
                  rows={4}
                  className="!mt-0"
                />
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="mt-10 pt-6 border-t border-[#E5E7EB] flex items-center justify-between">
              <Button
                type="button"
                onClick={() => {
                  setCurrentStep(1)
                }}
                label="Back"
                className="!w-auto bg-white hover:bg-gray-50 text-[#374151] border border-[#D1D5DB] py-2.5 px-6 rounded-lg text-sm font-medium transition-colors cursor-pointer"
              />
              <Button
                type="submit"
                label="Continue"
                className="!w-auto bg-[#0D2D54] text-white hover:opacity-90 py-2.5 px-8 rounded-lg text-sm font-medium transition-all shadow-xs cursor-pointer"
              />
            </div>
          </form>
        )}

        {/* ────────────────────────────────────────────────────────── */}
        {/* STEP 2B: Job Details (Aligned 2-Column Logistics Form)     */}
        {/* ────────────────────────────────────────────────────────── */}
        {!isReadingDoc && !isAnalyzingRole && currentStep === 2 && step2Phase === 'details' && (
          <form onSubmit={handleContinueJobDetails} className="w-full">
            {/* Header */}
            <div>
              <h1 className="font-sans text-2xl sm:text-[1.75rem] font-bold text-[#111827] leading-tight">
                Job Details
              </h1>
              <p className="font-inter text-sm sm:text-base text-[#6B7280] mt-1.5">
                Fill in compensation, location, and employment terms. Pre-filled where available
                from your JD.
              </p>
            </div>

            {/* 2-Column Balanced Form Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mt-8 items-start">
              {/* Row 1: Compensation (Spans across both columns) */}
              <div className="md:col-span-2">
                <label className="font-sans text-sm font-semibold text-[#111827] block mb-2">
                  Compensation <span className="text-[#EF4444]">*</span>
                </label>
                <div className="flex items-center gap-3 w-full">
                  <InputField
                    type="text"
                    inputMode="numeric"
                    placeholder="Min salary (USD/year)"
                    value={minSalary}
                    onChange={(e) => handleNumericSalaryChange(e.target.value, setMinSalary)}
                    error={!!formErrors.compensation}
                    wrapperClassName="flex-1"
                  />
                  <span className="text-[#9CA3AF] text-base font-bold select-none shrink-0 leading-none">
                    —
                  </span>
                  <InputField
                    type="text"
                    inputMode="numeric"
                    placeholder="Max salary (USD/year)"
                    value={maxSalary}
                    onChange={(e) => handleNumericSalaryChange(e.target.value, setMaxSalary)}
                    error={!!formErrors.compensation}
                    wrapperClassName="flex-1"
                  />
                </div>
                {formErrors.compensation && (
                  <span className="text-[0.75rem] text-[#EF4444] mt-1 block font-inter">
                    {formErrors.compensation}
                  </span>
                )}
              </div>

              {/* Row 2 Left: Location */}
              <div className="w-full">
                <InputField
                  label="Location"
                  placeholder="City, Country or 'Remote'"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value)
                    if (formErrors.location) {
                      setFormErrors((prev) => ({ ...prev, location: '' }))
                    }
                  }}
                  error={!!formErrors.location}
                  errorMessage={formErrors.location}
                  required
                  className="!mt-0"
                />
              </div>

              {/* Row 2 Right: Work Model (Segmented Control) */}
              <div className="w-full">
                <label className="font-sans text-sm font-semibold text-[#111827] block mb-2">
                  Work Model <span className="text-[#EF4444]">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2 h-11">
                  {(['Remote', 'Hybrid', 'On-site'] as const).map((model) => {
                    const isSelected = workModel === model
                    return (
                      <Button
                        key={model}
                        type="button"
                        onClick={() => setWorkModel(model)}
                        label={model}
                        className={`!w-full h-full flex items-center justify-center px-3 rounded-lg text-xs sm:text-sm font-inter transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#0D2D54] text-white border border-[#0D2D54] shadow-xs font-semibold'
                            : 'bg-white text-[#374151] border border-[#E5E7EB] hover:bg-gray-50 font-medium'
                        }`}
                      />
                    )
                  })}
                </div>
              </div>

              {/* Row 3 Left: Employment Type (Dropdown) */}
              <div className="w-full">
                <label className="font-sans text-sm font-semibold text-[#111827] block mb-2">
                  Employment Type <span className="text-[#EF4444]">*</span>
                </label>
                <Dropdown<string>
                  items={['Full-time', 'Part-time', 'Contract', 'Internship']}
                  value={employmentType}
                  placeholder="Select Employment Type"
                  onChange={(val) => {
                    setEmploymentType(val)
                    if (formErrors.employmentType) {
                      setFormErrors((prev) => ({ ...prev, employmentType: '' }))
                    }
                  }}
                  className="w-full"
                  triggerClassName={`w-full !py-3 !px-4 !text-sm border rounded-md font-inter justify-between ${
                    formErrors.employmentType ? 'border-[#EF4444]' : 'border-[#E6E6E6]'
                  }`}
                  menuClassName="w-full"
                />
                {formErrors.employmentType && (
                  <span className="text-[0.75rem] text-[#EF4444] mt-1 block font-inter">
                    {formErrors.employmentType}
                  </span>
                )}
              </div>

              {/* Row 3 Right: Hours Per Week */}
              <div className="w-full">
                <InputField
                  label="Hours Per Week"
                  placeholder="e.g. 40"
                  type="text"
                  inputMode="numeric"
                  value={hoursPerWeek}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/[^0-9]/g, '')
                    setHoursPerWeek(digits)
                    if (formErrors.hoursPerWeek) {
                      setFormErrors((prev) => ({ ...prev, hoursPerWeek: '' }))
                    }
                  }}
                  error={!!formErrors.hoursPerWeek}
                  errorMessage={formErrors.hoursPerWeek}
                  className="!mt-0"
                />
              </div>

              {/* Row 4 Left: Number of Openings */}
              <div className="w-full">
                <InputField
                  label="Number of Openings"
                  placeholder="1"
                  value={openings}
                  onChange={(e) => {
                    setOpenings(e.target.value)
                    if (formErrors.openings) {
                      setFormErrors((prev) => ({ ...prev, openings: '' }))
                    }
                  }}
                  error={!!formErrors.openings}
                  errorMessage={formErrors.openings}
                  className="!mt-0"
                />
              </div>

              {/* Row 4 Right: Hiring Priority (Segmented Control) */}
              <div className="w-full">
                <label className="font-sans text-sm font-semibold text-[#111827] block mb-2">
                  Hiring Priority
                </label>
                <div className="grid grid-cols-3 gap-2 h-11">
                  {(['Critical', 'High', 'Medium'] as const).map((priority) => {
                    const isSelected = hiringPriority === priority
                    return (
                      <Button
                        key={priority}
                        type="button"
                        onClick={() => setHiringPriority(priority)}
                        label={priority}
                        className={`!w-full h-full flex items-center justify-center px-3 rounded-lg text-xs sm:text-sm font-inter transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#0D2D54] text-white border border-[#0D2D54] shadow-xs font-semibold'
                            : 'bg-white text-[#374151] border border-[#E5E7EB] hover:bg-gray-50 font-medium'
                        }`}
                      />
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="flex items-center justify-between pt-8 mt-8 border-t border-[#E5E7EB] w-full">
              <Button
                type="button"
                onClick={() => {
                  setStep2Phase('role')
                }}
                label="Back"
                className="!w-auto bg-white hover:bg-gray-50 text-[#374151] border border-[#D1D5DB] py-2.5 px-6 rounded-lg text-sm font-medium transition-colors cursor-pointer"
              />
              <Button
                type="submit"
                isLoading={isSavingDraft}
                disabled={isSavingDraft}
                label={isSavingDraft ? 'Saving details...' : 'Continue'}
                className="!w-auto bg-[#0D2D54] hover:opacity-90 text-white py-2.5 px-8 rounded-lg text-sm font-medium shadow-sm transition-opacity cursor-pointer"
              />
            </div>
          </form>
        )}

        {/* ────────────────────────────────────────────────────────── */}
        {/* STEP 2C: AI Extraction Review (Confidence Breakdown)       */}
        {/* ────────────────────────────────────────────────────────── */}
        {!isReadingDoc && !isAnalyzingRole && currentStep === 2 && step2Phase === 'review' && (
          <JdConfidenceReview
            data={{
              fileName:
                uploadedFile?.name || (linkUrl ? 'Live-Job-Posting-URL' : 'Job-Description'),
              fileSize: uploadedFile ? `${(uploadedFile.size / 1024).toFixed(0)} KB` : undefined,
              confidenceScore: parseConfidence || 0,
              confidenceScores,
              roleTitle,
              department,
              seniorityLevel,
              experienceLevel,
              responsibilities,
              requiredSkills,
              preferredSkills,
              salaryCompensation:
                minSalary && maxSalary
                  ? `$${minSalary} - $${maxSalary} / year`
                  : minSalary
                    ? `$${minSalary} / year`
                    : salaryCompensation || undefined,
              roleSummary,
            }}
            onReupload={() => {
              setSelectedMethod('document')
              setStep2Phase('role')
              setCurrentStep(1)
            }}
            onBack={() => {
              setStep2Phase('details')
            }}
            onContinue={async () => {
              // Save/update draft then advance to pipeline
              setIsAnalyzingRole(true)
              try {
                const minClean = minSalary.replace(/[^0-9]/g, '')
                const maxClean = maxSalary.replace(/[^0-9]/g, '')
                const minNum = minClean ? Number(minClean) : null
                const maxNum = maxClean ? Number(maxClean) : null
                const payload = {
                  title: roleTitle,
                  category: department,
                  seniority: seniorityLevel,
                  requiredSkills,
                  preferredSkills,
                  responsibilities,
                  experienceLevel,
                  personsToHire: Number(openings) || 1,
                  employmentType: employmentType || 'Full-time',
                  location,
                  salaryMin: minNum,
                  salaryMax: maxNum,
                  salaryCurrency: 'USD',
                  workModel,
                  hoursPerWeek: Number(hoursPerWeek) || 40,
                  hiringPriority,
                  wizardStep: 2,
                  jdFileUrl,
                  roleDetails: {
                    roleTitle,
                    department,
                    seniorityLevel,
                    experienceLevel,
                    location,
                    workModel,
                    employmentType: employmentType || 'Full-time',
                    minSalary: minNum,
                    maxSalary: maxNum,
                    currency: 'USD',
                    requiredSkills,
                    preferredSkills,
                    responsibilities,
                    roleSummary,
                  },
                  logistics: {
                    openings: Number(openings) || 1,
                    hiringPriority,
                    hoursPerWeek: Number(hoursPerWeek) || 40,
                    workModel,
                  },
                }

                if (jobId) {
                  await jobsService.updateJobDraft(jobId, payload)
                } else {
                  const res = await jobsService.createJobDraft(payload)
                  setJobId(res.data.id)
                }

                // Fetch pipeline for step 3
                const currentJobId = jobId || (await jobsService.getJobById(jobId!)).data.id
                if (currentJobId) {
                  const pipelineRes = await jobsService.getJobPipeline(currentJobId)
                  setPipelineStages(pipelineRes.data.stages || [])
                  setEstTimeToHireDays(pipelineRes.data.estTimeToHireDays)
                }

                setIsAnalyzingRole(false)
                toast.success('Role details confirmed! Advancing to Pipeline.')
                setCurrentStep(3)
              } catch (err) {
                console.error('Save & advance error:', err)
                toast.error(
                  err instanceof Error ? err.message : 'Failed to save role. Please try again.',
                )
                setIsAnalyzingRole(false)
              }
            }}
            onUpdateData={(updated) => {
              if (updated.preferredSkills) setPreferredSkills(updated.preferredSkills)
              if (updated.requiredSkills) setRequiredSkills(updated.requiredSkills)
              if (updated.roleTitle) setRoleTitle(updated.roleTitle)
              if (updated.department) setDepartment(updated.department)
            }}
          />
        )}

        {/* ────────────────────────────────────────────────────────── */}
        {/* STEP 3: Assessment & Pipeline                             */}
        {/* ────────────────────────────────────────────────────────── */}
        {!isReadingDoc && !isAnalyzingRole && currentStep === 3 && (
          <AssessmentPipelineScreen
            jobId={jobId}
            initialStages={pipelineStages}
            initialEstTimeToHire={estTimeToHireDays}
            onBack={() => {
              setStep2Phase('review')
              setCurrentStep(2)
            }}
            onContinue={async (savedStages, savedEstTime) => {
              // Save pipeline via backend
              if (jobId) {
                try {
                  const stagesPayload = savedStages.map((s, idx) => ({
                    name: s.name,
                    uiType: s.uiType || s.type || 'custom',
                    description: s.description || '',
                    durationDays: s.durationDays || 3,
                    order: idx + 1,
                    enabled: s.enabled ?? s.isEnabled ?? true,
                    isMandatory: s.isMandatory || false,
                  }))
                  await jobsService.updateJobPipeline(jobId, {
                    estTimeToHireDays: savedEstTime || undefined,
                    stages: stagesPayload,
                  })
                  setPipelineStages(savedStages)
                  setEstTimeToHireDays(savedEstTime || null)
                } catch (err) {
                  console.error('Save pipeline error:', err)
                  toast.error(err instanceof Error ? err.message : 'Failed to save pipeline.')
                  return
                }
              }

              // Fetch application form for step 4
              if (jobId) {
                try {
                  const formRes = await jobsService.getJobApplicationForm(jobId)
                  setAppFormData(formRes.data)
                } catch (err) {
                  console.error('Fetch form error:', err)
                }
              }

              setCurrentStep(4)
              toast.success('Pipeline stages configured!')
            }}
          />
        )}

        {/* ────────────────────────────────────────────────────────── */}
        {/* STEP 4: Application Form Builder                          */}
        {/* ────────────────────────────────────────────────────────── */}
        {!isReadingDoc && !isAnalyzingRole && currentStep === 4 && (
          <ApplicationFormScreen
            jobId={jobId}
            roleTitle={roleTitle || 'Backend Engineer'}
            initialFormData={appFormData}
            onBack={() => {
              setCurrentStep(3)
            }}
            onContinue={async (formPayload: UpdateApplicationFormPayload) => {
              // Save application form via backend
              if (jobId) {
                try {
                  await jobsService.updateJobApplicationForm(jobId, formPayload)
                } catch (err) {
                  console.error('Save form error:', err)
                  toast.error(
                    err instanceof Error ? err.message : 'Failed to save application form.',
                  )
                  return
                }
              }
              setCurrentStep(5)
              toast.success('Application form saved!')
            }}
          />
        )}

        {/* ────────────────────────────────────────────────────────── */}
        {/* STEP 5: Review & Post Job                                 */}
        {/* ────────────────────────────────────────────────────────── */}
        {!isReadingDoc &&
          !isAnalyzingRole &&
          !isPublishingProcessing &&
          !isPublishedSuccess &&
          currentStep === 5 && (
            <ReviewPostJobScreen
              data={{
                roleTitle,
                department,
                seniorityLevel,
                experienceLevel,
                location,
                workModel,
                employmentType,
                minSalary,
                maxSalary,
                salaryCompensation,
                roleSummary,
              }}
              stages={pipelineStages}
              estTimeToHireDays={estTimeToHireDays}
              customQuestions={appFormData?.customQuestions || []}
              onEditRoleDetails={() => {
                setStep2Phase('role')
                setCurrentStep(2)
              }}
              onBack={() => {
                setCurrentStep(4)
              }}
              isPublishing={isPublishingProcessing}
              isSavingDraft={isSavingReviewDraft}
              onSaveDraft={async () => {
                if (jobId) {
                  setIsSavingReviewDraft(true)
                  try {
                    await jobsService.updateJobDraft(jobId, { wizardStep: 5 })
                    toast.success('Draft saved successfully!')
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : 'Failed to save draft.')
                  } finally {
                    setIsSavingReviewDraft(false)
                  }
                }
              }}
              onPublish={async () => {
                if (!jobId) {
                  toast.error('No job draft found. Please complete the wizard first.')
                  return
                }
                setIsPublishingProcessing(true)
                try {
                  const res = await jobsService.publishJob(jobId)
                  setPublishShareableUrl(res.data.shareableUrl || '')
                  setPublishSlug(res.data.slug || '')
                  setIsPublishingProcessing(false)
                  setIsPublishedSuccess(true)
                  toast.success('Role published successfully!')
                } catch (err) {
                  console.error('Publish error:', err)
                  toast.error(err instanceof Error ? err.message : 'Failed to publish role.')
                  setIsPublishingProcessing(false)
                }
              }}
            />
          )}
      </div>
    </div>
  )
}

export default CreateRoleWizard
