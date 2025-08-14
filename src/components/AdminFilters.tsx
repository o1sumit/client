import type { AppDispatch, RootState } from "../store";
import type { AdminRole, UserStatus } from "../types/entities";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, Filter, X } from "lucide-react";

import { setFilters, resetFilters } from "../store/slices/adminManagementSlice";

import "./AdminFilters.css";

interface AdminFiltersProps {
  className?: string;
}

const AdminFilters: React.FC<AdminFiltersProps> = ({ className = "" }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { filters, availableRoles } = useSelector(
    (state: RootState) => state.adminManagement,
  );

  // Local state for debounced search
  const [searchInput, setSearchInput] = useState(filters.search);

  // Update search filter when input changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      dispatch(setFilters({ search: searchInput }));
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchInput, dispatch]);

  // Sync local search state with Redux state
  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  // Handle role filter change
  const handleRoleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const role = e.target.value as AdminRole | "all";

    dispatch(setFilters({ role }));
  };

  // Handle status filter change
  const handleStatusFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const status = e.target.value as UserStatus | "all";

    dispatch(setFilters({ status }));
  };

  // Handle clear all filters
  const handleClearFilters = () => {
    setSearchInput("");
    dispatch(resetFilters());
  };

  // Check if any filters are active
  const hasActiveFilters =
    filters.search || filters.role !== "all" || filters.status !== "all";

  return (
    <div className={`admin-filters ${className}`}>
      <div className="filters-container">
        {/* Search Input */}
        <div className="filter-group search-group">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={16} />
            <input
              className="form-input search-input"
              placeholder="Search by name, email, or username..."
              type="text"
              value={searchInput}
              onChange={handleSearchChange}
            />
            {searchInput && (
              <button
                aria-label="Clear search"
                className="clear-search-btn"
                type="button"
                onClick={() => setSearchInput("")}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls */}
        <div className="filter-group controls-group">
          <div className="filter-control">
            <label className="filter-label" htmlFor="role-filter">
              <Filter size={14} />
              Role
            </label>
            <select
              className="form-select filter-select"
              id="role-filter"
              value={filters.role}
              onChange={handleRoleFilterChange}
            >
              <option value="all">All Roles</option>
              {availableRoles.map((role) => (
                <option key={role} value={role}>
                  {formatRoleName(role)}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-control">
            <label className="filter-label" htmlFor="status-filter">
              Status
            </label>
            <select
              className="form-select filter-select"
              id="status-filter"
              value={filters.status}
              onChange={handleStatusFilterChange}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div className="filter-control">
              <button
                className="btn btn-secondary btn-sm clear-filters-btn"
                type="button"
                onClick={handleClearFilters}
              >
                <X size={14} />
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="active-filters">
          <span className="active-filters-label">Active filters:</span>
          <div className="filter-tags">
            {filters.search && (
              <span className="filter-tag">
                Search: "{filters.search}"
                <button
                  aria-label="Remove search filter"
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    dispatch(setFilters({ search: "" }));
                  }}
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {filters.role !== "all" && (
              <span className="filter-tag">
                Role: {formatRoleName(filters.role)}
                <button
                  aria-label="Remove role filter"
                  type="button"
                  onClick={() => dispatch(setFilters({ role: "all" }))}
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {filters.status !== "all" && (
              <span className="filter-tag">
                Status:{" "}
                {filters.status.charAt(0).toUpperCase() +
                  filters.status.slice(1)}
                <button
                  aria-label="Remove status filter"
                  type="button"
                  onClick={() => dispatch(setFilters({ status: "all" }))}
                >
                  <X size={12} />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to format role names
const formatRoleName = (role: AdminRole): string => {
  return role
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default AdminFilters;
