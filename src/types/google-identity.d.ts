// Ambient typings for the subset of the Google Identity Services (GIS) browser
// SDK we use for "Sign in with Google". Loaded at runtime from
// https://accounts.google.com/gsi/client — see `src/lib/google-identity.ts`.
//
// Reference: https://developers.google.com/identity/gsi/web/reference/js-reference

export {}

declare global {
  /** Payload passed to the `callback` after a successful credential selection. */
  interface GoogleCredentialResponse {
    /** The JWT ID token to exchange with the backend (`POST /auth/google`). */
    credential?: string
    /** How the credential was selected (e.g. `btn`, `auto`). */
    select_by?: string
    clientId?: string
  }

  interface GoogleIdConfiguration {
    client_id: string
    callback: (response: GoogleCredentialResponse) => void
    auto_select?: boolean
    cancel_on_tap_outside?: boolean
    ux_mode?: 'popup' | 'redirect'
    context?: 'signin' | 'signup' | 'use'
    itp_support?: boolean
    use_fedcm_for_prompt?: boolean
  }

  interface GoogleButtonConfiguration {
    type?: 'standard' | 'icon'
    theme?: 'outline' | 'filled_blue' | 'filled_black'
    size?: 'large' | 'medium' | 'small'
    text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
    shape?: 'rectangular' | 'pill' | 'circle' | 'square'
    logo_alignment?: 'left' | 'center'
    /** Button width in pixels. Must be an integer between 200 and 400. */
    width?: number
    locale?: string
  }

  interface GoogleAccountsId {
    initialize: (config: GoogleIdConfiguration) => void
    renderButton: (parent: HTMLElement, options: GoogleButtonConfiguration) => void
    prompt: () => void
    cancel: () => void
    disableAutoSelect: () => void
  }

  interface Window {
    google?: {
      accounts: {
        id: GoogleAccountsId
      }
    }
  }
}
