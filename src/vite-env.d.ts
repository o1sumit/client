/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_KEYCLOAK_URL: string
  readonly VITE_KEYCLOAK_REALM: string
  readonly VITE_KEYCLOAK_CLIENT_ID: string
  readonly VITE_KEYCLOAK_CLIENT_SECRET: string
  readonly VITE_API_URL: string
  readonly DEV: boolean
  readonly MODE: string
  // Add other VITE_ prefixed env vars as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
