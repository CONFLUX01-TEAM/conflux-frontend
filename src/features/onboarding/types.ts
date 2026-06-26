import type { Dispatch, SetStateAction } from 'react'

export interface OnboardingOutletContext {
  step: number
  setStep: Dispatch<SetStateAction<number>>
}
