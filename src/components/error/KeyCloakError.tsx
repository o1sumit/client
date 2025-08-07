import React from "react";

interface KeyCloakErrorProps {
  initError: Error;
  envCheck: any;
}

const KeyCloakError: React.FC<KeyCloakErrorProps> = ({
  initError,
  envCheck,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-red-50 dark:bg-red-950">
      <div className="max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h1 className="mb-4 text-xl font-bold text-red-600 dark:text-red-400">
          Keycloak Initialization Error
        </h1>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          {initError.message}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Please check your Keycloak configuration and ensure the server is
          accessible.
        </p>
        <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono overflow-auto">
          <pre className="dark:text-gray-300">
            Environment Variables Status:
          </pre>
          {envCheck && (
            <>
              <pre className="dark:text-gray-300">
                URL: {envCheck.envVars.VITE_KEYCLOAK_URL}
              </pre>
              <pre className="dark:text-gray-300">
                Realm: {envCheck.envVars.VITE_KEYCLOAK_REALM}
              </pre>
              <pre className="dark:text-gray-300">
                Client ID: {envCheck.envVars.VITE_KEYCLOAK_CLIENT_ID}
              </pre>
            </>
          )}
        </div>
        <div className="mt-4">
          <h2 className="text-md font-semibold dark:text-white">How to fix:</h2>
          <ol className="mt-2 ml-4 list-decimal text-sm dark:text-gray-300">
            <li>
              Create a <code className="dark:text-gray-300">.env.local</code>{" "}
              file in the project root
            </li>
            <li>
              Add the following environment variables:
              <pre className="mt-1 p-2 bg-gray-200 dark:bg-gray-700 rounded text-xs dark:text-gray-300">
                VITE_KEYCLOAK_URL=https://your-keycloak-url
                <br />
                VITE_KEYCLOAK_REALM=your-realm
                <br />
                VITE_KEYCLOAK_CLIENT_ID=your-client-id
              </pre>
            </li>
            <li>Restart the development server</li>
          </ol>
        </div>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700 rounded"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    </div>
  );
};

export default KeyCloakError;
