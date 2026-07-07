import { Navigate, Route, Routes } from 'react-router-dom'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'
import SignInPage from '@/pages/auth/SignInPage'
import SignUpPage from '@/pages/auth/SignUpPage'
import VerifyEmailPage from '@/pages/auth/VerifyEmailPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import OnboardingPage from '@/pages/onboarding/OnboardingPage'
import { GuestOnly, RequireAuth, RequireOnboarded, RequireOnboarding } from '@/router/guards'
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
          <Route path="dashboard" element={<MainLayout />}>
            <Route index element={<DashboardPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/signin" replace />} />
    </Routes>
  )
}
