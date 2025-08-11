// Keycloak configuration from environment variables
const keycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL,
  realm: import.meta.env.VITE_KEYCLOAK_REALM,
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
  clientSecret: import.meta.env.VITE_KEYCLOAK_CLIENT_SECRET,
};
// OIDC provider config for react-oidc-context
const keycloak = {
  authority: keycloakConfig.url,
  client_id: keycloakConfig.clientId,
  client_secret: keycloakConfig.clientSecret,
  redirect_uri: window.location.origin,
  post_logout_redirect_uri: window.location.origin,
  response_type: "code",
  scope: "openid profile email",
  onSigninCallback: (user = { access_token: "" }) => {
    // Clean up URL after login
    localStorage.setItem("token", user?.access_token);
    window.history.replaceState({}, document.title, window.location.pathname);
  },
};

// Default initialization options for KeycloakProvider
const defaultInitOptions = {
  onLoad: "check-sso",
  silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
  pkceMethod: "S256",
  checkLoginIframe: false,
};

// Debug logging in development
if (import.meta.env.DEV) {
  // Only log relevant config, not all envs
  // eslint-disable-next-line no-console
  console.log("Keycloak Config:", {
    url: keycloakConfig.url,
    realm: keycloakConfig.realm,
    clientSecret: keycloakConfig.clientSecret,
    clientId: keycloakConfig.clientId,
    environment: import.meta.env.MODE,
  });
}

export { defaultInitOptions, keycloak };
