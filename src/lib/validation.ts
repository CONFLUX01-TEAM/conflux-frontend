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
  } else if (!isWorkEmail(formData.email)) {
    errors.email = 'Please enter a valid work email address (e.g. name@company.com)'
  }

  if (!formData.password) {
    errors.password = 'Password is required'
  } else if (formData.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
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
