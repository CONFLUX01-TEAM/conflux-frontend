import type { ReactNode } from 'react'

interface AuthNoticeProps {
  kind?: 'error' | 'info' | 'success'
  children: ReactNode
}

const STYLES: Record<NonNullable<AuthNoticeProps['kind']>, string> = {
  error: 'border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]',
  info: 'border-[#0D2D54]/20 bg-[#0D2D54]/[0.06] text-[#0D2D54]',
  success: 'border-[#0D2D54]/20 bg-[#0D2D54]/[0.06] text-[#0D2D54]',
}

/** Inline banner for form-level feedback (errors, notices, confirmations). */
const AuthNotice = ({ kind = 'info', children }: AuthNoticeProps) => (
  <div
    role={kind === 'error' ? 'alert' : 'status'}
    className={`mt-4 rounded-[0.5rem] border-[0.06rem] px-4 py-3.5 font-inter text-[0.88rem] font-medium leading-relaxed text-center ${STYLES[kind]}`}
  >
    {children}
  </div>
)

export default AuthNotice
