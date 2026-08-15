import type { ReactNode } from 'react'

interface AuthNoticeProps {
  kind?: 'error' | 'info' | 'success'
  children: ReactNode
}

const STYLES: Record<NonNullable<AuthNoticeProps['kind']>, string> = {
  error: 'border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]',
  info: 'border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]',
  success: 'border-[#A7F3D0] bg-[#ECFDF5] text-[#047857]',
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
