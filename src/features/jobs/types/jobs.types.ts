// ─── Backend DTO mirrors for the Create Job Wizard ───────────────────────────

/** Suggested role details extracted by the backend AI from a JD document/URL. */
export interface SuggestedRole {
  roleTitle: string
  department: string
  seniorityLevel: string
  experienceLevel: string
  location: string
  workModel: string
  employmentType: string
  minSalary: number | null
  maxSalary: number | null
  currency: string | null
  requiredSkills: string[]
  preferredSkills: string[]
  responsibilities: string[]
  roleSummary: string
  experienceMinYears: number | null
  experienceMaxYears: number | null
}

/** Per-field confidence scores returned alongside the suggested role. */
export interface ConfidenceScores {
  roleTitle: number
  department: number
  skills: number
  responsibilities: number
  salary: number
}

/** Response `data` payload from POST /dashboard/jobs/parse-jd. */
export interface ParseJdResponse {
  rawText: string
  jdFileUrl: string | null
  suggestedRole: SuggestedRole
  confidenceScores: ConfidenceScores
  parseConfidence: number
  /** Legacy flat fields — prefer suggestedRole. */
  fields?: Record<string, unknown>
  jdText?: string
}

// ─── Create / Update Job ─────────────────────────────────────────────────────

export interface RoleDetails {
  roleTitle?: string
  department?: string
  seniorityLevel?: string
  experienceLevel?: string
  location?: string
  workModel?: string
  employmentType?: string
  minSalary?: number | null
  maxSalary?: number | null
  currency?: string
  requiredSkills?: string[]
  preferredSkills?: string[]
  responsibilities?: string[]
  roleSummary?: string
}

export interface Logistics {
  openings?: number
  hiringPriority?: string
  hoursPerWeek?: number
}

export interface CreateJobPayload {
  title?: string
  category?: string
  seniority?: string
  requiredSkills?: string[]
  preferredSkills?: string[]
  responsibilities?: string[]
  experienceLevel?: string
  experienceMinYears?: number | null
  experienceMaxYears?: number | null
  jdText?: string
  jdFileUrl?: string | null
  relevantProjects?: string[]
  personsToHire?: number
  employmentType?: string
  location?: string
  salaryMin?: number | null
  salaryMax?: number | null
  salaryCurrency?: string
  workModel?: string
  hoursPerWeek?: number
  hiringPriority?: string
  wizardStep?: number
  roleDetails?: RoleDetails
  logistics?: Logistics
}

/** Response `data` from POST /dashboard/jobs or PATCH /dashboard/jobs/:id. */
export interface JobResponse {
  id: string
  status: string
  slug: string
  shareableUrl: string
  wizardStep: number
  roleTitle: string
  department: string
  seniorityLevel: string
  experienceLevel: string
  location: string
  workModel: string
  employmentType: string
  minSalary: number | null
  maxSalary: number | null
  currency: string | null
  requiredSkills: string[]
  preferredSkills: string[]
  responsibilities: string[]
  roleSummary: string
  openings: number | null
  hiringPriority: string | null
  hoursPerWeek: number | null
  publishedAt: string | null
  jdFileUrl: string | null
  pipelineStages?: PipelineStageDto[]
  [key: string]: unknown
}

// ─── Pipeline ────────────────────────────────────────────────────────────────

export interface PipelineStageDto {
  id?: string
  name: string
  stageType?: string
  type?: string
  uiType?: string
  description: string
  durationDays?: number
  duration?: string
  stageOrder?: number
  order?: number
  isRequired?: boolean
  isMandatory?: boolean
  isEnabled?: boolean
  enabled?: boolean
}

export interface PipelineResponse {
  jobRoleId: string
  estTimeToHireDays: number | null
  stages: PipelineStageDto[]
}

export interface UpdatePipelinePayload {
  estTimeToHireDays?: number
  stages: Array<{
    name: string
    uiType?: string
    description?: string
    durationDays?: number
    order: number
    enabled: boolean
    isMandatory?: boolean
  }>
}

// ─── Application Form ────────────────────────────────────────────────────────

export interface ApplicationFormElementConfig {
  enabled: boolean
  required?: boolean
}

export interface CustomQuestionDto {
  question: string
  required: boolean
  type: 'text' | 'textarea' | 'number' | 'select' | 'url'
}

export interface ApplicationFormResponse {
  fields?: Array<Record<string, unknown>>
  elements: Record<string, ApplicationFormElementConfig | boolean>
  customQuestions: CustomQuestionDto[]
}

export interface UpdateApplicationFormPayload {
  elements: Record<string, ApplicationFormElementConfig | boolean>
  customQuestions: CustomQuestionDto[]
}

// ─── Publish ─────────────────────────────────────────────────────────────────

export interface PublishJobResponse {
  id: string
  status: 'OPEN'
  slug: string
  shareableUrl: string
  publishedAt: string
  [key: string]: unknown
}
