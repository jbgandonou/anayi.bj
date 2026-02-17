import { onMounted, ref } from 'vue'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential: string }) => void
            auto_select?: boolean
          }) => void
          renderButton: (
            element: HTMLElement,
            config: {
              type?: string
              theme?: string
              size?: string
              text?: string
              width?: number
              logo_alignment?: string
            },
          ) => void
        }
      }
    }
  }
}

export function useGoogleSignIn(onToken: (idToken: string) => void) {
  const ready = ref(false)

  function initGoogle(buttonElement: HTMLElement) {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId || !window.google) return

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        onToken(response.credential)
      },
    })

    window.google.accounts.id.renderButton(buttonElement, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      width: 370,
      logo_alignment: 'left',
    })

    ready.value = true
  }

  function tryInit(buttonElement: HTMLElement, retries = 10) {
    if (window.google) {
      initGoogle(buttonElement)
    } else if (retries > 0) {
      setTimeout(() => tryInit(buttonElement, retries - 1), 300)
    }
  }

  return { ready, tryInit }
}
