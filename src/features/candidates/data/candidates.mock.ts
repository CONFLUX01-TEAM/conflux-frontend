import type {
  RoleCandidateOverview,
  StageMetric,
  RolePipelineDetail,
  PipelineCandidate,
  PipelineStageKey,
  CandidateDetailData,
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
          email: 'aisha.rahman@email.com',
          roleTitle: 'Senior Product Designer',
          appliedDate: 'Jul 16, 2024',
          appliedTimeAgo: 'Applied 2 days ago (Jul 16, 2024)',
          phone: '+1 (415) 555-0198',
          location: 'San Francisco, CA',
          resumeUrl: '#',
          portfolioUrl: '#',
          skills: ['Product Design', 'UI/UX', 'Figma', 'User Research', 'Prototyping', '+4'],
          timeline: [
            {
              id: 'tl-1',
              title: 'Applied',
              timestamp: 'Jul 16, 2024 • 9:32 AM',
            },
            {
              id: 'tl-2',
              title: 'Assessment Completed',
              timestamp: 'Jul 17, 2024 • 11:20 AM',
              score: 'Score: 92%',
            },
            {
              id: 'tl-3',
              title: 'Moved to Resume Review',
              timestamp: 'Jul 18, 2024 • 2:15 PM',
            },
            {
              id: 'tl-4',
              title: 'Current Stage',
              stageName: 'Resume Review',
              durationInStage: '2 days in stage',
              timestamp: '',
              isCurrent: true,
            },
          ],
          recruiterNotes: {
            text: 'Strong portfolio with excellent case studies. Great problem-solving approach. Schedule for portfolio deep dive in next round.',
            author: 'Maya Johnson',
            timeAgo: '2 days ago by Maya Johnson',
          },
          communications: [
            {
              id: 'comm-1',
              title: 'Screening Invitation',
              timestamp: 'Jul 16, 2024 • 9:38 AM',
              status: 'Delivered',
            },
            {
              id: 'comm-2',
              title: 'Assessment Invitation',
              timestamp: 'Jul 16, 2024 • 9:38 AM',
              status: 'Delivered',
            },
            {
              id: 'comm-3',
              title: 'Assessment Invitation',
              timestamp: 'Jul 18, 2024 • 9:38 AM',
              status: 'Delivered',
            },
          ],
          uploadedFiles: [
            {
              id: 'f-1',
              name: 'Aisha_Rahman_Resume.pdf',
              type: 'PDF',
              size: '245KB',
            },
            {
              id: 'f-2',
              name: 'Portfolio_Aisha_Rahman.pdf',
              type: 'PDF',
              size: '245KB',
            },
            {
              id: 'f-3',
              name: 'Cover letter.pdf',
              type: 'PDF',
              size: '245KB',
            },
          ],
          linkedinUrl: 'linkedin.com/in/aisharaman',
          portfolioWebsiteUrl: 'portfolio.aisharahman.design',
          currentStageKey: 'applied',
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

/**
 * Helper to safely construct rich candidate detail data matching the Figma designs.
 */
export const enrichCandidateDetails = (
  candidate: PipelineCandidate,
  roleTitle = 'Senior Product Designer',
  stageKey: PipelineStageKey = 'applied',
): CandidateDetailData => {
  const existingDetail = candidate as CandidateDetailData
  const safeNameSlug = candidate.name.toLowerCase().replace(/[^a-z0-9]/g, '')

  return {
    ...candidate,
    roleTitle: existingDetail.roleTitle || roleTitle,
    appliedDate: existingDetail.appliedDate || 'Jul 16, 2024',
    appliedTimeAgo:
      existingDetail.appliedTimeAgo ||
      `Applied ${candidate.timeInStage || '2 days ago'} (Jul 16, 2024)`,
    email: candidate.email || existingDetail.email || `${safeNameSlug}@email.com`,
    phone: existingDetail.phone || '+1 (415) 555-0198',
    location: existingDetail.location || 'San Francisco, CA',
    resumeUrl: existingDetail.resumeUrl || '#',
    portfolioUrl: existingDetail.portfolioUrl || '#',
    skills: existingDetail.skills || [
      'Product Design',
      'UI/UX',
      'Figma',
      'User Research',
      'Prototyping',
      '+4',
    ],
    timeline: existingDetail.timeline || [
      {
        id: 'tl-1',
        title: 'Applied',
        timestamp: 'Jul 16, 2024 • 9:32 AM',
      },
      {
        id: 'tl-2',
        title: 'Assessment Completed',
        timestamp: 'Jul 17, 2024 • 11:20 AM',
        score: `Score: ${candidate.atsScore}%`,
      },
      {
        id: 'tl-3',
        title: 'Moved to Resume Review',
        timestamp: 'Jul 18, 2024 • 2:15 PM',
      },
      {
        id: 'tl-4',
        title: 'Current Stage',
        stageName: 'Resume Review',
        durationInStage: candidate.timeInStage || '2 days in stage',
        timestamp: '',
        isCurrent: true,
      },
    ],
    recruiterNotes: existingDetail.recruiterNotes || {
      text: 'Strong portfolio with excellent case studies. Great problem-solving approach. Schedule for portfolio deep dive in next round.',
      author: 'Maya Johnson',
      timeAgo: '2 days ago by Maya Johnson',
    },
    communications: existingDetail.communications || [
      {
        id: 'comm-1',
        title: 'Screening Invitation',
        timestamp: 'Jul 16, 2024 • 9:38 AM',
        status: 'Delivered',
      },
      {
        id: 'comm-2',
        title: 'Assessment Invitation',
        timestamp: 'Jul 16, 2024 • 9:38 AM',
        status: 'Delivered',
      },
      {
        id: 'comm-3',
        title: 'Assessment Invitation',
        timestamp: 'Jul 18, 2024 • 9:38 AM',
        status: 'Delivered',
      },
    ],
    uploadedFiles: existingDetail.uploadedFiles || [
      {
        id: 'f-1',
        name: `${candidate.name.replace(/\s+/g, '_')}_Resume.pdf`,
        type: 'PDF',
        size: '245KB',
      },
      {
        id: 'f-2',
        name: `Portfolio_${candidate.name.replace(/\s+/g, '_')}.pdf`,
        type: 'PDF',
        size: '245KB',
      },
      {
        id: 'f-3',
        name: 'Cover letter.pdf',
        type: 'PDF',
        size: '245KB',
      },
    ],
    linkedinUrl: existingDetail.linkedinUrl || `linkedin.com/in/${safeNameSlug}`,
    portfolioWebsiteUrl: existingDetail.portfolioWebsiteUrl || `portfolio.${safeNameSlug}.design`,
    currentStageKey: stageKey,
  }
}
