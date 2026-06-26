import { Navigate, Route, Routes } from 'react-router-dom'
import GoogleCallbackPage from '@/pages/auth/GoogleCallbackPage'
import SignInPage from '@/pages/auth/SignInPage'
import SignUpPage from '@/pages/auth/SignUpPage'
import VerifyEmailPage from '@/pages/auth/VerifyEmailPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import OnboardingPage from '@/pages/onboarding/OnboardingPage'
import AuthLayout from '@/shared/layout/AuthLayout'
import MainLayout from '@/shared/layout/MainLayout'
import OnboardingLayout from '@/shared/layout/OnboardingLayout'

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/signin" replace />} />
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

      <Route path="dashboard" element={<MainLayout />}>
        <Route index element={<DashboardPage />} />
      </Route>
    </Routes>
  )
}
