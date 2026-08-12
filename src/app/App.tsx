import { Toaster } from 'sonner'
import AuthProvider from '@/features/auth/context/AuthProvider'
import { AppRouter } from '@/router'

const App = () => (
  <AuthProvider>
    <AppRouter />
    {/* App-wide, on-brand toast host for transient feedback (errors, confirmations). */}
    <Toaster
      position="top-center"
      richColors
      closeButton
      toastOptions={{ className: 'font-inter' }}
    />
  </AuthProvider>
)

export default App
