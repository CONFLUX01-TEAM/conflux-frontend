// import { useState } from 'react'
import type { Metric } from '../types'
import SummaryCard from './SummaryCard'
import HiringPipeline from './HiringPipeline'
import CandidatesBySource from './CandidatesBySource'
import ApplicationsOverTime from './ApplicationsOverTime'
import RecentCandidates from './RecentCandidates'
// import RecentActivity from './RecentActivity'

const DashboardOverview = () => {
  // const [isActivityCollapsed, setIsActivityCollapsed] = useState(true)

  const metrics: Metric[] = [
    {
      id: 'active-jobs',
      title: 'Active Jobs',
      value: 12,
      percentageChange: 12,
      isIncrease: true,
      iconType: 'briefcase',
    },
    {
      id: 'total-candidates',
      title: 'Total Candidates',
      value: 2000,
      percentageChange: 7,
      isIncrease: true,
      iconType: 'user',
    },
    {
      id: 'in-screening',
      title: 'In screening',
      value: 1290,
      percentageChange: 16,
      isIncrease: true,
      iconType: 'clipboard',
    },
    {
      id: 'in-interview',
      title: 'In interview',
      value: 24,
      percentageChange: 2,
      isIncrease: true,
      iconType: 'video',
    },
    {
      id: 'hired',
      title: 'Hired',
      value: 20,
      percentageChange: 14,
      isIncrease: false,
      iconType: 'briefcase_green',
    },
  ]

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full min-h-full font-sans text-black select-none">
      {/* Left Area: Main Dashboard Widgets */}
      <div className="flex-1 flex flex-col gap-6 min-w-0">
        {/* Title bar */}
        {/* {isActivityCollapsed && (
          <div className="flex items-center justify-between shrink-0">
            <h1 className="font-sans text-2xl sm:text-[2rem] font-medium text-[#000000] leading-none">
              Dashboard
            </h1>


            <button
              onClick={() => setIsActivityCollapsed(false)}
              className="font-inter text-xs text-[#062DF6] font-semibold hover:opacity-85 transition-opacity px-4 py-2 border border-[#EAEAEA] bg-white rounded-[0.5rem] shadow-[0_1px_2px_rgba(0,0,0,0.05)] cursor-pointer"
            >
              Show Activity
            </button>
          </div>
        )} */}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 w-full">
          {metrics.map((metric) => (
            <SummaryCard key={metric.id} metric={metric} />
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[535fr_309fr_443fr] gap-6 w-full">
          <HiringPipeline />
          <CandidatesBySource />
          <div className="md:col-span-2 xl:col-span-1">
            <ApplicationsOverTime />
          </div>
        </div>

        {/* Table Row */}
        <div className="w-full">
          <RecentCandidates />
        </div>
      </div>

      {/* Right Area: Collapsible Recent Activity Panel */}

      {/* This was commented because of change in ui, will be confirmed when the pm reaches out */}
      {/* {!isActivityCollapsed && (
        <div className="w-full lg:w-[20rem] xl:w-[22.5rem] shrink-0 self-stretch">
          <RecentActivity onCollapse={() => setIsActivityCollapsed(true)} />
        </div>
      )} */}
    </div>
  )
}

export default DashboardOverview
