import { request, type ApiEnvelope } from '@/services/api-client'
import type { RoleCandidateOverview, RolePipelineDetail } from '../types/candidates.types'
import { mockRoleCandidates, createMockPipelineDetail } from '../data/candidates.mock'

/**
 * Service to manage candidate roles and pipeline metrics.
 * Provides clean separation of concerns between UI components and backend/mock data source.
 */

/**
 * Fetch overview of candidates aggregated by active job roles.
 * Falls back to mock data if backend endpoint is in progress or unavailable.
 */
export const getCandidatesOverview = async (): Promise<RoleCandidateOverview[]> => {
  try {
    const response = await request<ApiEnvelope<RoleCandidateOverview[]>>(
      '/dashboard/candidates/overview',
    )
    if (response?.data && Array.isArray(response.data)) {
      return response.data
    }
    return mockRoleCandidates
  } catch (err) {
    // Graceful fallback to mock data in development or when backend route is pending
    console.info('[CandidatesService] Using mock data for candidates overview:', err)
    return mockRoleCandidates
  }
}

/**
 * Fetch candidate overview for a single role by role ID.
 */
export const getRoleCandidatesById = async (
  roleId: string,
): Promise<RoleCandidateOverview | undefined> => {
  try {
    const response = await request<ApiEnvelope<RoleCandidateOverview>>(
      `/dashboard/candidates/overview/${roleId}`,
    )
    if (response?.data) {
      return response.data
    }
    return mockRoleCandidates.find((r) => r.id === roleId)
  } catch {
    return mockRoleCandidates.find((r) => r.id === roleId)
  }
}

/**
 * Fetch candidate pipeline detail (stages and candidate cards) for a given role ID.
 */
export const getRolePipeline = async (roleId: string): Promise<RolePipelineDetail | null> => {
  try {
    const response = await request<ApiEnvelope<RolePipelineDetail>>(
      `/dashboard/candidates/pipeline/${roleId}`,
    )
    if (response?.data) {
      return response.data
    }
    const matchedRole = mockRoleCandidates.find((r) => r.id === roleId)
    return createMockPipelineDetail(roleId, matchedRole?.title || 'Senior Product Designer')
  } catch (err) {
    console.info(`[CandidatesService] Using mock pipeline data for ${roleId}:`, err)
    const matchedRole = mockRoleCandidates.find((r) => r.id === roleId)
    return createMockPipelineDetail(roleId, matchedRole?.title || 'Senior Product Designer')
  }
}
