export type CandidateStage = 'Interview' | 'Hired' | 'Screening'

export interface Candidate {
  id: string
  name: string
  email: string
  avatar?: string
  jobTitle: string
  department: string
  stage: CandidateStage
  experience: string
  location: string
  appliedOn: string
}

export type ActivityType =
  | 'job_posted'
  | 'interview_scheduled'
  | 'assessment_completed'
  | 'moved_to_hired'
  | 'moved_to_screening'
  | 'candidate_added'

export interface ActivityItem {
  id: string
  type: ActivityType
  title: string
  detail: string
  time: string
}

export interface Metric {
  id: string
  title: string
  value: number | string
  percentageChange: number
  isIncrease: boolean
  iconType: 'briefcase' | 'user' | 'clipboard' | 'video' | 'briefcase_green'
}
