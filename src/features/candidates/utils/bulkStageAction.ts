import type { PipelineStageDetail, PipelineStageKey } from '../types/candidates.types'

export type BulkStageActionKind = 'advance' | 'reject'

/** Where each stage hands its candidates on to when they advance. */
export const STAGE_TRANSITIONS: Partial<Record<PipelineStageKey, PipelineStageKey>> = {
  applied: 'screening',
  screening: 'assessment',
  assessment: 'interview',
  interview: 'shortlisted',
}

/** Rejection reads as a warning in the design, not the grey of the Rejected column. */
const REJECT_ACCENT = '#EF4444'
const FALLBACK_ACCENT = '#0D2D54'

export interface BulkStageActionSummary {
  kind: BulkStageActionKind
  /** Selected candidates the action will actually move. */
  count: number
  /** Source stage label, or null when the selection spans several stages. */
  fromLabel: string | null
  /** Destination stage label, or null when candidates land in different stages. */
  toLabel: string | null
  /** Colour of the destination dot on the stage track. */
  toAccent: string
}

const destinationOf = (
  stageKey: PipelineStageKey,
  kind: BulkStageActionKind,
): PipelineStageKey | undefined => {
  if (kind === 'advance') return STAGE_TRANSITIONS[stageKey]
  return stageKey === 'rejected' ? undefined : 'rejected'
}

/**
 * Works out what a bulk advance/reject will do to the current selection, so the
 * confirmation modal and toast can describe it before anything moves.
 * Candidates that can't make the move (e.g. already shortlisted) are skipped.
 */
export function summarizeBulkStageAction(
  stages: PipelineStageDetail[],
  selectedCandidateIds: string[],
  kind: BulkStageActionKind,
): BulkStageActionSummary {
  const selected = new Set(selectedCandidateIds)
  const fromKeys = new Set<PipelineStageKey>()
  const toKeys = new Set<PipelineStageKey>()
  let count = 0

  for (const stage of stages) {
    const destination = destinationOf(stage.key, kind)
    if (!destination) continue

    const moving = stage.candidates.filter((c) => selected.has(c.id)).length
    if (moving === 0) continue

    count += moving
    fromKeys.add(stage.key)
    toKeys.add(destination)
  }

  const stageFor = (keys: Set<PipelineStageKey>) =>
    keys.size === 1 ? stages.find((s) => s.key === [...keys][0]) : undefined
  const labelFor = (keys: Set<PipelineStageKey>) =>
    keys.size === 1 ? (stageFor(keys)?.label ?? capitalize([...keys][0])) : null

  return {
    kind,
    count,
    fromLabel: labelFor(fromKeys),
    toLabel: labelFor(toKeys),
    toAccent:
      kind === 'reject' ? REJECT_ACCENT : (stageFor(toKeys)?.accentColor ?? FALLBACK_ACCENT),
  }
}

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

export const pluralizeCandidates = (count: number, noun = 'candidate') =>
  `${count} ${noun}${count === 1 ? '' : 's'}`
