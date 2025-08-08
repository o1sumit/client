import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, UserCog } from "lucide-react";
import type { AppDispatch, RootState } from "../store";
import {
  fetchAdminUsers,
  fetchPermissions,
  fetchRoles,
  createAdminUser,
  updateAdminUser,
  clearError,
  setSelectedAdmin,
} from "../store/slices/adminManagementSlice";
import type { AdminUser } from "../types/entities";
import { usePermissions, ADMIN_PERMISSIONS } from "../utils/permissions";
import AdminFilters from "./AdminFilters";
import AdminTable from "./AdminTable";
import AdminModal from "./AdminModal";
import CreateAdminForm from "./CreateAdminForm";
import EditAdminForm from "./EditAdminForm";
import "./ManageAdmin.css";

const ManageAdmin: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    canManageAdmins,
    canCreateAdmin,
    canEditAdmin,
    canDeleteAdmin,
    canToggleAdminStatus,
    canManageAdminPermissions,
    canManageAdminRoles,
  } = usePermissions();

  const {
    adminUsers,
    loading,
    error,
    filters,
    pagination,
    availablePermissions,
    availableRoles,
  } = useSelector((state: RootState) => state.adminManagement);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAdminForEdit, setSelectedAdminForEdit] =
    useState<AdminUser | null>(null);

  // Initialize data on mount (permission gating handled by route guard)
  useEffect(() => {
    dispatch(fetchAdminUsers(undefined));
    dispatch(fetchPermissions());
    dispatch(fetchRoles());
  }, [dispatch]);

  // Refetch admin users when filters change
  useEffect(() => {
    const params = {
      search: filters.search || undefined,
      role: filters.role !== "all" ? filters.role : undefined,
      status: filters.status !== "all" ? filters.status : undefined,
      page: pagination.page,
      limit: pagination.limit,
    };
    dispatch(fetchAdminUsers(params));
  }, [dispatch, filters, pagination.page, pagination.limit]);

  // Handle create admin
  const handleCreateAdmin = () => {
    setIsCreateModalOpen(true);
  };

  // Handle edit admin
  const handleEditAdmin = (admin: AdminUser) => {
    setSelectedAdminForEdit(admin);
    dispatch(setSelectedAdmin(admin));
    setIsEditModalOpen(true);
  };

  // Handle create admin form submission
  const handleCreateAdminSubmit = async (values: any) => {
    try {
      await dispatch(createAdminUser(values)).unwrap();
      setIsCreateModalOpen(false);
      // Refresh the admin users list
      dispatch(fetchAdminUsers(undefined));
    } catch (error) {
      console.error("Failed to create admin:", error);
    }
  };

  // Handle edit admin form submission
  const handleEditAdminSubmit = async (values: any) => {
    if (!selectedAdminForEdit) return;

    try {
      await dispatch(
        updateAdminUser({ id: selectedAdminForEdit.id, data: values })
      ).unwrap();
      setIsEditModalOpen(false);
      setSelectedAdminForEdit(null);
      // Refresh the admin users list
      dispatch(fetchAdminUsers(undefined));
    } catch (error) {
      console.error("Failed to update admin:", error);
    }
  };

  // Handle close modals
  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedAdminForEdit(null);
    dispatch(setSelectedAdmin(null));
  };

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  return (
    <div className="manage-admin">
      {/* Header Section */}
      <div className="manage-admin-header">
        <div className="header-content">
          <h1>Manage Admin</h1>
          <p>Manage administrator accounts and permissions</p>
        </div>
        {canCreateAdmin() && (
          <button
            className="btn btn-primary"
            onClick={handleCreateAdmin}
            disabled={loading.create}
          >
            <Plus size={16} />
            Add Admin
          </button>
        )}
      </div>

      {/* Filters Section */}
      <AdminFilters />

      {/* Error Display */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => dispatch(clearError())}>×</button>
        </div>
      )}

      {/* Admin Table Section */}
      <AdminTable
        loading={loading.list}
        onEdit={canEditAdmin() ? handleEditAdmin : undefined}
        onDelete={
          canDeleteAdmin()
            ? (admin) => {
                // TODO: Implement delete functionality
                console.log("Delete admin:", admin);
              }
            : undefined
        }
        onToggleStatus={
          canToggleAdminStatus()
            ? (admin, newStatus) => {
                // Handle optimistic update in the table
                // The actual API call is handled by AdminStatusToggle component
                console.log("Status toggle:", admin, "to", newStatus);
              }
            : undefined
        }
      />

      {/* Admin Modals */}
      <AdminModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        title="Create Admin User"
        isLoading={loading.create}
        maxWidth="600px"
      >
        <CreateAdminForm
          onSubmit={handleCreateAdminSubmit}
          onCancel={handleCloseCreateModal}
          availableRoles={availableRoles}
          availablePermissions={availablePermissions}
          isLoading={loading.create}
        />
      </AdminModal>

      <AdminModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        title="Edit Admin User"
        isLoading={loading.update}
        maxWidth="600px"
      >
        {selectedAdminForEdit && (
          <EditAdminForm
            admin={selectedAdminForEdit}
            onSubmit={handleEditAdminSubmit}
            onCancel={handleCloseEditModal}
            availableRoles={availableRoles}
            availablePermissions={availablePermissions}
            isLoading={loading.update}
          />
        )}
      </AdminModal>
    </div>
  );
};

export default ManageAdmin;
