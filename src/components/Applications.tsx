import type { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { applicationsAPI } from "../services/api";
import type { Application } from "../types/entities";
import type { ApplicationFormData } from "../types/forms";
import type { ApiResponse } from "../types/api";
import DataTable from "./DataTable";

const Applications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);

  const [formData, setFormData] = useState<ApplicationFormData>({
    application_name: "",
    client_secret: "",
    version: "",
  });

  // Load applications from API
  useEffect(() => {
    const loadApplications = async () => {
      try {
        setLoading(true);
        const response = await applicationsAPI.getAll();
        // Handle new API response format: { success: true, data: [...], message: "..." }
        const apiResponse = response.data as ApiResponse<Application[]>;
        const applicationsData =
          apiResponse.success && apiResponse.data
            ? apiResponse.data
            : (response.data as unknown as Application[]);

        setApplications(applicationsData || []);
      } catch (error) {
        console.error("Failed to load applications:", error);
        toast.error("Failed to load applications");
        // Fallback to mock data if API fails
        const mockApplications: Application[] = [
          {
            application_id: "app-001",
            application_name: "APP-X",
            client_secret: "app-x",
            version: "1.0.0",
            // description: "User Management System",
            // applicationSecret: "app-x-secret",
            // status: "active",
            created_on: "2024-01-15T10:00:00Z",
            updated_on: "2024-01-15T10:00:00Z",
          },
          {
            application_id: "app-002",
            application_name: "APP-Y",
            client_secret: "app-y",
            version: "1.0.0",
            // description: "Analytics Platform",
            // applicationSecret: "app-y-secret",
            // status: "active",
            created_on: "2024-01-16T10:00:00Z",
            updated_on: "2024-01-16T10:00:00Z",
          },
          {
            application_id: "app-003",
            application_name: "APP-Z",
            client_secret: "app-z",
            version: "1.0.0",
            // description: "Communication System",
            // status: "active",
            // applicationSecret: "app-z-secret",
            created_on: "2024-01-17T10:00:00Z",
            updated_on: "2024-01-17T10:00:00Z",
          },
        ];
        setApplications(mockApplications);
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, []);

  const handleAddApplication = async () => {
    if (!formData.application_name || !formData.client_secret) {
      toast.error("application_name and Application ID are required!");
      return;
    }

    try {
      const response = await applicationsAPI.create(formData);
      const apiResponse = response.data as ApiResponse<Application>;
      const newApp =
        apiResponse.success && apiResponse.data
          ? apiResponse.data
          : (response.data as unknown as Application);

      if (newApp) {
        setApplications([...applications, newApp]);
        setFormData({
          application_name: "",
          client_secret: "",
          version: "",
          // description: "",
          // status: "active",
          // applicationSecret: "",
        });
        setShowAddModal(false);
        toast.success("Application added successfully!");
      }
    } catch (error) {
      console.error("Failed to add application:", error);
      toast.error("Failed to add application");
    }
  };

  const handleEditApplication = async (application: Application) => {
    setEditingApp(application);
    setFormData({
      application_name: application.application_name,
      client_secret: application.client_secret,
      version: application.version,
    });
    setShowAddModal(true);
  };

  const handleUpdateApplication = async () => {
    if (!editingApp || !formData.application_name || !formData.client_secret) {
      toast.error("application_name and Application ID are required!");
      return;
    }

    try {
      const response = await applicationsAPI.update(
        editingApp.application_id,
        formData
      );
      const apiResponse = response.data as ApiResponse<Application>;
      const updatedApp =
        apiResponse.success && apiResponse.data
          ? apiResponse.data
          : (response.data as unknown as Application);

      if (updatedApp) {
        setApplications(
          applications.map((app) =>
            app.application_id === editingApp.application_id ? updatedApp : app
          )
        );
        setFormData({
          application_name: "",
          client_secret: "",
          version: "",
        });
        setEditingApp(null);
        setShowAddModal(false);
        toast.success("Application updated successfully!");
      }
    } catch (error) {
      console.error("Failed to update application:", error);
      toast.error("Failed to update application");
    }
  };

  const handleDeleteApplication = async (application: Application) => {
    if (
      !confirm(
        `Are you sure you want to delete ${application.application_name}?`
      )
    ) {
      return;
    }

    try {
      await applicationsAPI.delete(application.application_id);
      setApplications(
        applications.filter(
          (app) => app.application_id !== application.application_id
        )
      );
      toast.success("Application deleted successfully!");
    } catch (error) {
      console.error("Failed to delete application:", error);
      toast.error("Failed to delete application");
    }
  };

  const handleStatusToggle = async (application: Application) => {
    try {
      const response = await applicationsAPI.toggleStatus(
        application.application_id
      );
      const apiResponse = response.data as ApiResponse<Application>;
      const updatedApp =
        apiResponse.success && apiResponse.data
          ? apiResponse.data
          : (response.data as unknown as Application);

      if (updatedApp) {
        setApplications(
          applications.map((app) =>
            app.application_id === application.application_id ? updatedApp : app
          )
        );
        toast.success(
          `Application ${
            updatedApp.version === "1.0.0" ? "activated" : "deactivated"
          } successfully!`
        );
      }
    } catch (error) {
      console.error("Failed to toggle application status:", error);
      toast.error("Failed to toggle application status");
    }
  };

  const handleRefreshData = async () => {
    try {
      toast.loading("Refreshing data...");

      const response = await applicationsAPI.getAll();
      const apiResponse = response.data as ApiResponse<Application[]>;
      const applicationsData =
        apiResponse.success && apiResponse.data
          ? apiResponse.data
          : (response.data as unknown as Application[]);
      setApplications(applicationsData || []);

      toast.dismiss();
      toast.success("Data refreshed successfully!");
    } catch (error) {
      console.error("Failed to refresh data:", error);
      toast.dismiss();
      toast.error("Failed to refresh data");
    }
  };

  const columns: ColumnDef<Application>[] = [
    {
      accessorKey: "application_name",
      header: "Application Name",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("application_name")}</div>
      ),
    },
    {
      accessorKey: "client_secret",
      header: "Client Secret",
      cell: ({ row }) => {
        const client_secret = row.getValue("client_secret") as string;
        return (
          <span
            className={`status-badge ${client_secret}`}
            onClick={() => handleStatusToggle(row.original)}
            style={{ cursor: "pointer" }}
          >
            {client_secret}
          </span>
        );
      },
    },
    {
      accessorKey: "version",
      header: "Version",
      cell: ({ row }) => (
        <div className="text-sm text-gray-500">{row.getValue("version")}</div>
      ),
    },
    {
      accessorKey: "created_by",
      header: "Created By",
      cell: ({ row }) => {
        const created_by = row.getValue("created_by") as string;
        return (
          <span
            className={`status-badge ${created_by}`}
            // onClick={() => handleStatusToggle(row.original)}
            style={{ cursor: "pointer" }}
          >
            {created_by}
          </span>
        );
      },
    },

    {
      accessorKey: "created_on",
      header: "Created On",
      cell: ({ row }) => (
        <div className="text-sm text-gray-500">
          {new Date(row.getValue("created_on")).toLocaleDateString()}
        </div>
      ),
    },
    {
      accessorKey: "updated_on",
      header: "Updated On",
      cell: ({ row }) => (
        <div className="text-sm text-gray-500">
          {new Date(row.getValue("updated_on")).toLocaleDateString()}
        </div>
      ),
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
          <h1>Applications</h1>
          <p>Manage your application integrations and permissions</p>
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
        data={applications}
        onAdd={() => setShowAddModal(true)}
        onEdit={handleEditApplication}
        onDelete={handleDeleteApplication}
        addButtonText="Add Application"
        searchPlaceholder="Search applications..."
      />

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingApp ? "Edit Application" : "Add New Application"}</h2>
              <button
                className="close-btn"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingApp(null);
                  setFormData({
                    application_name: "",
                    client_secret: "",
                    version: "",
                    // description: "",
                    // applicationSecret: "",
                    // status: "active",
                  });
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Application Name *</label>
                <input
                  type="text"
                  value={formData.application_name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      application_name: e.target.value,
                    })
                  }
                  placeholder="Enter application name"
                />
              </div>
              <div className="form-group">
                <label>Application Version *</label>
                <input
                  type="text"
                  value={formData.version}
                  onChange={(e) =>
                    setFormData({ ...formData, version: e.target.value })
                  }
                  placeholder="Enter application version"
                />
              </div>
              <div className="form-group">
                <label>Client Secret*</label>
                <input
                  type="text"
                  value={formData.client_secret}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      client_secret: e.target.value,
                    })
                  }
                  placeholder="Enter application Secret"
                />
              </div>
              {/* <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Enter description"
                  rows={3}
                />
              </div> */}
              {/* <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.version}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      version: e.target.value as ApplicationFormData["version"],
                    })
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div> */}
            </div>
            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingApp(null);
                  setFormData({
                    application_name: "",
                    client_secret: "",
                    version: "",
                    // description: "",
                    // applicationSecret: "",
                    // status: "active",
                  });
                }}
              >
                Cancel
              </button>
              <button
                className="save-btn"
                onClick={
                  editingApp ? handleUpdateApplication : handleAddApplication
                }
              >
                {editingApp ? "Update" : "Add"} Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Applications;
