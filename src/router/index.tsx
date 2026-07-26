import { Navigate, Route, Routes } from 'react-router-dom'
import GoogleCallbackPage from '@/pages/auth/GoogleCallbackPage'
import SignInPage from '@/pages/auth/SignInPage'
import SignUpPage from '@/pages/auth/SignUpPage'
import VerifyEmailPage from '@/pages/auth/VerifyEmailPage'
import AssessmentPage from '@/pages/assessment/AssessmentPage'
import CandidatesPage from '@/pages/candidates/CandidatesPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import InterviewsPage from '@/pages/interviews/InterviewsPage'
import OnboardingPage from '@/pages/onboarding/OnboardingPage'
import JobsPage from '@/pages/jobs/JobsPage'
import SettingsPage from '@/pages/settings/SettingsPage'
import AuthLayout from '@/shared/layout/AuthLayout'
import MainLayout from '@/shared/layout/MainLayout'
import OnboardingLayout from '@/shared/layout/OnboardingLayout'

export const AppRouter = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Navigate to="/signin" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="assessment" element={<AssessmentPage />} />
        <Route path="interviews" element={<InterviewsPage />} />
        <Route path="candidates" element={<CandidatesPage />} />
        <Route path="jobs" element={<JobsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="signin" element={<SignInPage />} />
        <Route path="signup" element={<SignUpPage />} />
        <Route path="verify-email" element={<VerifyEmailPage />} />
        <Route path="auth/callback" element={<GoogleCallbackPage />} />
        <Route path="auth/google/callback" element={<GoogleCallbackPage />} />
      </Route>

      <Route element={<OnboardingLayout />}>
        <Route path="onboarding" element={<OnboardingPage />} />
      </Route>
    </Routes>
  )
}
