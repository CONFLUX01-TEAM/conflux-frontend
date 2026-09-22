import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useCandidatePipeline } from '../hooks/useCandidatePipeline'
import { BULK_ACTION_PROCESSING_MS, useBulkStageAction } from '../hooks/useBulkStageAction'
import { createMockPipelineDetail } from '../data/candidates.mock'
import BulkStageActionModal from './BulkStageActionModal'
import PipelineActionToast, { PIPELINE_TOAST_DURATION_MS } from './PipelineActionToast'

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }))

vi.mock('../services/candidates.service', () => ({
  getRolePipeline: vi.fn(async () => createMockPipelineDetail('role-1')),
}))

const Harness = ({ selection }: { selection: string[] }) => {
  const pipeline = useCandidatePipeline('role-1')
  const bulkAction = useBulkStageAction(pipeline)
  const stageCount = (key: string) =>
    pipeline.pipelineData?.stages.find((s) => s.key === key)?.candidates.length

  return (
    <div>
      <span data-testid="applied">{stageCount('applied')}</span>
      <span data-testid="screening">{stageCount('screening')}</span>
      <span data-testid="rejected">{stageCount('rejected')}</span>
      <button onClick={() => selection.forEach(pipeline.toggleSelectCandidate)}>select</button>
      <button onClick={() => bulkAction.open('advance')}>advance</button>
      <button onClick={() => bulkAction.open('reject')}>reject</button>
      <BulkStageActionModal
        request={bulkAction.request}
        onCancel={bulkAction.cancel}
        onConfirm={bulkAction.confirm}
      />
      <PipelineActionToast
        toast={bulkAction.toast}
        onUndo={bulkAction.undo}
        onDismiss={bulkAction.dismissToast}
      />
    </div>
  )
}

const renderHarness = async (selection: string[]) => {
  render(<Harness selection={selection} />)
  await act(async () => {})
  fireEvent.click(screen.getByText('select'))
}

const advanceTime = (ms: number) => act(() => vi.advanceTimersByTime(ms))

describe('bulk stage action flow', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('confirms, processes, then moves the candidates and offers undo', async () => {
    await renderHarness(['app-1', 'app-2'])
    const appliedBefore = screen.getByTestId('applied').textContent

    fireEvent.click(screen.getByText('advance'))
    const dialog = screen.getByRole('alertdialog')
    expect(within(dialog).getByText('Advance candidates?')).toBeInTheDocument()
    expect(
      within(dialog).getByText('You’re about to move 2 candidates from Applied to Screening'),
    ).toBeInTheDocument()

    fireEvent.click(within(dialog).getByRole('button', { name: 'Advance 2 Candidates' }))
    expect(screen.getByText('Advancing candidates')).toBeInTheDocument()
    expect(
      screen.getByText('Please wait while we move 2 candidates to screening'),
    ).toBeInTheDocument()
    expect(screen.getByTestId('applied').textContent).toBe(appliedBefore)

    await advanceTime(BULK_ACTION_PROCESSING_MS)
    expect(Number(screen.getByTestId('applied').textContent)).toBe(Number(appliedBefore) - 2)
    expect(screen.getByText('2 candidates advanced')).toBeInTheDocument()
    expect(screen.getByText('Moved to Screening')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    expect(screen.getByTestId('applied').textContent).toBe(appliedBefore)
  })

  it('cancels from the confirm step without touching the board', async () => {
    await renderHarness(['app-1'])
    const rejectedBefore = screen.getByTestId('rejected').textContent

    fireEvent.click(screen.getByText('reject'))
    const dialog = screen.getByRole('alertdialog')
    expect(
      within(dialog).getByText('Are you sure you want to reject 1 candidate'),
    ).toBeInTheDocument()

    fireEvent.keyDown(dialog, { key: 'Escape' })
    await advanceTime(BULK_ACTION_PROCESSING_MS)

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(screen.getByTestId('rejected').textContent).toBe(rejectedBefore)
  })

  it('ignores Escape while processing and auto-dismisses the toast', async () => {
    await renderHarness(['app-1'])

    fireEvent.click(screen.getByText('reject'))
    fireEvent.click(screen.getByRole('button', { name: 'Reject 1 Candidate' }))
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    expect(screen.getByText('Rejecting candidates')).toBeInTheDocument()

    await advanceTime(BULK_ACTION_PROCESSING_MS)
    expect(screen.getByText('1 candidate rejected')).toBeInTheDocument()

    await advanceTime(PIPELINE_TOAST_DURATION_MS)
    expect(screen.getByRole('status')).toHaveAttribute('data-state', 'closed')

    await advanceTime(1000)
    expect(screen.queryByText('1 candidate rejected')).not.toBeInTheDocument()
  })
})
