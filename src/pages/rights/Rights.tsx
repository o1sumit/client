import type { RootState } from "@/store";
import type { Account, Application } from "@/types/entities";
import type { RightsFormData } from "@/types/forms";
import type { ColumnDef } from "@tanstack/react-table";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";

import DataTable from "../../components/DataTable";

import { RightsRow } from "@/types/rights.type";
import { accountsAPI, applicationsAPI, rightsAPI } from "@/services/api";

// Simplified response extraction
const extractData = (response: any) => {
  const data = response.data;

  return (data?.success ? data.data : data) || [];
};

// Simplified row transformation
const toRow = (
  r: any,
  applications: Application[],
  accounts: Account[],
): RightsRow => ({
  rights_id: r.rights_id,
  application_id: r.application_id,
  application_name:
    applications.find((a) => a.application_id === r.application_id)
      ?.application_name || "",
  account_id: r.account_id,
  account_name:
    accounts.find((a) => a.account_id === r.account_id)?.account_name || "",
  rights_code: r.rights_code,
  expires_on: r.expires_on,
  granted_by: r.grantedBy?.username,
  created_on: r.created_on,
  updated_on: r.updated_on,
});

const emptyFormData: RightsFormData = {
  application_id: "",
  account_id: "",
  rights_code: "",
};

const RightsComponent = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [rights, setRights] = useState<RightsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRight, setEditingRight] = useState<RightsRow | null>(null);
  const [availableApplications, setAvailableApplications] = useState<
    Application[]
  >([]);
  const [availableAccounts, setAvailableAccounts] = useState<Account[]>([]);
  const [formData, setFormData] = useState<RightsFormData>(emptyFormData);

  // Memoized permission class function
  const getPermissionClass = useCallback((permission: string) => {
    const baseClass = "permission-chip";

    switch (permission.toLowerCase()) {
      case "read":
        return `${baseClass} permission-read`;
      case "write":
        return `${baseClass} permission-write`;
      case "admin":
        return `${baseClass} permission-admin`;
      case "owner":
        return `${baseClass} permission-owner`;
      default:
        return `${baseClass} permission-default`;
    }
  }, []);

  // Memoized columns definition
  const columns: ColumnDef<RightsRow>[] = useMemo(
    () => [
      {
        accessorKey: "application_name",
        header: "Application Name",
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("application_name")}</div>
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
          const rightsCode = row.getValue("rights_code") as string;

          return (
            <div className="flex flex-wrap gap-1">
              <span className="permission-chip permission-default">
                {rightsCode}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "granted_by",
        header: "Granted By",
        cell: ({ row }) => {
          const grantedBy = row.getValue("granted_by") as string;

          return (
            <span className={`status-badge ${grantedBy}`}>{grantedBy}</span>
          );
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
    ],
    [getPermissionClass],
  );

  // Consolidated data loading
  const loadAllData = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const [applicationsRes, accountsRes, rightsRes] = await Promise.all([
        applicationsAPI.getAll(),
        accountsAPI.getAll(),
        rightsAPI.getAll(),
      ]);

      const applications = extractData(applicationsRes);
      const accounts = extractData(accountsRes);
      const rightsData = extractData(rightsRes);

      setAvailableApplications(applications);
      setAvailableAccounts(accounts);
      setRights(rightsData.map((r: any) => toRow(r, applications, accounts)));
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const closeModal = useCallback(() => {
    setShowAddModal(false);
    setEditingRight(null);
    setFormData(emptyFormData);
  }, []);

  const handleAddRight = useCallback(async () => {
    if (!formData.application_id || !formData.account_id) {
      toast.error("Application, Account, and Rights Code are required!");

      return;
    }

    try {
      const response = await rightsAPI.create(formData as any);
      const newRightRaw = extractData(response)[0] || response.data;
      const newRight = toRow(
        newRightRaw,
        availableApplications,
        availableAccounts,
      );

      setRights((prev) => [...prev, newRight]);
      closeModal();
      toast.success("Right added successfully!");
    } catch (error) {
      console.error("Failed to add right:", error);
      toast.error("Failed to add right");
    }
  }, [formData, availableApplications, availableAccounts, closeModal]);

  const handleEditRight = useCallback((right: RightsRow) => {
    setEditingRight(right);
    setFormData({
      application_id: right.application_id,
      account_id: right.account_id,
      rights_code: right.rights_code,
    });
    setShowAddModal(true);
  }, []);

  const handleUpdateRight = useCallback(async () => {
    if (!editingRight || !formData.application_id || !formData.account_id) {
      toast.error("Application, Account, and Rights Code are required!");

      return;
    }

    try {
      const response = await rightsAPI.update(editingRight.rights_id, formData);
      const updatedRaw = extractData(response)[0] || response.data;
      const updatedRight = toRow(
        updatedRaw,
        availableApplications,
        availableAccounts,
      );

      setRights((prev) =>
        prev.map((right) =>
          right.rights_id === editingRight.rights_id ? updatedRight : right,
        ),
      );
      closeModal();
      toast.success("Right updated successfully!");
    } catch (error) {
      console.error("Failed to update right:", error);
      toast.error("Failed to update right");
    }
  }, [
    editingRight,
    formData,
    availableApplications,
    availableAccounts,
    closeModal,
  ]);

  const handleDeleteRight = useCallback(async (right: RightsRow) => {
    if (
      !confirm(
        `Are you sure you want to delete this right for ${right.application_name}?`,
      )
    ) {
      return;
    }

    try {
      await rightsAPI.delete(right.rights_id);
      setRights((prev) => prev.filter((r) => r.rights_id !== right.rights_id));
      toast.success("Right deleted successfully!");
    } catch (error) {
      console.error("Failed to delete right:", error);
      toast.error("Failed to delete right");
    }
  }, []);

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
          <h1>Rights Management</h1>
          <p>Manage user permissions and access rights</p>
        </div>
        <div className="header-right">
          <button className="refresh-btn" onClick={loadAllData}>
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
        addButtonText="Add Right"
        columns={columns}
        data={rights}
        searchPlaceholder="Search rights..."
        onAdd={() => setShowAddModal(true)}
        onDelete={handleDeleteRight}
        onEdit={handleEditRight}
      />

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingRight ? "Edit Right" : "Add New Right"}</h2>
              <button className="close-btn" onClick={closeModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Application *</label>
                <select
                  value={formData.application_id}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      application_id: e.target.value,
                    }))
                  }
                >
                  <option value="">Select Application</option>
                  {availableApplications.map((app) => (
                    <option key={app.application_id} value={app.application_id}>
                      {app.application_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Account *</label>
                <select
                  value={formData.account_id}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      account_id: e.target.value,
                    }))
                  }
                >
                  <option value="">Select Account</option>
                  {availableAccounts.map((account) => (
                    <option key={account.account_id} value={account.account_id}>
                      {account.account_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Rights Code</label>
                <textarea
                  placeholder="Enter rights code"
                  rows={10}
                  value={formData.rights_code}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      rights_code: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={closeModal}>
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
