import { request, type ApiEnvelope } from '@/services/api-client'
import type {
  ParseJdResponse,
  CreateJobPayload,
  JobResponse,
  PipelineResponse,
  UpdatePipelinePayload,
  ApplicationFormResponse,
  UpdateApplicationFormPayload,
  PublishJobResponse,
} from '@/features/jobs/types/jobs.types'

// ─── Step 1: Parse JD ────────────────────────────────────────────────────────

/**
 * POST /dashboard/jobs/parse-jd
 * Accepts a file (multipart), jdUrl (JSON), or jdText (JSON).
 * Returns the AI-structured role with confidence scores.
 */
export const parseJobDescription = (params: { file?: File; jdUrl?: string; jdText?: string }) => {
  if (params.file) {
    const formData = new FormData()
    formData.append('jd', params.file)
    return request<ApiEnvelope<ParseJdResponse>>('/dashboard/jobs/parse-jd', {
      method: 'POST',
      body: formData,
    })
  }

  const body: Record<string, string> = {}
  if (params.jdUrl) body.jdUrl = params.jdUrl
  if (params.jdText) body.jdText = params.jdText

  return request<ApiEnvelope<ParseJdResponse>>('/dashboard/jobs/parse-jd', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

// ─── Job CRUD ────────────────────────────────────────────────────────────────

/** POST /dashboard/jobs — creates a new draft job. */
export const createJobDraft = (payload: CreateJobPayload) =>
  request<ApiEnvelope<JobResponse>>('/dashboard/jobs', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

/** PATCH /dashboard/jobs/:id — partial update of an existing job. */
export const updateJobDraft = (id: string, payload: Partial<CreateJobPayload>) =>
  request<ApiEnvelope<JobResponse>>(`/dashboard/jobs/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })

/** GET /dashboard/jobs/:id — retrieve full job data (used for wizard resume). */
export const getJobById = (id: string) => request<ApiEnvelope<JobResponse>>(`/dashboard/jobs/${id}`)

// ─── Step 3: Pipeline ────────────────────────────────────────────────────────

/** GET /dashboard/jobs/:id/pipeline — seeds template on first call. */
export const getJobPipeline = (id: string) =>
  request<ApiEnvelope<PipelineResponse>>(`/dashboard/jobs/${id}/pipeline`)

/** PUT /dashboard/jobs/:id/pipeline — full replace of pipeline stages. */
export const updateJobPipeline = (id: string, payload: UpdatePipelinePayload) =>
  request<ApiEnvelope<PipelineResponse>>(`/dashboard/jobs/${id}/pipeline`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

/** POST /dashboard/jobs/:id/pipeline/reset — resets to backend template. */
export const resetJobPipeline = (id: string) =>
  request<ApiEnvelope<PipelineResponse>>(`/dashboard/jobs/${id}/pipeline/reset`, {
    method: 'POST',
  })

// ─── Step 4: Application Form ────────────────────────────────────────────────

/** GET /dashboard/jobs/:id/application-form */
export const getJobApplicationForm = (id: string) =>
  request<ApiEnvelope<ApplicationFormResponse>>(`/dashboard/jobs/${id}/application-form`)

/** PUT /dashboard/jobs/:id/application-form */
export const updateJobApplicationForm = (id: string, payload: UpdateApplicationFormPayload) =>
  request<ApiEnvelope<ApplicationFormResponse>>(`/dashboard/jobs/${id}/application-form`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

// ─── Step 5: Publish ─────────────────────────────────────────────────────────

/** POST /dashboard/jobs/:id/publish */
export const publishJob = (id: string) =>
  request<ApiEnvelope<PublishJobResponse>>(`/dashboard/jobs/${id}/publish`, {
    method: 'POST',
  })
