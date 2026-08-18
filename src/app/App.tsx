import { Toaster } from 'sonner'
import AuthProvider from '@/features/auth/context/AuthProvider'
import { AppRouter } from '@/router'

const App = () => (
  <AuthProvider>
    <AppRouter />
    {/* App-wide, on-brand toast host for transient feedback styled with the brand navy #0D2D54 */}
    <Toaster
      position="top-right"
      toastOptions={{
        className: 'font-inter',
        style: {
          backgroundColor: '#0D2D54',
          color: '#FFFFFF',
          borderColor: 'rgba(255, 255, 255, 0.15)',
        },
        classNames: {
          toast: '!bg-[#0D2D54] !text-white !border-white/15 !shadow-xl !rounded-[0.5rem]',
          title: '!text-white font-medium',
          description: '!text-white/80',
          actionButton: '!bg-white !text-[#0D2D54] font-medium hover:!bg-white/90',
          cancelButton: '!bg-white/10 !text-white hover:!bg-white/20',
        },
      }}
    />
  </AuthProvider>
)

export default App
