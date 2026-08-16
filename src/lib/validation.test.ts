import { describe, expect, it } from 'vitest'
import {
  isWorkEmail,
  validateAuthForm,
  validateCompanyDescription,
  validateCompanyLogo,
  validateCompanyName,
  validateLinkedInUrl,
  validateLocation,
  validateOTP,
} from '@/lib/validation'

describe('validation utilities', () => {
  describe('validateCompanyName', () => {
    it('returns error when company name is empty or whitespace', () => {
      expect(validateCompanyName('')).toBe('Company name is required.')
      expect(validateCompanyName('   ')).toBe('Company name is required.')
    })

    it('returns error when company name is less than 2 characters', () => {
      expect(validateCompanyName('A')).toBe('Company name must be at least 2 characters.')
    })

    it('returns error when company name exceeds 100 characters', () => {
      expect(validateCompanyName('A'.repeat(101))).toBe(
        'Company name cannot exceed 100 characters.',
      )
    })

    it('returns null for valid company names', () => {
      expect(validateCompanyName('Conflux')).toBeNull()
      expect(validateCompanyName('Acme Inc.')).toBeNull()
    })
  })

  describe('validateLocation', () => {
    it('returns error when location is empty', () => {
      expect(validateLocation('')).toBe('Location is required.')
      expect(validateLocation('   ')).toBe('Location is required.')
    })

    it('returns error when location does not follow "State, Country" format', () => {
      expect(validateLocation('Abuja')).toBe(
        'Please enter location in "State, Country" format (e.g. Abuja, Nigeria).',
      )
      expect(validateLocation('Abuja,')).toBe(
        'Please enter location in "State, Country" format (e.g. Abuja, Nigeria).',
      )
      expect(validateLocation(', Nigeria')).toBe(
        'Please enter location in "State, Country" format (e.g. Abuja, Nigeria).',
      )
      expect(validateLocation('Abuja, 123')).toBe(
        'Please enter location in "State, Country" format (e.g. Abuja, Nigeria).',
      )
    })

    it('returns null for valid State, Country locations', () => {
      expect(validateLocation('Abuja, Nigeria')).toBeNull()
      expect(validateLocation('abuja, Nigeria')).toBeNull()
      expect(validateLocation('Lagos, Nigeria')).toBeNull()
      expect(validateLocation('New York, USA')).toBeNull()
      expect(validateLocation('London, United Kingdom')).toBeNull()
    })
  })

  describe('validateLinkedInUrl', () => {
    it('returns error when URL is empty', () => {
      expect(validateLinkedInUrl('')).toBe('LinkedIn URL is required.')
    })

    it('validates various valid LinkedIn company URL formats', () => {
      expect(validateLinkedInUrl('https://www.linkedin.com/company/conflux-labs')).toBeNull()
      expect(validateLinkedInUrl('https://linkedin.com/company/conflux')).toBeNull()
      expect(validateLinkedInUrl('linkedin.com/company/conflux')).toBeNull()
      expect(validateLinkedInUrl('https://ng.linkedin.com/company/conflux')).toBeNull()
      expect(validateLinkedInUrl('https://www.linkedin.com/school/harvard-university')).toBeNull()
      expect(validateLinkedInUrl('https://www.linkedin.com/showcase/tech-talks')).toBeNull()
    })

    it('rejects invalid or non-company URLs', () => {
      expect(validateLinkedInUrl('https://google.com')).toBe(
        'Please provide a valid LinkedIn company URL (e.g. https://linkedin.com/company/your-company).',
      )
      expect(validateLinkedInUrl('random string')).toBe(
        'Please provide a valid LinkedIn company URL (e.g. https://linkedin.com/company/your-company).',
      )
      expect(validateLinkedInUrl('https://linkedin.com/')).toBe(
        'Please provide a valid LinkedIn company URL (e.g. https://linkedin.com/company/your-company).',
      )
    })
  })

  describe('validateCompanyLogo', () => {
    it('returns error when no file is provided', () => {
      expect(validateCompanyLogo(null)).toBe('Please upload a company logo.')
    })

    it('returns error when file exceeds 2MB', () => {
      const oversizedFile = new File(['x'.repeat(2 * 1024 * 1024 + 1)], 'logo.png', {
        type: 'image/png',
      })
      expect(validateCompanyLogo(oversizedFile)).toBe('Logo file size must not exceed 2MB.')
    })

    it('returns error when file type is not supported', () => {
      const invalidFile = new File(['content'], 'document.pdf', {
        type: 'application/pdf',
      })
      expect(validateCompanyLogo(invalidFile)).toBe('Only PNG, JPG, or SVG images are supported.')
    })

    it('returns null for valid image files', () => {
      const validPng = new File(['valid png'], 'logo.png', { type: 'image/png' })
      const validSvg = new File(['<svg></svg>'], 'logo.svg', { type: 'image/svg+xml' })
      const validJpg = new File(['valid jpg'], 'logo.jpg', { type: 'image/jpeg' })

      expect(validateCompanyLogo(validPng)).toBeNull()
      expect(validateCompanyLogo(validSvg)).toBeNull()
      expect(validateCompanyLogo(validJpg)).toBeNull()
    })
  })

  describe('validateCompanyDescription', () => {
    it('returns error when description is empty', () => {
      expect(validateCompanyDescription('')).toBe('Description is required.')
      expect(validateCompanyDescription('   ')).toBe('Description is required.')
    })

    it('returns error when description is under 10 characters', () => {
      expect(validateCompanyDescription('Too short')).toBe(
        'Description must be at least 10 characters.',
      )
    })

    it('returns null for valid descriptions', () => {
      expect(
        validateCompanyDescription(
          'We build cutting edge developer tools for high-performing engineering teams.',
        ),
      ).toBeNull()
    })
  })

  describe('auth & OTP validations', () => {
    it('validates work email correctly', () => {
      expect(isWorkEmail('john@acme.com')).toBe(true)
      expect(isWorkEmail('john@gmail.com')).toBe(false)
    })

    it('validates auth form required fields', () => {
      const errors = validateAuthForm({ email: '', password: '' }, true)
      expect(errors.email).toBe('Email is required')
      expect(errors.password).toBe('Password is required')
    })

    it('validates OTP', () => {
      expect(validateOTP('123')).toBe('Please enter all 6 digits of the OTP.')
      expect(validateOTP('123456')).toBeNull()
    })
  })
})
