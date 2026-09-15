import React from 'react'
import type { RolePipelineDetail } from '../types/candidates.types'
import PipelineMetricsCards from './PipelineMetricsCards'
import Button from '@/shared/ui/Button'
import Dropdown, { type DropdownItemObject } from '@/shared/ui/Dropdown'

const FILTER_ITEMS: DropdownItemObject<string>[] = [
  { value: 'all', label: 'All Candidates' },
  { value: 'complete', label: 'Status: Complete' },
  { value: 'pending', label: 'Status: Pending' },
  { value: 'in_progress', label: 'Status: In progress' },
  { value: 'no_show', label: 'Status: No show' },
  { value: 'ats_95', label: 'ATS Score: ≥ 95%' },
  { value: 'ats_90', label: 'ATS Score: ≥ 90%' },
]

const SORT_ITEMS: DropdownItemObject<string>[] = [
  { value: 'default', label: 'Default Order' },
  { value: 'ats_desc', label: 'Highest ATS Score' },
  { value: 'ats_asc', label: 'Lowest ATS Score' },
  { value: 'name_asc', label: 'Name (A to Z)' },
  { value: 'name_desc', label: 'Name (Z to A)' },
]

interface PipelineToolbarProps {
  metrics: RolePipelineDetail['metrics']
  filterValue: string
  onFilterChange: (value: string) => void
  sortValue: string
  onSortChange: (value: string) => void
  isBulkMode: boolean
  onToggleBulkMode: () => void
  selectedCandidateCount: number
  onToggleSelectAll: () => void
  onAdvanceStage: () => void
  onRejectCandidates: () => void
  onClearSelection: () => void
}

/**
 * PipelineToolbar
 * Renders the 4 metrics summary row alongside Filter, Sort by, and Bulk Action buttons,
 * as well as the Bulk Action sub-toolbar when bulk mode is active.
 */
export const PipelineToolbar: React.FC<PipelineToolbarProps> = ({
  metrics,
  filterValue,
  onFilterChange,
  sortValue,
  onSortChange,
  isBulkMode,
  onToggleBulkMode,
  selectedCandidateCount,
  onToggleSelectAll,
  onAdvanceStage,
  onRejectCandidates,
  onClearSelection,
}) => {
  return (
    <div className="space-y-3">
      {/* Metrics Summary & Action Buttons Row */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pt-1 pb-2">
        {/* Left: 4-Metrics Summary Row */}
        <PipelineMetricsCards metrics={metrics} />

        {/* Right: Action Buttons using reusable Button and Dropdown components */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Reusable Filter Dropdown */}
          <Dropdown
            items={FILTER_ITEMS}
            value={filterValue}
            onChange={onFilterChange}
            align="left"
            menuClassName="w-48 rounded-xl shadow-lg border border-[#E9ECEF] p-1 z-30"
            itemClassName="rounded-lg px-3 py-2 text-xs font-sans text-[#495057]"
            renderTrigger={(_selected, isOpen) => (
              <Button
                type="button"
                className={`!w-auto border text-xs sm:text-sm font-sans font-medium rounded-xl px-4 py-2.5 shadow-2xs gap-2 transition-all cursor-pointer ${
                  filterValue !== 'all'
                    ? 'bg-slate-50 border-[#0D2D54] text-[#0D2D54]'
                    : 'bg-white border-[#E9ECEF] hover:bg-slate-50 text-[#495057]'
                }`}
                icon={<img src="/dashboard/filter-icon.svg" alt="" className="size-3.5 shrink-0" />}
              >
                <span className="flex items-center gap-2">
                  <span>
                    {filterValue !== 'all'
                      ? FILTER_ITEMS.find((f) => f.value === filterValue)
                          ?.label.replace('Status: ', '')
                          .replace('ATS Score: ', '')
                      : 'Filter'}
                  </span>
                  <img
                    src="/dropdown_arrow-icon.svg"
                    alt=""
                    className={`size-2.5 opacity-70 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </span>
              </Button>
            )}
          />

          {/* Reusable Sort By Dropdown */}
          <Dropdown
            items={SORT_ITEMS}
            value={sortValue}
            onChange={onSortChange}
            align="right"
            menuClassName="w-52 rounded-xl shadow-lg border border-[#E9ECEF] p-1 z-30"
            itemClassName="rounded-lg px-3 py-2 text-xs font-sans text-[#495057]"
            renderTrigger={(_selected, isOpen) => (
              <Button
                type="button"
                className={`!w-auto border text-xs sm:text-sm font-sans font-medium rounded-xl px-4 py-2.5 shadow-2xs gap-2 transition-all cursor-pointer ${
                  sortValue !== 'default'
                    ? 'bg-slate-50 border-[#0D2D54] text-[#0D2D54]'
                    : 'bg-white border-[#E9ECEF] hover:bg-slate-50 text-[#495057]'
                }`}
                icon={<img src="/dashboard/sort-icon.svg" alt="" className="size-3.5 shrink-0" />}
              >
                <span className="flex items-center gap-2">
                  <span>
                    {sortValue !== 'default'
                      ? SORT_ITEMS.find((s) => s.value === sortValue)?.label
                      : 'Sort by'}
                  </span>
                  <img
                    src="/dropdown_arrow-icon.svg"
                    alt=""
                    className={`size-2.5 opacity-70 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </span>
              </Button>
            )}
          />

          {/* Bulk Action Button */}
          <Button
            type="button"
            onClick={onToggleBulkMode}
            className={`!w-auto text-xs sm:text-sm font-sans font-medium rounded-xl px-4 py-2.5 shadow-2xs gap-2 transition-all cursor-pointer ${
              isBulkMode
                ? 'bg-slate-50 border border-[#0D2D54] text-[#0D2D54] ring-1 ring-[#0D2D54]/20'
                : 'bg-white border border-[#E9ECEF] hover:bg-slate-50 text-[#495057]'
            }`}
            icon={<img src="/solar_upload-square-icon.svg" alt="" className="size-4.5 shrink-0" />}
          >
            <span>Bulk action</span>
          </Button>
        </div>
      </div>

      {/* Bulk Action Sub-Toolbar */}
      {isBulkMode && (
        <div className="flex items-center gap-5 flex-wrap py-5 animate-in fade-in duration-200">
          {/* Checkbox Count Pill Button */}
          <button
            type="button"
            onClick={onToggleSelectAll}
            className="border border-[#E9ECEF] hover:bg-slate-50 text-[#21252A] text-sm sm:text-[16px] font-inter font-medium rounded-lg px-5 py-4 flex items-center gap-4 transition-colors cursor-pointer"
          >
            <span
              className={`size-4.5 rounded flex items-center justify-center transition-colors ${
                selectedCandidateCount > 0
                  ? 'bg-[#0D2D54] border border-[#0D2D54]'
                  : 'border border-[#CED4DA] bg-white'
              }`}
            >
              {selectedCandidateCount > 0 && (
                <img src="/check_mark-icon.svg" alt="" className="size-2.5 brightness-0 invert" />
              )}
            </span>
            <span>{selectedCandidateCount} selected</span>
          </button>

          {/* Advance stage Button */}
          <Button
            type="button"
            onClick={onAdvanceStage}
            disabled={selectedCandidateCount === 0}
            className="!w-auto bg-[#DEEBFA] border border-[#E9ECEF] text-[#1859F1] hover:bg-[#E0EEFE] disabled:opacity-40 disabled:cursor-not-allowed rounded-lg px-5 py-4 text-sm sm:text-[16px] font-inter font-medium gap-3 shadow-2xs cursor-pointer transition-colors"
            icon={<img src="/arrow-right.svg" alt="" className="size-6 -rotate-45 shrink-0" />}
          >
            <span>Advance stage</span>
          </Button>

          {/* Reject candidates Button */}
          <Button
            type="button"
            onClick={onRejectCandidates}
            disabled={selectedCandidateCount === 0}
            className="!w-auto bg-[#FDECEC] text-[#EF4444] hover:bg-[#FDD8D8] disabled:opacity-40 disabled:cursor-not-allowed rounded-lg px-5 py-4 text-sm sm:text-[16px] font-inter font-medium gap-3 shadow-2xs cursor-pointer transition-colors"
            icon={
              <img
                src="/x-icon.svg"
                alt=""
                className="size-3.5 shrink-0"
                style={{
                  filter:
                    'brightness(0) saturate(100%) invert(38%) sepia(78%) saturate(2476%) hue-rotate(338deg) brightness(98%) contrast(92%)',
                }}
              />
            }
          >
            <span>Reject candidates</span>
          </Button>

          {/* Clear Button */}
          <Button
            type="button"
            onClick={onClearSelection}
            className="!w-auto border border-[#E9ECEF] hover:bg-slate-50 text-[#495057] rounded-lg px-5 py-4 text-sm sm:text-[16px] font-inter font-medium cursor-pointer transition-colors"
          >
            <span>Clear</span>
          </Button>
        </div>
      )}
    </div>
  )
}

export default PipelineToolbar
