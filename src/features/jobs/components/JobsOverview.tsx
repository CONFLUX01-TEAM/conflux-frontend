import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getJobs } from '../services/jobs.service'
import type { JobResponse } from '../types/jobs.types'
import Spinner from '@/shared/ui/Spinner'
import EmptyState from '@/shared/ui/EmptyState'
import Button from '@/shared/ui/Button'

/**
 * JobsOverview
 * Main feature container component for the Jobs page.
 * Displays user job roles or the empty-state matching the Figma design.
 */
export const JobsOverview: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isForceEmpty = searchParams.get('empty') === 'true'
  const [jobs, setJobs] = useState<JobResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const loadJobsData = async () => {
      try {
        setIsLoading(true)
        const data = await getJobs()
        if (isMounted) {
          setJobs(data)
        }
      } catch (err) {
        console.error('Failed to load jobs data:', err)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadJobsData()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="w-full mx-auto space-y-6 sm:space-y-8">
      {/* Page Header matching Figma specification */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1.5 leading-[100%] tracking-[0%] font-sans">
          <h1 className="text-2xl sm:text-4xl font-semibold text-[#000000]">Jobs</h1>
          <p className="text-sm sm:text-base text-[#868E96] font-normal">
            View and manage candidates across all your active roles
          </p>
        </div>

        {!isLoading && !isForceEmpty && jobs.length > 0 && (
          <Button
            onClick={() => navigate('/jobs/create')}
            className="w-auto bg-[#0D2D54] hover:bg-[#0A2342] text-white rounded-lg py-2.5 px-5 font-inter text-sm font-medium transition-colors cursor-pointer inline-flex items-center gap-2"
            icon={<span className="text-base font-semibold leading-none">+</span>}
            label="Create Role"
          />
        )}
      </div>

      {/* Loading Spinner */}
      {isLoading && (
        <div className="flex items-center justify-center min-h-[360px]">
          <Spinner className="h-8 w-8 text-[#0D2D54]" wrapperClassName="bg-transparent p-0" />
        </div>
      )}

      {/* Active Jobs Grid */}
      {!isLoading && !isForceEmpty && jobs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-sans font-semibold text-lg text-[#101828] leading-snug">
                    {job.roleTitle || 'Untitled Role'}
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                    {job.status || 'Active'}
                  </span>
                </div>
                <p className="text-sm text-[#667085] mt-1">
                  {[job.department, job.location, job.workModel].filter(Boolean).join(' • ') ||
                    'General'}
                </p>
                {job.roleSummary && (
                  <p className="text-sm text-[#475467] mt-3 line-clamp-2">{job.roleSummary}</p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-[#F2F4F7] flex items-center justify-between">
                <span className="text-xs text-[#868E96]">
                  {job.employmentType || 'Full-time'}
                </span>
                <Button
                  onClick={() => navigate(`/jobs/${job.id}`)}
                  className="w-auto text-xs py-1.5 px-3 bg-[#F2F4F7] hover:bg-[#E5E7EB] text-[#0D2D54] rounded-md font-medium"
                  label="View Details"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State Fallback matching Figma design */}
      {!isLoading && (jobs.length === 0 || isForceEmpty) && (
        <EmptyState
          variant="card"
          title="No job roles yet"
          content="Start by creating your first hiring workflow and structured job setup."
          action={
            <Button
              onClick={() => navigate('/jobs/create')}
              className="w-auto bg-[#0D2D54] hover:bg-[#0A2342] text-white rounded-lg py-2.5 px-5 font-inter text-sm font-medium transition-colors cursor-pointer inline-flex items-center gap-2"
              icon={<span className="text-base font-semibold leading-none">+</span>}
              label="Create Role"
            />
          }
        />
      )}
    </div>
  )
}

export default JobsOverview
