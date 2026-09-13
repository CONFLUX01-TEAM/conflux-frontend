/**
 * Candidates Feature Type Definitions
 * Represents candidate role overviews, metrics, and hiring pipeline stage breakdowns.
 */

export type RoleStatus = 'Active' | 'Draft' | 'Closed'

export type PipelineStageKey =
  | 'applied'
  | 'screening'
  | 'assessment'
  | 'interview'
  | 'shortlisted'
  | 'rejected'

export type ProgressBarColor = 'navy' | 'blue' | 'lightBlue'

/**
 * Metric breakdown for an individual pipeline stage in a role overview card
 */
export interface StageMetric {
  key: PipelineStageKey
  label: string
  count: number
  /** Color theme variant for progress fill: navy (#175095), blue (#3C86E1), lightBlue (#7DAEEB) */
  colorVariant?: ProgressBarColor
}

/**
 * Summary metrics displayed at the top of each role card
 */
export interface RoleCandidateMetrics {
  totalCandidates: number
  newToday: number
  avgTimeToHire: string
}

/**
 * Role Candidate Overview representing a single card in the candidates dashboard
 */
export interface RoleCandidateOverview {
  id: string
  title: string
  status: RoleStatus
  metrics: RoleCandidateMetrics
  stages: StageMetric[]
  pipelineUrl?: string
}

// ─── Role Pipeline Detail & Kanban Types ─────────────────────────────────────

export type CandidateStageStatus = 'Complete' | 'Pending' | 'In progress' | 'No show'

export interface PipelineCandidate {
  id: string
  name: string
  initials: string
  atsScore: number
  status: CandidateStageStatus
  timeInStage: string
  avatarUrl?: string
  email?: string
}

export interface PipelineStageDetail {
  key: PipelineStageKey
  label: string
  count: number
  newTodayCount: number
  /** Hex color for the vertical indicator accent bar in the column header */
  accentColor: string
  candidates: PipelineCandidate[]
}

export interface RolePipelineMetrics {
  totalCandidates: number
  newToday: number
  avgTimeToHire: string
  activeInterviews: number
}

export interface RolePipelineDetail {
  id: string
  title: string
  status: RoleStatus
  metrics: RolePipelineMetrics
  stages: PipelineStageDetail[]
}
