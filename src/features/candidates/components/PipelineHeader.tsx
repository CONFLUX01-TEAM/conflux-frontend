import React from 'react'
import { Link } from 'react-router-dom'
import Tag from '@/shared/ui/Tag'

interface PipelineHeaderProps {
  title: string
  status: string
}

/**
 * PipelineHeader
 * Displays breadcrumbs navigation and the role title with its status badge.
 */
export const PipelineHeader: React.FC<PipelineHeaderProps> = ({ title, status }) => {
  return (
    <div className="space-y-4">
      {/* 1. Breadcrumbs */}
      <nav className="flex items-center gap-2 text-[14px] font-sans font-medium text-[#ADB5BD]">
        <Link to="/candidates" className="hover:text-[#0D2D54] transition-colors">
          Candidates
        </Link>
        <img
          src="/dropdown_arrow-icon.svg"
          alt=""
          className="size-2 -rotate-90 opacity-50 shrink-0"
        />
        <span className="text-[#868E96]">{title}</span>
      </nav>

      {/* 2. Role Title & Active Badge */}
      <div className="flex justify-start items-center gap-10.5">
        <h1 className="text-3xl sm:text-4xl font-semibold text-[#000000] tracking-[0%] leading-[100%] font-sans">
          {title}
        </h1>
        <Tag
          label={status}
          variant={status === 'Active' ? 'success' : 'inactive'}
          rounded="xl"
          className="shrink-0 px-2.5 py-2 leading-none"
        />
      </div>
    </div>
  )
}

export default PipelineHeader
