import AdminLayout from "@components/AdminLayout";
import Login from "@components/Login";
import ManageAdmin from "@components/ManageAdmin";
import PermissionRoute from "@components/PermissionRoute";
import ProtectedRoute from "@components/ProtectedRoute";
import UnauthorizedAccess from "@components/UnauthorizedAccess";
import InviteCodeModal from "@components/InviteCodeModal";
import PublicRoute from "@lib/auth/PublicRoute";
import { AppDispatch, store } from "@store/index";
import { setUser, logout } from "@store/slices/authSlice";
import { useEffect, useState } from "react";
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
import { authAPI } from "@services/api";

const DashboardComponent = () => {
  return <h1>Dashboard</h1>;
};

function App() {
  const { isAuthenticated, isLoading, user, signinRedirect, signoutRedirect } =
    useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isSubmittingInvite, setIsSubmittingInvite] = useState(false);
  const [inviteError, setInviteError] = useState("");

  const handleInviteSubmit = async (inviteCode: string) => {
    setIsSubmittingInvite(true);
    setInviteError(""); // Clear any previous errors
    try {
      await authAPI.register({
        invite_code: inviteCode,
      });
      setShowInviteModal(false);
      // Optionally refresh user data or show success message
      window.location.reload(); // Simple refresh to re-fetch user data
    } catch (error: any) {
      console.error("Failed to submit invite code:", error);
      
      // Extract error message from the response
      const errorMessage = error?.response?.data?.error || 
                          error?.response?.data?.message || 
                          error?.message || 
                          "Invalid invite code. Please check your code and try again.";
      
      setInviteError(errorMessage);
    } finally {
      setIsSubmittingInvite(false);
    }
  };

  const handleInviteCancel = () => {
    // Clear local session and Redux state
    localStorage.clear();
    sessionStorage.clear();
    dispatch(logout());

    // Clear invite error and close modal
    setInviteError("");
    setShowInviteModal(false);
    signoutRedirect({
      id_token_hint: user?.id_token,
      post_logout_redirect_uri: "http://localhost:5173/login",
    });
  };

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      signinRedirect();
    }
    if (isAuthenticated && user) {
      const userData = authAPI.getUser().then((res) => {
        console.log("userData", res);
        if (res?.data?.data?.role === "user") {
          setShowInviteModal(true);
        } else if (res?.data?.data?.role === "admin") {
          dispatch(setUser(res.data.data));
        }
        return res.data;
      });

      console.log("userData", userData);

      if (userData) {
        dispatch(setUser(userData));
      }
    }
  }, [isAuthenticated]);

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

          {/* Invite Code Modal */}
          <InviteCodeModal
            isOpen={showInviteModal}
            onClose={handleInviteCancel}
            onSubmit={handleInviteSubmit}
            isLoading={isSubmittingInvite}
            serverError={inviteError}
            onClearServerError={() => setInviteError("")}
          />
        </div>
      </Router>
    </Provider>
  );
}

export default App;
