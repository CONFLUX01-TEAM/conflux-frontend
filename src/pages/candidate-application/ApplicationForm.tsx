import { useState, useRef } from 'react'
import { toast } from 'sonner'
import InputField from '@/shared/ui/InputField'
import Button from '@/shared/ui/Button'
import Spinner from '@/shared/ui/Spinner'
import Dropdown from '@/shared/ui/Dropdown'

interface ApplicationFormProps {
  isClosed: boolean
  onSubmitSuccess: () => void
}

const ApplicationForm = ({ isClosed, onSubmitSuccess }: ApplicationFormProps) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    locationType: '',
    experience: '',
    currentRole: '',
    techFocus: '',
    keyTech: '',
    consent: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [links, setLinks] = useState<string[]>([''])
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle Input Changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    setFormData((prev) => ({ ...prev, [name]: val }))
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev }
        delete copy[name]
        return copy
      })
    }
  }

  const handleDropdownChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev }
        delete copy[name]
        return copy
      })
    }
  }

  // Handle Dynamic Links
  const handleLinkChange = (index: number, value: string) => {
    const newLinks = [...links]
    newLinks[index] = value
    setLinks(newLinks)
  }

  const addLinkField = () => {
    setLinks([...links, ''])
  }

  const removeLinkField = (index: number) => {
    const newLinks = links.filter((_, i) => i !== index)
    setLinks(newLinks.length ? newLinks : [''])
  }

  // CV File Upload Handler
  const handleFileChange = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds the 10MB limit.')
      return
    }
    setCvFile(file)
    setUploadProgress(0)

    // Simulate progress upload
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null || prev >= 100) {
          clearInterval(interval)
          toast.success('CV uploaded successfully!')
          return 100
        }
        return prev + 25
      })
    }, 150)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0])
    }
  }

  // Form Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address'
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    if (!formData.location) newErrors.location = 'Location is required'
    if (!formData.locationType) newErrors.locationType = 'Location type is required'
    if (!formData.experience) newErrors.experience = 'Experience level is required'
    if (!formData.currentRole) newErrors.currentRole = 'Current role is required'
    if (!formData.techFocus) newErrors.techFocus = 'Technical focus is required'
    if (!formData.keyTech) newErrors.keyTech = 'Key technologies is required'
    if (!cvFile) newErrors.cv = 'Please upload your CV'
    if (!formData.consent) newErrors.consent = 'You must agree to the Terms'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isClosed) return

    if (!validateForm()) {
      const isPersonalInfoEmpty =
        !formData.firstName.trim() ||
        !formData.lastName.trim() ||
        !formData.email.trim() ||
        !formData.phone.trim()
      const isProfessionalInfoEmpty =
        !formData.experience || !formData.currentRole || !formData.techFocus || !formData.keyTech
      const isLocationEmpty = !formData.location || !formData.locationType

      if (isPersonalInfoEmpty && isProfessionalInfoEmpty && isLocationEmpty && !cvFile) {
        toast.error('Please fill in all required fields and upload your CV.')
      } else if (!cvFile) {
        toast.error('Please upload your CV before submitting.')
      } else if (!formData.consent) {
        toast.error('You must agree to the Privacy Policy and Terms of Use.')
      } else {
        toast.error('Please fill in all required fields marked with *.')
      }
      return
    }

    setIsSubmitting(true)

    // Simulate API Submission
    setTimeout(() => {
      setIsSubmitting(false)
      onSubmitSuccess()
      toast.success('Your application has been submitted successfully!')
    }, 2000)
  }

  return (
    <div className="w-full bg-white border-[0.5px] border-[#DDE0E9] rounded-2xl p-4 sm:p-6 lg:py-10 lg:px-8 shadow-sm lg:max-w-[715px]">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 sm:gap-8">
        {/* Section: Personal Info */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-5 sm:mb-8">
            <div className="flex items-center gap-2.5 sm:gap-4.5 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 p-1.5 sm:p-2 rounded-full bg-[#E7EAEE] flex items-center justify-center shrink-0">
                <img
                  src="/Candidate-icon/user-icon.svg"
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  alt="personal info icon"
                />
              </div>
              <h2 className="text-base sm:text-[20px] font-semibold text-[#000000] font-sans leading-none tracking-[0%]">
                Personal Information
              </h2>
            </div>
            <span
              className={`shrink-0 whitespace-nowrap text-[11px] sm:text-xs md:text-[14px] font-medium font-inter px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full leading-none tracking-[0%] ${isClosed ? 'bg-[#FCDADA] text-[#EF4444]' : 'bg-[#D3F3DF] text-[#22C55E]'}`}
            >
              {isClosed ? 'Application Closed' : 'Application Ongoing'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4.5 font-inter">
            <InputField
              label="First name *"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="e.g Eniafe"
              error={!!errors.firstName}
              errorMessage={errors.firstName}
              disabled={isClosed}
            />
            <InputField
              label="Last name *"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="e.g Eniafe"
              error={!!errors.lastName}
              errorMessage={errors.lastName}
              disabled={isClosed}
            />
            <InputField
              label="Email Address *"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="yourmail@example.com"
              error={!!errors.email}
              errorMessage={errors.email}
              disabled={isClosed}
            />
            <InputField
              label="Phone number *"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. +234 812 345 6789"
              error={!!errors.phone}
              errorMessage={errors.phone}
              disabled={isClosed}
            />

            {/* Location Dropdowns */}
            <div className="flex flex-col mt-[1.25rem] w-full">
              <label className="text-sm sm:text-base text-black mb-[0.5rem]">Location *</label>
              <Dropdown
                items={[
                  { value: 'Lagos, Nigeria', label: 'Lagos, Nigeria' },
                  { value: 'San Francisco, USA', label: 'San Francisco, USA' },
                  { value: 'London, UK', label: 'London, UK' },
                  { value: 'Remote', label: 'Remote' },
                ]}
                value={formData.location}
                onChange={(val) => handleDropdownChange('location', val)}
                placeholder="Select location"
                className="w-full mt-[0.5rem]"
                triggerClassName={`w-full px-4 py-[11px] rounded-md border text-[0.88rem] transition-colors duration-200 ease-in-out hover:border-gray-300 focus:border-[#0D2D54] focus:ring-2 focus:ring-[#0D2D54]/20 justify-between flex items-center bg-white ${
                  errors.location ? 'border-[#EF4444]' : 'border-gray-200'
                } ${isClosed ? 'pointer-events-none bg-gray-50 opacity-60 cursor-not-allowed' : ''}`}
                menuClassName="w-full max-h-60 overflow-y-auto"
                align="left"
              />
              {errors.location && (
                <span className="text-[0.75rem] text-[#EF4444] mt-1 block font-inter">
                  {errors.location}
                </span>
              )}
            </div>

            <div className="flex flex-col mt-[1.25rem] w-full">
              <label className="text-sm sm:text-base text-black mb-[0.5rem]">
                Current location type *
              </label>
              <Dropdown
                items={[
                  { value: 'Hybrid', label: 'Hybrid' },
                  { value: 'Remote', label: 'Remote' },
                  { value: 'Onsite', label: 'Onsite' },
                ]}
                value={formData.locationType}
                onChange={(val) => handleDropdownChange('locationType', val)}
                placeholder="Select location type"
                className="w-full mt-[0.5rem]"
                triggerClassName={`w-full px-4 py-[11px] rounded-md border text-[0.88rem] transition-colors duration-200 ease-in-out hover:border-gray-300 focus:border-[#0D2D54] focus:ring-2 focus:ring-[#0D2D54]/20 justify-between flex items-center bg-white ${
                  errors.locationType ? 'border-[#EF4444]' : 'border-gray-200'
                } ${isClosed ? 'pointer-events-none bg-gray-50 opacity-60 cursor-not-allowed' : ''}`}
                menuClassName="w-full max-h-60 overflow-y-auto"
                align="left"
              />
              {errors.locationType && (
                <span className="text-[0.75rem] text-[#EF4444] mt-1 block font-inter">
                  {errors.locationType}
                </span>
              )}
            </div>
          </div>

          {/* Upload CV Drag & Drop */}
          <div className="mt-6 font-inter">
            <label className="text-sm sm:text-base text-black mb-2 block font-medium">
              Upload CV *
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
              className="hidden"
              disabled={isClosed}
            />
            {cvFile ? (
              <div className="flex flex-col gap-3">
                {/* Dashed Box with File Info */}
                <div
                  className="rounded-xl p-6 bg-white flex items-center justify-between w-full"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='12' ry='12' stroke='%23CBD5E1' stroke-width='2' stroke-dasharray='5%2c 5' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e")`,
                  }}
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    {/* Custom PDF Icon Placeholder */}
                    <img
                      src="/Candidate-icon/pdf-icon.svg"
                      className="w-10 h-10 shrink-0"
                      alt="pdf icon"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-black truncate">{cvFile.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {uploadProgress !== null && uploadProgress < 100
                          ? `Uploading... ${uploadProgress}%`
                          : `${(cvFile.size / 1024).toFixed(0)} KB`}
                      </p>
                      {uploadProgress !== null && uploadProgress < 100 && (
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2 overflow-hidden">
                          <div
                            className="bg-[#0D2D54] h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setCvFile(null)
                      setUploadProgress(null)
                    }}
                    className="text-gray-400 hover:text-red-500 p-1.5 rounded-full hover:bg-gray-100 transition-all cursor-pointer shrink-0 ml-2"
                  >
                    <img src="/x-icon.svg" className="w-4 h-4" alt="remove file" />
                  </button>
                </div>

                {/* Disabled Browse Files Button */}
                <button
                  type="button"
                  disabled
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl text-gray-400 font-semibold text-sm opacity-50 cursor-not-allowed select-none"
                >
                  <img src="/Candidate-icon/file-icon.svg" className="w-4 h-4 opacity-40" alt="" />
                  Browse files
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {/* Dashed Box */}
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  onClick={() => !isClosed && fileInputRef.current?.click()}
                  className="rounded-xl py-4 px-3 gap-2 text-center flex flex-col items-center justify-center transition-all bg-[#FFFFFF] cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='12' ry='12' stroke='${isHovered ? '%230D2D54' : '%23CBD5E1'}' stroke-width='2' stroke-dasharray='5%2c 5' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e")`,
                  }}
                >
                  <img
                    src="/Candidate-icon/cloud-upload-icon.svg"
                    className="w-10 h-10"
                    alt="upload cloud icon"
                  />
                  <p className="text-[1rem] leading-[100%] tracking-[0%] font-sans font-medium text-[#535353]">
                    Drag and drop your CV here
                  </p>
                  <p className="text-[14px] font-inter font-normal text-[#9D9D9D] mt-2">
                    PDF or DOC max 10MB
                  </p>
                </div>

                {/* Full-width Browse Files Button */}
                <button
                  type="button"
                  onClick={() => !isClosed && fileInputRef.current?.click()}
                  disabled={isClosed}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl text-black font-semibold text-sm hover:bg-[#E2E8F0] transition-colors select-none cursor-pointer"
                >
                  <img src="/Candidate-icon/file-icon.svg" className="w-4 h-4" alt="" />
                  Browse files
                </button>
              </div>
            )}
            {errors.cv && (
              <span className="text-[0.75rem] text-[#EF4444] mt-2 block font-inter">
                {errors.cv}
              </span>
            )}
          </div>
        </div>

        {/* Section: Experience */}
        <div>
          <div className="flex items-center justify-between mb-5 sm:mb-8">
            <div className="flex items-center gap-3 sm:gap-4.5">
              <div className="w-8 h-8 sm:w-10 sm:h-10 p-1.5 sm:p-2 rounded-full bg-[#E7EAEE] flex items-center justify-center shrink-0">
                <img
                  src="/Candidate-icon/suit-case-brown-icon.svg"
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  alt="experience icon"
                />
              </div>
              <h2 className="text-lg sm:text-[20px] font-semibold text-[#000000] font-sans leading-[100%] tracking-[0%]">
                Experience
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 font-inter">
            <div className="flex flex-col w-full">
              <label className="text-sm sm:text-base text-black mb-[0.5rem]">
                Years of experience *
              </label>
              <Dropdown
                items={[
                  { value: '1', label: '1 Year' },
                  { value: '2', label: '2 Years' },
                  { value: '3-5', label: '3-5 Years' },
                  { value: '5+', label: '5+ Years' },
                ]}
                value={formData.experience}
                onChange={(val) => handleDropdownChange('experience', val)}
                placeholder="Select years"
                className="w-full mt-[0.5rem]"
                triggerClassName={`w-full px-4 py-[11px] rounded-md border text-[0.88rem] transition-colors duration-200 ease-in-out hover:border-gray-300 focus:border-[#0D2D54] focus:ring-2 focus:ring-[#0D2D54]/20 justify-between flex items-center bg-white ${
                  errors.experience ? 'border-[#EF4444]' : 'border-gray-200'
                } ${isClosed ? 'pointer-events-none bg-gray-50 opacity-60 cursor-not-allowed' : ''}`}
                menuClassName="w-full max-h-60 overflow-y-auto"
                align="left"
              />
              {errors.experience && (
                <span className="text-[0.75rem] text-[#EF4444] mt-1 block font-inter">
                  {errors.experience}
                </span>
              )}
            </div>

            <div className="flex flex-col w-full">
              <label className="text-sm sm:text-base text-black mb-[0.5rem]">Current role *</label>
              <Dropdown
                items={[
                  { value: 'Frontend Engineer', label: 'Frontend Engineer' },
                  { value: 'Backend Engineer', label: 'Backend Engineer' },
                  { value: 'Fullstack Engineer', label: 'Fullstack Engineer' },
                  { value: 'Product Designer', label: 'Product Designer' },
                  { value: 'Product Manager', label: 'Product Manager' },
                ]}
                value={formData.currentRole}
                onChange={(val) => handleDropdownChange('currentRole', val)}
                placeholder="Select current role"
                className="w-full mt-[0.5rem]"
                triggerClassName={`w-full px-4 py-[11px] rounded-md border text-[0.88rem] transition-colors duration-200 ease-in-out hover:border-gray-300 focus:border-[#0D2D54] focus:ring-2 focus:ring-[#0D2D54]/20 justify-between flex items-center bg-white ${
                  errors.currentRole ? 'border-[#EF4444]' : 'border-gray-200'
                } ${isClosed ? 'pointer-events-none bg-gray-50 opacity-60 cursor-not-allowed' : ''}`}
                menuClassName="w-full max-h-60 overflow-y-auto"
                align="left"
              />
              {errors.currentRole && (
                <span className="text-[0.75rem] text-[#EF4444] mt-1 block font-inter">
                  {errors.currentRole}
                </span>
              )}
            </div>

            <div className="flex flex-col w-full">
              <label className="text-sm sm:text-base text-black mb-[0.5rem]">
                Technical focus *
              </label>
              <Dropdown
                items={[
                  { value: 'React / TypeScript', label: 'React / TypeScript' },
                  { value: 'Node.js / Express', label: 'Node.js / Express' },
                  { value: 'Python / Django', label: 'Python / Django' },
                  { value: 'Java / Spring Boot', label: 'Java / Spring Boot' },
                ]}
                value={formData.techFocus}
                onChange={(val) => handleDropdownChange('techFocus', val)}
                placeholder="Select tech focus"
                className="w-full mt-[0.5rem]"
                triggerClassName={`w-full px-4 py-[11px] rounded-md border text-[0.88rem] transition-colors duration-200 ease-in-out hover:border-gray-300 focus:border-[#0D2D54] focus:ring-2 focus:ring-[#0D2D54]/20 justify-between flex items-center bg-white ${
                  errors.techFocus ? 'border-[#EF4444]' : 'border-gray-200'
                } ${isClosed ? 'pointer-events-none bg-gray-50 opacity-60 cursor-not-allowed' : ''}`}
                menuClassName="w-full max-h-60 overflow-y-auto"
                align="left"
              />
              {errors.techFocus && (
                <span className="text-[0.75rem] text-[#EF4444] mt-1 block font-inter">
                  {errors.techFocus}
                </span>
              )}
            </div>

            <div className="flex flex-col w-full">
              <label className="text-sm sm:text-base text-black mb-[0.5rem]">
                Key Technologies *
              </label>
              <Dropdown
                items={[
                  { value: 'Docker, AWS, Kubernetes', label: 'Docker, AWS, Kubernetes' },
                  { value: 'React, Node.js, PostgreSQL', label: 'React, Node.js, PostgreSQL' },
                  { value: 'Go, Redis, Kafka', label: 'Go, Redis, Kafka' },
                ]}
                value={formData.keyTech}
                onChange={(val) => handleDropdownChange('keyTech', val)}
                placeholder="Select key technology"
                className="w-full mt-[0.5rem]"
                triggerClassName={`w-full px-4 py-[11px] rounded-md border text-[0.88rem] transition-colors duration-200 ease-in-out hover:border-gray-300 focus:border-[#0D2D54] focus:ring-2 focus:ring-[#0D2D54]/20 justify-between flex items-center bg-white ${
                  errors.keyTech ? 'border-[#EF4444]' : 'border-gray-200'
                } ${isClosed ? 'pointer-events-none bg-gray-50 opacity-60 cursor-not-allowed' : ''}`}
                menuClassName="w-full max-h-60 overflow-y-auto"
                align="left"
              />
              {errors.keyTech && (
                <span className="text-[0.75rem] text-[#EF4444] mt-1 block font-inter">
                  {errors.keyTech}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Section: Links */}
        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="flex items-center gap-3 sm:gap-4.5">
            <div className="w-8 h-8 sm:w-10 sm:h-10 p-1.5 sm:p-2 rounded-full bg-[#E7EAEE] flex items-center justify-center shrink-0">
              <img
                src="/Candidate-icon/link-icon.svg"
                className="w-5 h-5 sm:w-6 sm:h-6"
                alt="links icon"
              />
            </div>
            <div className="flex flex-col gap-1 leading-tight tracking-[0%]">
              <h2 className="text-lg sm:text-[20px] font-semibold text-[#000000] font-sans">
                Links
              </h2>
              <p className="text-xs sm:text-sm font-inter font-normal text-[#767676]">
                Add links to your Github, portfolio, Linkedin or Personal website
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 font-inter">
            {links.map((link, idx) => (
              <div key={idx} className="flex gap-3 items-end">
                <div className="flex-1">
                  <InputField
                    label=""
                    value={link}
                    onChange={(e) => handleLinkChange(idx, e.target.value)}
                    placeholder="https://myportfolio.com"
                    disabled={isClosed}
                    className="-mt-10"
                  />
                </div>
                {links.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => removeLinkField(idx)}
                    disabled={isClosed}
                    className="!w-auto bg-red-50 text-red-600 hover:bg-red-100 p-3.5 rounded-lg border border-red-200 transition-colors cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              onClick={addLinkField}
              disabled={isClosed}
              className="!w-auto self-end bg-[#FFFFFF] border border-[#E6E6E6] text-[#0D2D54] hover:bg-gray-50 font-medium text-[14px] p-2.5 rounded-sm transition-colors select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add another link
            </Button>
          </div>
        </div>

        {/* Section: Consent Checkbox & Submit */}
        <div className="flex flex-col gap-11 text-xs font-inter">
          <div>
            <label
              className={`flex items-start gap-2.5 sm:gap-3 cursor-pointer text-xs sm:text-sm text-gray-600 ${isClosed ? 'cursor-not-allowed opacity-60' : ''}`}
            >
              <input
                type="checkbox"
                name="consent"
                checked={formData.consent}
                onChange={handleChange}
                disabled={isClosed}
                className="size-4 rounded text-[#000000] focus:ring-[#000000] border-[#000000] shrink-0 mt-0.5 cursor-pointer"
              />
              <span className="leading-5">
                I agree to the{' '}
                <a href="#privacy" className="text-[#0D2D54] hover:underline font-medium">
                  Privacy Policy
                </a>{' '}
                and{' '}
                <a href="#terms" className="text-[#0D2D54] hover:underline font-medium">
                  Terms of Use
                </a>
              </span>
            </label>
            {errors.consent && (
              <span className="text-[0.75rem] text-[#EF4444] mt-1.5 ml-6.5 sm:ml-7 block font-inter">
                {errors.consent}
              </span>
            )}
          </div>

          <div>
            <Button
              type="submit"
              disabled={isClosed || isSubmitting}
              icon={
                isSubmitting ? (
                  <Spinner className="text-white h-4 w-4" wrapperClassName="bg-transparent p-0" />
                ) : undefined
              }
              className={`w-full py-4 rounded-xl text-base font-semibold transition-all ${
                isClosed
                  ? 'bg-[#5C7290] text-white cursor-not-allowed'
                  : isSubmitting
                    ? 'bg-[#A3A3A3] text-white cursor-not-allowed'
                    : 'bg-[#0D2D54] text-white hover:bg-[#0A2647] shadow-sm cursor-pointer'
              }`}
              label={
                isClosed
                  ? 'Application closed'
                  : isSubmitting
                    ? 'Submitting Application…'
                    : 'Submit Application'
              }
            />
          </div>
        </div>
      </form>
    </div>
  )
}

export default ApplicationForm
