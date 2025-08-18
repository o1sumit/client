import type { ApiResponse } from "@/types/api";
import type { AccountFormData } from "@/types/forms";
import type { ColumnDef } from "@tanstack/react-table";

import DataTable from "@components/DataTable";
import { accountsAPI, usersAPI } from "@services/api";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import { AccountStatus, AccountType, User } from "@/types/entities";

// Local UI model for this screen
type UIAccount = {
  account_id: string;
  account_name: string;
  account_email: string;
  // account_description: string;
  account_type: string;
  status: string;
  created_on: string;
  updated_on: string;
};

const mapToUIAccount = (account: any): UIAccount => ({
  account_id: account.account_id,
  account_name: account.account_name,
  account_email: account.account_email,
  // account_description: account.account_description,
  account_type: (account.account_type ||
    "Personal") as UIAccount["account_type"],
  status: (account.status || "active") as UIAccount["status"],
  created_on: account.created_on,
  updated_on: account.updated_on,
});

const Accounts = () => {
  const [accounts, setAccounts] = useState<UIAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSharingModal, setShowSharingModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<UIAccount | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<UIAccount | null>(
    null,
  );

  const [formData, setFormData] = useState<AccountFormData>({
    account_name: "",
    account_email: "",
    // account_description: "",
    account_type: "personal" as AccountType,
    status: "active",
  });

  const [sharingData, setSharingData] = useState({
    sharedAccounts: [] as string[],
  });

  // Load accounts from API
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        setLoading(true);
        const response = await accountsAPI.getAll();
        // get all users
        const usersResponse = await usersAPI.getAll();
        const usersData = usersResponse.data as ApiResponse<User[]>;
        const users = usersData.success && usersData.data ? usersData.data : [];

        setUsers(users);

        // Handle new API response format: { success: true, data: [...], message: "..." }
        const apiResponse = response.data as ApiResponse<any[]>;
        const accountsData =
          apiResponse.success && apiResponse.data
            ? apiResponse.data
            : (response.data as unknown as any[]);

        // Map to UI model
        const mappedAccounts: UIAccount[] = (
          Array.isArray(accountsData) ? accountsData : []
        ).map(mapToUIAccount);

        setAccounts(mappedAccounts);
      } catch (error) {
        console.error("Failed to load accounts:", error);
        toast.error("Failed to load accounts");
        // Fallback to mock data if API fails
        setAccounts([]);
      } finally {
        setLoading(false);
      }
    };

    loadAccounts();
  }, []);

  const handleAddAccount = async () => {
    try {
      const response = await accountsAPI.create(formData);
      const newAccount = response.data?.data;

      if (newAccount) {
        const uiAccount = mapToUIAccount(newAccount);

        setAccounts((prev) => [uiAccount, ...prev]);
        toast.success("Account created successfully");
        setShowAddModal(false);
        setFormData({
          account_name: "",
          account_email: "",
          // account_description: "",
          account_type: "personal" as AccountType,
          status: "active",
        });
      }
    } catch (error) {
      console.error("Failed to create account:", error);
      toast.error("Failed to create account");
    }
  };

  const handleEditAccount = async (account: UIAccount) => {
    setEditingAccount(account);
    setFormData({
      account_name: account.account_name,
      account_email: account.account_email,
      // account_description: account.account_description,
      account_type: account.account_type as AccountType,
      status: account.status as AccountStatus,
    });
    setShowAddModal(true);
  };

  const handleUpdateAccount = async () => {
    if (!editingAccount) return;

    try {
      const response = await accountsAPI.update(
        editingAccount.account_id,
        formData,
      );
      const updatedAccount = response.data?.data;

      if (updatedAccount) {
        const uiAccount = mapToUIAccount(updatedAccount);

        setAccounts((prev) =>
          prev.map((acc) =>
            acc.account_id === editingAccount.account_id ? uiAccount : acc,
          ),
        );
        toast.success("Account updated successfully");
        setShowAddModal(false);
        setEditingAccount(null);
        setFormData({
          account_name: "",
          account_email: "",
          // account_description: "",
          account_type: "personal" as AccountType,
          status: "active",
        });
      }
    } catch (error) {
      console.error("Failed to update account:", error);
      toast.error("Failed to update account");
    }
  };

  const handleDeleteAccount = async (account: UIAccount) => {
    if (
      window.confirm(`Are you sure you want to delete ${account.account_name}?`)
    ) {
      try {
        await accountsAPI.delete(account.account_id);
        setAccounts((prev) =>
          prev.filter((acc) => acc.account_id !== account.account_id),
        );
        toast.success("Account deleted successfully");
      } catch (error) {
        console.error("Failed to delete account:", error);
        toast.error("Failed to delete account");
      }
    }
  };

  const handleViewAccount = (account: UIAccount) => {
    setSelectedAccount(account);
    setSharingData({
      sharedAccounts: [],
    });
    setShowSharingModal(true);
  };

  // Reset sharing data when modal opens
  useEffect(() => {
    if (showSharingModal && selectedAccount) {
      // Find users already associated with this account
      const alreadyAssociatedUsers = users
        .filter((user) => user.account_id === selectedAccount.account_id)
        .map((user) => user.user_id);

      setSharingData({
        sharedAccounts: alreadyAssociatedUsers,
      });
    }
  }, [showSharingModal, selectedAccount, users]);

  const handleShareAccount = async () => {
    if (!selectedAccount) return;

    try {
      const response = await usersAPI.update(sharingData.sharedAccounts[0], {
        account_id: selectedAccount.account_id,
      });

      if (response.data.success) {
        setAccounts((prev) =>
          prev.map((acc) =>
            acc.account_id === selectedAccount.account_id
              ? { ...acc, sharedAccounts: sharingData.sharedAccounts }
              : acc,
          ),
        );
        toast.success("Account sharing updated successfully");
        setShowSharingModal(false);
        setSelectedAccount(null);
      } else {
        toast.error("Failed to update account sharing");
      }
    } catch (error) {
      toast.error("Failed to update account sharing");
    }
  };

  const handleUserToggle = (userId: string) => {
    setSharingData((prev) => ({
      ...prev,
      sharedAccounts: prev.sharedAccounts.includes(userId)
        ? prev.sharedAccounts.filter((id) => id !== userId)
        : [...prev.sharedAccounts, userId],
    }));
  };

  const handleRefreshData = async () => {
    try {
      toast.loading("Refreshing data...");

      const response = await accountsAPI.getAll();
      const apiResponse = response.data as ApiResponse<any[]>;
      const accountsData =
        apiResponse.success && apiResponse.data
          ? apiResponse.data
          : (response.data as unknown as any[]);

      const mappedAccounts: UIAccount[] = (
        Array.isArray(accountsData) ? accountsData : []
      ).map(mapToUIAccount);

      setAccounts(mappedAccounts);

      toast.dismiss();
      toast.success("Data refreshed successfully!");
    } catch (error) {
      console.error("Failed to refresh data:", error);
      toast.dismiss();
      toast.error("Failed to refresh data");
    }
  };

  const columns: ColumnDef<UIAccount>[] = [
    {
      accessorKey: "account_name",
      header: "Account Name",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("account_name")}</div>
      ),
    },
    {
      accessorKey: "account_id",
      header: "Account ID",
      cell: ({ row }) => (
        <div className="text-sm text-gray-500">
          {row.getValue("account_id")}
        </div>
      ),
    },
    {
      accessorKey: "account_type",
      header: "Account Type",
      cell: ({ row }) => {
        const type = (row.getValue("account_type") as string) || "Personal";
        const getTypeClass = (type: string) => {
          switch (type.toLowerCase()) {
            case "business":
              return "chip-badge chip-type-business";
            case "personal":
              return "chip-badge chip-type-personal";
            case "temporary":
              return "chip-badge chip-type-temporary";
            default:
              return "chip-badge chip-type-personal";
          }
        };

        return <span className={getTypeClass(type)}>{type}</span>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = (row.getValue("status") as string) || "active";
        const getStatusClass = (status: string) => {
          switch (status.toLowerCase()) {
            case "active":
              return "chip-badge chip-status-active";
            case "inactive":
              return "chip-badge chip-status-inactive";
            case "pending":
              return "chip-badge chip-status-pending";
            default:
              return "chip-badge chip-status-active";
          }
        };

        return <span className={getStatusClass(status)}>{status}</span>;
      },
    },
    {
      accessorKey: "sharedAccounts",
      header: "Shared With",
      cell: ({ row }) => {
        const sharedWith = row.getValue("shared_with") as string[];

        return (
          <div className="text-sm text-gray-500">
            {sharedWith?.length > 0 ? (
              <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 rounded">
                {sharedWith?.length} user{sharedWith?.length !== 1 ? "s" : ""}
              </span>
            ) : (
              <span className="inline-block px-3 py-1 text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200 rounded">
                Not shared
              </span>
            )}
          </div>
        );
      },
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
          <h1>Accounts</h1>
          <p>Manage user accounts and sharing permissions</p>
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
        addButtonText="Add Account"
        columns={columns}
        data={accounts}
        searchPlaceholder="Search accounts..."
        onAdd={() => setShowAddModal(true)}
        onDelete={handleDeleteAccount}
        onEdit={handleEditAccount}
        onView={handleViewAccount}
      />

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingAccount ? "Edit Account" : "Add New Account"}</h2>
              <button
                className="close-btn"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingAccount(null);
                  setFormData({
                    account_name: "",
                    account_email: "",
                    // account_description: "",
                    account_type: "personal" as AccountType,
                    status: "active",
                  });
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Name</label>
                <input
                  placeholder="Enter account name"
                  type="text"
                  value={formData.account_name}
                  onChange={(e) =>
                    setFormData({ ...formData, account_name: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Account Type</label>
                <select
                  value={formData.account_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      account_type: e.target
                        .value as AccountFormData["account_type"],
                    })
                  }
                >
                  <option value="personal">Personal</option>
                  <option value="business">Business</option>
                  <option value="temporary">Temporary</option>
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as AccountFormData["status"],
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
                  setEditingAccount(null);
                  setFormData({
                    account_name: "",
                    account_email: "",
                    // account_description: "",
                    account_type: "personal" as AccountType,
                    status: "active",
                  });
                }}
              >
                Cancel
              </button>
              <button
                className="save-btn"
                onClick={
                  editingAccount ? handleUpdateAccount : handleAddAccount
                }
              >
                {editingAccount ? "Update" : "Add"} Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sharing Modal */}
      {showSharingModal && selectedAccount && (
        <div className="modal-overlay">
          <div
            key={`share-modal-${selectedAccount.account_id}`}
            className="modal"
          >
            <div className="modal-header">
              <h2>Share Account: {selectedAccount.account_name}</h2>
              <button
                className="close-btn"
                onClick={() => {
                  setShowSharingModal(false);
                  setSelectedAccount(null);
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Share with Users</label>
                <div className="users-list">
                  {users.map((user) => {
                    const isCurrentlySelected =
                      sharingData.sharedAccounts.includes(user.user_id);
                    const isAlreadyAssociated =
                      user.account_id === selectedAccount.account_id;
                    const isNewlySelected =
                      isCurrentlySelected && !isAlreadyAssociated;

                    return (
                      <label key={user.user_id} className="user-checkbox">
                        <input
                          checked={isCurrentlySelected}
                          type="checkbox"
                          onChange={() => handleUserToggle(user.user_id)}
                        />
                        <span style={{ marginLeft: "8px" }}>
                          {user.username}{" "}
                          {isAlreadyAssociated && (
                            <span
                              style={{ color: "blue", fontWeight: "bold" }}
                              title="Already associated with this account"
                            >
                              ★
                            </span>
                          )}
                          {isNewlySelected && (
                            <span
                              style={{ color: "green", fontWeight: "bold" }}
                              title="Newly selected for sharing"
                            >
                              ✓
                            </span>
                          )}
                        </span>
                      </label>
                    );
                  })}
                </div>
                <div
                  style={{ marginTop: "10px", fontSize: "12px", color: "#666" }}
                >
                  Currently shared with: {sharingData.sharedAccounts.length}{" "}
                  user(s)
                </div>
                {selectedAccount && (
                  <div
                    style={{
                      marginTop: "10px",
                      padding: "8px",
                      backgroundColor: "#f0f8ff",
                      borderRadius: "4px",
                      fontSize: "12px",
                    }}
                  >
                    <strong>Summary:</strong> This account will be shared with{" "}
                    {sharingData.sharedAccounts.length} user(s)
                    {sharingData.sharedAccounts.length > 0 && (
                      <div style={{ marginTop: "4px" }}>
                        Users:{" "}
                        {sharingData.sharedAccounts
                          .map((userId) => {
                            const user = users.find(
                              (u) => u.user_id === userId,
                            );

                            return user ? user.username : userId;
                          })
                          .join(", ")}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => {
                  setShowSharingModal(false);
                  setSelectedAccount(null);
                }}
              >
                Cancel
              </button>
              <button className="save-btn" onClick={handleShareAccount}>
                Update Sharing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounts;
