import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { useAuth } from "react-oidc-context";
import { Provider, useDispatch } from "react-redux";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import Accounts from "./components/Accounts";
import AdminLayout from "./components/AdminLayout";
import Applications from "./components/Applications";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import ManageAdmin from "./components/ManageAdmin";
import PermissionRoute from "./components/PermissionRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import RightsComponent from "./components/Rights";
import UnauthorizedAccess from "./components/UnauthorizedAccess";
import Users from "./components/Users";
import "./index.css";
import PublicRoute from "./lib/auth/PublicRoute";
import { AppDispatch, store } from "./store";
import { setUser } from "./store/slices/authSlice";

function App() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    if (isAuthenticated && user) {
      dispatch(setUser(user));
    }
  }, [isAuthenticated, user]);

  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Toaster position="top-right" />
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="applications" element={<Applications />} />
              <Route path="rights" element={<RightsComponent />} />
              <Route path="users" element={<Users />} />
              <Route path="accounts" element={<Accounts />} />
              <Route
                path="manage-admin"
                element={
                  <PermissionRoute
                    requiredPermission="view_admin_management"
                    fallbackComponent={<UnauthorizedAccess />}
                  >
                    <ManageAdmin />
                  </PermissionRoute>
                }
              />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
