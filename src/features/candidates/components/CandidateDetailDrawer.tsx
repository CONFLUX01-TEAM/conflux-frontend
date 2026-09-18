import React, { useState } from 'react'
import { toast } from 'sonner'
import Modal from '@/shared/ui/Modal'
import Button from '@/shared/ui/Button'
import Tag from '@/shared/ui/Tag'
import type {
  CandidateDetailData,
  CandidateTimelineEvent,
  PipelineStageKey,
} from '../types/candidates.types'
import NextStageModal from './NextStageModal'
import EmailPreviewView from './EmailPreviewView'
import RejectCandidatesModal from './RejectCandidatesModal'
import AdvanceCandidatesModal from './AdvanceCandidatesModal'

interface CandidateDetailDrawerProps {
  isOpen: boolean
  onClose: () => void
  candidate: CandidateDetailData | null
  onAdvance: (candidateId: string, nextStageKey?: string) => void
  onReject: (candidateId: string) => void
}

type TabKey = 'overview' | 'timeline' | 'communications' | 'notes' | 'files'

const STAGE_NEXT_MAP: Record<PipelineStageKey, { nextKey: PipelineStageKey; label: string }> = {
  applied: { nextKey: 'screening', label: 'Screening' },
  screening: { nextKey: 'assessment', label: 'Assessment' },
  assessment: { nextKey: 'interview', label: 'Interview' },
  interview: { nextKey: 'shortlisted', label: 'Shortlisted' },
  shortlisted: { nextKey: 'shortlisted', label: 'Offer' },
  rejected: { nextKey: 'screening', label: 'Screening' },
}

export const CandidateDetailDrawer: React.FC<CandidateDetailDrawerProps> = ({
  isOpen,
  onClose,
  candidate,
  onAdvance,
  onReject,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const [showNextStageModal, setShowNextStageModal] = useState(false)
  const [showEmailPreview, setShowEmailPreview] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showAdvanceModal, setShowAdvanceModal] = useState(false)
  const [isEditingNote, setIsEditingNote] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [newNoteInput, setNewNoteInput] = useState('')

  if (!candidate) return null

  const currentStageKey = (candidate.currentStageKey || 'applied') as PipelineStageKey
  const nextStageInfo = STAGE_NEXT_MAP[currentStageKey] || {
    nextKey: 'screening',
    label: 'Screening',
  }

  const handleCopyEmail = () => {
    if (candidate.email) {
      navigator.clipboard.writeText(candidate.email)
      toast.success('Email copied to clipboard')
    }
  }

  const handleAdvanceClick = () => {
    setShowNextStageModal(false)
    setShowAdvanceModal(true)
  }

  const handleConfirmAdvanceFromModal = () => {
    onAdvance(candidate.id, nextStageInfo.nextKey)
    onClose()
  }

  const handleConfirmDirectAdvance = () => {
    setShowNextStageModal(false)
    onAdvance(candidate.id, nextStageInfo.nextKey)
    onClose()
  }

  const handleOpenEmailPreview = () => {
    setShowNextStageModal(false)
    setShowEmailPreview(true)
  }

  const handleSendEmailAndAdvance = () => {
    setShowEmailPreview(false)
    onAdvance(candidate.id, nextStageInfo.nextKey)
    toast.success(`Sent status update email to ${candidate.email}`)
    onClose()
  }

  const handleRejectClick = () => {
    setShowNextStageModal(false)
    setShowEmailPreview(false)
    setShowRejectModal(true)
  }

  const handleConfirmReject = () => {
    onReject(candidate.id)
    onClose()
  }

  const currentRecruiterNote =
    noteText ||
    candidate.recruiterNotes?.text ||
    'Strong portfolio with excellent case studies. Great problem-solving approach. Schedule for portfolio deep dive in next round.'

  const candidateDetailsContent = (
    <div className="flex flex-col h-full bg-white relative">
      {/* 1. Header with Avatar, Name, ATS Match, and Close Button */}
      <div className="p-6 border-b border-[#F1F3F5] pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-full bg-[#DEE2E6] text-[#868E96] font-semibold text-lg flex items-center justify-center shrink-0 select-none">
              {candidate.initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#868E96] font-inter leading-tight">
                {candidate.roleTitle || 'Senior Product Designer'}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <h3 className="text-lg sm:text-xl font-bold text-[#111827] font-sans truncate">
                  {candidate.name}
                </h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#DEEBFA] text-[#1C61B6] text-xs font-semibold font-sans">
                  {candidate.atsScore}%
                </span>
                <span className="text-[11px] font-inter text-[#6B7280]">ATS Match</span>
              </div>
              <p className="text-xs text-[#868E96] font-inter mt-1">
                {candidate.appliedTimeAgo || 'Applied 2 days ago (Jul 16, 2024)'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-full hover:bg-gray-100 cursor-pointer ${
              showEmailPreview ? 'md:hidden' : ''
            }`}
            aria-label="Close drawer"
          >
            <img src="/x-icon.svg" alt="" className="size-3.5" />
          </button>
        </div>

        {/* Candidate Quick Contact Bar */}
        <div className="mt-4 space-y-1.5 text-xs text-[#495057] font-inter">
          {/* Email */}
          <div className="flex items-center gap-2">
            <svg
              className="size-3.5 text-[#868E96] shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            <span className="text-[#1C61B6]">{candidate.email || 'aisha.rahman@email.com'}</span>
            <button
              type="button"
              onClick={handleCopyEmail}
              className="text-[#868E96] hover:text-[#1C61B6] transition-colors p-0.5 cursor-pointer"
              title="Copy email"
            >
              <svg
                className="size-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
            </button>
          </div>

          {/* Phone */}
          <div className="flex items-center gap-2">
            <svg
              className="size-3.5 text-[#868E96] shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span>{candidate.phone || '+1 (415) 555-0198'}</span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2">
            <svg
              className="size-3.5 text-[#868E96] shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>{candidate.location || 'San Francisco, CA'}</span>
          </div>

          {/* Resume & Portfolio links */}
          <div className="flex items-center gap-4 pt-1">
            <a
              href={candidate.resumeUrl || '#'}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-[#1C61B6] hover:underline"
            >
              <img src="/Candidate-icon/file-icon.svg" alt="" className="size-3.5 opacity-75" />
              <span>View Resume</span>
              <svg
                className="size-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>

            <a
              href={candidate.portfolioUrl || '#'}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-[#1C61B6] hover:underline"
            >
              <span>Portfolio</span>
              <svg
                className="size-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-6 px-6 border-b border-[#F1F3F5] text-xs font-medium font-inter">
        {(['overview', 'timeline', 'communications', 'notes', 'files'] as TabKey[]).map(
          (tabKey) => {
            const isActive = activeTab === tabKey
            const label = tabKey.charAt(0).toUpperCase() + tabKey.slice(1)
            return (
              <button
                key={tabKey}
                type="button"
                onClick={() => setActiveTab(tabKey)}
                className={`py-3 transition-colors relative cursor-pointer ${
                  isActive
                    ? 'text-[#1C61B6] font-semibold border-b-2 border-[#1C61B6]'
                    : 'text-[#868E96] hover:text-[#212529]'
                }`}
              >
                {label}
              </button>
            )
          },
        )}
      </div>

      {/* 3. Main Scrollable Tab Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
        {/* ── Overview Tab ── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Skills */}
            <div>
              <h4 className="text-xs font-bold text-[#111827] tracking-wider uppercase mb-2.5 font-sans">
                Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {(
                  candidate.skills || [
                    'Product Design',
                    'UI/UX',
                    'Figma',
                    'User Research',
                    'Prototyping',
                    '+4',
                  ]
                ).map((skill) => (
                  <Tag
                    key={skill}
                    label={skill}
                    variant="required"
                    rounded="xl"
                    size="md"
                    className="bg-[#F8F9FA] border border-[#E9ECEF] text-[#495057] font-medium"
                  />
                ))}
              </div>
            </div>

            {/* Timeline Stepper */}
            <div>
              <h4 className="text-xs font-bold text-[#111827] tracking-wider uppercase mb-3.5 font-sans">
                Timeline
              </h4>
              <div className="relative pl-6 space-y-6">
                {/* Vertical connecting bar */}
                <div className="absolute left-2.5 top-2.5 bottom-2.5 w-0.5 bg-[#DEE2E6]" />

                {(candidate.timeline || []).map((event: CandidateTimelineEvent, idx: number) => {
                  const isLast = idx === (candidate.timeline?.length || 0) - 1
                  return (
                    <div key={event.id || idx} className="relative flex items-start gap-3">
                      {/* Dot / Indicator */}
                      <div
                        className={`absolute -left-6 top-0.5 size-5 rounded-full flex items-center justify-center bg-white ${
                          isLast ? 'border-2 border-[#1C61B6]' : 'border-2 border-[#3C86E1]'
                        }`}
                      >
                        <span
                          className={`size-2 rounded-full ${
                            isLast ? 'bg-[#1C61B6]' : 'bg-[#3C86E1]'
                          }`}
                        />
                      </div>

                      <div className="min-w-0">
                        <h5
                          className={`text-xs font-sans ${
                            isLast ? 'font-bold text-[#1C61B6]' : 'font-semibold text-[#212529]'
                          }`}
                        >
                          {event.title}
                        </h5>
                        {event.stageName && (
                          <p className="text-xs font-medium text-[#495057] font-inter">
                            {event.stageName}
                          </p>
                        )}
                        {event.timestamp && (
                          <p className="text-[11px] text-[#868E96] font-inter mt-0.5">
                            {event.timestamp}
                          </p>
                        )}
                        {event.score && (
                          <p className="text-[11px] text-[#868E96] font-inter mt-0.5">
                            {event.score}
                          </p>
                        )}
                        {event.durationInStage && (
                          <p className="text-[11px] text-[#868E96] font-inter mt-0.5">
                            {event.durationInStage}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Recruiter Notes */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-[#111827] tracking-wider uppercase font-sans">
                  Recruiter Notes
                </h4>
              </div>

              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 text-xs text-[#334155] leading-relaxed font-inter">
                {isEditingNote ? (
                  <div className="space-y-3">
                    <textarea
                      rows={3}
                      value={noteText || currentRecruiterNote}
                      onChange={(e) => setNoteText(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#1C61B6]"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        onClick={() => setIsEditingNote(false)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 px-3 rounded-lg text-xs w-auto"
                        label="Cancel"
                      />
                      <Button
                        onClick={() => {
                          setIsEditingNote(false)
                          toast.success('Note updated')
                        }}
                        className="bg-[#0D2D54] hover:bg-[#0A2342] text-white py-1.5 px-3 rounded-lg text-xs w-auto"
                        label="Save"
                      />
                    </div>
                  </div>
                ) : (
                  <p>{currentRecruiterNote}</p>
                )}
              </div>

              <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-[#868E96] font-inter">
                <span>{candidate.recruiterNotes?.timeAgo || '2 days ago by Maya Johnson'}</span>
                {!isEditingNote && (
                  <button
                    type="button"
                    onClick={() => setIsEditingNote(true)}
                    className="text-[#868E96] hover:text-[#1C61B6] transition-colors cursor-pointer p-0.5"
                    aria-label="Edit note"
                  >
                    <svg
                      className="size-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Timeline Tab ── */}
        {activeTab === 'timeline' && (
          <div className="space-y-5">
            <h4 className="text-xs font-bold text-[#111827] tracking-wider uppercase font-sans">
              Timeline
            </h4>
            <div className="relative pl-6 space-y-6">
              <div className="absolute left-2.5 top-2.5 bottom-2.5 w-0.5 bg-[#DEE2E6]" />

              {(candidate.timeline || []).map((event, idx) => {
                const isLast = idx === (candidate.timeline?.length || 0) - 1
                return (
                  <div key={event.id || idx} className="relative flex items-start gap-3">
                    <div
                      className={`absolute -left-6 top-0.5 size-5 rounded-full flex items-center justify-center bg-white ${
                        isLast ? 'border-2 border-[#1C61B6]' : 'border-2 border-[#3C86E1]'
                      }`}
                    >
                      <span
                        className={`size-2 rounded-full ${
                          isLast ? 'bg-[#1C61B6]' : 'bg-[#3C86E1]'
                        }`}
                      />
                    </div>

                    <div className="min-w-0">
                      <h5
                        className={`text-xs font-sans ${
                          isLast ? 'font-bold text-[#1C61B6]' : 'font-semibold text-[#212529]'
                        }`}
                      >
                        {event.title}
                      </h5>
                      {event.stageName && (
                        <p className="text-xs font-medium text-[#495057] font-inter">
                          {event.stageName}
                        </p>
                      )}
                      {event.timestamp && (
                        <p className="text-[11px] text-[#868E96] font-inter mt-0.5">
                          {event.timestamp}
                        </p>
                      )}
                      {event.score && (
                        <p className="text-[11px] text-[#868E96] font-inter mt-0.5">
                          {event.score}
                        </p>
                      )}
                      {event.durationInStage && (
                        <p className="text-[11px] text-[#868E96] font-inter mt-0.5">
                          {event.durationInStage}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Communications Tab ── */}
        {activeTab === 'communications' && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-[#111827] tracking-wider uppercase font-sans">
              Communication Thread
            </h4>

            <div className="space-y-2.5">
              {(
                candidate.communications || [
                  {
                    id: 'c-1',
                    title: 'Screening Invitation',
                    timestamp: 'Jul 16, 2024 • 9:38 AM',
                    status: 'Delivered',
                  },
                  {
                    id: 'c-2',
                    title: 'Assessment Invitation',
                    timestamp: 'Jul 16, 2024 • 9:38 AM',
                    status: 'Delivered',
                  },
                  {
                    id: 'c-3',
                    title: 'Assessment Invitation',
                    timestamp: 'Jul 18, 2024 • 9:38 AM',
                    status: 'Delivered',
                  },
                ]
              ).map((comm) => (
                <div
                  key={comm.id}
                  className="bg-white rounded-xl border border-[#F1F3F5] hover:border-slate-300 p-4 shadow-2xs flex items-center justify-between"
                >
                  <div>
                    <h5 className="text-xs font-bold text-[#212529] font-sans">{comm.title}</h5>
                    <p className="text-[11px] text-[#868E96] font-inter mt-0.5">{comm.timestamp}</p>
                  </div>
                  <span className="text-[11px] font-semibold text-[#0D2D54] font-inter">
                    {comm.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Notes Tab ── */}
        {activeTab === 'notes' && (
          <div className="space-y-5">
            <h4 className="text-xs font-bold text-[#111827] tracking-wider uppercase font-sans">
              Recruiter Notes
            </h4>

            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 text-xs text-[#334155] leading-relaxed font-inter">
              <p>{currentRecruiterNote}</p>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#868E96] font-inter">
              <span>{candidate.recruiterNotes?.timeAgo || '2 days ago by Maya Johnson'}</span>
            </div>

            {/* Add new note section */}
            <div className="pt-4 border-t border-[#F1F3F5] space-y-2.5">
              <h5 className="text-xs font-semibold text-[#212529] font-sans">Add a quick note</h5>
              <textarea
                rows={3}
                placeholder="Write an internal observation or update..."
                value={newNoteInput}
                onChange={(e) => setNewNoteInput(e.target.value)}
                className="w-full bg-white border border-[#DEE2E6] rounded-xl p-3 text-xs text-[#111827] placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#1C61B6]"
              />
              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    if (!newNoteInput.trim()) return
                    setNoteText(newNoteInput)
                    setNewNoteInput('')
                    toast.success('Note added successfully')
                  }}
                  className="bg-[#0D2D54] hover:bg-[#0A2342] text-white py-2 px-4 rounded-lg text-xs font-medium w-auto"
                  label="Post Note"
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Files Tab ── */}
        {activeTab === 'files' && (
          <div className="space-y-6">
            {/* Skills tags */}
            <div>
              <h4 className="text-xs font-bold text-[#111827] tracking-wider uppercase mb-2.5 font-sans">
                Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {(
                  candidate.skills || [
                    'Product Design',
                    'UI/UX',
                    'Figma',
                    'User Research',
                    'Prototyping',
                    '+4',
                  ]
                ).map((skill) => (
                  <Tag
                    key={skill}
                    label={skill}
                    variant="required"
                    rounded="xl"
                    size="md"
                    className="bg-[#F8F9FA] border border-[#E9ECEF] text-[#495057] font-medium"
                  />
                ))}
              </div>
            </div>

            {/* Uploaded Files */}
            <div>
              <h4 className="text-xs font-bold text-[#111827] tracking-wider uppercase mb-3 font-sans">
                Uploaded Files
              </h4>
              <div className="space-y-2.5">
                {(
                  candidate.uploadedFiles || [
                    { id: 'f-1', name: 'Aisha_Rahman_Resume.pdf', type: 'PDF', size: '245KB' },
                    { id: 'f-2', name: 'Portfolio_Aisha_Rahman.pdf', type: 'PDF', size: '245KB' },
                    { id: 'f-3', name: 'Cover letter.pdf', type: 'PDF', size: '245KB' },
                  ]
                ).map((file) => (
                  <div
                    key={file.id}
                    className="bg-white rounded-xl border border-[#F1F3F5] hover:border-slate-300 p-3.5 shadow-2xs flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src="/Candidate-icon/pdf-icon.svg"
                        alt="PDF"
                        className="size-8 shrink-0 select-none"
                      />
                      <div className="min-w-0">
                        <h5 className="text-xs font-semibold text-[#212529] font-sans truncate">
                          {file.name}
                        </h5>
                        <p className="text-[11px] text-[#868E96] font-inter">
                          {file.type} • {file.size}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toast.success(`Downloading ${file.name}`)}
                      className="p-1.5 text-[#6B7280] hover:text-[#0D2D54] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0"
                      title="Download file"
                    >
                      <svg
                        className="size-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Other Information */}
            <div>
              <h4 className="text-xs font-bold text-[#111827] tracking-wider uppercase mb-3 font-sans">
                Other Information
              </h4>
              <div className="space-y-2.5">
                {/* Linkedin */}
                <div className="bg-white rounded-xl border border-[#F1F3F5] p-3.5 shadow-2xs">
                  <p className="text-xs font-bold text-[#212529] font-sans">Linkedin profile</p>
                  <a
                    href={`https://${candidate.linkedinUrl || 'linkedin.com/in/aisharaman'}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-[#1C61B6] hover:underline mt-1 font-inter"
                  >
                    <span>{candidate.linkedinUrl || 'linkedin.com/in/aisharaman'}</span>
                    <svg
                      className="size-3"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                </div>

                {/* Portfolio */}
                <div className="bg-white rounded-xl border border-[#F1F3F5] p-3.5 shadow-2xs">
                  <p className="text-xs font-bold text-[#212529] font-sans">Portfolio website</p>
                  <a
                    href={`https://${candidate.portfolioWebsiteUrl || 'portfolio.aisharahman.design'}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-[#1C61B6] hover:underline mt-1 font-inter"
                  >
                    <span>{candidate.portfolioWebsiteUrl || 'portfolio.aisharahman.design'}</span>
                    <svg
                      className="size-3"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Next Stage Modal Popover */}
      <NextStageModal
        isOpen={showNextStageModal}
        onClose={() => setShowNextStageModal(false)}
        stageName={nextStageInfo.label}
        onPreviewEmail={handleOpenEmailPreview}
        onConfirmAdvance={handleConfirmDirectAdvance}
      />

      {/* 5. Sticky Bottom Action Bar */}
      <div className="p-4 sm:p-5 border-t border-[#F1F3F5] bg-white flex items-center gap-3">
        {/* Split Button: Advance Stage + Dropdown Toggle */}
        <div className="flex-1 flex items-stretch h-11 sm:h-12 rounded-xl overflow-hidden shadow-2xs">
          <Button
            onClick={handleAdvanceClick}
            className="bg-[#0D2D54] hover:bg-[#0A2342] text-white rounded-none h-full py-0 text-xs sm:text-sm font-semibold font-inter flex-1"
            icon={
              <svg
                className="size-4 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="7 7 17 7 17 17" />
              </svg>
            }
            label="Advance stage"
          />
          <button
            type="button"
            onClick={() => setShowNextStageModal((prev) => !prev)}
            className="bg-[#0D2D54] hover:bg-[#0A2342] border-l border-white/20 text-white rounded-none h-full px-3.5 transition-colors cursor-pointer flex items-center justify-center shrink-0"
            aria-label="Toggle stage advance options"
          >
            <svg
              className="size-4 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>

        {/* Reject Candidates Button */}
        <Button
          onClick={handleRejectClick}
          className="bg-white hover:bg-rose-50/50 text-[#FC2424] border border-[#F87171] rounded-xl h-11 sm:h-12 py-0 text-xs sm:text-sm font-semibold font-inter shadow-2xs flex-1"
          icon={
            <svg
              className="size-3.5 text-[#FC2424]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          }
          label="Reject candidates"
        />
      </div>
    </div>
  )

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        position="custom"
        showCloseButton={false}
        className={`fixed inset-y-0 right-0 h-screen w-full bg-white z-[9999] shadow-2xl flex overflow-hidden animate-in slide-in-from-right duration-300 transition-all ${
          showEmailPreview
            ? 'max-w-[520px] md:max-w-[980px] lg:max-w-[1040px] flex-col md:flex-row'
            : 'max-w-[520px] flex-col'
        }`}
      >
        {showEmailPreview ? (
          <>
            {/* Left panel: Candidate Details (visible on desktop) */}
            <div className="hidden md:flex flex-col h-full w-[480px] lg:w-[500px] shrink-0 border-r border-[#F1F3F5] relative bg-white overflow-hidden">
              {candidateDetailsContent}
            </div>

            {/* Right panel: Email Preview (full-width on small screens, side-by-side on desktop) */}
            <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
              <EmailPreviewView
                candidate={candidate}
                stageName={nextStageInfo.label}
                onBack={() => setShowEmailPreview(false)}
                onClose={onClose}
                onSendAndAdvance={handleSendEmailAndAdvance}
              />
            </div>
          </>
        ) : (
          <div className="flex flex-col h-full w-full bg-white relative overflow-hidden">
            {candidateDetailsContent}
          </div>
        )}
      </Modal>

      {/* Advance Candidate Confirmation & Processing Modal */}
      <AdvanceCandidatesModal
        isOpen={showAdvanceModal}
        onClose={() => setShowAdvanceModal(false)}
        candidateCount={1}
        sourceStageName={currentStageKey}
        targetStageName={nextStageInfo.label}
        onConfirm={handleConfirmAdvanceFromModal}
      />

      {/* Reject Candidate Confirmation & Processing Modal */}
      <RejectCandidatesModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        candidateCount={1}
        sourceStageName={candidate.currentStageKey || 'Applied'}
        onConfirm={handleConfirmReject}
      />
    </>
  )
}

export default CandidateDetailDrawer
