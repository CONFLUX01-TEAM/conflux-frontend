import { useState, useRef, useEffect } from 'react'
import type { Candidate } from '../types'
import Button from '@/shared/ui/Button'
import Dropdown from '@/shared/ui/Dropdown'
import SearchBar from '@/shared/ui/SearchBar'
import Table from '@/shared/ui/Table'
import type { Column } from '@/shared/ui/Table'
import FilterChips from '@/shared/ui/FilterChips'
import type { FilterChip } from '@/shared/ui/FilterChips'

const RecentCandidates = () => {
  const [activeFilters, setActiveFilters] = useState<FilterChip[]>([])

  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false)

  const sortDropdownRef = useRef<HTMLDivElement>(null)

  // Sort states
  const [selectedDateSort, setSelectedDateSort] = useState<'Last Updated' | 'Created Date'>(
    'Last Updated',
  )
  const [selectedNameSort, setSelectedNameSort] = useState<'A to Z' | 'Z to A'>('A to Z')
  const [activeSortType, setActiveSortType] = useState<'date' | 'name' | null>(null)

  // Temporary dropdown states
  const [tempDateSort, setTempDateSort] = useState<'Last Updated' | 'Created Date'>('Last Updated')
  const [tempNameSort, setTempNameSort] = useState<'A to Z' | 'Z to A'>('A to Z')
  const [tempActiveSortType, setTempActiveSortType] = useState<'date' | 'name'>('date')

  const [candidates] = useState<Candidate[]>([
    {
      id: '1',
      name: 'Eniafe Bada',
      email: 'badaeniafe@gmail.com',
      jobTitle: 'Senior product designer',
      department: 'Product design',
      stage: 'Interview',
      experience: '3+ years',
      location: 'Remote',
      appliedOn: 'June 23,2026',
    },
    {
      id: '2',
      name: 'Tunde Asorona',
      email: 'tunderona@gmail.com',
      jobTitle: 'Project manager',
      department: 'Projects',
      stage: 'Hired',
      experience: '3+ years',
      location: 'Remote',
      appliedOn: 'June 23,2026',
    },
    {
      id: '3',
      name: 'Sefa Mamu',
      email: 'sefamamu@gmail.com',
      jobTitle: 'Junior software engineer',
      department: 'Software engineering',
      stage: 'Interview',
      experience: '7+ years',
      location: 'Lagos, Nigeria',
      appliedOn: 'June 3,2026',
    },
    {
      id: '4',
      name: 'Sefa Mamu',
      email: 'sefamamu@gmail.com',
      jobTitle: 'Senior backend engineer',
      department: 'Software engineering',
      stage: 'Screening',
      experience: '7+ years',
      location: 'Lagos, Nigeria',
      appliedOn: 'June 3,2026',
    },
    {
      id: '5',
      name: 'Jane Doe',
      email: 'jane.doe@gmail.com',
      jobTitle: 'Senior product designer',
      department: 'Product design',
      stage: 'Interview',
      experience: '3+ years',
      location: 'Remote',
      appliedOn: 'June 23,2026',
    },
    {
      id: '6',
      name: 'John Smith',
      email: 'smithjohn@gmail.com',
      jobTitle: 'Project manager',
      department: 'Projects',
      stage: 'Hired',
      experience: '3+ years',
      location: 'Remote',
      appliedOn: 'June 23,2026',
    },
    {
      id: '7',
      name: 'Alice Johnson',
      email: 'alice.j@gmail.com',
      jobTitle: 'Junior software engineer',
      department: 'Software engineering',
      stage: 'Interview',
      experience: '7+ years',
      location: 'Lagos, Nigeria',
      appliedOn: 'June 3,2026',
    },
    {
      id: '8',
      name: 'Bob Wilson',
      email: 'bobwilson@gmail.com',
      jobTitle: 'Senior backend engineer',
      department: 'Software engineering',
      stage: 'Screening',
      experience: '7+ years',
      location: 'Lagos, Nigeria',
      appliedOn: 'June 3,2026',
    },
    {
      id: '9',
      name: 'Charlie Brown',
      email: 'charlie.b@gmail.com',
      jobTitle: 'Senior product designer',
      department: 'Product design',
      stage: 'Interview',
      experience: '3+ years',
      location: 'Remote',
      appliedOn: 'June 23,2026',
    },
    {
      id: '10',
      name: 'David Miller',
      email: 'miller.d@gmail.com',
      jobTitle: 'Project manager1',
      department: 'Projects',
      stage: 'Hired',
      experience: '3+ years',
      location: 'Remote',
      appliedOn: 'June 23,2026',
    },
    {
      id: '11',
      name: 'Emma Davis',
      email: 'emma.davis@gmail.com',
      jobTitle: 'Junior software engineer2',
      department: 'Software engineering1',
      stage: 'Interview',
      experience: '7+ years',
      location: 'Lagos, Nigeria',
      appliedOn: 'June 3,2026',
    },
    {
      id: '12',
      name: 'Fiona Gallagher',
      email: 'fiona.g@gmail.com',
      jobTitle: 'Senior backend enginee3r',
      department: 'Software engineering',
      stage: 'Screening',
      experience: '7+ years',
      location: 'Lagos, Nigeria',
      appliedOn: 'June 3,2026',
    },
    {
      id: '13',
      name: 'George Wilson',
      email: 'george.w@gmail.com',
      jobTitle: 'Senior product designer4',
      department: 'Product design',
      stage: 'Interview',
      experience: '3+ years',
      location: 'Remote',
      appliedOn: 'June 23,2026',
    },
    {
      id: '14',
      name: 'Henry Taylor',
      email: 'henry.t@gmail.com',
      jobTitle: 'Project manager',
      department: 'Projects',
      stage: 'Hired',
      experience: '3+ years',
      location: 'Remote',
      appliedOn: 'June 23,2026',
    },
    {
      id: '15',
      name: 'Isabella Martinez',
      email: 'isabella.m@gmail.com',
      jobTitle: 'Junior software engineer',
      department: 'QA Tester',
      stage: 'Interview',
      experience: '7+ years',
      location: 'Lagos, Nigeria',
      appliedOn: 'June 3,2026',
    },
    {
      id: '16',
      name: 'Jack Anderson',
      email: 'jack.a@gmail.com',
      jobTitle: 'Senior backend engineer',
      department: 'Software engineering',
      stage: 'Screening',
      experience: '7+ years',
      location: 'Lagos, Nigeria',
      appliedOn: 'June 3,2026',
    },
    {
      id: '17',
      name: 'Kate Thompson',
      email: 'kate.t@gmail.com',
      jobTitle: 'Senior product designer',
      department: 'Product design',
      stage: 'Interview',
      experience: '3+ years',
      location: 'Remote',
      appliedOn: 'June 23,2026',
    },
    {
      id: '18',
      name: 'Liam Davis',
      email: 'liam.d@gmail.com',
      jobTitle: 'Project manager',
      department: 'Projects',
      stage: 'Hired',
      experience: '3+ years',
      location: 'Remote',
      appliedOn: 'June 23,2026',
    },
  ])

  // Dynamic list of options extracted from candidates data
  const dynamicJobs = Array.from(new Set(candidates.map((c) => c.jobTitle))).sort()
  const dynamicStages = Array.from(new Set(candidates.map((c) => c.stage))).sort()
  const dynamicExperiences = Array.from(new Set(candidates.map((c) => c.experience))).sort()

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const parseAppliedDate = (dateStr: string) => {
    const normalized = dateStr.replace(',', ', ')
    return new Date(normalized).getTime()
  }

  // Filter and then sort candidates
  const sortedCandidates = [...candidates]
    .filter((c) => {
      // Group active filters by type
      const jobFilters = activeFilters.filter((f) => f.type === 'job')
      const stageFilters = activeFilters.filter((f) => f.type === 'stage')
      const experienceFilters = activeFilters.filter((f) => f.type === 'experience')

      // Candidate must match at least one filter of each type (OR within types, AND between types)
      const matchesJob = jobFilters.length === 0 || jobFilters.some((f) => c.jobTitle === f.value)

      const matchesStage =
        stageFilters.length === 0 || stageFilters.some((f) => c.stage === f.value)

      const matchesExperience =
        experienceFilters.length === 0 || experienceFilters.some((f) => c.experience === f.value)

      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesJob && matchesStage && matchesExperience && matchesSearch
    })
    .sort((a, b) => {
      if (!activeSortType) return 0

      if (activeSortType === 'date') {
        const dateA = parseAppliedDate(a.appliedOn)
        const dateB = parseAppliedDate(b.appliedOn)
        if (dateA !== dateB) {
          return selectedDateSort === 'Last Updated' ? dateB - dateA : dateA - dateB
        }
        return selectedNameSort === 'A to Z'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name)
      } else {
        const nameCompare =
          selectedNameSort === 'A to Z'
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name)
        if (nameCompare !== 0) return nameCompare
        const dateA = parseAppliedDate(a.appliedOn)
        const dateB = parseAppliedDate(b.appliedOn)
        return selectedDateSort === 'Last Updated' ? dateB - dateA : dateA - dateB
      }
    })

  const itemsPerPage = 4
  const totalCount = sortedCandidates.length
  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedCandidates = sortedCandidates.slice(startIndex, startIndex + itemsPerPage)

  const getPaginationGroup = () => {
    if (totalPages <= 4) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    if (currentPage <= 3) {
      return [1, 2, 3, '...', totalPages]
    } else if (currentPage >= totalPages - 2) {
      return [1, '...', totalPages - 2, totalPages - 1, totalPages]
    } else {
      return [1, '...', currentPage, '...', totalPages]
    }
  }

  const columns: Column<Candidate>[] = [
    {
      header: 'Candidate',
      key: 'name',
      headerClassName: 'py-5 px-6',
      render: (candidate) => (
        <div className="flex flex-col leading-[100%]">
          <span className="font-inter text-xs sm:text-[1rem] font-medium text-[#000000]">
            {candidate.name}
          </span>
          <span className="font-inter font-normal text-[1rem] text-[#535353] mt-2.5">
            {candidate.email}
          </span>
        </div>
      ),
    },
    {
      header: 'Job Titles',
      key: 'jobTitle',
      render: (candidate) => (
        <div className="flex flex-col leading-tight">
          <span className="font-inter text-xs sm:text-[1rem] font-medium text-[#000000]">
            {candidate.jobTitle}
          </span>
          <span className="font-inter font-normal text-[1rem] text-[#535353] mt-2.5">
            {candidate.department}
          </span>
        </div>
      ),
    },
    {
      header: 'Stage',
      key: 'stage',
      render: (candidate) => {
        let badgeClass = ''
        switch (candidate.stage) {
          case 'Interview':
            badgeClass = 'border border-[#D97706] text-[#D97706] bg-transparent'
            break
          case 'Hired':
            badgeClass = 'border border-[#15803D] text-[#15803D] bg-transparent'
            break
          case 'Screening':
            badgeClass = 'border border-[#4F46E5] text-[#4F46E5] bg-transparent'
            break
        }
        return (
          <span
            className={`inline-block px-3 py-1 rounded-[6px] text-[0.6875rem] font-sans font-medium text-center ${badgeClass}`}
          >
            {candidate.stage}
          </span>
        )
      },
    },
    {
      header: 'Experience',
      key: 'experience',
      cellClassName: 'font-inter text-xs sm:text-[1rem] font-medium text-[#000000]',
    },
    {
      header: 'Location',
      key: 'location',
      cellClassName: 'font-inter text-xs sm:text-[1rem] font-medium text-[#000000]',
    },
    {
      header: 'Applied On',
      key: 'appliedOn',
      cellClassName: 'font-inter text-xs sm:text-[1rem] font-medium text-[#000000]',
    },
    {
      header: 'Actions',
      key: 'actions',
      headerClassName: 'text-center',
      cellClassName: 'text-center',
      render: () => (
        <Button
          type="button"
          className="!w-auto inline-flex items-center justify-center text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-50 transition-colors cursor-pointer"
          icon={<img src="/dashboard/menu-meatballs-icon.svg" alt="icon" />}
        />
      ),
    },
  ]

  return (
    <div className="flex flex-col bg-[#FFFFFF] border-[0.5px] border-[#DDE0E9] rounded-[0.75rem] py-[30px] px-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] w-full overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-[42px]">
        <div className="flex flex-col items-start gap-2 justify-center">
          <h3 className="font-sans text-[1.5rem] font-semibold text-[#000000] leading-[100%] tracking-[0%]">
            Recent Candidates
          </h3>
          <p className="font-sans font-medium text-[0.9375rem] text-[#535353] leading-[100%] tracking-[0%]">
            View and manage candidates across your active jobs
          </p>
        </div>

        {/* Controls: Search and Filter Popover */}
        <div className="flex items-stretch gap-3 sm:gap-4 self-stretch md:self-auto h-12 md:h-[3.75rem]">
          {/* Search Input */}
          <SearchBar
            placeholder="Search candidates by name, email or job"
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val)
              setCurrentPage(1)
            }}
            className="flex-1 md:w-[31.25rem] md:h-[3.75rem] max-w-[31.25rem]"
          />

          {/* Filter Popover Trigger */}
          <Dropdown
            className="h-full"
            triggerClassName="h-full"
            items={[
              { value: 'job', label: 'Job titles' },
              { value: 'stage', label: 'Stage' },
              { value: 'experience', label: 'Experience' },
            ]}
            onChange={(type) => {
              const defaultVal =
                type === 'job'
                  ? dynamicJobs[0]
                  : type === 'stage'
                    ? dynamicStages[0]
                    : dynamicExperiences[0]
              setActiveFilters((prev) => [
                ...prev,
                {
                  id: Math.random().toString(),
                  type: type as 'job' | 'stage' | 'experience',
                  value: defaultVal || '',
                },
              ])
              setCurrentPage(1)
            }}
            align="right"
            renderTrigger={() => (
              <Button
                type="button"
                className={`!w-auto flex h-full items-center gap-3 px-4.5 border rounded-[0.5rem] text-xs font-sans font-medium hover:bg-slate-50 cursor-pointer transition-colors ${
                  activeFilters.length > 0
                    ? 'border-[#0D2D54] text-[#0D2D54]'
                    : 'border-[#DDE0E9] text-[#1F2937]'
                }`}
                icon={<img src="/dashboard/filter-icon.svg" alt="" />}
              >
                Filter
              </Button>
            )}
            menuClassName="w-40 h"
            itemClassName="text-[15px] text-[#3B3B3B] font-inter font-medium px-5 py-2.5 hover:bg-[#E7EAEE] rounded-[8px] cursor-pointer"
          />

          {/* Sort Popover Trigger */}
          <div className="relative h-full" ref={sortDropdownRef}>
            <Button
              type="button"
              onClick={() => {
                if (!isSortDropdownOpen) {
                  setTempDateSort(selectedDateSort)
                  setTempNameSort(selectedNameSort)
                  setTempActiveSortType(activeSortType || 'date')
                }
                setIsSortDropdownOpen(!isSortDropdownOpen)
              }}
              className="!w-auto flex h-full items-center gap-3 px-4.5 border border-[#DDE0E9] text-[#1F2937] rounded-[0.5rem] text-xs font-sans font-medium hover:bg-slate-50 cursor-pointer transition-colors"
              icon={<img src="/dashboard/sort-icon.svg" alt="" />}
            >
              {activeSortType
                ? activeSortType === 'date'
                  ? selectedDateSort
                  : selectedNameSort
                : 'Sort'}
            </Button>

            {/* Dropdown Menu */}
            {isSortDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-[13.5rem] bg-white border border-[#E4E4E7] rounded-[0.5rem] shadow-lg p-3 z-50">
                <div className="flex flex-col gap-1.5">
                  {/* Date Options */}
                  <Button
                    type="button"
                    onClick={() => {
                      setTempDateSort('Last Updated')
                      setTempActiveSortType('date')
                    }}
                    className="!w-auto flex items-center justify-between w-full text-left py-1 text-xs font-sans font-medium text-[#1F2937] hover:bg-[#F4F4F5]/60 transition-colors cursor-pointer"
                  >
                    <span>Last Updated</span>
                    <div
                      className={`size-4.5 flex items-center justify-center rounded border transition-colors ${
                        tempDateSort === 'Last Updated'
                          ? 'border-[#0D2D54] text-white'
                          : 'border-[#E6E6E6] bg-white'
                      }`}
                    >
                      {tempDateSort === 'Last Updated' && <img src="/check_mark-icon.svg" alt="" />}
                    </div>
                  </Button>

                  <Button
                    type="button"
                    onClick={() => {
                      setTempDateSort('Created Date')
                      setTempActiveSortType('date')
                    }}
                    className="!w-auto flex items-center justify-between w-full text-left py-1 text-xs font-sans font-medium text-[#1F2937] hover:bg-[#F4F4F5]/60 transition-colors cursor-pointer"
                  >
                    <span>Created Date</span>
                    <div
                      className={`size-4.5 flex items-center justify-center rounded border transition-colors ${
                        tempDateSort === 'Created Date'
                          ? 'border-[#0D2D54] text-white'
                          : 'border-[#E6E6E6] bg-white'
                      }`}
                    >
                      {tempDateSort === 'Created Date' && <img src="/check_mark-icon.svg" alt="" />}
                    </div>
                  </Button>

                  <hr className="border-[#E4E4E7] my-1" />

                  {/* Name Options */}
                  <Button
                    type="button"
                    onClick={() => {
                      setTempNameSort('A to Z')
                      setTempActiveSortType('name')
                    }}
                    className="!w-auto flex items-center justify-between w-full text-left py-1 text-xs font-sans font-medium text-[#1F2937] hover:bg-[#F4F4F5]/60 transition-colors cursor-pointer"
                  >
                    <span>A to Z</span>
                    <div
                      className={`size-4.5 flex items-center justify-center rounded border transition-colors ${
                        tempNameSort === 'A to Z'
                          ? 'border-[#0D2D54] text-white'
                          : 'border-[#E6E6E6] bg-white'
                      }`}
                    >
                      {tempNameSort === 'A to Z' && <img src="/check_mark-icon.svg" alt="" />}
                    </div>
                  </Button>

                  <Button
                    type="button"
                    onClick={() => {
                      setTempNameSort('Z to A')
                      setTempActiveSortType('name')
                    }}
                    className="!w-auto flex items-center justify-between w-full text-left py-1 text-xs font-sans font-medium text-[#1F2937] hover:bg-[#F4F4F5]/60 transition-colors cursor-pointer"
                  >
                    <span>Z to A</span>
                    <div
                      className={`size-4.5 flex items-center justify-center rounded border transition-colors ${
                        tempNameSort === 'Z to A'
                          ? 'border-[#0D2D54] text-white'
                          : 'border-[#E6E6E6] bg-white'
                      }`}
                    >
                      {tempNameSort === 'Z to A' && <img src="/check_mark-icon.svg" alt="" />}
                    </div>
                  </Button>

                  <hr className="border-[#E4E4E7] my-1" />

                  {/* Apply Button */}
                  <div className="flex justify-end mt-2">
                    <Button
                      type="button"
                      onClick={() => {
                        setSelectedDateSort(tempDateSort)
                        setSelectedNameSort(tempNameSort)
                        setActiveSortType(tempActiveSortType)
                        setIsSortDropdownOpen(false)
                        setCurrentPage(1)
                      }}
                      className="!w-auto px-5 py-1.5 bg-[#122C54] text-white text-xs font-sans font-semibold rounded-[0.375rem] hover:bg-[#09203c] transition-colors cursor-pointer"
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Filter Chips Builder Row */}
      <FilterChips
        activeFilters={activeFilters}
        availableOptions={{
          job: dynamicJobs,
          stage: dynamicStages,
          experience: dynamicExperiences,
        }}
        filterLabels={{
          job: 'Job titles',
          stage: 'Stage',
          experience: 'Experience',
        }}
        onFilterValueChange={(id, value) => {
          setActiveFilters(activeFilters.map((f) => (f.id === id ? { ...f, value } : f)))
          setCurrentPage(1)
        }}
        onRemoveFilter={(id) => {
          setActiveFilters(activeFilters.filter((f) => f.id !== id))
        }}
        onClearFilters={() => {
          setActiveFilters([])
          setCurrentPage(1)
        }}
        renderValue={(type, value) => {
          if (type === 'stage') {
            const dotColor =
              value === 'Hired'
                ? 'bg-[#10B981]'
                : value === 'Interview'
                  ? 'bg-[#F59E0B]'
                  : 'bg-[#6B7280]'
            return (
              <>
                <span className={`size-2 rounded-full ${dotColor}`} />
                <span>{value}</span>
              </>
            )
          }
          return <span>{value}</span>
        }}
        renderOption={(type, option) => {
          if (type === 'stage') {
            const dotColor =
              option === 'Hired'
                ? 'bg-[#10B981]'
                : option === 'Interview'
                  ? 'bg-[#F59E0B]'
                  : 'bg-[#6B7280]'
            return (
              <span className="flex items-center gap-1.5 text-xs font-sans">
                <span className={`size-2 rounded-full ${dotColor}`} />
                <span>{option}</span>
              </span>
            )
          }
          return (
            <span className="flex items-center gap-1.5 text-[13px] text-[#3B3B3B] font-inter">
              <span>{option}</span>
            </span>
          )
        }}
      />

      {/* Responsive Table Wrapper */}
      <Table
        data={paginatedCandidates}
        columns={columns}
        keyExtractor={(candidate) => candidate.id}
      />

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4">
        <span className="font-sans text-xs text-[#5F5F5F] font-medium">
          Showing {totalCount > 0 ? startIndex + 1 : 0} to{' '}
          {Math.min(startIndex + itemsPerPage, totalCount)} of {totalCount} candidates
        </span>
        <div className="flex items-center gap-1.5 select-none">
          {/* Previous Page Button */}
          <Button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className={`!w-8 !h-8 flex items-center justify-center border border-[#E4E4E7] rounded-[6px] transition-colors ${
              currentPage === 1
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-500 hover:bg-gray-50 cursor-pointer'
            }`}
            icon={
              <img
                src="/dropdown_arrow-icon.svg"
                alt="Previous"
                className={`size-3 rotate-90 transition-opacity duration-200 ${currentPage === 1 ? 'opacity-30' : ''}`}
              />
            }
          />

          {/* Page numbers */}
          {getPaginationGroup().map((page, idx) => {
            if (page === '...') {
              return (
                <span
                  key={`dots-${idx}`}
                  className="flex items-center justify-center size-8 text-xs font-medium text-gray-400"
                >
                  ...
                </span>
              )
            }

            return (
              <Button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page as number)}
                className={`!w-8 !h-8 flex items-center justify-center rounded-[6px] text-xs transition-colors cursor-pointer ${
                  currentPage === page
                    ? 'bg-[#0D2D54] text-white font-semibold'
                    : 'border border-[#E4E4E7] font-medium text-gray-700 hover:bg-gray-50'
                }`}
              >
                {page}
              </Button>
            )
          })}

          {/* Next Page Button */}
          <Button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            className={`!w-8 !h-8 flex items-center justify-center border border-[#E4E4E7] rounded-[6px] transition-colors ${
              currentPage === totalPages
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-500 hover:bg-gray-50 cursor-pointer'
            }`}
            icon={
              <img
                src="/dropdown_arrow-icon.svg"
                alt="Next"
                className={`size-3 -rotate-90 transition-opacity duration-200 ${currentPage === totalPages ? 'opacity-30' : ''}`}
              />
            }
          />
        </div>
      </div>
    </div>
  )
}

export default RecentCandidates
