import { Toaster } from 'sonner'
import Spinner from '@/shared/ui/Spinner'

/**
 * Hairline glyph on a circle — the same 1px outline language as the auth
 * inputs and OTP boxes. Drawn in `currentColor` so each toast tints its icon
 * from the palette in `index.css` rather than shipping its own colour.
 */
const NoticeIcon = ({ d }: { d: string }) => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-full w-full"
    aria-hidden
  >
    <circle cx="10" cy="10" r="8.25" />
    <path d={d} />
  </svg>
)

const CHECK = 'm6.5 10.25 2.4 2.4 4.6-5.05'
const BANG = 'M10 5.9v4.7M10 13.75h.01'
const INFO = 'M10 9.4v4.7M10 6.25h.01'

/** App-wide toast host, themed to match the auth/onboarding surfaces. */
const ToastHost = () => (
  <Toaster
    position="bottom-right"
    closeButton
    duration={5000}
    offset="1.5rem"
    icons={{
      success: <NoticeIcon d={CHECK} />,
      error: <NoticeIcon d={BANG} />,
      warning: <NoticeIcon d={BANG} />,
      info: <NoticeIcon d={INFO} />,
      loading: <Spinner size="sm" className="text-current" />,
    }}
    toastOptions={{ className: 'font-inter' }}
  />
)

export default ToastHost
