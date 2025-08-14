import type { AppDispatch } from "../store";

import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useAuth } from "react-oidc-context";
import {
  LayoutDashboard,
  Rocket,
  Shield,
  Users,
  User,
  UserCog,
  LogOut,
  Menu,
  ChevronRight,
} from "lucide-react";

import { logout } from "../store/slices/authSlice";
import { usePermissions } from "../utils/permissions";

interface SidebarProps {
  children: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const userData = useAuth();
  const { canManageAdmins } = usePermissions();
  // const { user } = useSelector((state: RootState) => state.auth); // Unused for now
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    userData.signoutRedirect();
    dispatch(logout());
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="admin-layout">
      {/* Mobile Menu Button */}
      <button className="mobile-menu-btn" onClick={toggleSidebar}>
        <Menu size={20} />
      </button>

      {/* Sidebar Navigation */}
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="logo-section">
            <div className="logo-icon">
              <Shield size={24} />
            </div>
            <div className="logo-text">
              <h2>APP-ADMIN</h2>
              {/* <p>Multi-Application Management</p> */}
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <Link className={`nav-item ${isActive("/") ? "active" : ""}`} to="/">
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
            <ChevronRight className="nav-arrow" size={16} />
          </Link>
          <Link
            className={`nav-item ${isActive("/applications") ? "active" : ""}`}
            to="/applications"
          >
            <Rocket size={18} />
            <span>Applications</span>
            <ChevronRight className="nav-arrow" size={16} />
          </Link>
          <Link
            className={`nav-item ${isActive("/rights") ? "active" : ""}`}
            to="/rights"
          >
            <Shield size={18} />
            <span>Rights</span>
            <ChevronRight className="nav-arrow" size={16} />
          </Link>
          <Link
            className={`nav-item ${isActive("/accounts") ? "active" : ""}`}
            to="/accounts"
          >
            <Users size={18} />
            <span>Accounts</span>
            <ChevronRight className="nav-arrow" size={16} />
          </Link>
          <Link
            className={`nav-item ${isActive("/users") ? "active" : ""}`}
            to="/users"
          >
            <User size={18} />
            <span>Users</span>
            <ChevronRight className="nav-arrow" size={16} />
          </Link>
          {canManageAdmins() && (
            <Link
              className={`nav-item ${
                isActive("/manage-admin") ? "active" : ""
              }`}
              to="/manage-admin"
            >
              <UserCog size={18} />
              <span>Manage Admin</span>
              <ChevronRight className="nav-arrow" size={16} />
            </Link>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              <User size={20} />
            </div>
            <div className="user-details">
              <p className="user-name">
                Welcome, {userData.user?.profile.given_name || "Admin"}!
              </p>
              {/* <p className="user-role">Administrator</p> */}
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">{children}</div>
    </div>
  );
};

export default Sidebar;
