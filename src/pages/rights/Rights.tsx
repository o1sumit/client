import type { RootState } from "@/store";
import type { Account, Application } from "@/types/entities";
import type { RightsFormData } from "@/types/forms";
import type { ColumnDef } from "@tanstack/react-table";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";

import DataTable from "../../components/DataTable";
import JsonModal from "@/components/json/JsonModal";
import "./RightsChips.css";

import { RightsRow } from "@/types/rights.type";
import { accountsAPI, applicationsAPI, rightsAPI } from "@/services/api";
import { Eye } from "lucide-react";

// Simplified response extraction
const extractData = (response: any) => {
  const data = response.data;

  return (data?.success ? data.data : data) || [];
};

// Helper to extract expiry from rights_code JSON string
const getExpiryFromRightsCode = (rightsCode: string): string | undefined => {
  try {
    const parsed = JSON.parse(rightsCode || "{}");
    return typeof parsed.expiry === "string" ? parsed.expiry : undefined;
  } catch {
    return undefined;
  }
};

// Simplified row transformation
const toRow = (
  r: any,
  applications: Application[],
  accounts: Account[]
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
  // Derive expiry from rights_code JSON (expiry is part of rights_code JSON, not separate)
  expires_on: getExpiryFromRightsCode(r.rights_code),
  granted_by: r.grantedBy?.username,
  created_on: r.created_on,
  updated_on: r.updated_on,
});

// New interface for dynamic rights code structure
interface RightsCodeData {
  expiry: string;
  username: string;
  totalNumberUsers: string;
  customFields: { key: string; value: string }[];
}

// Updated form data interface
interface ExtendedRightsFormData extends Omit<RightsFormData, "rights_code"> {
  rightsCodeData: RightsCodeData;
}

const emptyRightsCodeData: RightsCodeData = {
  expiry: "",
  username: "",
  totalNumberUsers: "",
  customFields: [{ key: "", value: "" }],
};

const emptyFormData: ExtendedRightsFormData = {
  application_id: "",
  account_id: "",
  rightsCodeData: emptyRightsCodeData,
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
  const [formData, setFormData] =
    useState<ExtendedRightsFormData>(emptyFormData);
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [showJsonModal, setShowJsonModal] = useState(false);
  // Inline edit states for chip-like UI
  const [editingRequired, setEditingRequired] = useState<
    null | "expiry" | "username" | "totalNumberUsers"
  >(null);
  const [editingCustomIndex, setEditingCustomIndex] = useState<number | null>(
    null
  );

  // Formik setup
  const validationSchema = useMemo(
    () =>
      Yup.object({
        application_id: Yup.string().trim().required("Required"),
        account_id: Yup.string().trim().required("Required"),
        rightsCodeData: Yup.object({
          expiry: Yup.string()
            .trim()
            .required("Required")
            .matches(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
          username: Yup.string().trim().required("Required"),
          totalNumberUsers: Yup.string().trim().required("Required"),
          customFields: Yup.array()
            .of(
              Yup.object({
                key: Yup.string().test(
                  "key-required",
                  "Required",
                  function (val) {
                    const siblingValue = (this.parent as any)?.value;
                    const hasAny =
                      !!(val && String(val).trim()) ||
                      !!(siblingValue && String(siblingValue).trim());
                    return hasAny ? !!(val && String(val).trim()) : true;
                  }
                ),
                value: Yup.string().test(
                  "value-required",
                  "Required",
                  function (val) {
                    const siblingKey = (this.parent as any)?.key;
                    const hasAny =
                      !!(val && String(val).trim()) ||
                      !!(siblingKey && String(siblingKey).trim());
                    return hasAny ? !!(val && String(val).trim()) : true;
                  }
                ),
              })
            )
            .required(),
        }),
      }),
    []
  );

  const formik = useFormik<ExtendedRightsFormData>({
    initialValues: formData,
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      const submitData = {
        application_id: values.application_id,
        account_id: values.account_id,
        rights_code: convertRightsCodeToJSON(values.rightsCodeData),
      } as any;

      try {
        if (editingRight) {
          const response = await rightsAPI.update(
            editingRight.rights_id,
            submitData
          );
          const updatedRaw = extractData(response)[0] || response.data;
          const updatedRight = toRow(
            updatedRaw,
            availableApplications,
            availableAccounts
          );
          setRights((prev) =>
            prev.map((right) =>
              right.rights_id === editingRight.rights_id ? updatedRight : right
            )
          );
          toast.success("Right updated successfully!");
        } else {
          const response = await rightsAPI.create(submitData);
          const newRightRaw = extractData(response)[0] || response.data;
          const newRight = toRow(
            newRightRaw,
            availableApplications,
            availableAccounts
          );
          setRights((prev) => [...prev, newRight]);
          toast.success("Right added successfully!");
        }
        closeModal();
      } catch (error) {
        console.error("Failed to save right:", error);
        toast.error("Failed to save right");
      }
    },
  });

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
            <div className="flex items-center gap-2">
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: 14,
                  fontWeight: 600,
                  marginTop: 2,
                  marginRight: 2,
                  marginBottom: 2,
                }}
              >
                ••••••••
              </span>
              <button
                style={{
                  marginTop: 2,
                  marginRight: 2,
                  marginBottom: 2,
                  cursor: "pointer",
                  border: "1px solid #e0e0e0",
                  borderRadius: 4,
                  padding: 4,
                  paddingBottom: 2,
                  backgroundColor: "#f0f0f0",
                  color: "#666",
                }}
                onClick={() => {
                  try {
                    const jsonData = JSON.parse(rightsCode);
                    setFormData((prev) => ({
                      ...prev,
                      rightsCodeData: jsonData,
                    }));
                    setShowJsonModal(true);
                  } catch (error) {
                    // If not valid JSON, show as string
                    setShowJsonModal(true);
                  }
                }}
                title="View Rights Code"
              >
                <Eye size={16} />
              </button>
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
    [getPermissionClass]
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
    formik.resetForm({ values: emptyFormData });
  }, []);

  // Helper function to convert RightsCodeData to JSON string
  const convertRightsCodeToJSON = useCallback(
    (rightsCodeData: RightsCodeData): string => {
      const result: Record<string, string> = {
        expiry: rightsCodeData.expiry,
        username: rightsCodeData.username,
        totalNumberUsers: rightsCodeData.totalNumberUsers,
      };

      // Add custom fields
      rightsCodeData.customFields.forEach((field) => {
        if (field.key.trim() && field.value.trim()) {
          result[field.key.trim()] = field.value.trim();
        }
      });

      return JSON.stringify(result);
    },
    []
  );

  // Helper function to parse JSON string back to RightsCodeData
  const parseJSONToRightsCode = useCallback(
    (jsonString: string): RightsCodeData => {
      try {
        const parsed = JSON.parse(jsonString || "{}");
        const customFields: { key: string; value: string }[] = [];

        // Extract custom fields (excluding required fields)
        Object.entries(parsed).forEach(([key, value]) => {
          if (!["expiry", "username", "totalNumberUsers"].includes(key)) {
            customFields.push({ key, value: String(value) });
          }
        });

        // Ensure at least one empty custom field for adding new ones
        if (customFields.length === 0) {
          customFields.push({ key: "", value: "" });
        }

        return {
          expiry: parsed.expiry || "",
          username: parsed.username || "",
          totalNumberUsers: parsed.totalNumberUsers || "",
          customFields,
        };
      } catch {
        return emptyRightsCodeData;
      }
    },
    []
  );

  // Function to add a new custom field (Formik as source of truth)
  const addCustomField = useCallback(() => {
    const list = formik.values.rightsCodeData.customFields || [];
    const nextList = [...list, { key: "", value: "" }];
    formik.setFieldValue("rightsCodeData.customFields", nextList);
    setEditingCustomIndex(list.length);
  }, [formik]);

  // Function to remove a custom field
  const removeCustomField = useCallback(
    (index: number) => {
      const list = formik.values.rightsCodeData.customFields || [];
      const nextList = list.filter((_, i) => i !== index);
      formik.setFieldValue("rightsCodeData.customFields", nextList);
    },
    [formik]
  );

  // Function to update custom field
  const updateCustomField = useCallback(
    (index: number, field: "key" | "value", newValue: string) => {
      const list = formik.values.rightsCodeData.customFields || [];
      const nextList = list.map((item, i) =>
        i === index ? { ...item, [field]: newValue } : item
      );
      formik.setFieldValue("rightsCodeData.customFields", nextList);
    },
    [formik]
  );

  const handleAddRight = useCallback(async () => {
    if (!formData.application_id || !formData.account_id) {
      toast.error("Application and Account are required!");
      return;
    }

    if (
      !formData.rightsCodeData.expiry ||
      !formData.rightsCodeData.username ||
      !formData.rightsCodeData.totalNumberUsers
    ) {
      toast.error("Expiry, Username, and Total Number of Users are required!");
      return;
    }

    try {
      const rightsCodeJSON = convertRightsCodeToJSON(formData.rightsCodeData);
      const submitData = {
        application_id: formData.application_id,
        account_id: formData.account_id,
        rights_code: rightsCodeJSON,
      };

      const response = await rightsAPI.create(submitData as any);
      const newRightRaw = extractData(response)[0] || response.data;
      const newRight = toRow(
        newRightRaw,
        availableApplications,
        availableAccounts
      );

      setRights((prev) => [...prev, newRight]);
      closeModal();
      toast.success("Right added successfully!");
    } catch (error) {
      console.error("Failed to add right:", error);
      toast.error("Failed to add right");
    }
  }, [
    formData,
    availableApplications,
    availableAccounts,
    closeModal,
    convertRightsCodeToJSON,
  ]);

  const handleEditRight = useCallback(
    (right: RightsRow) => {
      setEditingRight(right);
      setFormData({
        application_id: right.application_id,
        account_id: right.account_id,
        rightsCodeData: parseJSONToRightsCode(right.rights_code),
      });
      setShowAddModal(true);
    },
    [parseJSONToRightsCode]
  );

  const handleUpdateRight = useCallback(async () => {
    if (!editingRight || !formData.application_id || !formData.account_id) {
      toast.error("Application and Account are required!");
      return;
    }

    if (
      !formData.rightsCodeData.expiry ||
      !formData.rightsCodeData.username ||
      !formData.rightsCodeData.totalNumberUsers
    ) {
      toast.error("Expiry, Username, and Total Number of Users are required!");
      return;
    }

    try {
      const rightsCodeJSON = convertRightsCodeToJSON(formData.rightsCodeData);
      const submitData = {
        application_id: formData.application_id,
        account_id: formData.account_id,
        rights_code: rightsCodeJSON,
      };

      const response = await rightsAPI.update(
        editingRight.rights_id,
        submitData
      );
      const updatedRaw = extractData(response)[0] || response.data;
      const updatedRight = toRow(
        updatedRaw,
        availableApplications,
        availableAccounts
      );

      setRights((prev) =>
        prev.map((right) =>
          right.rights_id === editingRight.rights_id ? updatedRight : right
        )
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
    convertRightsCodeToJSON,
  ]);

  const handleDeleteRight = useCallback(async (right: RightsRow) => {
    if (
      !confirm(
        `Are you sure you want to delete this right for ${right.application_name}?`
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

  const formattedRightsJson = useMemo(() => {
    try {
      const json = convertRightsCodeToJSON(formik.values.rightsCodeData);
      return JSON.stringify(JSON.parse(json || "{}"), null, 2);
    } catch {
      return "{}";
    }
  }, [formik.values, convertRightsCodeToJSON]);

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
                  value={formik.values.application_id}
                  onChange={(e) =>
                    formik.setFieldValue("application_id", e.target.value)
                  }
                  onBlur={() => formik.setFieldTouched("application_id", true)}
                >
                  <option value="">Select Application</option>
                  {availableApplications.map((app) => (
                    <option key={app.application_id} value={app.application_id}>
                      {app.application_name}
                    </option>
                  ))}
                </select>
                {formik.touched.application_id &&
                  formik.errors.application_id && (
                    <span className="text-red-500-sm">
                      {formik.errors.application_id as string}
                    </span>
                  )}
              </div>

              <div className="form-group">
                <label>Account *</label>
                <select
                  value={formik.values.account_id}
                  onChange={(e) =>
                    formik.setFieldValue("account_id", e.target.value)
                  }
                  onBlur={() => formik.setFieldTouched("account_id", true)}
                >
                  <option value="">Select Account</option>
                  {availableAccounts.map((account) => (
                    <option key={account.account_id} value={account.account_id}>
                      {account.account_name}
                    </option>
                  ))}
                </select>
                {formik.touched.account_id && formik.errors.account_id && (
                  <span className="text-red-500-sm">
                    {formik.errors.account_id as string}
                  </span>
                )}
              </div>

              {/* Rights Code Section - Chip style with click-to-edit */}
              <div className="form-group">
                <label>Rights Code</label>

                {/* Required rows (styled like chips grid) */}
                <div className="kv-grid" style={{ marginTop: 4 }}>
                  {/* Expiry row */}
                  <div className="kv-row">
                    <div className="kv-chip label">Expiry</div>
                    {editingRequired === "expiry" ? (
                      <input
                        className="kv-input"
                        type="date"
                        value={formik.values.rightsCodeData.expiry}
                        onChange={(e) =>
                          formik.setFieldValue(
                            "rightsCodeData.expiry",
                            e.target.value
                          )
                        }
                        onBlur={() => setEditingRequired(null)}
                        autoFocus
                      />
                    ) : (
                      <button
                        type="button"
                        className={`kv-chip ${formik.values.rightsCodeData.expiry ? "" : "placeholder"}`}
                        onClick={() => setEditingRequired("expiry")}
                      >
                        {formik.values.rightsCodeData.expiry || "Set…"}
                      </button>
                    )}
                    {formik.touched.rightsCodeData?.expiry &&
                      (formik.errors.rightsCodeData as any)?.expiry && (
                        <span className="text-red-500-sm">
                          {(formik.errors.rightsCodeData as any).expiry}
                        </span>
                      )}
                  </div>

                  {/* Username row */}
                  <div className="kv-row">
                    <div className="kv-chip label">Username</div>
                    {editingRequired === "username" ? (
                      <input
                        className="kv-input"
                        type="text"
                        value={formik.values.rightsCodeData.username}
                        placeholder="Enter username"
                        onChange={(e) =>
                          formik.setFieldValue(
                            "rightsCodeData.username",
                            e.target.value
                          )
                        }
                        onBlur={() => setEditingRequired(null)}
                        autoFocus
                      />
                    ) : (
                      <button
                        type="button"
                        className={`kv-chip ${formik.values.rightsCodeData.username ? "" : "placeholder"}`}
                        onClick={() => setEditingRequired("username")}
                      >
                        {formik.values.rightsCodeData.username || "Set…"}
                      </button>
                    )}
                    {formik.touched.rightsCodeData?.username &&
                      (formik.errors.rightsCodeData as any)?.username && (
                        <span className="text-red-500-sm">
                          {(formik.errors.rightsCodeData as any).username}
                        </span>
                      )}
                  </div>

                  {/* Total users row */}
                  <div className="kv-row">
                    <div className="kv-chip label">Total users</div>
                    {editingRequired === "totalNumberUsers" ? (
                      <input
                        className="kv-input"
                        type="number"
                        min="1"
                        placeholder="Total users"
                        value={formik.values.rightsCodeData.totalNumberUsers}
                        onChange={(e) =>
                          formik.setFieldValue(
                            "rightsCodeData.totalNumberUsers",
                            e.target.value
                          )
                        }
                        onBlur={() => setEditingRequired(null)}
                        autoFocus
                      />
                    ) : (
                      <button
                        type="button"
                        className={`kv-chip ${formik.values.rightsCodeData.totalNumberUsers ? "" : "placeholder"}`}
                        onClick={() => setEditingRequired("totalNumberUsers")}
                      >
                        {formik.values.rightsCodeData.totalNumberUsers ||
                          "Set…"}
                      </button>
                    )}
                    {formik.touched.rightsCodeData?.totalNumberUsers &&
                      (formik.errors.rightsCodeData as any)
                        ?.totalNumberUsers && (
                        <span className="text-red-500-sm">
                          {
                            (formik.errors.rightsCodeData as any)
                              .totalNumberUsers
                          }
                        </span>
                      )}
                  </div>
                </div>

                {/* Spacer */}
                <div style={{ height: 8 }} />

                {/* Custom fields grid (two columns: key, value) */}
                <div className="kv-grid">
                  {formik.values.rightsCodeData.customFields.map(
                    (field, index) => {
                      const isEditing = editingCustomIndex === index;
                      return (
                        <div key={index} className="kv-row">
                          {isEditing ? (
                            <input
                              className="kv-input"
                              type="text"
                              placeholder="Field name"
                              value={field.key}
                              onChange={(e) => {
                                updateCustomField(index, "key", e.target.value);
                                formik.setFieldTouched(
                                  `rightsCodeData.customFields.${index}.key`,
                                  true,
                                  false
                                );
                              }}
                              autoFocus
                            />
                          ) : (
                            <button
                              type="button"
                              className={`kv-chip ${field.key ? "" : "placeholder"}`}
                              onClick={() => setEditingCustomIndex(index)}
                            >
                              {field.key || "Field name"}
                            </button>
                          )}

                          <div className="kv-value">
                            {isEditing ? (
                              <input
                                className="kv-input kv-input-value"
                                type="text"
                                placeholder="Value"
                                value={field.value}
                                onChange={(e) => {
                                  updateCustomField(
                                    index,
                                    "value",
                                    e.target.value
                                  );
                                  formik.setFieldTouched(
                                    `rightsCodeData.customFields.${index}.value`,
                                    true,
                                    false
                                  );
                                }}
                                onBlur={() => setEditingCustomIndex(null)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    addCustomField();
                                  }
                                }}
                              />
                            ) : (
                              <button
                                type="button"
                                className={`kv-chip ${field.value ? "" : "placeholder"}`}
                                onClick={() => setEditingCustomIndex(index)}
                              >
                                {field.value || "Value"}
                              </button>
                            )}

                            {formik.values.rightsCodeData.customFields.length >
                              1 && (
                              <button
                                type="button"
                                className="kv-remove"
                                onClick={() => removeCustomField(index)}
                                title="Remove"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    }
                  )}
                  {/* Add button as last grid item */}
                  <button
                    type="button"
                    className="kv-add-fab kv-add-in-grid"
                    onClick={addCustomField}
                    title="Add field"
                  >
                    <span className="kv-plus">+</span>
                    <span>Add field</span>
                  </button>
                </div>

                {/* Single JSON modal trigger */}
                <div className="kv-json-actions">
                  <button
                    type="button"
                    className="kv-json-btn"
                    onClick={() => setShowJsonModal(true)}
                  >
                    View JSON
                  </button>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="cancel-btn" onClick={closeModal}>
                Cancel
              </button>
              <button
                className="save-btn"
                onClick={() => formik.handleSubmit()}
              >
                {editingRight ? "Update" : "Add"} Right
              </button>
            </div>
          </div>
        </div>
      )}
      <JsonModal
        isOpen={showJsonModal}
        title="Rights JSON"
        json={
          showJsonModal
            ? (() => {
                try {
                  return JSON.parse(formData.rightsCodeData as any);
                } catch {
                  return formData.rightsCodeData;
                }
              })()
            : {}
        }
        onClose={() => setShowJsonModal(false)}
        onCopy={() => {
          navigator.clipboard?.writeText(formattedRightsJson);
          toast.success("Copied JSON to clipboard");
        }}
      />
    </div>
  );
};

export default RightsComponent;
