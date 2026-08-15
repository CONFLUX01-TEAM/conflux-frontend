import type { ReactNode } from 'react'

/**
 * Two-column auth shell (brand illustration + bordered card) matching the
 * sign-in/verify-email pages. Content is vertically centred in the card.
 */
const AuthPanel = ({ children }: { children: ReactNode }) => (
  <div className="w-full max-w-[1600px] mx-auto min-w-0">
    <div className="w-full flex flex-col xl:grid xl:grid-cols-2 gap-6 xl:gap-8 2xl:gap-12 min-w-0 xl:items-stretch">
      <div className="hidden xl:block h-full min-h-0 xl:min-h-[58.25rem]">
        <div className="h-full w-full max-w-[44.75rem] xl:min-h-[58.25rem] rounded-xl overflow-hidden bg-[#0D2D54]">
          <img
            src="/auth-img.svg"
            alt="Conflux Hiring illustration"
            className="h-full w-full object-contain"
          />
        </div>
      </div>

      <div className="flex flex-col w-full max-w-[42rem] mx-auto xl:mx-0 xl:max-w-none 2xl:max-w-[42rem] h-full xl:min-h-[58.25rem] rounded-[0.94rem] py-6 sm:py-8 px-4 sm:px-8 lg:px-12 xl:px-10 2xl:px-[97px] border-[0.06rem] border-[#E6E6E6] justify-center">
        {children}
      </div>
    </div>
  </div>
)

export default AuthPanel
