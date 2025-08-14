import AdminLayout from "@components/AdminLayout";
import Login from "@components/Login";
import ManageAdmin from "@components/ManageAdmin";
import PermissionRoute from "@components/PermissionRoute";
import ProtectedRoute from "@components/ProtectedRoute";
import UnauthorizedAccess from "@components/UnauthorizedAccess";
import PublicRoute from "@lib/auth/PublicRoute";
import { AppDispatch, store } from "@store/index";
import { setUser } from "@store/slices/authSlice";
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

import Users from "@/pages/users/Users";
import RightsComponent from "@/pages/rights/Rights";
import Applications from "@/pages/applications/Applications";
import Accounts from "@/pages/accounts/Accounts";
import "./index.css";

const DashboardComponent = () => {
  return <h1>Dashboard</h1>;
};

function App() {
  const { isAuthenticated, isLoading, user, signinRedirect } = useAuth();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      signinRedirect();
    }
    if (isAuthenticated && user) {
      dispatch(setUser(user));
    }
  }, [isAuthenticated, user, isLoading]);

  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Toaster position="top-right" />
          <Routes>
            <Route
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
              path="/login"
            />
            <Route
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
              path="/"
            >
              <Route index element={<DashboardComponent />} />
              <Route element={<Applications />} path="applications" />
              <Route element={<RightsComponent />} path="rights" />
              <Route element={<Users />} path="users" />
              <Route element={<Accounts />} path="accounts" />
              <Route
                element={
                  <PermissionRoute
                    fallbackComponent={<UnauthorizedAccess />}
                    requiredPermission="view_admin_management"
                  >
                    <ManageAdmin />
                  </PermissionRoute>
                }
                path="manage-admin"
              />
            </Route>
            <Route element={<Navigate replace to="/" />} path="*" />
          </Routes>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
