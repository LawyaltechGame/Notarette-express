export const ENVObj = {
  VITE_APPWRITE_PROJECT_ID: import.meta.env.VITE_APPWRITE_PROJECT_ID,
  VITE_APPWRITE_ENDPOINT: import.meta.env.VITE_APPWRITE_ENDPOINT,
  VITE_APPWRITE_FUNCTION_ID: import.meta.env.VITE_APPWRITE_FUNCTION_ID,
  VITE_APPWRITE_DATABASE_ID: import.meta.env.VITE_APPWRITE_DATABASE_ID,
  VITE_APPWRITE_COLLECTION_ID: import.meta.env.VITE_APPWRITE_COLLECTION_ID,
  VITE_APPWRITE_BUCKET_ID: import.meta.env.VITE_APPWRITE_BUCKET_ID,
  VITE_FORM_SUBMISSIONS_DATABASE_ID: import.meta.env.VITE_FORM_SUBMISSIONS_DATABASE_ID,
  VITE_FORM_SUBMISSIONS_TABLE_ID: import.meta.env.VITE_FORM_SUBMISSIONS_TABLE_ID,
  VITE_NOTARY_TEAM_ID: import.meta.env.VITE_NOTARY_TEAM_ID,
  VITE_NOTARY_EMAILS: import.meta.env.VITE_NOTARY_EMAILS,
  VITE_GRANT_FUNCTION_ID: import.meta.env.VITE_GRANT_FUNCTION_ID,
  VITE_GRANT_FILE_ACCESS_FUNCTION_ID: import.meta.env.VITE_GRANT_FILE_ACCESS_FUNCTION_ID,
  VITE_STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  VITE_EMAILJS_PUBLIC_KEY: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
  VITE_EMAILJS_SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID,
  VITE_EMAILJS_TEMPLATE_ID: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
  VITE_APP_BASE_URL: import.meta.env.VITE_APP_BASE_URL,
  VITE_STRIPE_PREFILL_EMAIL: import.meta.env.VITE_STRIPE_PREFILL_EMAIL,
}

// Centralized app base URL resolver for absolute links in emails/notifications
export const APP_BASE_URL: string = (() => {
  const envBase = import.meta.env.VITE_APP_BASE_URL
  if (envBase && typeof envBase === 'string') {
    return String(envBase).replace(/\/+$/, '')
  }
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1'
    return isLocal
      ? 'http://localhost:5173'
      : 'https://notarette-express.notarette.com'
      
  }
  // SSR/unknown environment fallback to production URL
  return 'https://notarette-express.notarette.com'
})()

export const getPortalUrl = (): string => `${APP_BASE_URL}/portal`

// Public logo URL configurable via env, with sane default to /logo.png in public/
export const LOGO_URL: string = (() => {
  const envLogo = import.meta.env.VITE_LOGO_URL
  if (envLogo && typeof envLogo === 'string') {
    return String(envLogo)
  }
  return 'https://api.deepai.org/job-view-file/60a26a2a-2ccc-4ecb-958e-5bbb609d89f2/outputs/output.jpg'
})()