// Loads the Google Identity Services (GIS) browser SDK on demand.
//
// The script is injected lazily (only when a "Continue with Google" button
// mounts) and shared across every caller via a single in-flight promise, so
// StrictMode double-mounts and multiple auth screens never race to add it twice.

const GSI_SRC = 'https://accounts.google.com/gsi/client'

let loaderPromise: Promise<GoogleAccountsId> | null = null

const isReady = (): boolean => Boolean(window.google?.accounts?.id)

/**
 * Resolves once `window.google.accounts.id` is available, injecting the GIS
 * script if it has not been loaded yet. Rejects (and resets, so a retry can
 * try again) when the script fails to load.
 */
export const loadGoogleIdentity = (): Promise<GoogleAccountsId> => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Identity Services requires a browser environment.'))
  }

  if (isReady()) {
    return Promise.resolve(window.google!.accounts.id)
  }

  if (loaderPromise) return loaderPromise

  loaderPromise = new Promise<GoogleAccountsId>((resolve, reject) => {
    const settle = () => {
      if (isReady()) {
        resolve(window.google!.accounts.id)
      } else {
        loaderPromise = null
        reject(new Error('Google Identity Services loaded but is unavailable.'))
      }
    }
    const fail = () => {
      loaderPromise = null
      reject(new Error('Failed to load Google Identity Services.'))
    }

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SRC}"]`)
    if (existing) {
      if (isReady()) return settle()
      existing.addEventListener('load', settle, { once: true })
      existing.addEventListener('error', fail, { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = GSI_SRC
    script.async = true
    script.defer = true
    script.addEventListener('load', settle, { once: true })
    script.addEventListener('error', fail, { once: true })
    document.head.appendChild(script)
  })

  return loaderPromise
}
