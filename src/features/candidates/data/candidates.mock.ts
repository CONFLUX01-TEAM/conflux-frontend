import type {
  RoleCandidateOverview,
  StageMetric,
  RolePipelineDetail,
} from '../types/candidates.types'

/**
 * Default stage breakdown matching the visual design
 */
export const defaultRoleStages: StageMetric[] = [
  { key: 'applied', label: 'Applied', count: 122, colorVariant: 'navy' },
  { key: 'screening', label: 'Screening', count: 12, colorVariant: 'blue' },
  { key: 'assessment', label: 'Assessment', count: 58, colorVariant: 'navy' },
  { key: 'interview', label: 'Interview', count: 16, colorVariant: 'blue' },
  { key: 'shortlisted', label: 'Shortlisted', count: 8, colorVariant: 'lightBlue' },
  { key: 'rejected', label: 'Rejected', count: 28, colorVariant: 'navy' },
]

/**
 * Mock candidate role overview list matching the UI specification
 */
export const mockRoleCandidates: RoleCandidateOverview[] = [
  {
    id: 'role-1',
    title: 'Senior Product Designer',
    status: 'Active',
    metrics: {
      totalCandidates: 28,
      newToday: 18,
      avgTimeToHire: '12 days',
    },
    stages: defaultRoleStages,
    pipelineUrl: '/candidates/role-1',
  },
  {
    id: 'role-2',
    title: 'Java Developer',
    status: 'Active',
    metrics: {
      totalCandidates: 28,
      newToday: 18,
      avgTimeToHire: '12 days',
    },
    stages: defaultRoleStages,
    pipelineUrl: '/candidates/role-2',
  },
  {
    id: 'role-3',
    title: 'Senior Product Designer',
    status: 'Active',
    metrics: {
      totalCandidates: 28,
      newToday: 18,
      avgTimeToHire: '12 days',
    },
    stages: defaultRoleStages,
    pipelineUrl: '/candidates/role-3',
  },
  {
    id: 'role-4',
    title: 'Senior Product Designer',
    status: 'Active',
    metrics: {
      totalCandidates: 28,
      newToday: 18,
      avgTimeToHire: '12 days',
    },
    stages: defaultRoleStages,
    pipelineUrl: '/candidates/role-4',
  },
  {
    id: 'role-5',
    title: 'Senior Product Designer',
    status: 'Active',
    metrics: {
      totalCandidates: 28,
      newToday: 18,
      avgTimeToHire: '12 days',
    },
    stages: defaultRoleStages,
    pipelineUrl: '/candidates/role-5',
  },
  {
    id: 'role-6',
    title: 'Senior Product Designer',
    status: 'Active',
    metrics: {
      totalCandidates: 28,
      newToday: 18,
      avgTimeToHire: '12 days',
    },
    stages: defaultRoleStages,
    pipelineUrl: '/candidates/role-6',
  },
]

// ─── Mock Data for Candidate Role Pipeline Kanban Detail ─────────────────────

export const createMockPipelineDetail = (
  roleId: string,
  roleTitle = 'Senior Product Designer',
): RolePipelineDetail => ({
  id: roleId,
  title: roleTitle,
  status: 'Active',
  metrics: {
    totalCandidates: 28,
    newToday: 18,
    avgTimeToHire: '12 days',
    activeInterviews: 6,
  },
  stages: [
    {
      key: 'applied',
      label: 'Applied',
      count: 109,
      newTodayCount: 4,
      accentColor: '#175095',
      candidates: [
        {
          id: 'app-1',
          name: 'Aisha Rahman',
          initials: 'AR',
          atsScore: 99,
          status: 'Complete',
          timeInStage: '2d in stage',
        },
        {
          id: 'app-2',
          name: 'Marcus Vance',
          initials: 'MV',
          atsScore: 96,
          status: 'Complete',
          timeInStage: '1d in stage',
        },
        {
          id: 'app-3',
          name: 'Eniafe Bada',
          initials: 'EB',
          atsScore: 94,
          status: 'Complete',
          timeInStage: '3d in stage',
        },
      ],
    },
    {
      key: 'screening',
      label: 'Screening',
      count: 45,
      newTodayCount: 4,
      accentColor: '#5956E9',
      candidates: [
        {
          id: 'scr-1',
          name: 'Tunde Asorona',
          initials: 'TA',
          atsScore: 98,
          status: 'Pending',
          timeInStage: '2d in stage',
        },
        {
          id: 'scr-2',
          name: 'Chloe Dupont',
          initials: 'CD',
          atsScore: 88,
          status: 'No show',
          timeInStage: '4d in stage',
        },
        {
          id: 'scr-3',
          name: 'Sefa Mamu',
          initials: 'SM',
          atsScore: 92,
          status: 'In progress',
          timeInStage: '1d in stage',
        },
      ],
    },
    {
      key: 'assessment',
      label: 'Assessment',
      count: 20,
      newTodayCount: 4,
      accentColor: '#1859F1',
      candidates: [
        {
          id: 'ass-1',
          name: 'Priya Patel',
          initials: 'PP',
          atsScore: 95,
          status: 'Pending',
          timeInStage: '3d in stage',
        },
        {
          id: 'ass-2',
          name: "David O'Connor",
          initials: 'DO',
          atsScore: 91,
          status: 'Pending',
          timeInStage: '2d in stage',
        },
        {
          id: 'ass-3',
          name: 'Fatima Al-Hassan',
          initials: 'FA',
          atsScore: 97,
          status: 'Complete',
          timeInStage: '1d in stage',
        },
      ],
    },
    {
      key: 'interview',
      label: 'Interview',
      count: 2,
      newTodayCount: 4,
      accentColor: '#F59F00',
      candidates: [
        {
          id: 'int-1',
          name: 'Lucas Silva',
          initials: 'LS',
          atsScore: 99,
          status: 'Pending',
          timeInStage: '2d in stage',
        },
        {
          id: 'int-2',
          name: 'Elena Rostova',
          initials: 'ER',
          atsScore: 96,
          status: 'In progress',
          timeInStage: '3d in stage',
        },
      ],
    },
    {
      key: 'shortlisted',
      label: 'Shortlisted',
      count: 6,
      newTodayCount: 4,
      accentColor: '#15AABF',
      candidates: [
        {
          id: 'sho-1',
          name: 'Kwame Mensah',
          initials: 'KM',
          atsScore: 98,
          status: 'Complete',
          timeInStage: '5d in stage',
        },
        {
          id: 'sho-2',
          name: 'Hannah Abbott',
          initials: 'HA',
          atsScore: 94,
          status: 'Pending',
          timeInStage: '2d in stage',
        },
        {
          id: 'sho-3',
          name: 'Daniel Kim',
          initials: 'DK',
          atsScore: 95,
          status: 'Complete',
          timeInStage: '1d in stage',
        },
      ],
    },
    {
      key: 'rejected',
      label: 'Rejected',
      count: 28,
      newTodayCount: 4,
      accentColor: '#868E96',
      candidates: [
        {
          id: 'rej-1',
          name: 'Tariq Aziz',
          initials: 'TA',
          atsScore: 78,
          status: 'No show',
          timeInStage: '6d in stage',
        },
        {
          id: 'rej-2',
          name: 'Bob Wilson',
          initials: 'BW',
          atsScore: 72,
          status: 'Pending',
          timeInStage: '4d in stage',
        },
        {
          id: 'rej-3',
          name: 'Jane Doe',
          initials: 'JD',
          atsScore: 68,
          status: 'Pending',
          timeInStage: '1w in stage',
        },
      ],
    },
  ],
})
