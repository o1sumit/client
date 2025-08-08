import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { store } from "./store";
import Login from "./components/Login";
import AdminLayout from "./components/AdminLayout";
import Dashboard from "./components/Dashboard";
import Applications from "./components/Applications";
import RightsComponent from "./components/Rights";
import Users from "./components/Users";
import Accounts from "./components/Accounts";
import ManageAdmin from "./components/ManageAdmin";
import PermissionRoute from "./components/PermissionRoute";
import UnauthorizedAccess from "./components/UnauthorizedAccess";
import "./index.css";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" index element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route element={<Dashboard />} />
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
