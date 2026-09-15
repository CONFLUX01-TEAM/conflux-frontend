import { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import type {
  RolePipelineDetail,
  PipelineCandidate,
  PipelineStageDetail,
  PipelineStageKey,
  CandidateDetailData,
} from '../types/candidates.types'
import { getRolePipeline } from '../services/candidates.service'
import { enrichCandidateDetails } from '../data/candidates.mock'

export interface UseCandidatePipelineReturn {
  pipelineData: RolePipelineDetail | null
  isLoading: boolean
  searchQuery: string
  setSearchQuery: (query: string) => void
  filterValue: string
  setFilterValue: (val: string) => void
  sortValue: string
  setSortValue: (val: string) => void
  isBulkMode: boolean
  setIsBulkMode: React.Dispatch<React.SetStateAction<boolean>>
  toggleBulkMode: () => void
  selectedCandidateIds: string[]
  allCandidateIds: string[]
  toggleSelectCandidate: (candidateId: string) => void
  toggleSelectAll: () => void
  clearSelection: () => void
  advanceSelectedCandidates: () => void
  rejectSelectedCandidates: () => void
  displayStages: PipelineStageDetail[]
  // Single Candidate Details Drawer state & actions
  selectedCandidate: CandidateDetailData | null
  setSelectedCandidate: React.Dispatch<React.SetStateAction<CandidateDetailData | null>>
  selectCandidate: (candidate: PipelineCandidate, stageKey?: PipelineStageKey) => void
  closeCandidateDrawer: () => void
  advanceCandidate: (candidateId: string, targetStageKey?: string) => void
  rejectCandidate: (candidateId: string) => void
}

const STAGE_TRANSITIONS: Record<string, string> = {
  applied: 'screening',
  screening: 'assessment',
  assessment: 'interview',
  interview: 'shortlisted',
}

/**
 * Custom hook managing candidate pipeline state, data fetching,
 * real-time filtering & sorting, and bulk stage transitions.
 */
export function useCandidatePipeline(roleId: string): UseCandidatePipelineReturn {
  const [pipelineData, setPipelineData] = useState<RolePipelineDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Search, Filter & Sort states
  const [searchQuery, setSearchQuery] = useState('')
  const [filterValue, setFilterValue] = useState('all')
  const [sortValue, setSortValue] = useState('default')

  // Bulk Action states
  const [isBulkMode, setIsBulkMode] = useState(false)
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([])

  // Single Candidate Details Drawer state
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateDetailData | null>(null)

  // Load pipeline data on mount or when roleId changes
  useEffect(() => {
    let isMounted = true

    const loadPipeline = async () => {
      try {
        setIsLoading(true)
        const data = await getRolePipeline(roleId)
        if (isMounted) {
          setPipelineData(data)
        }
      } catch (err) {
        console.error('Failed to load role pipeline:', err)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadPipeline()

    return () => {
      isMounted = false
    }
  }, [roleId])

  const allCandidateIds = useMemo(() => {
    return pipelineData?.stages.flatMap((s) => s.candidates.map((c) => c.id)) || []
  }, [pipelineData])

  const toggleBulkMode = () => {
    setIsBulkMode((prev) => {
      if (prev) {
        setSelectedCandidateIds([])
      }
      return !prev
    })
  }

  const toggleSelectCandidate = (candidateId: string) => {
    setSelectedCandidateIds((prev) =>
      prev.includes(candidateId) ? prev.filter((id) => id !== candidateId) : [...prev, candidateId],
    )
  }

  const toggleSelectAll = () => {
    if (selectedCandidateIds.length === allCandidateIds.length) {
      setSelectedCandidateIds([])
    } else {
      setSelectedCandidateIds(allCandidateIds)
    }
  }

  const clearSelection = () => {
    setSelectedCandidateIds([])
  }

  const advanceSelectedCandidates = () => {
    if (!pipelineData || selectedCandidateIds.length === 0) return

    const selectedSet = new Set(selectedCandidateIds)
    let advancedCount = 0
    const candidatesToMove: Record<string, PipelineCandidate[]> = {}

    const updatedStages = pipelineData.stages.map((stage) => {
      const remaining: PipelineCandidate[] = []
      const nextStageKey = STAGE_TRANSITIONS[stage.key]

      stage.candidates.forEach((cand) => {
        if (selectedSet.has(cand.id) && nextStageKey) {
          advancedCount++
          if (!candidatesToMove[nextStageKey]) {
            candidatesToMove[nextStageKey] = []
          }
          candidatesToMove[nextStageKey].push({
            ...cand,
            timeInStage: 'Just now',
            status: 'In progress',
          })
        } else {
          remaining.push(cand)
        }
      })

      return {
        ...stage,
        candidates: remaining,
        count: remaining.length,
      }
    })

    const finalStages = updatedStages.map((stage) => {
      const moved = candidatesToMove[stage.key] || []
      if (moved.length > 0) {
        const newCandidates = [...stage.candidates, ...moved]
        return {
          ...stage,
          candidates: newCandidates,
          count: newCandidates.length,
          newTodayCount: stage.newTodayCount + moved.length,
        }
      }
      return stage
    })

    setPipelineData({
      ...pipelineData,
      stages: finalStages,
    })

    toast.success(
      `Advanced ${advancedCount} candidate${advancedCount === 1 ? '' : 's'} to next stage`,
    )
    setSelectedCandidateIds([])
  }

  const rejectSelectedCandidates = () => {
    if (!pipelineData || selectedCandidateIds.length === 0) return

    const selectedSet = new Set(selectedCandidateIds)
    let rejectedCount = 0
    const movedToRejected: PipelineCandidate[] = []

    const updatedStages = pipelineData.stages.map((stage) => {
      if (stage.key === 'rejected') return stage

      const remaining: PipelineCandidate[] = []
      stage.candidates.forEach((cand) => {
        if (selectedSet.has(cand.id)) {
          rejectedCount++
          movedToRejected.push({
            ...cand,
            timeInStage: 'Just now',
            status: 'No show',
          })
        } else {
          remaining.push(cand)
        }
      })

      return {
        ...stage,
        candidates: remaining,
        count: remaining.length,
      }
    })

    const finalStages = updatedStages.map((stage) => {
      if (stage.key === 'rejected') {
        const newCandidates = [...stage.candidates, ...movedToRejected]
        return {
          ...stage,
          candidates: newCandidates,
          count: newCandidates.length,
          newTodayCount: stage.newTodayCount + movedToRejected.length,
        }
      }
      return stage
    })

    setPipelineData({
      ...pipelineData,
      stages: finalStages,
    })

    toast.success(`Moved ${rejectedCount} candidate${rejectedCount === 1 ? '' : 's'} to Rejected`)
    setSelectedCandidateIds([])
  }

  // Filter and Sort displayed stages in real-time
  const displayStages = useMemo(() => {
    if (!pipelineData) return []

    const cleanQuery = searchQuery.trim().toLowerCase()

    return pipelineData.stages.map((stage) => {
      let filtered = [...stage.candidates]

      // 1. Text Search Filter (candidate name)
      if (cleanQuery) {
        filtered = filtered.filter((c) => c.name.toLowerCase().includes(cleanQuery))
      }

      // 2. Dropdown Filter
      if (filterValue === 'complete') {
        filtered = filtered.filter((c) => c.status === 'Complete')
      } else if (filterValue === 'pending') {
        filtered = filtered.filter((c) => c.status === 'Pending')
      } else if (filterValue === 'in_progress') {
        filtered = filtered.filter((c) => c.status === 'In progress')
      } else if (filterValue === 'no_show') {
        filtered = filtered.filter((c) => c.status === 'No show')
      } else if (filterValue === 'ats_95') {
        filtered = filtered.filter((c) => c.atsScore >= 95)
      } else if (filterValue === 'ats_90') {
        filtered = filtered.filter((c) => c.atsScore >= 90)
      }

      // 3. Dropdown Sort
      if (sortValue === 'ats_desc') {
        filtered.sort((a, b) => b.atsScore - a.atsScore)
      } else if (sortValue === 'ats_asc') {
        filtered.sort((a, b) => a.atsScore - b.atsScore)
      } else if (sortValue === 'name_asc') {
        filtered.sort((a, b) => a.name.localeCompare(b.name))
      } else if (sortValue === 'name_desc') {
        filtered.sort((a, b) => b.name.localeCompare(a.name))
      }

      return {
        ...stage,
        candidates: filtered,
        count: filtered.length,
      }
    })
  }, [pipelineData, searchQuery, filterValue, sortValue])

  const selectCandidate = (candidate: PipelineCandidate, stageKey?: PipelineStageKey) => {
    const enriched = enrichCandidateDetails(candidate, pipelineData?.title, stageKey)
    setSelectedCandidate(enriched)
  }

  const closeCandidateDrawer = () => {
    setSelectedCandidate(null)
  }

  const advanceCandidate = (candidateId: string, targetStageKey?: string) => {
    if (!pipelineData) return

    let movedCandidate: PipelineCandidate | null = null
    let fromStageKey = ''
    let toStageKey = targetStageKey || ''

    for (const stage of pipelineData.stages) {
      const found = stage.candidates.find((c) => c.id === candidateId)
      if (found) {
        movedCandidate = found
        fromStageKey = stage.key
        if (!toStageKey) {
          toStageKey = STAGE_TRANSITIONS[fromStageKey] || 'screening'
        }
        break
      }
    }

    if (!movedCandidate || !toStageKey) {
      toast.error('Cannot advance candidate any further')
      return
    }

    const updatedStages = pipelineData.stages.map((stage) => {
      if (stage.key === fromStageKey) {
        const remaining = stage.candidates.filter((c) => c.id !== candidateId)
        return {
          ...stage,
          candidates: remaining,
          count: remaining.length,
        }
      }
      if (stage.key === toStageKey) {
        const updatedCandidate: PipelineCandidate = {
          ...movedCandidate!,
          timeInStage: 'Just now',
          status: 'In progress',
        }
        return {
          ...stage,
          candidates: [...stage.candidates, updatedCandidate],
          count: stage.candidates.length + 1,
          newTodayCount: stage.newTodayCount + 1,
        }
      }
      return stage
    })

    setPipelineData({
      ...pipelineData,
      stages: updatedStages,
    })

    setSelectedCandidate((prev) => {
      if (!prev || prev.id !== candidateId) return prev
      return {
        ...prev,
        currentStageKey: toStageKey as PipelineStageKey,
        timeInStage: 'Just now',
        status: 'In progress',
      }
    })

    const toStageLabel = pipelineData.stages.find((s) => s.key === toStageKey)?.label || toStageKey
    toast.success(`Advanced ${movedCandidate.name} to ${toStageLabel}`)
  }

  const rejectCandidate = (candidateId: string) => {
    if (!pipelineData) return

    let targetCandidate: PipelineCandidate | null = null
    let fromStageKey = ''

    for (const stage of pipelineData.stages) {
      const found = stage.candidates.find((c) => c.id === candidateId)
      if (found) {
        targetCandidate = found
        fromStageKey = stage.key
        break
      }
    }

    if (!targetCandidate || fromStageKey === 'rejected') {
      toast.info('Candidate is already in rejected')
      return
    }

    const updatedStages = pipelineData.stages.map((stage) => {
      if (stage.key === fromStageKey) {
        const remaining = stage.candidates.filter((c) => c.id !== candidateId)
        return {
          ...stage,
          candidates: remaining,
          count: remaining.length,
        }
      }
      if (stage.key === 'rejected') {
        const rejectedCandidate: PipelineCandidate = {
          ...targetCandidate!,
          timeInStage: 'Just now',
          status: 'No show',
        }
        return {
          ...stage,
          candidates: [...stage.candidates, rejectedCandidate],
          count: stage.candidates.length + 1,
          newTodayCount: stage.newTodayCount + 1,
        }
      }
      return stage
    })

    setPipelineData({
      ...pipelineData,
      stages: updatedStages,
    })

    setSelectedCandidate((prev) => {
      if (!prev || prev.id !== candidateId) return prev
      return {
        ...prev,
        currentStageKey: 'rejected',
        status: 'No show',
        timeInStage: 'Just now',
      }
    })

    toast.success(`Moved ${targetCandidate.name} to Rejected`)
  }

  return {
    pipelineData,
    isLoading,
    searchQuery,
    setSearchQuery,
    filterValue,
    setFilterValue,
    sortValue,
    setSortValue,
    isBulkMode,
    setIsBulkMode,
    toggleBulkMode,
    selectedCandidateIds,
    allCandidateIds,
    toggleSelectCandidate,
    toggleSelectAll,
    clearSelection,
    advanceSelectedCandidates,
    rejectSelectedCandidates,
    displayStages,
    selectedCandidate,
    setSelectedCandidate,
    selectCandidate,
    closeCandidateDrawer,
    advanceCandidate,
    rejectCandidate,
  }
}

export default useCandidatePipeline
