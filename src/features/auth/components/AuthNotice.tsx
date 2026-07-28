import type { ReactNode } from 'react'

interface AuthNoticeProps {
  kind?: 'error' | 'info' | 'success'
  children: ReactNode
}

// Same palette the toasts use (see `index.css`) so inline and floating
// feedback read as one component in two positions.
const STYLES: Record<NonNullable<AuthNoticeProps['kind']>, string> = {
  error: 'border-notice-error-line bg-notice-error-surface text-notice-error',
  info: 'border-notice-info-line bg-notice-info-surface text-notice-info',
  success: 'border-notice-success-line bg-notice-success-surface text-notice-success',
}

/** Inline banner for form-level feedback (errors, notices, confirmations). */
const AuthNotice = ({ kind = 'info', children }: AuthNoticeProps) => (
  <div
    role={kind === 'error' ? 'alert' : 'status'}
    className={`mt-4 rounded-[0.5rem] border-[0.06rem] px-4 py-3 font-inter text-[0.88rem] leading-relaxed ${STYLES[kind]}`}
  >
    {children}
  </div>
)

export default AuthNotice
