import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App.tsx";
import "./index.css";
import KeycloakProvider from "./lib/auth/KeycloakProvider.tsx";
import { store } from "./store";

ReactDOM.createRoot(document.getElementById("root")!).render(
  // <React.StrictMode>
  <Provider store={store}>
    <KeycloakProvider>
      <App />
    </KeycloakProvider>
  </Provider>
);
