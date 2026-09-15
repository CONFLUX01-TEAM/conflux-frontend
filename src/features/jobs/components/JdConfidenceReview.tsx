import { useState } from 'react'
import Button from '@/shared/ui/Button'
import Tag from '@/shared/ui/Tag'
import InputField from '@/shared/ui/InputField'

export interface JdExtractedDetails {
  fileName: string
  fileSize?: string
  confidenceScore: number
  confidenceScores?: {
    roleTitle?: number
    department?: number
    skills?: number
    responsibilities?: number
    salary?: number
  } | null
  roleTitle: string
  department: string
  seniorityLevel: string
  experienceLevel: string
  responsibilities: string[]
  requiredSkills: string[]
  preferredSkills: string[]
  salaryCompensation?: string
  roleSummary: string
}

interface JdConfidenceReviewProps {
  data: JdExtractedDetails
  onReupload: () => void
  onBack: () => void
  onContinue: () => void
  onUpdateData: (updated: Partial<JdExtractedDetails>) => void
}

export const JdConfidenceReview = ({
  data,
  onReupload,
  onBack,
  onContinue,
  onUpdateData,
}: JdConfidenceReviewProps) => {
  const [showAllResponsibilities, setShowAllResponsibilities] = useState(false)
  const [showAllRequiredSkills, setShowAllRequiredSkills] = useState(true)
  const [showAllPreferredSkills, setShowAllPreferredSkills] = useState(false)

  // Editing state for flagged rows
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editSalaryInput, setEditSalaryInput] = useState(data.salaryCompensation || '')
  const [newSkillInput, setNewSkillInput] = useState('')

  // Calculate flagged items count dynamically
  const flaggedCount =
    (data.preferredSkills.length < 3 ? 1 : 0) + (!data.salaryCompensation ? 1 : 0)

  const handleSaveSalary = () => {
    onUpdateData({ salaryCompensation: editSalaryInput })
    setEditingField(null)
  }

  const handleAddPreferredSkill = () => {
    if (!newSkillInput.trim()) return
    const updated = [...data.preferredSkills, newSkillInput.trim()]
    onUpdateData({ preferredSkills: updated })
    setNewSkillInput('')
  }

  const handleRemovePreferredSkill = (index: number) => {
    const updated = data.preferredSkills.filter((_, i) => i !== index)
    onUpdateData({ preferredSkills: updated })
  }

  const displayedResponsibilities = showAllResponsibilities
    ? data.responsibilities
    : data.responsibilities.slice(0, 3)

  const displayedRequiredSkills = showAllRequiredSkills
    ? data.requiredSkills
    : data.requiredSkills.slice(0, 8)

  const displayedPreferredSkills = showAllPreferredSkills
    ? data.preferredSkills
    : data.preferredSkills.slice(0, 4)

  return (
    <div className="w-full max-w-[52rem] mx-auto py-2 animate-in fade-in duration-300">
      {/* ── Document Metadata Header Box ───────────────────────────── */}
      <div className="p-5 sm:p-6 rounded-2xl border border-[#E5E7EB] bg-white shadow-xs mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="size-12 rounded-xl bg-[#0D2D54]/10 text-[#0D2D54] border border-[#0D2D54]/20 flex items-center justify-center shrink-0">
              <svg
                className="size-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-sans font-bold text-base sm:text-lg text-[#111827]">
                  {data.fileName || 'Job-Description.pdf'}
                </h3>
                <span className="inline-flex items-center text-[#0D2D54]">
                  <svg className="size-4.5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.061 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              </div>
              <p className="font-inter text-xs sm:text-sm text-[#6B7280] mt-1">
                {data.fileSize || '245 KB'} · Parsed successfully ·{' '}
                <span className="font-semibold text-[#0D2D54]">
                  {flaggedCount} {flaggedCount === 1 ? 'item needs' : 'items need'} your attention
                </span>
              </p>

              {/* Confidence Progress Bar */}
              {(() => {
                const rawScore = data.confidenceScore
                const score =
                  rawScore <= 1 && rawScore > 0
                    ? Math.round(rawScore * 100)
                    : Math.round(rawScore || 0)
                return (
                  <div className="flex items-center gap-3 mt-3">
                    <div className="w-36 sm:w-48 h-2 rounded-full bg-[#E5E7EB] overflow-hidden">
                      <div
                        className="h-full bg-[#0D2D54] rounded-full transition-all duration-500"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <span className="font-inter text-xs font-bold text-[#0D2D54]">
                      {score}% confidence
                    </span>
                  </div>
                )
              })()}
            </div>
          </div>

          <Button
            type="button"
            onClick={onReupload}
            label="Re-upload"
            icon={
              <svg
                className="size-3.5 text-[#6B7280]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            }
            className="!w-auto flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#D1D5DB] bg-white hover:bg-gray-50 text-xs font-inter font-semibold text-[#111827] shadow-2xs transition-colors cursor-pointer shrink-0 self-start sm:self-center"
          />
        </div>
      </div>

      {/* ── Section 1: ROLE IDENTITY ───────────────────────────────── */}
      <div className="mb-8">
        <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-[#6B7280] mb-3">
          Role Identity
        </h4>
        <div className="bg-white rounded-xl border border-[#E5E7EB] divide-y divide-[#E5E7EB] shadow-xs">
          {/* Role Title */}
          <div className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="size-2 rounded-full bg-[#0D2D54] shrink-0" />
              <span className="font-sans font-bold text-sm text-[#111827]">Role Title:</span>
              <span className="font-inter text-sm text-[#4B5563]">{data.roleTitle}</span>
            </div>
            <Tag label="High" variant="high" size="sm" />
          </div>

          {/* Department */}
          <div className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="size-2 rounded-full bg-[#0D2D54] shrink-0" />
              <span className="font-sans font-bold text-sm text-[#111827]">Department:</span>
              <span className="font-inter text-sm text-[#4B5563]">{data.department}</span>
            </div>
            <Tag label="High" variant="high" size="sm" />
          </div>

          {/* Seniority & Experience */}
          <div className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="size-2 rounded-full bg-[#0D2D54] shrink-0" />
              <span className="font-sans font-bold text-sm text-[#111827]">Level:</span>
              <span className="font-inter text-sm text-[#4B5563]">
                {data.seniorityLevel} · {data.experienceLevel}
              </span>
            </div>
            <Tag label="High" variant="high" size="sm" />
          </div>
        </div>
      </div>

      {/* ── Section 2: CORE CONTENT ────────────────────────────────── */}
      <div className="mb-8">
        <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-[#6B7280] mb-3">
          Core Content
        </h4>
        <div className="bg-white rounded-xl border border-[#E5E7EB] divide-y divide-[#E5E7EB] shadow-xs">
          {/* Responsibilities */}
          {data.responsibilities.length > 0 && (
            <div className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="size-2 rounded-full bg-[#0D2D54] shrink-0" />
                  <span className="font-sans font-bold text-sm text-[#111827]">
                    Responsibilities
                  </span>
                  <span className="font-inter text-xs text-[#6B7280]">
                    {data.responsibilities.length} items extracted
                  </span>
                  <Tag label="High" variant="high" size="sm" />
                </div>
                {data.responsibilities.length > 3 && (
                  <button
                    type="button"
                    onClick={() => setShowAllResponsibilities(!showAllResponsibilities)}
                    className="text-xs font-semibold text-[#0D2D54] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{showAllResponsibilities ? 'Hide' : 'View all'}</span>
                    <svg
                      className={`size-3.5 transition-transform duration-200 ${
                        showAllResponsibilities ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                )}
              </div>

              {/* Responsibilities List */}
              <ul className="mt-3 pl-5 list-disc space-y-1 text-xs sm:text-sm font-inter text-[#4B5563]">
                {displayedResponsibilities.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Required Skills */}
          <div className="p-4">
            <div className="flex items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-3">
                <span className="size-2 rounded-full bg-[#0D2D54] shrink-0" />
                <span className="font-sans font-bold text-sm text-[#111827]">Required Skills</span>
                <span className="font-inter text-xs text-[#6B7280]">
                  {data.requiredSkills.length} skills identified
                </span>
                <Tag label="High" variant="high" size="sm" />
              </div>
              {data.requiredSkills.length > 8 && (
                <button
                  type="button"
                  onClick={() => setShowAllRequiredSkills(!showAllRequiredSkills)}
                  className="text-xs font-semibold text-[#0D2D54] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>{showAllRequiredSkills ? 'Hide' : 'View all'}</span>
                  <svg
                    className={`size-3.5 transition-transform duration-200 ${
                      showAllRequiredSkills ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Required Skills Pill Badges using reusable Tag */}
            <div className="flex flex-wrap gap-2">
              {displayedRequiredSkills.map((skill, idx) => (
                <Tag key={idx} label={skill} variant="neutral" size="sm" />
              ))}
            </div>
          </div>

          {/* Preferred Skills (Clean subtle container, no left side stripe) */}
          <div className="p-4 bg-[#0D2D54]/[0.03]">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="size-2 rounded-full bg-[#0D2D54]/40 shrink-0" />
                <span className="font-sans font-bold text-sm text-[#0D2D54]">Preferred Skills</span>
                <span className="font-inter text-xs text-[#0D2D54]/80">
                  {data.preferredSkills.length} skills found
                </span>
                <Tag label="Needs review" variant="warning" size="sm" />
              </div>
              <div className="flex items-center gap-2">
                {data.preferredSkills.length > 4 && (
                  <button
                    type="button"
                    onClick={() => setShowAllPreferredSkills(!showAllPreferredSkills)}
                    className="text-xs font-semibold text-[#0D2D54] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{showAllPreferredSkills ? 'Hide' : 'View all'}</span>
                    <svg
                      className={`size-3.5 transition-transform duration-200 ${
                        showAllPreferredSkills ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                )}
                <Button
                  type="button"
                  onClick={() =>
                    setEditingField(editingField === 'preferredSkills' ? null : 'preferredSkills')
                  }
                  label="Edit"
                  icon={
                    <svg
                      className="size-3 text-[#0D2D54]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  }
                  className="!w-auto px-2.5 py-1 bg-white border border-[#0D2D54]/20 rounded-md text-xs font-semibold text-[#0D2D54] hover:bg-[#0D2D54]/5 shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
                />
              </div>
            </div>

            <p className="font-inter text-xs text-[#0D2D54]/70 mt-1.5">
              Most JDs have 4–6 preferred skills — this may be incomplete.
            </p>

            {/* Preferred Skills Tags using reusable Tag */}
            <div className="flex flex-wrap gap-2 mt-3">
              {displayedPreferredSkills.map((skill, idx) => (
                <Tag
                  key={idx}
                  label={skill}
                  variant="outline"
                  size="sm"
                  onRemove={
                    editingField === 'preferredSkills'
                      ? () => handleRemovePreferredSkill(idx)
                      : undefined
                  }
                />
              ))}
            </div>

            {/* Inline Add Skill Input */}
            {editingField === 'preferredSkills' && (
              <div className="mt-3 flex items-center gap-2 max-w-sm">
                <InputField
                  type="text"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && (e.preventDefault(), handleAddPreferredSkill())
                  }
                  placeholder="Type skill & press enter..."
                  className="!py-1.5 !text-xs"
                  wrapperClassName="flex-1"
                  autoFocus
                />
                <Button
                  type="button"
                  onClick={handleAddPreferredSkill}
                  label="Add"
                  className="!w-auto px-3 py-1.5 bg-[#0D2D54] text-white rounded-md text-xs font-medium cursor-pointer shrink-0"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Section 3: LOGISTICS ───────────────────────────────────── */}
      <div className="mb-8">
        <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-[#6B7280] mb-3">
          Logistics
        </h4>
        <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-xs">
          {/* Salary / Compensation (Clean container, no left red side stripe) */}
          <div
            className={`p-4 rounded-xl transition-colors ${
              !data.salaryCompensation ? 'bg-rose-50/40' : 'bg-white'
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className={`size-2 rounded-full shrink-0 ${
                    data.salaryCompensation ? 'bg-[#0D2D54]' : 'bg-rose-500'
                  }`}
                />
                <span className="font-sans font-bold text-sm text-[#111827]">
                  Salary / Compensation:
                </span>
                {data.salaryCompensation ? (
                  <span className="font-inter text-sm text-[#374151]">
                    {data.salaryCompensation}
                  </span>
                ) : (
                  <Tag label="Not found" variant="missing" size="sm" />
                )}
              </div>

              <Button
                type="button"
                onClick={() => setEditingField(editingField === 'salary' ? null : 'salary')}
                label={data.salaryCompensation ? 'Edit' : 'Add'}
                icon={
                  data.salaryCompensation ? (
                    <svg
                      className="size-3 text-[#0D2D54]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  ) : (
                    <span className="font-bold text-sm leading-none text-[#0D2D54]">+</span>
                  )
                }
                className="!w-auto px-3 py-1 bg-white border border-gray-300 hover:bg-gray-50 rounded-md text-xs font-semibold text-[#0D2D54] shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
              />
            </div>

            {!data.salaryCompensation && (
              <p className="font-inter text-xs text-rose-700 font-medium mt-1.5">
                Not found in document — adding salary increases applicant quality by 40%.
              </p>
            )}

            {/* Inline Salary Input */}
            {editingField === 'salary' && (
              <div className="mt-3 flex items-center gap-2 max-w-sm">
                <InputField
                  type="text"
                  value={editSalaryInput}
                  onChange={(e) => setEditSalaryInput(e.target.value)}
                  placeholder="e.g. $120,000 - $150,000 / year"
                  className="!py-1.5 !text-xs"
                  wrapperClassName="flex-1"
                  autoFocus
                />
                <Button
                  type="button"
                  onClick={handleSaveSalary}
                  label="Save"
                  className="!w-auto px-3 py-1.5 bg-[#0D2D54] text-white rounded-md text-xs font-medium cursor-pointer shrink-0"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom Action Navigation ──────────────────────────────── */}
      <div className="flex items-center justify-between pt-6 border-t border-[#E5E7EB]">
        <Button
          type="button"
          onClick={onBack}
          label="Back"
          className="!w-auto bg-white hover:bg-gray-50 text-[#374151] border border-[#D1D5DB] py-2.5 px-6 rounded-lg text-sm font-medium transition-colors cursor-pointer"
        />
        <Button
          type="button"
          onClick={onContinue}
          label="Continue"
          className="!w-auto bg-[#0D2D54] hover:opacity-90 text-white py-2.5 px-8 rounded-lg text-sm font-medium shadow-sm transition-opacity cursor-pointer"
        />
      </div>
    </div>
  )
}

export default JdConfidenceReview
