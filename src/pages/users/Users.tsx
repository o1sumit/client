import type { ColumnDef } from "@tanstack/react-table";
import type { User } from "../../types/entities";
import type { UserFormData } from "../../types/forms";
import type { ApiResponse } from "../../types/api";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import { usersAPI } from "../../services/api";
import DataTable from "../../components/DataTable";

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formData, setFormData] = useState<UserFormData>({
    username: "",
    email: "",
    role: "user",
    status: "active",
  });

  // Load users from API
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const response = await usersAPI.getAll();
        // Handle new API response format: { success: true, data: [...], message: "..." }
        const apiResponse = response.data as ApiResponse<User[]>;
        const usersData =
          apiResponse.success && apiResponse.data
            ? apiResponse.data
            : (response.data as unknown as User[]);

        // Map to expected format if needed
        const mappedUsers = (usersData || []).map((user: any) => ({
          user_id: user.user_id,
          username: user.username,
          email: user.email,
          role: user?.account?.type || user.role,
          status: user?.account?.status || user.status,
          accountId: user.accountId || "default-account",
          created_on: user.created_on,
          updated_on: user.updated_on,
        }));

        setUsers(mappedUsers as unknown as User[]);
      } catch (error) {
        console.error("Failed to load users:", error);
        toast.error("Failed to load users");
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleAddUser = async () => {
    if (!formData.username || !formData.email) {
      toast.error("Username and email are required!");

      return;
    }

    try {
      const response = await usersAPI.create(formData);
      const apiResponse = response.data as ApiResponse<User>;
      const newUser =
        apiResponse.success && apiResponse.data
          ? apiResponse.data
          : (response.data as unknown as User);

      if (newUser) {
        setUsers([...users, newUser]);
        setFormData({
          username: "",
          email: "",
          role: "user",
          status: "active",
        });
        setShowAddModal(false);
        toast.success("User added successfully!");
      }
    } catch (error) {
      console.error("Failed to add user:", error);
      toast.error("Failed to add user");
    }
  };

  const handleEditUser = async (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
    });
    setShowAddModal(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser || !formData.username || !formData.email) {
      toast.error("Username and email are required!");

      return;
    }

    try {
      const response = await usersAPI.update(editingUser.user_id, formData);
      const apiResponse = response.data as ApiResponse<User>;
      const updatedUser =
        apiResponse.success && apiResponse.data
          ? apiResponse.data
          : (response.data as unknown as User);

      if (updatedUser) {
        setUsers(
          users.map((user) =>
            user.user_id === editingUser.user_id ? updatedUser : user,
          ),
        );
        setFormData({
          username: "",
          email: "",
          role: "user",
          status: "active",
        });
        setEditingUser(null);
        setShowAddModal(false);
        toast.success("User updated successfully!");
      }
    } catch (error) {
      console.error("Failed to update user:", error);
      toast.error("Failed to update user");
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Are you sure you want to delete ${user.username}?`)) {
      return;
    }

    try {
      await usersAPI.delete(user.user_id);
      setUsers(users.filter((u) => u.user_id !== user.user_id));
      toast.success("User deleted successfully!");
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error("Failed to delete user");
    }
  };

  const handleStatusToggle = async (user: User) => {
    const newStatus = user.status === "active" ? "inactive" : "active";

    try {
      const response = await usersAPI.update(user.user_id, {
        ...user,
        status: newStatus,
      });
      const apiResponse = response.data as ApiResponse<User>;
      const updatedUser =
        apiResponse.success && apiResponse.data
          ? apiResponse.data
          : (response.data as unknown as User);

      if (updatedUser) {
        setUsers(
          users.map((u) => (u.user_id === user.user_id ? updatedUser : u)),
        );
        toast.success(`User ${newStatus} successfully!`);
      }
    } catch (error) {
      console.error("Failed to update user status:", error);
      toast.error("Failed to update user status");
    }
  };

  const handleRefreshData = async () => {
    try {
      toast.loading("Refreshing data...");

      const response = await usersAPI.getAll();
      const apiResponse = response.data as ApiResponse<User[]>;
      const usersData =
        apiResponse.success && apiResponse.data
          ? apiResponse.data
          : (response.data as unknown as User[]);

      const mappedUsers = (usersData || []).map((user: any) => ({
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        role: user?.account?.type || user.role,
        status: user?.account?.status || user.status,
        accountId: user.accountId || "default-account",
        created_on: user.created_on,
        updated_on: user.updated_on,
      }));

      setUsers(mappedUsers as unknown as User[]);

      toast.dismiss();
      toast.success("Data refreshed successfully!");
    } catch (error) {
      console.error("Failed to refresh data:", error);
      toast.dismiss();
      toast.error("Failed to refresh data");
    }
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "username",
      header: "Username",
      cell: ({ row }) => (
        <div className="font-medium">
          {(() => {
            const username = row.getValue("username") as string;
            const atIndex = username.indexOf("@");

            return atIndex !== -1 ? username.slice(0, atIndex) : username;
          })()}
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="text-sm text-gray-500">{row.getValue("email")}</div>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        console.log(row);
        const role = row.getValue("role") as string;

        return (
          <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;

        return (
          <span
            className={`status-badge ${status}`}
            style={{ cursor: "pointer" }}
            onClick={() => handleStatusToggle(row.original)}
          >
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: "created_on",
      header: "Created",
      cell: ({ row }) => (
        <div className="text-sm text-gray-500">
          {new Date(row.getValue("created_on")).toLocaleDateString()}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div>
      <div className="top-header">
        <div className="header-left">
          <h1>Users</h1>
          <p>Manage system users and their roles</p>
        </div>
        <div className="header-right">
          <button className="refresh-btn" onClick={handleRefreshData}>
            <svg
              fill="none"
              height="24"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M3 21v-5h5" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      <DataTable
        addButtonText="Add User"
        columns={columns}
        data={users}
        searchPlaceholder="Search users..."
        onAdd={() => setShowAddModal(true)}
        onDelete={handleDeleteUser}
        onEdit={handleEditUser}
      />

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingUser ? "Edit User" : "Add New User"}</h2>
              <button
                className="close-btn"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingUser(null);
                  setFormData({
                    username: "",
                    email: "",
                    role: "user",
                    status: "active",
                  });
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Username *</label>
                <input
                  placeholder="Enter username"
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  placeholder="Enter email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              {/* <div className="form-group">
                <label>
                  {editingUser
                    ? "Password (leave blank to keep current)"
                    : "Password *"}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder={
                    editingUser ? "Enter new password" : "Enter password"
                  }
                />
              </div> */}
              <div className="form-group">
                <label>Role</label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value as UserFormData["role"],
                    })
                  }
                >
                  <option value="user">User</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as UserFormData["status"],
                    })
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingUser(null);
                  setFormData({
                    username: "",
                    email: "",
                    role: "user",
                    status: "active",
                  });
                }}
              >
                Cancel
              </button>
              <button
                className="save-btn"
                onClick={editingUser ? handleUpdateUser : handleAddUser}
              >
                {editingUser ? "Update" : "Add"} User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
