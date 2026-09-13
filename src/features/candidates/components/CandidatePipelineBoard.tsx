import React, { useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import Spinner from '@/shared/ui/Spinner'
import { useCandidatePipeline } from '../hooks/useCandidatePipeline'
import PipelineHeader from './PipelineHeader'
import PipelineToolbar from './PipelineToolbar'
import PipelineStageColumn from './PipelineStageColumn'
import CandidateDetailDrawer from './CandidateDetailDrawer'

/**
 * CandidatePipelineBoard
 * Orchestrates the role candidate pipeline detail page.
 * Uses the custom useCandidatePipeline hook for state and business logic,
 * and delegates UI to PipelineHeader, PipelineToolbar, and PipelineStageColumn.
 */
export const CandidatePipelineBoard: React.FC = () => {
  const { roleId = 'role-1' } = useParams<{ roleId: string }>()
  const sliderRef = useRef<HTMLDivElement>(null)

  const {
    pipelineData,
    isLoading,
    filterValue,
    setFilterValue,
    sortValue,
    setSortValue,
    isBulkMode,
    toggleBulkMode,
    selectedCandidateIds,
    toggleSelectCandidate,
    toggleSelectAll,
    clearSelection,
    advanceSelectedCandidates,
    rejectSelectedCandidates,
    displayStages,
    selectedCandidate,
    selectCandidate,
    closeCandidateDrawer,
    advanceCandidate,
    rejectCandidate,
  } = useCandidatePipeline(roleId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[450px]">
        <Spinner className="h-8 w-8 text-[#0D2D54]" wrapperClassName="bg-transparent p-0" />
      </div>
    )
  }

  if (!pipelineData) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-base font-semibold text-slate-800">Role pipeline not found</p>
        <Link
          to="/candidates"
          className="mt-3 inline-block text-sm font-medium text-[#2563EB] hover:underline"
        >
          ← Back to Candidates
        </Link>
      </div>
    )
  }

  const { title, status, metrics } = pipelineData

  return (
    <div className="w-full mx-auto space-y-6">
      {/* 1. Breadcrumbs & Role Title Header */}
      <PipelineHeader title={title} status={status} />

      {/* 2. Metrics Summary & Controls Toolbar */}
      <PipelineToolbar
        metrics={metrics}
        filterValue={filterValue}
        onFilterChange={setFilterValue}
        sortValue={sortValue}
        onSortChange={setSortValue}
        isBulkMode={isBulkMode}
        onToggleBulkMode={toggleBulkMode}
        selectedCandidateCount={selectedCandidateIds.length}
        onToggleSelectAll={toggleSelectAll}
        onAdvanceStage={advanceSelectedCandidates}
        onRejectCandidates={rejectSelectedCandidates}
        onClearSelection={clearSelection}
      />

      {/* 3. Pipeline Stages Kanban Slider */}
      <div
        ref={sliderRef}
        className="overflow-x-auto pb-6 pt-2 scroll-smooth flex items-start gap-3 sm:gap-4"
        style={{
          scrollbarWidth: 'auto',
          scrollbarColor: '#0D2D54 #E9ECEF',
        }}
      >
        {displayStages.map((stage) => (
          <PipelineStageColumn
            key={stage.key}
            stage={stage}
            onCandidateClick={(candidate) => selectCandidate(candidate, stage.key)}
            isBulkMode={isBulkMode}
            selectedCandidateIds={selectedCandidateIds}
            onToggleSelectCandidate={toggleSelectCandidate}
          />
        ))}
      </div>

      {/* 4. Candidate Detail Slide-Over Drawer */}
      <CandidateDetailDrawer
        isOpen={Boolean(selectedCandidate)}
        onClose={closeCandidateDrawer}
        candidate={selectedCandidate}
        onAdvance={advanceCandidate}
        onReject={rejectCandidate}
      />
    </div>
  )
}

export default CandidatePipelineBoard
