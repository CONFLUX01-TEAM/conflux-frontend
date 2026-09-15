import { useCallback, useEffect, useRef, useState } from 'react'
import { toast as notify } from 'sonner'
import type { RolePipelineDetail } from '../types/candidates.types'
import {
  summarizeBulkStageAction,
  type BulkStageActionKind,
  type BulkStageActionSummary,
} from '../utils/bulkStageAction'

/** How long the "Advancing/Rejecting candidates" state holds (dummy latency). */
export const BULK_ACTION_PROCESSING_MS = 2400

export type BulkStageActionPhase = 'confirm' | 'processing'

export interface BulkStageActionRequest extends BulkStageActionSummary {
  phase: BulkStageActionPhase
}

export interface BulkStageActionToast {
  id: number
  kind: BulkStageActionKind
  count: number
  toLabel: string | null
}

interface UseBulkStageActionOptions {
  pipelineData: RolePipelineDetail | null
  selectedCandidateIds: string[]
  advanceSelectedCandidates: () => void
  rejectSelectedCandidates: () => void
  restorePipeline: (pipeline: RolePipelineDetail, selectedCandidateIds: string[]) => void
}

export interface UseBulkStageActionReturn {
  request: BulkStageActionRequest | null
  toast: BulkStageActionToast | null
  open: (kind: BulkStageActionKind) => void
  cancel: () => void
  confirm: () => void
  undo: () => void
  dismissToast: () => void
}

/**
 * Drives the bulk advance/reject flow on the pipeline board:
 * confirm modal → processing state → board update → undoable toast.
 */
export function useBulkStageAction({
  pipelineData,
  selectedCandidateIds,
  advanceSelectedCandidates,
  rejectSelectedCandidates,
  restorePipeline,
}: UseBulkStageActionOptions): UseBulkStageActionReturn {
  const [request, setRequest] = useState<BulkStageActionRequest | null>(null)
  const [toast, setToast] = useState<BulkStageActionToast | null>(null)
  const undoSnapshotRef = useRef<{ pipeline: RolePipelineDetail; selection: string[] } | null>(null)

  // The commit fires from a timer, so read the latest mutators rather than the
  // ones captured when processing began.
  const commitRef = useRef({ advanceSelectedCandidates, rejectSelectedCandidates })
  useEffect(() => {
    commitRef.current = { advanceSelectedCandidates, rejectSelectedCandidates }
  })

  const open = (kind: BulkStageActionKind) => {
    if (!pipelineData) return

    const summary = summarizeBulkStageAction(pipelineData.stages, selectedCandidateIds, kind)
    if (summary.count === 0) {
      notify.info(
        kind === 'advance'
          ? 'Selected candidates are already at their final stage'
          : 'Selected candidates are already rejected',
      )
      return
    }

    setRequest({ ...summary, phase: 'confirm' })
  }

  const cancel = () => {
    setRequest((current) => (current?.phase === 'confirm' ? null : current))
  }

  const confirm = () => {
    if (!pipelineData || request?.phase !== 'confirm') return

    undoSnapshotRef.current = { pipeline: pipelineData, selection: selectedCandidateIds }
    setToast(null)
    setRequest({ ...request, phase: 'processing' })
  }

  useEffect(() => {
    if (request?.phase !== 'processing') return

    const timeout = window.setTimeout(() => {
      const { kind, count, toLabel } = request
      if (kind === 'advance') commitRef.current.advanceSelectedCandidates()
      else commitRef.current.rejectSelectedCandidates()

      setRequest(null)
      setToast({ id: Date.now(), kind, count, toLabel })
    }, BULK_ACTION_PROCESSING_MS)

    return () => window.clearTimeout(timeout)
  }, [request])

  const dismissToast = useCallback(() => setToast(null), [])

  const undo = () => {
    const snapshot = undoSnapshotRef.current
    if (!snapshot) return

    restorePipeline(snapshot.pipeline, snapshot.selection)
    undoSnapshotRef.current = null
    setToast(null)
  }

  return { request, toast, open, cancel, confirm, undo, dismissToast }
}

export default useBulkStageAction
