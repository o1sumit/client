import type { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { accountsAPI, applicationsAPI, rightsAPI } from "../services/api";
import type { RootState } from "../store";
import type {
  Rights,
  Application,
  Account,
  Permission,
} from "../types/entities";
import type { RightsFormData } from "../types/forms";
import type { ApiResponse } from "../types/api";
import DataTable from "./DataTable";

const RightsComponent = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [rights, setRights] = useState<Rights[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRight, setEditingRight] = useState<Rights | null>(null);
  const [availableApplications, setAvailableApplications] = useState<
    Application[]
  >([]);
  const [availableAccounts, setAvailableAccounts] = useState<Account[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  const [formData, setFormData] = useState<RightsFormData>({
    application_id: "",
    account_id: "",
    rights_code: "",
    //    expires_on: "",
  });

  // Load applications from API
  useEffect(() => {
    const loadApplications = async () => {
      // Only load if authenticated
      if (!isAuthenticated) {
        console.log("User not authenticated, skipping applications load");
        return;
      }

      try {
        setLoadingApplications(true);
        console.log("Loading applications from API...");
        const response = await applicationsAPI.getAll();
        console.log("Applications API response:", response);
        // Handle new API response format: { success: true, data: [...], message: "..." }
        const apiResponse = response.data as ApiResponse<Application[]>;
        const applicationsData =
          apiResponse.success && apiResponse.data
            ? apiResponse.data
            : (response.data as unknown as Application[]);
        setAvailableApplications(applicationsData || []);
        console.log("Applications loaded:", applicationsData);
      } catch (error: any) {
        console.error("Failed to load applications:", error);
        console.error("Error details:", error.response?.data);
        toast.error("Failed to load applications");
        // Fallback to mock data if API fails
        setAvailableApplications([
          {
            application_id: "app-001",
            application_name: "APP-X",
            client_secret: "app-x",
            version: "1.0.0",
            created_on: "2024-01-15T10:00:00Z",
            updated_on: "2024-01-15T10:00:00Z",
          },
          {
            application_id: "app-002",
            application_name: "APP-Y",
            client_secret: "app-y",
            version: "1.0.0",
            created_on: "2024-01-16T10:00:00Z",
            updated_on: "2024-01-16T10:00:00Z",
          },
          {
            application_id: "app-003",
            application_name: "APP-Z",
            client_secret: "app-z",
            version: "1.0.0",
            created_on: "2024-01-17T10:00:00Z",
            updated_on: "2024-01-17T10:00:00Z",
          },
        ]);
      } finally {
        setLoadingApplications(false);
      }
    };

    loadApplications();
  }, [isAuthenticated]);

  // Load accounts from API
  useEffect(() => {
    const loadAccounts = async () => {
      // Only load if authenticated
      if (!isAuthenticated) {
        console.log("User not authenticated, skipping accounts load");
        return;
      }

      try {
        setLoadingAccounts(true);
        const response = await accountsAPI.getAll();
        // Handle new API response format: { success: true, data: [...], message: "..." }
        const apiResponse = response.data as ApiResponse<Account[]>;
        const accountsData =
          apiResponse.success && apiResponse.data
            ? apiResponse.data
            : (response.data as unknown as Account[]);
        setAvailableAccounts(accountsData || []);
      } catch (error: any) {
        console.error("Failed to load accounts:", error);
        toast.error("Failed to load accounts");
        // Fallback to mock data if API fails
        setAvailableAccounts([
          {
            account_id: "john-doe-001",
            account_name: "Personal",
            account_type: "Personal",
            status: "active",
            created_on: "2024-01-15T10:00:00Z",
            updated_on: "2024-01-15T10:00:00Z",
          },
          {
            account_id: "jane-smith-001",
            account_name: "Personal",
            account_type: "Personal",
            status: "active",
            created_on: "2024-01-16T10:00:00Z",
            updated_on: "2024-01-16T10:00:00Z",
          },
          {
            account_id: "bob-johnson-001",
            account_name: "Personal",
            account_type: "Personal",
            status: "active",
            created_on: "2024-01-17T10:00:00Z",
            updated_on: "2024-01-17T10:00:00Z",
          },
        ]);
      } finally {
        setLoadingAccounts(false);
      }
    };

    loadAccounts();
  }, [isAuthenticated]);

  // Load rights from API
  useEffect(() => {
    const loadRights = async () => {
      // Only load if authenticated
      if (!isAuthenticated) {
        console.log("User not authenticated, skipping rights load");
        return;
      }

      try {
        setLoading(true);
        const response = await rightsAPI.getAll();
        // Handle new API response format: { success: true, data: [...], message: "..." }
        const apiResponse = response.data as ApiResponse<Rights[]>;
        const rightsData =
          apiResponse.success && apiResponse.data
            ? apiResponse.data
            : (response.data as unknown as Rights[]);

        // Parse permissions JSON string and map to expected format
        const mappedRights = (rightsData || []).map(
          (right: any) =>
            ({
              rights_id: right.rights_id,
              application_id: right.application_id,
              application_name:
                right.application?.application_name || right.application_name,
              account_id: right.account_id,
              account_name: right.account?.account_name || right.account_name,
              rights_code: right.rights_code || "",
              expires_on: right.expires_on,
              granted_by: right.granted_by,
              // status: right.status,
              created_on: right.created_on,
              updated_on: right.updated_on,
            } as Rights)
        );

        setRights(mappedRights);
      } catch (error: any) {
        console.error("Failed to load rights:", error);
        toast.error("Failed to load rights");
        // Fallback to mock data if API fails
        const mockRights: Rights[] = [
          {
            rights_id: "right-001",
            application_id: "app-001",
            application_name: "APP-X",
            account_id: "acc-001",
            account_name: "John Doe",
            rights_code: "jwt-token-001",
            expires_on: "2024-12-31T23:59:59Z",
            // status: "active",
            created_on: "2024-01-15T10:00:00Z",
            updated_on: "2024-01-15T10:00:00Z",
          },
          {
            rights_id: "right-002",
            application_id: "app-002",
            application_name: "APP-Y",
            account_id: "acc-002",
            account_name: "Jane Smith",
            rights_code: "jwt-token-002",
            expires_on: "2024-06-30T23:59:59Z",
            // status: "active",
            created_on: "2024-01-16T10:00:00Z",
            updated_on: "2024-01-16T10:00:00Z",
          },
          {
            rights_id: "right-003",
            application_id: "app-003",
            application_name: "APP-Z",
            account_id: "acc-003",
            account_name: "Bob Johnson",
            rights_code: "jwt-token-003",
            expires_on: undefined,
            // status: "active",
            created_on: "2024-01-17T10:00:00Z",
            updated_on: "2024-01-17T10:00:00Z",
          },
        ];
        setRights(mockRights);
      } finally {
        setLoading(false);
      }
    };

    loadRights();
  }, [isAuthenticated]);

  const handleAddRight = async () => {
    if (!formData.application_id || !formData.account_id) {
      toast.error("Application, Account, and Rights Code are required!");
      return;
    }

    try {
      const payload = {
        application_id: formData.application_id,
        account_id: formData.account_id,
        rights_code: formData.rights_code,
        //  expires_on: formData.expires_on,
      };
      const response = await rightsAPI.create(payload);
      const apiResponse = response.data as ApiResponse<Rights>;
      const newRight =
        apiResponse.success && apiResponse.data
          ? apiResponse.data
          : (response.data as unknown as Rights);

      if (newRight) {
        setRights([...rights, newRight]);
        setFormData({
          application_id: "",
          account_id: "",
          rights_code: "",
          //  expires_on: "",
        });
        setShowAddModal(false);
        toast.success("Right added successfully!");
      }
    } catch (error) {
      console.error("Failed to add right:", error);
      toast.error("Failed to add right");
    }
  };

  const handleEditRight = async (right: Rights) => {
    setEditingRight(right);
    setFormData({
      application_id: right.application_id,
      account_id: right.account_id,
      rights_code: right.rights_code,
      //expires_on: right.expires_on ? right.expires_on.split("T")[0] : "",
    });
    setShowAddModal(true);
  };

  const handleUpdateRight = async () => {
    if (!editingRight || !formData.application_id || !formData.account_id) {
      toast.error(
        "Application, Account, and at least one permission are required!"
      );
      return;
    }

    try {
      const response = await rightsAPI.update(editingRight.rights_id, formData);
      const apiResponse = response.data as ApiResponse<Rights>;
      const updatedRight =
        apiResponse.success && apiResponse.data
          ? apiResponse.data
          : (response.data as unknown as Rights);

      if (updatedRight) {
        // Parse permissions if it's a JSON string
        // if (typeof updatedRight.permissions === "string") {
        //   updatedRight.permissions = JSON.parse(
        //     updatedRight.permissions
        //   ) as Permission[];
        // }

        // Ensure updatedRight has all required properties for Rights
        const updatedRightForTable: Rights = {
          rights_id: updatedRight.rights_id,
          application_id: updatedRight.application_id,
          application_name: updatedRight.application_name,
          account_id: updatedRight.account_id,
          account_name: updatedRight.account_name,
          rights_code: updatedRight.rights_code,
          // expires_on: updatedRight.expires_on,
          // status: updatedRight.status,
          created_on: updatedRight.created_on,
          updated_on: updatedRight.updated_on,
        };

        setRights(
          rights.map((right) =>
            right.rights_id === editingRight.rights_id
              ? updatedRightForTable
              : right
          )
        );
        setFormData({
          application_id: "",
          account_id: "",
          rights_code: "",
          //  expires_on: "",
        });
        setEditingRight(null);
        setShowAddModal(false);
        toast.success("Right updated successfully!");
      }
    } catch (error) {
      console.error("Failed to update right:", error);
      toast.error("Failed to update right");
    }
  };

  const handleDeleteRight = async (right: Rights) => {
    if (
      !confirm(
        `Are you sure you want to delete this right for ${right.application_name}?`
      )
    ) {
      return;
    }

    try {
      await rightsAPI.delete(right.rights_id);
      setRights(rights.filter((r) => r.rights_id !== right.rights_id));
      toast.success("Right deleted successfully!");
    } catch (error) {
      console.error("Failed to delete right:", error);
      toast.error("Failed to delete right");
    }
  };

  const handlePermissionToggle = (permission: Permission) => {
    setFormData((prev) => ({
      ...prev,
      rights_code: prev.rights_code,
    }));
  };

  const handleRefreshData = async () => {
    try {
      toast.loading("Refreshing data...");

      // Refresh applications
      const applicationsResponse = await applicationsAPI.getAll();
      const applicationsApiResponse = applicationsResponse.data as ApiResponse<
        Application[]
      >;
      const applicationsData =
        applicationsApiResponse.success && applicationsApiResponse.data
          ? applicationsApiResponse.data
          : (applicationsResponse.data as unknown as Application[]);
      setAvailableApplications(applicationsData || []);

      // Refresh accounts
      const accountsResponse = await accountsAPI.getAll();
      const accountsApiResponse = accountsResponse.data as ApiResponse<
        Account[]
      >;
      const accountsData =
        accountsApiResponse.success && accountsApiResponse.data
          ? accountsApiResponse.data
          : (accountsResponse.data as unknown as Account[]);
      setAvailableAccounts(accountsData || []);

      // Refresh rights
      const rightsResponse = await rightsAPI.getAll();
      const rightsApiResponse = rightsResponse.data as ApiResponse<Rights[]>;
      const rightsData =
        rightsApiResponse.success && rightsApiResponse.data
          ? rightsApiResponse.data
          : (rightsResponse.data as unknown as Rights[]);

      const mappedRights = (rightsData || []).map(
        (right: any) =>
          ({
            rights_id: right.rights_id,
            application_id: right.application_id,
            application_name:
              right.application?.application_name || right.application_name,
            account_id: right.account_id,
            account_name: right.account?.account_name || right.account_name,
            rights_code: right.rights_code || "",
            // expires_on: right.expires_on,
            granted_by: right.granted_by,
            // status: right.status,
            created_on: right.created_on,
            updated_on: right.updated_on,
          } as unknown as Rights)
      );
      setRights(mappedRights);

      toast.dismiss();
      toast.success("Data refreshed successfully!");
    } catch (error) {
      console.error("Failed to refresh data:", error);
      toast.dismiss();
      toast.error("Failed to refresh data");
    }
  };

  const columns: ColumnDef<Rights>[] = [
    {
      accessorKey: "application_name",
      header: "Application Name",
      cell: ({ row }) => (
        console.log("Row data:", row),
        (<div className="font-medium">{row.getValue("application_name")}</div>)
      ),
    },
    {
      accessorKey: "account_name",
      header: "Account Name",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("account_name")}</div>
      ),
    },
    {
      accessorKey: "rights_code",
      header: "Rights Code",
      cell: ({ row }) => {
        console.log("Rights Code:", row);
        const rightsCode = row.getValue("rights_code") as string;
        const getPermissionClass = (permission: Permission) => {
          switch (permission.toLowerCase()) {
            case "read":
              return "permission-chip permission-read";
            case "write":
              return "permission-chip permission-write";
            case "admin":
              return "permission-chip permission-admin";
            case "owner":
              return "permission-chip permission-owner";
            default:
              return "permission-chip permission-default";
          }
        };
        return (
          <div className="flex flex-wrap gap-1">
            <span
              key={rightsCode}
              className={getPermissionClass(rightsCode as Permission)}
            >
              {rightsCode}
            </span>
          </div>
        );
      },
    },
    // {
    //   accessorKey: "expires_on",
    //   header: "Expires On",
    //   cell: ({ row }) => {
    //     const expiresOn = row.getValue("expires_on") as string | undefined;
    //     return (
    //       <div className="text-sm text-gray-500">
    //         {expiresOn ? new Date(expiresOn).toLocaleDateString() : "Never"}
    //       </div>
    //     );
    //   },
    // },
    {
      accessorKey: "granted_by",
      header: "Granted By",
      cell: ({ row }) => {
        const status = row.getValue("granted_by") as string;
        return <span className={`status-badge ${status}`}>{status}</span>;
      },
    },
    {
      accessorKey: "updated_on",
      header: "Updated On",
      cell: ({ row }) => {
        const updatedOn = row.getValue("updated_on") as string;
        return (
          <span className="text-sm text-gray-500">
            {updatedOn ? new Date(updatedOn).toLocaleDateString() : "Never"}
          </span>
        );
      },
    },
    {
      accessorKey: "created_on",
      header: "Created On",
      cell: ({ row }) => {
        const createdOn = row.getValue("created_on") as string;
        return (
          <span className="text-sm text-gray-500">
            {createdOn ? new Date(createdOn).toLocaleDateString() : "Never"}
          </span>
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
          <h1>Rights Management</h1>
          <p>Manage user permissions and access rights</p>
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
      </div>

      <DataTable
        columns={columns}
        data={rights}
        onAdd={() => setShowAddModal(true)}
        onEdit={handleEditRight}
        onDelete={handleDeleteRight}
        addButtonText="Add Right"
        searchPlaceholder="Search rights..."
      />

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingRight ? "Edit Right" : "Add New Right"}</h2>
              <button
                className="close-btn"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingRight(null);
                  setFormData({
                    application_id: "",
                    account_id: "",
                    rights_code: "",
                    //expires_on: "",
                  });
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Application *</label>
                <select
                  value={formData.application_id}
                  onChange={(e) =>
                    setFormData({ ...formData, application_id: e.target.value })
                  }
                  disabled={loadingApplications}
                >
                  <option value="">
                    {loadingApplications
                      ? "Loading applications..."
                      : "Select Application"}
                  </option>
                  {availableApplications.map((app) => (
                    <option key={app.application_id} value={app.application_id}>
                      {app.application_name}
                    </option>
                  ))}
                </select>
                {loadingApplications && (
                  <div className="text-sm text-gray-500 mt-1">
                    Loading applications from database...
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Account *</label>
                <select
                  value={formData.account_id}
                  onChange={(e) =>
                    setFormData({ ...formData, account_id: e.target.value })
                  }
                  disabled={loadingAccounts}
                >
                  <option value="">
                    {loadingAccounts ? "Loading accounts..." : "Select Account"}
                  </option>
                  {availableAccounts.map((account) => (
                    <option key={account.account_id} value={account.account_id}>
                      {account.account_name}
                    </option>
                  ))}
                </select>
                {loadingAccounts && (
                  <div className="text-sm text-gray-500 mt-1">
                    Loading accounts from database...
                  </div>
                )}
              </div>
              {/* <div className="form-group">
                <label>Permissions *</label>
                <div className="permissions-grid">
                  {(["read", "write", "delete", "admin"] as Permission[]).map(
                    (permission) => (
                      <label key={permission} className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(permission)}
                          onChange={() => handlePermissionToggle(permission)}
                        />
                        {permission.charAt(0).toUpperCase() +
                          permission.slice(1)}
                      </label>
                    )
                  )}
                </div>
              </div> */}

              <div className="form-group">
                <label>Rights Code</label>
                <textarea
                  value={formData.rights_code}
                  onChange={(e) =>
                    setFormData({ ...formData, rights_code: e.target.value })
                  }
                  placeholder="Enter rights code"
                  rows={10}
                />
              </div>
              {/* <div className="form-group">
                <label>Expires At</label>
                <input
                  type="date"
                  value={formData.expires_on}
                  onChange={(e) =>
                    setFormData({ ...formData, expires_on: e.target.value })
                  }
                />
              </div> */}
            </div>
            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingRight(null);
                  setFormData({
                    application_id: "",
                    account_id: "",
                    rights_code: "",
                    //    expires_on: "",
                  });
                }}
              >
                Cancel
              </button>
              <button
                className="save-btn"
                onClick={editingRight ? handleUpdateRight : handleAddRight}
              >
                {editingRight ? "Update" : "Add"} Right
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RightsComponent;
