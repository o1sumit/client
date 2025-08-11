import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "./DataTable";
import { accountsAPI } from "../services/api";
import type { AccountFormData } from "../types/forms";
import type { ApiResponse } from "../types/api";
import { AccountStatus, AccountType } from "@/types/entities";

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
  const [selectedAccount, setSelectedAccount] = useState<UIAccount | null>(
    null
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

  const availableUsers = [
    { user_id: "user-001", user_name: "John Doe" },
    { user_id: "user-002", user_name: "Jane Smith" },
    { user_id: "user-003", user_name: "Bob Johnson" },
  ];

  // Load accounts from API
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        setLoading(true);
        const response = await accountsAPI.getAll();
        console.log("=== RAW API RESPONSE ===");
        console.log("Response:", response);
        console.log("Response.data:", response.data);

        // Handle new API response format: { success: true, data: [...], message: "..." }
        const apiResponse = response.data as ApiResponse<any[]>;
        const accountsData =
          apiResponse.success && apiResponse.data
            ? apiResponse.data
            : (response.data as unknown as any[]);

        console.log("Accounts data:", accountsData);

        // Map to UI model
        const mappedAccounts: UIAccount[] = (
          Array.isArray(accountsData) ? accountsData : []
        ).map(mapToUIAccount);

        console.log("Final mapped accounts:", mappedAccounts);
        setAccounts(mappedAccounts);
      } catch (error) {
        console.error("Failed to load accounts:", error);
        toast.error("Failed to load accounts");
        // Fallback to mock data if API fails
        const mockAccounts: UIAccount[] = [
          {
            account_id: "acc-001",
            account_name: "John Doe",
            account_email: "john@example.com",
            // account_description: "Personal account for John Doe",
            account_type: "personal",
            status: "active",
            created_on: "2024-01-15T10:00:00Z",
            updated_on: "2024-01-15T10:00:00Z",
          },
          {
            account_id: "acc-002",
            account_name: "Jane Smith",
            account_email: "jane@example.com",
            // account_description: "Personal account for Jane Smith",
            account_type: "personal",
            status: "active",
            created_on: "2024-01-16T10:00:00Z",
            updated_on: "2024-01-16T10:00:00Z",
          },
          {
            account_id: "acc-003",
            account_name: "Acme Corp",
            account_email: "admin@acme.com",
            // account_description: "Business account for Acme Corporation",
            account_type: "business",
            status: "active",
            created_on: "2024-01-17T10:00:00Z",
            updated_on: "2024-01-17T10:00:00Z",
          },
        ];
        setAccounts(mockAccounts);
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
        formData
      );
      const updatedAccount = response.data?.data;
      if (updatedAccount) {
        const uiAccount = mapToUIAccount(updatedAccount);
        setAccounts((prev) =>
          prev.map((acc) =>
            acc.account_id === editingAccount.account_id ? uiAccount : acc
          )
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
          prev.filter((acc) => acc.account_id !== account.account_id)
        );
        toast.success("Account deleted successfully");
      } catch (error) {
        console.error("Failed to delete account:", error);
        toast.error("Failed to delete account");
      }
    }
  };

  const handleViewAccount = (account: UIAccount) => {
    console.log("=== OPENING SHARE MODAL ===");
    console.log("Account:", account);
    console.log("Available users:", availableUsers);

    // Verify the account has sharedAccounts field

    setSelectedAccount(account);
    setSharingData({
      sharedAccounts: [],
    });
    setShowSharingModal(true);
  };

  // Reset sharing data when modal opens
  useEffect(() => {
    if (showSharingModal && selectedAccount) {
      console.log("=== MODAL OPENED ===");
      console.log("Selected account:", selectedAccount);
      console.log("Selected account sharedAccounts:");
      console.log("Current sharingData:", sharingData);

      const initialSharedAccounts: string[] = [];
      console.log("Setting initial sharedAccounts:", initialSharedAccounts);

      setSharingData({
        sharedAccounts: initialSharedAccounts,
      });
    }
  }, [showSharingModal, selectedAccount]);

  const handleShareAccount = async () => {
    if (!selectedAccount) return;

    console.log("=== SHARING ACCOUNT ===");
    console.log("Selected account:", selectedAccount);
    console.log("Sharing data:", sharingData);
    console.log("API call payload:", {
      sharedAccounts: sharingData.sharedAccounts,
    });

    try {
      // Call the API to update account sharing
      const response = await accountsAPI.update(selectedAccount.account_id, {
        sharedAccounts: sharingData.sharedAccounts,
      } as unknown as any);

      console.log("API response:", response);
      console.log("Response data:", response.data);

      if (response.data.success) {
        // Update local state with the response from API
        setAccounts((prev) =>
          prev.map((acc) =>
            acc.account_id === selectedAccount.account_id
              ? { ...acc, sharedAccounts: sharingData.sharedAccounts }
              : acc
          )
        );
        toast.success("Account sharing updated successfully");
        setShowSharingModal(false);
        setSelectedAccount(null);
      } else {
        console.error("API returned success: false");
        console.error("API error:", response.data);
        toast.error("Failed to update account sharing");
      }
    } catch (error) {
      console.error("=== SHARING ERROR ===");
      console.error("Error object:", error);
      const axiosError = error as {
        response?: { data?: unknown; status?: number };
      };
      console.error("Error response:", axiosError.response);
      console.error("Error data:", axiosError.response?.data);
      console.error("Error status:", axiosError.response?.status);
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
    // {
    //   accessorKey: "email",
    //   header: "Email",
    //   cell: ({ row }) => {
    //     const email = row.getValue("email") as string;
    //     return (
    //       <div className="text-sm text-gray-500">{email || "No email"}</div>
    //     );
    //   },
    // },
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
        <div className="spinner"></div>
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
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M3 21v-5h5" />
            </svg>
            Refresh
          </button>
        </div>
        {/* <div className="header-actions">
          <button
            className="refresh-btn"
            onClick={() => {
              console.log("Current accounts state:", accounts);
              console.log("Available users:", availableUsers);
            }}
            style={{ marginRight: "10px" }}
          >
            Debug Info
          </button>
          <button
            className="refresh-btn"
            onClick={() => {
              // Test with the first account that has sharing data
              const testAccount = accounts.find(
                (acc) => acc.sharedAccounts && acc.sharedAccounts.length > 0
              );
              if (testAccount) {
                console.log("Testing share modal with:", testAccount);
                handleViewAccount(testAccount);
              } else {
                console.log("No accounts with sharing data found");
              }
            }}
            style={{ marginRight: "10px" }}
          >
            Test Share Modal
          </button>
        </div> */}
      </div>

      <DataTable
        columns={columns}
        data={accounts}
        onAdd={() => setShowAddModal(true)}
        onEdit={handleEditAccount}
        onDelete={handleDeleteAccount}
        onView={handleViewAccount}
        addButtonText="Add Account"
        searchPlaceholder="Search accounts..."
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
                  type="text"
                  value={formData.account_name}
                  onChange={(e) =>
                    setFormData({ ...formData, account_name: e.target.value })
                  }
                  placeholder="Enter account name"
                />
              </div>
              {/* <div className="form-group">
                <label>Account ID</label>
                <input
                  type="text"
                  value={formData.accountId}
                  onChange={(e) =>
                    setFormData({ ...formData, accountId: e.target.value })
                  }
                  placeholder="Enter account ID"
                />
              </div> */}
              {/* <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Enter account email"
                />
              </div> */}
              {/* <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.account_description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      account_description: e.target.value,
                    })
                  }
                  placeholder="Enter account description"
                />
              </div> */}
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
            className="modal"
            key={`share-modal-${selectedAccount.account_id}`}
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
                  {availableUsers.map((user) => {
                    const isShared = sharingData.sharedAccounts.includes(
                      user.user_id
                    );
                    console.log(
                      `🔍 Checkbox for ${user.user_name} (${user.user_id}):`
                    );
                    console.log(
                      `  - sharingData.sharedAccounts:`,
                      sharingData.sharedAccounts
                    );
                    console.log(`  - user.id: ${user.user_id}`);
                    console.log(
                      `  - includes check: ${sharingData.sharedAccounts.includes(
                        user.user_id
                      )}`
                    );
                    console.log(`  - isShared: ${isShared}`);
                    return (
                      <label key={user.user_id} className="user-checkbox">
                        <input
                          type="checkbox"
                          checked={isShared}
                          onChange={() => handleUserToggle(user.user_id)}
                        />
                        <span style={{ marginLeft: "8px" }}>
                          {user.user_name}{" "}
                          {isShared && (
                            <span
                              style={{ color: "green", fontWeight: "bold" }}
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
                            const user = availableUsers.find(
                              (u) => u.user_id === userId
                            );
                            return user ? user.user_name : userId;
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
