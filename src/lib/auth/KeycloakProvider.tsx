import KeyCloakError from "@components/error/KeyCloakError";
import { keycloak } from "@services/keycloak";
import { useEffect, useState, type ReactNode } from "react";
import { AuthProvider } from "react-oidc-context";
import checkKeycloakEnv from "./checkEnv";

interface KeycloakProviderProps {
  children: ReactNode;
}

export const KeycloakProvider = ({ children }: KeycloakProviderProps) => {
  const [initError, setInitError] = useState<Error | null>(null);
  const [envCheck, setEnvCheck] = useState<unknown>(null);

  useEffect(() => {
    const result = checkKeycloakEnv();
    setEnvCheck(result);

    if (!result.isValid) {
      setInitError(new Error("Missing required environment variables"));
    }
  }, []);

  if (initError) {
    if (import.meta.env.DEV) {
      return <KeyCloakError initError={initError} envCheck={envCheck} />;
    } else {
      return <div>Error</div>;
    }
  }

  return <AuthProvider {...keycloak}>{children}</AuthProvider>;
};

export default KeycloakProvider;
