import type { Application, Rights } from "@/types/entities";
import type { ApplicationFormData } from "@/types/forms";
import type { ColumnDef } from "@tanstack/react-table";

import DataTable from "@components/DataTable";
import ApplicationModal from "@components/modal/ApplicationModal";
import { useAppDispatch, useAppSelector } from "@store/index";
import {
  clearError,
  createApplication,
  deleteApplication,
  fetchApplications,
  toggleApplicationStatus,
  updateApplication,
} from "@store/slices/applicationsSlice";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

// Main Applications Component
const Applications = () => {
  const dispatch = useAppDispatch();
  const { applications, loading, error } = useAppSelector(
    (state) => state.applications,
  );

  console.log(applications);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Load applications on component mount
  useEffect(() => {
    dispatch(fetchApplications({}));
  }, [dispatch]);

  // Handle errors from Redux store
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleAddApplication = useCallback(
    async (formData: ApplicationFormData) => {
      setIsSubmitting(true);
      try {
        await dispatch(createApplication(formData)).unwrap();
        toast.success("Application added successfully!");
        setShowAddModal(false);
      } catch (error) {
        console.error("Failed to add application:", error);
        toast.error("Failed to add application");
      } finally {
        setIsSubmitting(false);
      }
    },
    [dispatch],
  );

  const handleEditApplication = useCallback((application: Application) => {
    setEditingApp(application);
    setShowAddModal(true);
  }, []);

  const handleUpdateApplication = useCallback(
    async (formData: ApplicationFormData) => {
      if (!editingApp) return;

      setIsSubmitting(true);
      try {
        await dispatch(
          updateApplication({
            id: editingApp.application_id,
            data: formData,
          }),
        ).unwrap();
        toast.success("Application updated successfully!");
        setEditingApp(null);
        setShowAddModal(false);
      } catch (error) {
        console.error("Failed to update application:", error);
        toast.error("Failed to update application");
      } finally {
        setIsSubmitting(false);
      }
    },
    [dispatch, editingApp],
  );

  const handleDeleteApplication = useCallback(
    async (application: Application) => {
      if (
        !confirm(
          `Are you sure you want to delete ${application.application_name}?`,
        )
      ) {
        return;
      }

      try {
        await dispatch(deleteApplication(application.application_id)).unwrap();
        toast.success("Application deleted successfully!");
      } catch (error) {
        console.error("Failed to delete application:", error);
        toast.error("Failed to delete application");
      }
    },
    [dispatch],
  );

  const handleStatusToggle = useCallback(
    async (application: Application) => {
      try {
        await dispatch(
          toggleApplicationStatus(application.application_id),
        ).unwrap();
        toast.success("Application status updated successfully!");
      } catch (error) {
        console.error("Failed to toggle application status:", error);
        toast.error("Failed to toggle application status");
      }
    },
    [dispatch],
  );

  const handleRefreshData = useCallback(async () => {
    try {
      toast.loading("Refreshing data...");
      await dispatch(fetchApplications({})).unwrap();
      toast.dismiss();
      toast.success("Data refreshed successfully!");
    } catch (error) {
      console.error("Failed to refresh data:", error);
      toast.dismiss();
      toast.error("Failed to refresh data");
    }
  }, [dispatch]);

  const handleCloseModal = useCallback(() => {
    if (isSubmitting) return; // Prevent closing while submitting
    setShowAddModal(false);
    setEditingApp(null);
  }, [isSubmitting]);

  const handleSubmitModal = useCallback(
    async (data: ApplicationFormData) => {
      if (editingApp) {
        await handleUpdateApplication(data);
      } else {
        await handleAddApplication(data);
      }
    },
    [editingApp, handleUpdateApplication, handleAddApplication],
  );

  const columns: ColumnDef<Application>[] = useMemo(
    () => [
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
          const clientSecret = row.getValue("client_secret") as string;

          return (
            <span
              className={`status-badge ${clientSecret}`}
              style={{ cursor: "pointer" }}
              title="Click to toggle status"
              onClick={() => handleStatusToggle(row.original)}
            >
              {clientSecret}
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
        accessorKey: "createdBy",
        header: "Created By",
        cell: ({ row }) => {
          const createdBy = row.getValue("createdBy") as Rights["createdBy"];

          return (
            <span
              className={`status-badge ${createdBy.username}`}
              style={{ cursor: "pointer" }}
            >
              {createdBy.username}
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
    ],
    [handleStatusToggle],
  );

  if (loading && applications.length === 0) {
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
          <h1>Applications</h1>
          <p>Manage your application integrations and permissions</p>
          {applications.length > 0 && (
            <span className="text-sm text-gray-500">
              {applications.length} application
              {applications.length !== 1 ? "s" : ""} total
            </span>
          )}
        </div>
        <div className="header-right">
          <button
            className="refresh-btn"
            disabled={loading}
            onClick={handleRefreshData}
          >
            <svg
              className={loading ? "animate-spin" : ""}
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
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      <DataTable
        addButtonText="Add Application"
        columns={columns}
        data={applications}
        searchPlaceholder="Search applications..."
        onAdd={() => setShowAddModal(true)}
        onDelete={handleDeleteApplication}
        onEdit={handleEditApplication}
      />

      <ApplicationModal
        editingApp={editingApp}
        isOpen={showAddModal}
        isSubmitting={isSubmitting}
        onClose={handleCloseModal}
        onSubmit={handleSubmitModal}
      />
    </div>
  );
};

export default Applications;
