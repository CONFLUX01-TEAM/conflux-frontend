import { useState } from 'react'
import { useParams } from 'react-router-dom'
import Button from '@/shared/ui/Button'
import JobDetails from './JobDetails'
import type { JobDetailsData } from './JobDetails'
import ApplicationForm from './ApplicationForm'
import Navbar from './Navbar'

const JOB_DATA: Record<string, JobDetailsData> = {
  'STPM-009': {
    title: 'Backend Engineer',
    company: 'Uber Eats',
    location: 'Remote',
    locationType: 'Full-time',
    salary: '$170,000 - $250,000',
    deadline: '09/08/2026',
    logoText: 'Uber and and testing for breaking the code ',
    logoBg: '#000000',
    about: [
      "We're looking for a passionate Software Engineer to build scalable, reliable and user friendly products.",
      'You will work with a talented team to design, build and ship software that makes a real impact.',
      'Build and maintain scalable web applications.',
      'Write clean, efficient and testable code.',
      'Collaborate with cross functional teams.',
      'Participate in code reviews and tech discussions.',
    ],
    requirements: [
      '5+ years of professional software experience.',
      'Strong proficiency in Java and Typescript.',
      'Knowledge of databases (SQL and NoSQL).',
      'Good knowledge of Git and CI/CD.',
    ],
    nextSteps: [
      'Submit your application with your CV and details.',
      'Our AI screening engine reviews your skills and credentials.',
      'Shortlisted candidates will receive a technical assessment invite.',
      'Final rounds will include code pairing and system design interviews.',
    ],
  },
}

const CandidateApplicationPage = () => {
  const { jobId } = useParams<{ jobId: string }>()
  const job = JOB_DATA[jobId || 'STPM-009'] || JOB_DATA['STPM-009']

  const [isSubmitted, setIsSubmitted] = useState(false)
  const isClosed = false // Preview toggle

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between font-sans">
        {/* Public Navbar */}
        <div className="max-w-[1400px] w-full mx-auto px-8 sm:px-16 pt-10">
          <Navbar />
        </div>

        {/* Success Content */}
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="bg-white border border-[#E2E8F0] rounded-xl max-w-lg w-full p-8 sm:p-12 shadow-sm text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-6">
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-black mb-3">Application Submitted!</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-8">
              Thank you for applying for the <strong>{job.title}</strong> position at{' '}
              <strong>{job.company}</strong>. Our automated screening team will review your CV
              shortly. You will receive an email update soon.
            </p>
            <Button
              type="button"
              onClick={() => {
                window.location.href = 'https://hiring-ai-lp.vercel.app'
              }}
              className="bg-[#0D2D54] hover:bg-[#0A2647] text-white py-3 px-8 rounded-lg font-medium text-sm w-full transition-colors cursor-pointer"
              label="Go back to Conflux"
            />
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-[#E2E8F0] py-6 text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} Conflux. All rights reserved.
        </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-black relative">
      {/* <Toaster position="top-right" richColors /> */}

      {/* Preview toggle indicator bar */}
      {/* <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 flex items-center justify-between text-xs text-amber-800">
        <span><strong>Preview Controls:</strong> Toggle job state to view alternate layouts.</span>
        <button
          onClick={() => setIsClosed((prev) => !prev)}
          className="bg-amber-600 hover:bg-amber-700 text-white font-medium px-3 py-1 rounded transition-colors cursor-pointer"
        >
          Toggle: {isClosed ? 'Open Application' : 'Close Application'}
        </button>
      </div> */}

      {/* Public Navbar */}
      <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-8 lg:px-16 pt-3 sm:pt-6 lg:pt-10">
        <Navbar />
      </div>

      {/* Content Container */}
      <main className="max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-10 w-full flex-1">
        <div className="flex flex-col lg:grid lg:grid-cols-[548fr_715fr] gap-4 sm:gap-6 lg:gap-8 items-start">
          <JobDetails job={job} />
          <ApplicationForm isClosed={isClosed} onSubmitSuccess={() => setIsSubmitted(true)} />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E2E8F0] py-8 text-center text-xs text-gray-500 mt-12">
        &copy; {new Date().getFullYear()} Conflux. All rights reserved.
      </footer>
    </div>
  )
}

export default CandidateApplicationPage
export { CandidateApplicationPage as JobSharePage }
