import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import Auth from './pages/Auth/Auth';
import VerifyEmail from './pages/Auth/VerifyEmail';
import OnboardingPage from './pages/onboarding/Onboarding';
import OnboardingLayout from './layouts/OnboardingLayout';
// import Home from './pages/Home';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/signin" replace />} />
      </Route>
      
      <Route element={<AuthLayout />}>
        <Route path="signin" element={<Auth authState='signin' />} />
        <Route path="signup" element={<Auth authState='signup' />} />
        <Route path="verify-email" element={<VerifyEmail />} />
      </Route>

      <Route element={<OnboardingLayout />}>
        <Route path="onboarding" element={<OnboardingPage />} />
      </Route>
    </Routes>
  );
};

export default App;