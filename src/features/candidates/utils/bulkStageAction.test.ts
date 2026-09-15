import { describe, expect, it } from 'vitest'
import { createMockPipelineDetail } from '../data/candidates.mock'
import { pluralizeCandidates, summarizeBulkStageAction } from './bulkStageAction'

const { stages } = createMockPipelineDetail('role-1')

describe('summarizeBulkStageAction', () => {
  it('names both stages when the selection shares one stage', () => {
    expect(summarizeBulkStageAction(stages, ['app-1', 'app-2'], 'advance')).toEqual({
      kind: 'advance',
      count: 2,
      fromLabel: 'Applied',
      toLabel: 'Screening',
      toAccent: '#5956E9',
    })
  })

  it('drops stage names when the selection spans several stages', () => {
    const summary = summarizeBulkStageAction(stages, ['app-1', 'scr-1'], 'advance')
    expect(summary).toMatchObject({ count: 2, fromLabel: null, toLabel: null })
  })

  it('skips candidates that cannot advance any further', () => {
    const summary = summarizeBulkStageAction(stages, ['int-1', 'sho-1'], 'advance')
    expect(summary).toMatchObject({ count: 1, fromLabel: 'Interview', toLabel: 'Shortlisted' })
  })

  it('sends every non-rejected candidate to Rejected in the warning colour', () => {
    const summary = summarizeBulkStageAction(stages, ['app-1', 'sho-1'], 'reject')
    expect(summary).toMatchObject({
      count: 2,
      fromLabel: null,
      toLabel: 'Rejected',
      toAccent: '#EF4444',
    })
  })

  it('counts nothing for an empty selection', () => {
    expect(summarizeBulkStageAction(stages, [], 'reject').count).toBe(0)
  })
})

describe('pluralizeCandidates', () => {
  it('matches the noun to the count', () => {
    expect(pluralizeCandidates(1)).toBe('1 candidate')
    expect(pluralizeCandidates(4, 'Candidate')).toBe('4 Candidates')
  })
})
