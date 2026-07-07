import { useEffect, useRef, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { toast } from 'sonner'
import type { OnboardingOutletContext } from '@/features/onboarding/types'
import {
  completeEmployerOnboarding,
  getEmployerOnboardingStatus,
  isApiError,
  uploadCompanyLogo,
} from '@/services/api-client'
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
  const [companyName, setCompanyName] = useState('')
  const [location, setLocation] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [logo, setLogo] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showError, setShowError] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  // StrictMode double-invokes effects in dev — only act on the status once.
  const statusCheckedRef = useRef(false)

  // Employers who already finished onboarding shouldn't see the form again.
  useEffect(() => {
    if (statusCheckedRef.current) return
    statusCheckedRef.current = true
    getEmployerOnboardingStatus()
      .then(({ data }) => {
        if (data?.completed) navigate('/dashboard', { replace: true })
      })
      .catch(() => {
        /* not-yet-onboarded (or a 403/network hiccup) — just show the form */
      })
  }, [navigate])

  const currentStepConfig = (() => {
    switch (step) {
      case 1:
        return {
          title: 'What is your company called?',
          subtitle: 'This is how you will appear to others on the platform.',
          placeholder: 'e.g Conflux labs',
          value: companyName,
          type: 'text',
          onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setCompanyName(e.target.value)
            setShowError(false)
          },
          isValid: companyName.trim().length > 0,
          errorMessage: 'Company name is required.',
        }
      case 2:
        return {
          title: 'Where are you located?',
          subtitle: 'This helps us show relevant regional context for your account.',
          placeholder: 'e.g Lagos, Nigeria',
          value: location,
          type: 'text',
          onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setLocation(e.target.value)
            setShowError(false)
          },
          isValid: location.trim().length > 0,
          errorMessage: 'Location is required.',
        }
      case 3:
        return {
          title: "Link your company's Linkedin",
          subtitle: "We'll use this to verify your company and keep your profile accurate.",
          placeholder: 'https://linkedin.com/company/your-company',
          value: linkedin,
          type: 'text',
          onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setLinkedin(e.target.value)
            setShowError(false)
          },
          isValid:
            /^(https?:\/\/)?(www\.)?linkedin\.com\/(company|school|showcase)\/[a-zA-Z0-9-]+(\/.*)?$/i.test(
              linkedin.trim(),
            ),
          errorMessage: 'Please provide a valid LinkedIn URL.',
        }
      case 4:
        return {
          title: 'Add your company logo',
          subtitle: 'A recognizable logo builds trust with others on the platform.',
          type: 'file',
          isValid: logo !== null,
          errorMessage: 'Please upload a company logo.',
        }
      case 5:
        return {
          title: 'Describe what your company does',
          subtitle: 'Keep it short, a sentence or two is enough. You can always edit this later.',
          placeholder: 'we help growing businesses manage their hiring process for technical roles',
          value: description,
          type: 'textarea',
          onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setDescription(e.target.value)
            setShowError(false)
          },
          isValid: description.trim().length >= 10,
          errorMessage: 'Description must be at least 10 characters.',
        }
      default:
        return {
          title: '',
          subtitle: '',
          placeholder: '',
          value: '',
          type: 'text',
          onChange: () => {},
          isValid: false,
          errorMessage: '',
        }
    }
  })()

  const handleFinish = async () => {
    setIsLoading(true)
    try {
      // A logo is required to pass step 4, so it is present here — upload it
      // first and thread the returned URL into the completion payload.
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

      toast.success('Onboarding complete! Welcome aboard.')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const apiErr = isApiError(err) ? err : null
      // Onboarding was already finished (e.g. in another tab) — treat as success.
      if (apiErr?.status === 409) {
        navigate('/dashboard', { replace: true })
        return
      }
      const message = apiErr?.message || 'We couldn’t complete onboarding. Please try again.'
      toast.error(apiErr?.details?.length ? `${message} ${apiErr.details.join('. ')}` : message)
      setIsLoading(false)
    }
  }

  const handleContinue = () => {
    if (isLoading) return
    if (!currentStepConfig.isValid) {
      setShowError(true)
      return
    }
    setShowError(false)

    if (step < 5) {
      setStep(step + 1)
    } else {
      void handleFinish()
    }
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  return (
    <div className="w-full h-full py-[4.75em] px-[2.81em] font-sans">
      <div className="mb-[6.06rem] w-full">
        <p className="text-[0.74rem] text-black opacity-60 mb-2 font-medium">Step {step}/5</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className={`h-[0.5rem] w-[3.75rem] flex-1 rounded-[1.44rem] transition-colors duration-300 ${item <= step ? 'bg-[#0D2D54]' : 'bg-[#E6E6E6]'}`}
            ></div>
          ))}
        </div>
      </div>

      <div className="w-full">
        <h2 className="text-[1.75rem] sm:text-[1.88rem] font-semibold text-black mb-[0.5rem] font-sans">
          {currentStepConfig.title}
        </h2>
        <p className="text-[#6C6C6C] text-[1.13rem] mb-[3.13rem] font-inter">
          {currentStepConfig.subtitle}
        </p>

        {currentStepConfig.type === 'text' && (
          <InputField
            placeholder={currentStepConfig.placeholder}
            value={currentStepConfig.value as string}
            onChange={currentStepConfig.onChange}
            className="py-[0.8rem] rounded-[0.5rem]"
          />
        )}

        {currentStepConfig.type === 'textarea' && (
          <textarea
            placeholder={currentStepConfig.placeholder}
            value={currentStepConfig.value as string}
            onChange={currentStepConfig.onChange}
            className="w-full py-[1rem] px-[1.2rem] border border-[#E6E6E6] rounded-[0.5rem] outline-none focus:border-[#0D2D54] resize-none h-[9rem] font-sans text-[0.88rem] text-black placeholder:text-[#9D9D9D]"
          />
        )}

        {currentStepConfig.type === 'file' && (
          <div
            className={`w-full border-2 border-dashed ${showError ? 'border-red-500 bg-red-50' : 'border-[#E6E6E6]'} rounded-[0.5rem] flex flex-col items-center justify-center py-[3.5rem] cursor-pointer hover:bg-gray-50 transition-colors`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              accept="image/png, image/jpeg, image/svg+xml"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const file = e.target.files[0]
                  setLogo(file)
                  setLogoPreview(URL.createObjectURL(file))
                  setShowError(false)
                }
              }}
            />
            {logoPreview ? (
              <div className="flex flex-col items-center">
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="w-16 h-16 object-contain mb-2 rounded-[0.25rem]"
                />
                <p className="text-[0.88rem] text-[#0D2D54] font-medium text-center px-4 truncate max-w-xs">
                  {logo?.name}
                </p>
                <p className="text-[0.75rem] text-[#9D9D9D] mt-1">Click to change</p>
              </div>
            ) : (
              <>
                <img src="/file-upload.svg" alt="Upload" className="w-6 h-6 mb-3" />
                <p className="text-[0.88rem] text-black font-medium mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-[0.75rem] text-[#9D9D9D]">PNG, JPG or SVG - max 2MB</p>
              </>
            )}
          </div>
        )}

        {showError && (
          <p className="text-red-500 text-[0.8rem] mt-2 font-medium">
            {currentStepConfig.errorMessage}
          </p>
        )}

        <div className={`mt-[5.5rem] flex ${step > 1 ? 'justify-between' : 'justify-end'}`}>
          {step > 1 && (
            <Button
              label="Back"
              onClick={handleBack}
              disabled={isLoading}
              className="px-[2rem] py-[0.6rem] rounded-[0.38rem] font-medium text-[0.88rem] !w-auto min-w-[8rem] bg-white text-black border border-[#E6E6E6] hover:bg-gray-50 transition-all"
            />
          )}
          <Button
            label={step === 5 ? 'Finish' : 'Continue'}
            onClick={handleContinue}
            disabled={isLoading}
            icon={
              isLoading ? (
                <Spinner className="text-white h-4 w-4" wrapperClassName="bg-transparent p-0" />
              ) : undefined
            }
            className={`px-[2rem] py-[0.6rem] rounded-[0.38rem] font-medium text-[0.88rem] !w-auto min-w-[8rem] transition-all ${
              currentStepConfig.isValid
                ? 'bg-[#0D2D54] text-white hover:bg-[#0D2D54]/90 shadow-sm'
                : 'bg-[#93B2F0] text-white opacity-80 cursor-default'
            }`}
          />
        </div>
      </div>
    </div>
  )
}

export default OnboardingSteps
