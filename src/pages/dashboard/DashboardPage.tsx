import { useState } from 'react'
import { useAuth } from '@/features/auth'
import Button from '@/shared/ui/Button'
import Spinner from '@/shared/ui/Spinner'

const DashboardPage = () => {
  const { user, signOut } = useAuth()
  const [signingOut, setSigningOut] = useState(false)

  const handleLogout = async () => {
    if (signingOut) return
    setSigningOut(true)
    // signOut ends the session and routes to /signin, so no state reset needed.
    await signOut()
  }

  return (
    <div className="flex flex-col items-center justify-center text-center gap-4 py-12">
      <h1 className="font-sans text-2xl sm:text-3xl text-[#222222] font-medium">
        Welcome{user?.fullName ? `, ${user.fullName}` : ''} 🎉
      </h1>
      <p className="font-inter text-base text-[#9D9D9D]">You're signed in.</p>
      <Button
        type="button"
        disabled={signingOut}
        icon={
          signingOut ? (
            <Spinner className="text-white h-4 w-4" wrapperClassName="bg-transparent p-0" />
          ) : undefined
        }
        label={signingOut ? 'Signing out…' : 'Log out'}
        onClick={handleLogout}
        className={`mt-2 bg-[#0D2D54] text-white rounded-[0.5rem] py-3 px-8 font-inter text-base font-medium ${signingOut ? 'opacity-80 cursor-wait' : ''}`}
      />
    </div>
  )
}

export default DashboardPage
