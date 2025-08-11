import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import App from "./App.tsx";
import "./index.css";
import KeycloakProvider from "./lib/auth/KeycloakProvider.tsx";
import { store, persistor } from "./store";

ReactDOM.createRoot(document.getElementById("root")!).render(
  // <React.StrictMode>
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <KeycloakProvider>
        <App />
      </KeycloakProvider>
    </PersistGate>
  </Provider>
);
