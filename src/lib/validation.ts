export const FREE_EMAIL_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'aol.com',
  'icloud.com',
  'mail.com',
  'protonmail.com',
  'zoho.com',
  'yandex.com',
]

export const isWorkEmail = (email: string): boolean => {
  if (!email || !email.includes('@')) return false
  const domain = email.split('@')[1].toLowerCase()
  return !FREE_EMAIL_DOMAINS.includes(domain)
}

export const validateAuthForm = (formData: Record<string, string>, isSignIn: boolean) => {
  const errors: Record<string, string> = {}

  if (!formData.email) {
    errors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Please enter a valid email address'
  } else if (!isSignIn && !isWorkEmail(formData.email)) {
    // The backend only enforces work emails at registration.
    errors.email = 'Please enter a valid work email address (e.g. name@company.com)'
  }

  if (!formData.password) {
    errors.password = 'Password is required'
  } else if (!isSignIn && formData.password.length < 8) {
    errors.password = 'Password must be at least 8 characters'
  }

  if (!isSignIn) {
    if (!formData.fullName) {
      errors.fullName = 'Full Name is required'
    }
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirm Password is required'
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }
  }

  return errors
}

export const validateOTP = (otp: string): string | null => {
  if (!otp || otp.length < 6) {
    return 'Please enter all 6 digits of the OTP.'
  }
  return null
}

// ─── Onboarding Validations ──────────────────────────────────────────────────

export const LINKEDIN_URL_REGEX =
  /^(https?:\/\/)?(([\w-]+\.)?linkedin\.com)\/(company|school|showcase)\/[\w\-.~%]+(\/.*)?$/i

export const MAX_LOGO_SIZE_BYTES = 2 * 1024 * 1024 // 2MB
export const ALLOWED_LOGO_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/svg+xml',
  'image/webp',
]

export const validateCompanyName = (name: string): string | null => {
  const trimmed = name.trim()
  if (!trimmed) {
    return 'Company name is required.'
  }
  if (trimmed.length < 2) {
    return 'Company name must be at least 2 characters.'
  }
  if (trimmed.length > 100) {
    return 'Company name cannot exceed 100 characters.'
  }
  return null
}

export const validateLocation = (location: string): string | null => {
  const trimmed = location.trim()
  if (!trimmed) {
    return 'Location is required.'
  }
  const parts = trimmed.split(',').map((p) => p.trim())
  if (
    parts.length !== 2 ||
    !parts[0] ||
    !parts[1] ||
    parts[0].length < 2 ||
    parts[1].length < 2 ||
    !/^[\p{L}\s.-]+,\s*[\p{L}\s.-]+$/u.test(trimmed)
  ) {
    return 'Please enter location in "State, Country" format (e.g. Abuja, Nigeria).'
  }
  if (trimmed.length > 100) {
    return 'Location cannot exceed 100 characters.'
  }
  return null
}

export const validateLinkedInUrl = (url: string): string | null => {
  const trimmed = url.trim()
  if (!trimmed) {
    return 'LinkedIn URL is required.'
  }
  if (!LINKEDIN_URL_REGEX.test(trimmed)) {
    return 'Please provide a valid LinkedIn company URL (e.g. https://linkedin.com/company/your-company).'
  }
  return null
}

export const validateCompanyLogo = (file: File | null): string | null => {
  if (!file) {
    return 'Please upload a company logo.'
  }
  if (file.size > MAX_LOGO_SIZE_BYTES) {
    return 'Logo file size must not exceed 2MB.'
  }
  const hasValidType =
    ALLOWED_LOGO_MIME_TYPES.includes(file.type) || /\.(png|jpe?g|svg|webp)$/i.test(file.name)
  if (!hasValidType) {
    return 'Only PNG, JPG, or SVG images are supported.'
  }
  return null
}

export const validateCompanyDescription = (description: string): string | null => {
  const trimmed = description.trim()
  if (!trimmed) {
    return 'Description is required.'
  }
  if (trimmed.length < 10) {
    return 'Description must be at least 10 characters.'
  }
  if (trimmed.length > 1000) {
    return 'Description cannot exceed 1000 characters.'
  }
  return null
}
