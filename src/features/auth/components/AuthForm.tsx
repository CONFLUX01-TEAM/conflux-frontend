import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { AuthFormProps } from '@/features/auth/types'
import { validateAuthForm } from '@/lib/validation'
import { startGoogleLogin } from '@/services/auth.service'
import Button from '@/shared/ui/Button'
import InputField from '@/shared/ui/InputField'

const AuthForm = ({ authState }: AuthFormProps) => {
  const navigate = useNavigate()
  const isSignIn = authState === 'signin'

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleGoogleLogin = () => {
    setGoogleLoading(true)
    startGoogleLogin()
  }

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' })
    }
  }

  const validate = () => {
    const newErrors = validateAuthForm(formData, isSignIn)
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleForm = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      if (!isSignIn) {
        navigate('/verify-email')
      } else {
        console.log('Sign in successful', formData)
        alert('Sign in successful! (Dashboard coming soon)')
        setFormData({ fullName: '', email: '', password: '', confirmPassword: '' })
      }
    }
  }

  return (
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

        <div className="flex flex-col w-full max-w-[42rem] mx-auto xl:mx-0 xl:max-w-none 2xl:max-w-[42rem] h-full xl:min-h-[58.25rem] rounded-[0.94rem] py-6 sm:py-8 px-4 sm:px-8 lg:px-12 xl:px-10 2xl:px-[97px] border-[0.06rem] border-[#E6E6E6]">
          <div>
            <h1 className="font-sans text-2xl sm:text-[2.5rem] md:text-[3rem] text-[#222222] font-medium leading-tight">
              Welcome to Conflux Hiring
            </h1>
            <p className="font-inter text-base sm:text-lg md:text-[1.25rem] text-[#9D9D9D] mt-2">
              Start your experience with signing in or signing up
            </p>
          </div>

          <div className="mt-6 sm:mt-8 mb-4 sm:mb-6 p-1.5 sm:p-2 flex justify-center gap-2 sm:gap-4 md:gap-8 2xl:gap-[5.63rem] border-[0.06rem] border-[#E6E6E6] rounded-[0.5rem]">
            <Button
              type="button"
              label="Sign Up"
              onClick={() => navigate('/signup')}
              className={`flex-1 !w-auto font-inter font-regular text-sm md:text-base py-3 px-4 sm:px-8 2xl:px-[4.03rem] rounded-[0.5rem] border-[0.06rem] border-[#E6E6E6] cursor-pointer transition-all duration-300 ease-in-out whitespace-nowrap ${!isSignIn ? 'text-black bg-[#E7EAEE]' : 'text-[#9D9D9D] hover:text-black bg-transparent'}`}
            />
            <Button
              type="button"
              label="Sign In"
              onClick={() => navigate('/signin')}
              className={`flex-1 !w-auto font-inter font-regular text-sm md:text-base py-3 px-4 sm:px-8 2xl:px-[4.03rem] rounded-[0.5rem] border-[0.06rem] border-[#E6E6E6] cursor-pointer transition-all duration-300 ease-in-out whitespace-nowrap ${isSignIn ? 'text-black bg-[#E7EAEE]' : 'text-[#9D9D9D] hover:text-black bg-transparent'}`}
            />
          </div>
          <form onSubmit={handleForm} className="flex flex-col flex-1">
            {!isSignIn && (
              <InputField
                label="Full Name"
                type="text"
                name="fullName"
                placeholder="Adewale Adebisi"
                value={formData.fullName}
                onChange={handleChange}
                error={!!errors.fullName}
                errorMessage={errors.fullName}
              />
            )}
            <InputField
              label="Email Address"
              type="email"
              name="email"
              placeholder="Adewaleadebisi@gmail.com"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              errorMessage={errors.email}
            />
            <InputField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="******"
              icon={
                <img
                  src={showPassword ? '/show-password.svg' : '/hide-password.svg'}
                  alt="Toggle visibility"
                  className="size-[1.25rem]"
                />
              }
              onIconClick={() => setShowPassword(!showPassword)}
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              errorMessage={errors.password}
            />
            {!isSignIn && (
              <InputField
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="******"
                icon={
                  <img
                    src={showConfirmPassword ? '/show-password.svg' : '/hide-password.svg'}
                    alt="Toggle visibility"
                    className="size-[1.25rem]"
                  />
                }
                onIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
                value={formData.confirmPassword}
                onChange={handleChange}
                error={!!errors.confirmPassword}
                errorMessage={errors.confirmPassword}
              />
            )}
            <Button
              type="submit"
              label={isSignIn ? 'Sign In' : 'Signup'}
              className="mt-[1.25rem] bg-[#0D2D54] text-white rounded-[0.5rem] py-[0.91em] font-inter text-base font-medium shrink-0"
            />

            <div className="flex items-center gap-4 my-[1.25rem]">
              <div className="flex-1 h-[1px] bg-[#9D9D9D]"></div>
              <span className="font-inter text-[0.75rem] text-[#9D9D9D]">or continue with</span>
              <div className="flex-1 h-[1px] bg-[#9D9D9D]"></div>
            </div>
            <div>
              <Button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                label={googleLoading ? 'Redirecting to Google…' : 'Continue with google'}
                icon={
                  !googleLoading && (
                    <img src="/google-icon.svg" alt="Google" className="size-[1.25rem]" />
                  )
                }
                className="mb-[1.25rem] text-[#0D2D54] border-[0.06rem] rounded-[0.5rem] border-[#E6E6E6] bg-white py-[0.91em] font-inter text-base font-medium shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            {isSignIn ? (
              <p className="text-center font-inter text-sm sm:text-base text-[#9D9D9D]">
                Don't have an account?{' '}
                <Link to="/signup" className="font-medium text-[#0D2D54]">
                  Register
                </Link>
              </p>
            ) : (
              <p className="text-center font-inter text-sm sm:text-base text-[#9D9D9D]">
                Already have an account?{' '}
                <Link to="/signin" className="font-medium text-[#0D2D54]">
                  Login
                </Link>
              </p>
            )}

            <p className="mt-6 sm:mt-auto pt-4 text-center font-inter font-medium text-xs sm:text-base text-[#9D9D9D] leading-relaxed">
              By continuing you are accepting our{' '}
              <span className="text-[#0D2D54]">Terms & conditions</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AuthForm
