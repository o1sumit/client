import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Edit,
  Trash2,
  UserCog,
  Clock,
  Calendar,
} from "lucide-react";
import type { AppDispatch, RootState } from "../store";
import { setSelectedAdmin } from "../store/slices/adminManagementSlice";
import type { AdminUser, AdminRole, UserStatus } from "../types/entities";
import AdminStatusToggle from "./AdminStatusToggle";
import "./AdminTable.css";

interface AdminTableProps {
  onEdit?: (admin: AdminUser) => void;
  onDelete?: (admin: AdminUser) => void;
  onToggleStatus?: (admin: AdminUser, newStatus: UserStatus) => void;
  loading?: boolean;
}

const AdminTable: React.FC<AdminTableProps> = ({
  onEdit,
  onDelete,
  onToggleStatus,
  loading = false,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { adminUsers, pagination } = useSelector((state: RootState) => state.adminManagement);
  
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Helper function to format role names
  const formatRoleName = (role: AdminRole): string => {
    return role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Helper function to format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  // Helper function to format last login
  const formatLastLogin = (lastLoginAt: string | null | undefined): string => {
    if (!lastLoginAt) return 'Never';
    return formatDate(lastLoginAt);
  };

  // Column definitions
  const columns: ColumnDef<AdminUser>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const admin = row.original;
        return (
          <div className="admin-name-cell">
            <div className="admin-name">
              <strong>{admin.firstName} {admin.lastName}</strong>
            </div>
            <div className="admin-username">
              @{admin.username}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="admin-email">
          {row.original.email}
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <span className={`role-badge role-${row.original.role}`}>
          {formatRoleName(row.original.role)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const admin = row.original;
        return (
          <div className="status-cell">
            <span className={`status-badge status-${admin.status}`}>
              {admin.status.toUpperCase()}
            </span>
            {onToggleStatus && (
              <AdminStatusToggle
                admin={admin}
                onToggle={onToggleStatus}
                className="table-status-toggle"
              />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "lastLoginAt",
      header: "Last Login",
      cell: ({ row }) => (
        <div className="last-login-cell">
          <Clock size={12} className="cell-icon" />
          <span>{formatLastLogin(row.original.lastLoginAt)}</span>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => (
        <div className="created-cell">
          <Calendar size={12} className="cell-icon" />
          <span>{formatDate(row.original.createdAt)}</span>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: adminUsers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  });

  // Handle row click for edit
  const handleRowClick = (admin: AdminUser) => {
    dispatch(setSelectedAdmin(admin));
    onEdit?.(admin);
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="admin-table-container">
        <div className="loading-skeleton">
          <div className="skeleton-header">
            <div className="skeleton-search"></div>
            <div className="skeleton-button"></div>
          </div>
          <div className="skeleton-table">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="skeleton-row">
                {Array.from({ length: 6 }).map((_, cellIndex) => (
                  <div key={cellIndex} className="skeleton-cell"></div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (adminUsers.length === 0) {
    return (
      <div className="admin-table-container">
        <div className="empty-state">
          <UserCog size={48} className="empty-icon" />
          <h3>No admin users found</h3>
          <p>Get started by creating your first admin user.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-table-container">
      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="table-header-cell">
                    {header.isPlaceholder ? null : (
                      <div
                        className={`header-content ${
                          header.column.getCanSort() ? "sortable" : ""
                        }`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort() && (
                          <span className="sort-icon">
                            {{
                              asc: <ChevronUp size={14} />,
                              desc: <ChevronDown size={14} />,
                            }[header.column.getIsSorted() as string] ?? (
                              <ChevronsUpDown size={14} />
                            )}
                          </span>
                        )}
                      </div>
                    )}
                  </th>
                ))}
                <th className="table-header-cell actions-header">Actions</th>
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr 
                key={row.id} 
                className="table-row"
                onClick={() => handleRowClick(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="table-cell">
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </td>
                ))}
                <td className="table-cell actions-cell">
                  <div className="action-buttons">
                    {onEdit && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(row.original);
                        }}
                        className="action-btn edit-btn"
                        title="Edit"
                      >
                        <Edit size={14} />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(row.original);
                        }}
                        className="action-btn delete-btn"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="table-pagination">
          <div className="pagination-info">
            <span>
              Page {pagination.page} of {pagination.pages}
            </span>
            <span>
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} results
            </span>
          </div>
          {/* Pagination controls will be implemented when needed */}
        </div>
      )}
    </div>
  );
};

export default AdminTable;
