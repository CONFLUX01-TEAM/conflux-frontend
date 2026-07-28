import AuthProvider from '@/features/auth/context/AuthProvider'
import { AppRouter } from '@/router'
import ToastHost from '@/shared/ui/ToastHost'

const App = () => (
  <AuthProvider>
    <AppRouter />
    {/* App-wide, on-brand toast host for transient feedback (errors, confirmations). */}
    <ToastHost />
  </AuthProvider>
)

export default App
