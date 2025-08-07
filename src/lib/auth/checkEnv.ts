/**
 * Utility to check if required environment variables are set
 */

export const checkKeycloakEnv = () => {
  const requiredVars = [
    "VITE_KEYCLOAK_URL",
    "VITE_KEYCLOAK_REALM",
    "VITE_KEYCLOAK_CLIENT_ID",
  ];

  const missingVars = requiredVars.filter(
    (varName) => !import.meta.env[varName]
  );

  if (missingVars.length > 0) {
    console.error(
      `Missing required environment variables: ${missingVars.join(", ")}`
    );
    return {
      isValid: false,
      missingVars,
      envVars: {
        VITE_KEYCLOAK_URL: import.meta.env.VITE_KEYCLOAK_URL || "Not defined",
        VITE_KEYCLOAK_REALM:
          import.meta.env.VITE_KEYCLOAK_REALM || "Not defined",
        VITE_KEYCLOAK_CLIENT_ID:
          import.meta.env.VITE_KEYCLOAK_CLIENT_ID || "Not defined",
      },
    };
  }

  return {
    isValid: true,
    envVars: {
      VITE_KEYCLOAK_URL: import.meta.env.VITE_KEYCLOAK_URL,
      VITE_KEYCLOAK_REALM: import.meta.env.VITE_KEYCLOAK_REALM,
      VITE_KEYCLOAK_CLIENT_ID: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
    },
  };
};

export default checkKeycloakEnv;
