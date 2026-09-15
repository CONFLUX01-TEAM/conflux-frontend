import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { RoleCandidateOverview } from '../types/candidates.types'
import { getCandidatesOverview } from '../services/candidates.service'
import RoleCandidateCard from './RoleCandidateCard'
import Spinner from '@/shared/ui/Spinner'
import EmptyState from '@/shared/ui/EmptyState'
import Button from '@/shared/ui/Button'

/**
 * CandidatesOverview
 * Main feature container component for the Candidates page.
 * Fetches and displays role-based candidate metrics in a responsive grid.
 */
export const CandidatesOverview: React.FC = () => {
  const navigate = useNavigate()
  const [roles, setRoles] = useState<RoleCandidateOverview[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const loadCandidatesData = async () => {
      try {
        setIsLoading(true)
        const data = await getCandidatesOverview()
        if (isMounted) {
          setRoles(data)
        }
      } catch (err) {
        console.error('Failed to load candidate overviews:', err)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadCandidatesData()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="w-full mx-auto space-y-6 sm:space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-1.5 leading-[100%] tracking-[0%] font-sans">
        <h1 className="text-2xl sm:text-4xl font-semibold text-[#000000]">Candidates</h1>
        <p className="text-sm sm:text-base text-[#868E96] font-normal">
          View and manage candidates across all your active roles
        </p>
      </div>

      {/* Loading Spinner */}
      {isLoading && (
        <div className="flex items-center justify-center min-h-[360px]">
          <Spinner className="h-8 w-8 text-[#0D2D54]" wrapperClassName="bg-transparent p-0" />
        </div>
      )}

      {/* Grid of Role Candidate Cards */}
      {!isLoading && roles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-y-12 gap-x-4">
          {roles.map((role) => (
            <RoleCandidateCard key={role.id} role={role} />
          ))}
        </div>
      )}

      {/* Empty State Fallback */}
      {!isLoading && roles.length === 0 && (
        <EmptyState
          imgIcon="/empty-state.svg"
          title="No Roles created yet!"
          content="Start by creating your first hiring workflow and structured job setup."
          action={
            <Button
              onClick={() => navigate('/jobs/create')}
              className="bg-[#0D2D54] text-white rounded-[0.5rem] py-3 px-6 font-inter text-sm font-medium hover:opacity-90 transition-opacity"
              icon={<span className="text-lg leading-none">+</span>}
              label="Create Role"
            />
          }
        />
      )}
    </div>
  )
}

export default CandidatesOverview
