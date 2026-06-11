import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import Auth from './pages/Auth/Auth';
import VerifyEmail from './pages/Auth/VerifyEmail';
import GoogleCallback from './pages/Auth/GoogleCallback';
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
        {/* Google OAuth redirect lands here (path depends on backend's frontend redirect). */}
        <Route path="auth/callback" element={<GoogleCallback />} />
        <Route path="auth/google/callback" element={<GoogleCallback />} />
      </Route>
    </Routes>
  );
};

export default App;