import { Navigate, Route, Routes } from 'react-router-dom'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'
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
import { GuestOnly, RequireAuth, RequireOnboarded, RequireOnboarding } from '@/router/guards'
import AuthLayout from '@/shared/layout/AuthLayout'
import MainLayout from '@/shared/layout/MainLayout'
import OnboardingLayout from '@/shared/layout/OnboardingLayout'

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/signin" replace />} />

      <Route element={<AuthLayout />}>
        <Route element={<GuestOnly />}>
          <Route path="signin" element={<SignInPage />} />
          <Route path="signup" element={<SignUpPage />} />
        </Route>
        <Route path="verify-email" element={<VerifyEmailPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route element={<RequireOnboarding />}>
          <Route element={<OnboardingLayout />}>
            <Route path="onboarding" element={<OnboardingPage />} />
          </Route>
        </Route>

        <Route element={<RequireOnboarded />}>
          <Route element={<MainLayout />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="assessment" element={<AssessmentPage />} />
            <Route path="interviews" element={<InterviewsPage />} />
            <Route path="candidates" element={<CandidatesPage />} />
            <Route path="jobs" element={<JobsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/signin" replace />} />
    </Routes>
  )
}
