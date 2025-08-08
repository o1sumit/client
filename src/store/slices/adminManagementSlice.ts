import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { adminManagementAPI } from "../../services/api";
import type {
  AdminUser,
  AdminPermission,
  AdminRole,
  UserStatus
} from "../../types/entities";
import type {
  CreateAdminFormData,
  EditAdminFormData,
  AdminFiltersData
} from "../../types/forms";
import type { ApiResponse } from "../../types/api";

// Admin Management State Interface
interface AdminManagementState {
  adminUsers: AdminUser[];
  selectedAdmin: AdminUser | null;
  availablePermissions: AdminPermission[];
  availableRoles: AdminRole[];
  filters: AdminFiltersData;
  loading: {
    list: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
    permissions: boolean;
    roles: boolean;
  };
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Async thunks
export const fetchAdminUsers = createAsyncThunk(
  "adminManagement/fetchAdminUsers",
  async (params: {
    search?: string;
    role?: AdminRole;
    status?: UserStatus;
    page?: number;
    limit?: number;
  } | undefined, { rejectWithValue }: { rejectWithValue: any }) => {
    try {
      const response = await adminManagementAPI.getAll(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch admin users"
      );
    }
  }
);

export const createAdminUser = createAsyncThunk(
  "adminManagement/createAdminUser",
  async (adminData: CreateAdminFormData, { rejectWithValue }: { rejectWithValue: any }) => {
    try {
      const { confirmPassword, ...dataToSend } = adminData;
      const response = await adminManagementAPI.create(dataToSend);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create admin user"
      );
    }
  }
);

export const updateAdminUser = createAsyncThunk(
  "adminManagement/updateAdminUser",
  async ({ id, data }: { id: string; data: Partial<EditAdminFormData> }, { rejectWithValue }: { rejectWithValue: any }) => {
    try {
      const response = await adminManagementAPI.update(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update admin user"
      );
    }
  }
);

export const toggleAdminStatus = createAsyncThunk(
  "adminManagement/toggleAdminStatus",
  async (id: string, { rejectWithValue }: { rejectWithValue: any }) => {
    try {
      const response = await adminManagementAPI.toggleStatus(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to toggle admin status"
      );
    }
  }
);

export const deleteAdminUser = createAsyncThunk(
  "adminManagement/deleteAdminUser",
  async (id: string, { rejectWithValue }: { rejectWithValue: any }) => {
    try {
      await adminManagementAPI.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete admin user"
      );
    }
  }
);

export const fetchPermissions = createAsyncThunk(
  "adminManagement/fetchPermissions",
  async (_, { rejectWithValue }: { rejectWithValue: any }) => {
    try {
      const response = await adminManagementAPI.getPermissions();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch permissions"
      );
    }
  }
);

export const fetchRoles = createAsyncThunk(
  "adminManagement/fetchRoles",
  async (_, { rejectWithValue }: { rejectWithValue: any }) => {
    try {
      const response = await adminManagementAPI.getRoles();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch roles"
      );
    }
  }
);

const initialState: AdminManagementState = {
  adminUsers: [],
  selectedAdmin: null,
  availablePermissions: [],
  availableRoles: [],
  filters: {
    search: '',
    role: 'all',
    status: 'all'
  },
  loading: {
    list: false,
    create: false,
    update: false,
    delete: false,
    permissions: false,
    roles: false
  },
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  }
};

const adminManagementSlice = createSlice({
  name: "adminManagement",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action: PayloadAction<Partial<AdminFiltersData>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSelectedAdmin: (state, action: PayloadAction<AdminUser | null>) => {
      state.selectedAdmin = action.payload;
    },
    setPagination: (state, action: PayloadAction<Partial<AdminManagementState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        search: '',
        role: 'all',
        status: 'all'
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Admin Users
      .addCase(fetchAdminUsers.pending, (state) => {
        state.loading.list = true;
        state.error = null;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.loading.list = false;
        if (action.payload?.data) {
          state.adminUsers = action.payload.data;
          if (action.payload.pagination) {
            state.pagination = action.payload.pagination;
          }
        }
        state.error = null;
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => {
        state.loading.list = false;
        state.error = action.payload as string;
      })
      // Create Admin User
      .addCase(createAdminUser.pending, (state) => {
        state.loading.create = true;
        state.error = null;
      })
      .addCase(createAdminUser.fulfilled, (state, action) => {
        state.loading.create = false;
        if (action.payload?.data) {
          state.adminUsers.push(action.payload.data);
        }
        state.error = null;
      })
      .addCase(createAdminUser.rejected, (state, action) => {
        state.loading.create = false;
        state.error = action.payload as string;
      })
      // Update Admin User
      .addCase(updateAdminUser.pending, (state) => {
        state.loading.update = true;
        state.error = null;
      })
      .addCase(updateAdminUser.fulfilled, (state, action) => {
        state.loading.update = false;
        if (action.payload) {
          const index = state.adminUsers.findIndex(admin => admin.id === action.payload.id);
          if (index !== -1) {
            state.adminUsers[index] = action.payload;
          }
          if (state.selectedAdmin?.id === action.payload.id) {
            state.selectedAdmin = action.payload;
          }
        }
        state.error = null;
      })
      .addCase(updateAdminUser.rejected, (state, action) => {
        state.loading.update = false;
        state.error = action.payload as string;
      })
      // Toggle Admin Status
      .addCase(toggleAdminStatus.pending, (state) => {
        state.loading.update = true;
        state.error = null;
      })
      .addCase(toggleAdminStatus.fulfilled, (state, action) => {
        state.loading.update = false;
        if (action.payload) {
          const index = state.adminUsers.findIndex(admin => admin.id === action.payload.id);
          if (index !== -1) {
            state.adminUsers[index] = action.payload;
          }
        }
        state.error = null;
      })
      .addCase(toggleAdminStatus.rejected, (state, action) => {
        state.loading.update = false;
        state.error = action.payload as string;
      })
      // Delete Admin User
      .addCase(deleteAdminUser.pending, (state) => {
        state.loading.delete = true;
        state.error = null;
      })
      .addCase(deleteAdminUser.fulfilled, (state, action) => {
        state.loading.delete = false;
        state.adminUsers = state.adminUsers.filter(admin => admin.id !== action.payload);
        if (state.selectedAdmin?.id === action.payload) {
          state.selectedAdmin = null;
        }
        state.error = null;
      })
      .addCase(deleteAdminUser.rejected, (state, action) => {
        state.loading.delete = false;
        state.error = action.payload as string;
      })
      // Fetch Permissions
      .addCase(fetchPermissions.pending, (state) => {
        state.loading.permissions = true;
        state.error = null;
      })
      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.loading.permissions = false;
        if (action.payload?.data) {
          state.availablePermissions = action.payload.data;
        }
        state.error = null;
      })
      .addCase(fetchPermissions.rejected, (state, action) => {
        state.loading.permissions = false;
        state.error = action.payload as string;
      })
      // Fetch Roles
      .addCase(fetchRoles.pending, (state) => {
        state.loading.roles = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading.roles = false;
        if (action.payload?.data) {
          state.availableRoles = action.payload.data;
        }
        state.error = null;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading.roles = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearError, 
  setFilters, 
  setSelectedAdmin, 
  setPagination, 
  resetFilters 
} = adminManagementSlice.actions;

export default adminManagementSlice.reducer;