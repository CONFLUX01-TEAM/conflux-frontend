import { useEffect, useId, useRef, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '@/features/auth/context/auth-context'
import type { OnboardingOutletContext } from '@/features/onboarding/types'
import {
  ALLOWED_LOGO_MIME_TYPES,
  validateCompanyDescription,
  validateCompanyLogo,
  validateCompanyName,
  validateLinkedInUrl,
  validateLocation,
} from '@/lib/validation'
import { completeEmployerOnboarding, isApiError, uploadCompanyLogo } from '@/services/api-client'
import Button from '@/shared/ui/Button'
import InputField from '@/shared/ui/InputField'
import Spinner from '@/shared/ui/Spinner'

const LOGO_URL_KEYS = ['logoUrl', 'url', 'secureUrl', 'logo'] as const

/** The logo endpoint's payload shape isn't documented — pull the URL defensively. */
const extractLogoUrl = (data: Record<string, unknown>): string | undefined => {
  for (const key of LOGO_URL_KEYS) {
    const value = data[key]
    if (typeof value === 'string' && value) return value
  }
  return undefined
}

const OnboardingSteps = () => {
  const { step, setStep } = useOutletContext<OnboardingOutletContext>()
  const navigate = useNavigate()
  const { markOnboardingComplete } = useAuth()
  const textareaId = useId()

  const [companyName, setCompanyName] = useState('')
  const [location, setLocation] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [logo, setLogo] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [stepError, setStepError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Clean up object URL preview on unmount or when logo changes
  useEffect(() => {
    return () => {
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview)
      }
    }
  }, [logoPreview])

  const validateCurrentStep = (currentStep: number): string | null => {
    switch (currentStep) {
      case 1:
        return validateCompanyName(companyName)
      case 2:
        return validateLocation(location)
      case 3:
        return validateLinkedInUrl(linkedin)
      case 4:
        return validateCompanyLogo(logo)
      case 5:
        return validateCompanyDescription(description)
      default:
        return null
    }
  }

  const isCurrentStepValid = validateCurrentStep(step) === null

  const handleFileSelect = (file: File | null) => {
    if (!file) return

    const validationError = validateCompanyLogo(file)
    if (validationError) {
      setStepError(validationError)
      return
    }

    if (logoPreview) {
      URL.revokeObjectURL(logoPreview)
    }

    setLogo(file)
    setLogoPreview(URL.createObjectURL(file))
    setStepError(null)
  }

  const handleRemoveLogo = () => {
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview)
    }
    setLogo(null)
    setLogoPreview(null)
    setStepError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleFinish = async () => {
    setIsLoading(true)
    try {
      let logoUrl: string | undefined
      if (logo) {
        const { data } = await uploadCompanyLogo(logo)
        logoUrl = extractLogoUrl(data)
      }

      await completeEmployerOnboarding({
        name: companyName.trim(),
        location: location.trim(),
        linkedinUrl: linkedin.trim(),
        description: description.trim(),
        ...(logoUrl ? { logoUrl } : {}),
      })

      markOnboardingComplete()
      toast.success('Onboarding complete! Welcome aboard.')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const apiErr = isApiError(err) ? err : null
      // Onboarding was already finished (e.g. in another tab) — treat as success.
      if (apiErr?.status === 409) {
        markOnboardingComplete()
        navigate('/dashboard', { replace: true })
        return
      }
      const message = apiErr?.message || 'We couldn’t complete onboarding. Please try again.'
      toast.error(apiErr?.details?.length ? `${message} ${apiErr.details.join('. ')}` : message)
      setIsLoading(false)
    }
  }

  const handleContinue = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (isLoading) return

    const error = validateCurrentStep(step)
    if (error) {
      setStepError(error)
      return
    }
    setStepError(null)

    if (step < 5) {
      setStep(step + 1)
    } else {
      void handleFinish()
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStepError(null)
      setStep(step - 1)
    }
  }

  return (
    <div className="w-full h-full py-[4.75em] px-[2.81em] font-sans">
      <div className="mb-[6.06rem] w-full">
        <p className="text-[0.74rem] text-black opacity-60 mb-2 font-medium">Step {step}/5</p>
        <div
          className="flex gap-2"
          role="progressbar"
          aria-valuenow={step}
          aria-valuemin={1}
          aria-valuemax={5}
        >
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className={`h-[0.5rem] w-[3.75rem] flex-1 rounded-[1.44rem] transition-colors duration-300 ${item <= step ? 'bg-[#0D2D54]' : 'bg-[#E6E6E6]'}`}
            />
          ))}
        </div>
      </div>

      <div className="w-full">
        <form onSubmit={handleContinue} noValidate>
          {step === 1 && (
            <div>
              <h2 className="text-[1.75rem] sm:text-[1.88rem] font-semibold text-black mb-[0.5rem] font-sans">
                What is your company called?
              </h2>
              <p className="text-[#6C6C6C] text-[1.13rem] mb-[3.13rem] font-inter">
                This is how you will appear to others on the platform.
              </p>
              <InputField
                id="company-name"
                placeholder="e.g Conflux labs"
                value={companyName}
                onChange={(e) => {
                  setCompanyName(e.target.value)
                  if (stepError) setStepError(null)
                }}
                error={Boolean(stepError)}
                errorMessage={stepError || undefined}
                className="py-[0.8rem] rounded-[0.5rem]"
                maxLength={100}
                autoFocus
              />
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-[1.75rem] sm:text-[1.88rem] font-semibold text-black mb-[0.5rem] font-sans">
                Where are you located?
              </h2>
              <p className="text-[#6C6C6C] text-[1.13rem] mb-[3.13rem] font-inter">
                This helps us show relevant regional context for your account.
              </p>
              <InputField
                id="location"
                placeholder="e.g Abuja, Nigeria"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value)
                  if (stepError) setStepError(null)
                }}
                error={Boolean(stepError)}
                errorMessage={stepError || undefined}
                className="py-[0.8rem] rounded-[0.5rem]"
                maxLength={100}
                autoFocus
              />
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-[1.75rem] sm:text-[1.88rem] font-semibold text-black mb-[0.5rem] font-sans">
                Link your company's Linkedin
              </h2>
              <p className="text-[#6C6C6C] text-[1.13rem] mb-[3.13rem] font-inter">
                We'll use this to verify your company and keep your profile accurate.
              </p>
              <InputField
                id="linkedin-url"
                type="url"
                placeholder="https://linkedin.com/company/your-company"
                value={linkedin}
                onChange={(e) => {
                  setLinkedin(e.target.value)
                  if (stepError) setStepError(null)
                }}
                error={Boolean(stepError)}
                errorMessage={stepError || undefined}
                className="py-[0.8rem] rounded-[0.5rem]"
                autoFocus
              />
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-[1.75rem] sm:text-[1.88rem] font-semibold text-black mb-[0.5rem] font-sans">
                Add your company logo
              </h2>
              <p className="text-[#6C6C6C] text-[1.13rem] mb-[3.13rem] font-inter">
                A recognizable logo builds trust with others on the platform.
              </p>
              <div
                className={`w-full border-2 border-dashed ${
                  stepError
                    ? 'border-red-500 bg-red-50/50'
                    : isDragging
                      ? 'border-[#0D2D54] bg-blue-50/40'
                      : 'border-[#E6E6E6]'
                } rounded-[0.5rem] flex flex-col items-center justify-center py-[3.5rem] cursor-pointer hover:bg-gray-50 transition-colors`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    fileInputRef.current?.click()
                  }
                }}
              >
                <input
                  type="file"
                  className="hidden"
                  ref={fileInputRef}
                  accept={ALLOWED_LOGO_MIME_TYPES.join(', ')}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelect(e.target.files[0])
                    }
                  }}
                />
                {logoPreview ? (
                  <div className="flex flex-col items-center">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-16 h-16 object-contain mb-2 rounded-[0.25rem] border border-gray-200 bg-white"
                    />
                    <p className="text-[0.88rem] text-[#0D2D54] font-medium text-center px-4 truncate max-w-xs">
                      {logo?.name}
                    </p>
                    <div className="flex gap-3 mt-2">
                      <button
                        type="button"
                        className="text-[0.75rem] text-[#0D2D54] hover:underline font-medium cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation()
                          fileInputRef.current?.click()
                        }}
                      >
                        Change
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        type="button"
                        className="text-[0.75rem] text-red-600 hover:underline font-medium cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveLogo()
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <img src="/file-upload.svg" alt="" aria-hidden className="w-6 h-6 mb-3" />
                    <p className="text-[0.88rem] text-black font-medium mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-[0.75rem] text-[#9D9D9D]">PNG, JPG or SVG - max 2MB</p>
                  </>
                )}
              </div>

              {stepError && (
                <p className="text-red-500 text-[0.8rem] mt-2 font-medium font-inter" role="alert">
                  {stepError}
                </p>
              )}
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 className="text-[1.75rem] sm:text-[1.88rem] font-semibold text-black mb-[0.5rem] font-sans">
                Describe what your company does
              </h2>
              <p className="text-[#6C6C6C] text-[1.13rem] mb-[3.13rem] font-inter">
                Keep it short, a sentence or two is enough. You can always edit this later.
              </p>
              <div>
                <label htmlFor={textareaId} className="sr-only">
                  Company description
                </label>
                <textarea
                  id={textareaId}
                  placeholder="we help growing businesses manage their hiring process for technical roles"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value)
                    if (stepError) setStepError(null)
                  }}
                  maxLength={1000}
                  className={`w-full py-[1rem] px-[1.2rem] border rounded-[0.5rem] outline-none resize-none h-[9rem] font-sans text-[0.88rem] text-black placeholder:text-[#9D9D9D] transition-colors ${
                    stepError
                      ? 'border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/20'
                      : 'border-[#E6E6E6] focus:border-[#0D2D54]'
                  }`}
                  autoFocus
                />
                <div className="flex justify-between items-center mt-1">
                  {stepError ? (
                    <span
                      className="text-red-500 text-[0.8rem] font-medium font-inter"
                      role="alert"
                    >
                      {stepError}
                    </span>
                  ) : (
                    <span />
                  )}
                  <span className="text-[0.75rem] text-[#9D9D9D] font-inter">
                    {description.length}/1000
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className={`mt-[5.5rem] flex ${step > 1 ? 'justify-between' : 'justify-end'}`}>
            {step > 1 && (
              <Button
                type="button"
                label="Back"
                onClick={handleBack}
                disabled={isLoading}
                className="px-[2rem] py-[0.6rem] rounded-[0.38rem] font-medium text-[0.88rem] !w-auto min-w-[8rem] bg-white text-black border border-[#E6E6E6] hover:bg-gray-50 transition-all cursor-pointer"
              />
            )}
            <Button
              type="submit"
              label={step === 5 ? (isLoading ? 'Finishing…' : 'Finish') : 'Continue'}
              disabled={isLoading}
              icon={
                isLoading ? (
                  <Spinner className="text-white h-4 w-4" wrapperClassName="bg-transparent p-0" />
                ) : undefined
              }
              className={`px-[2rem] py-[0.6rem] rounded-[0.38rem] font-medium text-[0.88rem] !w-auto min-w-[8rem] transition-all cursor-pointer ${
                isCurrentStepValid
                  ? 'bg-[#0D2D54] text-white hover:bg-[#0D2D54]/90 shadow-sm'
                  : 'bg-[#93B2F0] text-white opacity-80'
              }`}
            />
          </div>
        </form>
      </div>
    </div>
  )
}

export default OnboardingSteps
