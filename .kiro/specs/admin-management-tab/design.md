# Design Document

## Overview

The Manage Admin feature will add a new navigation tab to the existing sidebar and create a comprehensive admin management screen. This feature will integrate seamlessly with the current React/TypeScript application architecture, utilizing existing patterns for routing, API calls, state management, and UI components.

The design follows the established patterns in the codebase:
- React Router for navigation
- Redux Toolkit for state management
- Axios-based API layer with centralized configuration
- TypeScript for type safety
- Formik for form management
- Lucide React for icons
- Existing CSS patterns for styling

## Architecture

### Component Hierarchy
```
AdminLayout
├── Sidebar (modified)
│   └── Manage Admin nav item (new)
└── ManageAdmin (new)
    ├── AdminManagementHeader (new)
    ├── AdminFilters (new)
    ├── AdminTable (new)
    │   └── AdminTableRow (new)
    ├── AdminModal (new)
    │   ├── CreateAdminForm (new)
    │   └── EditAdminForm (new)
    └── AdminStatusToggle (new)
```

### Routing Integration
The new route will be added to the existing routing structure in `App.tsx`:
```typescript
<Route path="manage-admin" element={<ManageAdmin />} />
```

### State Management
A new Redux slice will be created for admin management:
- `adminManagementSlice` - handles admin users state, loading states, and error handling
- Integration with existing auth slice for permission checks

## Components and Interfaces

### 1. Sidebar Component (Modified)
**File**: `src/components/Sidebar.tsx`
**Changes**: Add new navigation item for Manage Admin

**New Navigation Item**:
```typescript
<Link
  to="/manage-admin"
  className={`nav-item ${isActive("/manage-admin") ? "active" : ""}`}
>
  <UserCog size={18} />
  <span>Manage Admin</span>
  <ChevronRight size={16} className="nav-arrow" />
</Link>
```

### 2. ManageAdmin Component (New)
**File**: `src/components/ManageAdmin.tsx`
**Purpose**: Main container component for admin management functionality

**Key Features**:
- Fetches admin users on mount
- Manages modal states for create/edit operations
- Handles search and filtering
- Coordinates between child components

### 3. AdminTable Component (New)
**File**: `src/components/AdminTable.tsx`
**Purpose**: Displays admin users in a table format using existing DataTable patterns

**Features**:
- Sortable columns (name, email, role, status, created date)
- Click-to-edit functionality
- Status toggle integration
- Loading and empty states

### 4. AdminModal Component (New)
**File**: `src/components/AdminModal.tsx`
**Purpose**: Modal container for create/edit forms

**Features**:
- Reusable for both create and edit operations
- Form validation using Formik and Yup
- Error handling and success feedback
- Responsive design

### 5. AdminFilters Component (New)
**File**: `src/components/AdminFilters.tsx`
**Purpose**: Search and filter controls

**Features**:
- Text search by name/email
- Role filter dropdown
- Status filter (active/inactive)
- Clear filters functionality

## Data Models

### Admin User Interface
**File**: `src/types/entities.ts` (extended)

```typescript
export interface AdminUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: AdminRole;
  status: UserStatus;
  permissions: AdminPermission[];
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export type AdminRole = 'super_admin' | 'admin' | 'moderator';

export interface AdminPermission {
  id: string;
  name: string;
  description: string;
  category: string;
}
```

### Form Interfaces
**File**: `src/types/forms.ts` (extended)

```typescript
export interface CreateAdminFormData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: AdminRole;
  permissions: string[];
  password: string;
  confirmPassword: string;
}

export interface EditAdminFormData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: AdminRole;
  permissions: string[];
  status: UserStatus;
}

export interface AdminFiltersData {
  search: string;
  role: AdminRole | 'all';
  status: UserStatus | 'all';
}
```

## API Integration

### Admin Management API
**File**: `src/services/api.ts` (extended)

```typescript
export const adminManagementAPI = {
  getAll: (params?: {
    search?: string;
    role?: AdminRole;
    status?: UserStatus;
    page?: number;
    limit?: number;
  }) => api.get<ApiResponse<AdminUser[]>>("/admin-management", { params }),
  
  getById: (id: string) => 
    api.get<ApiResponse<AdminUser>>(`/admin-management/${id}`),
  
  create: (data: CreateAdminFormData) => 
    api.post<ApiResponse<AdminUser>>("/admin-management", data),
  
  update: (id: string, data: Partial<EditAdminFormData>) => 
    api.put<ApiResponse<AdminUser>>(`/admin-management/${id}`, data),
  
  toggleStatus: (id: string) => 
    api.patch<ApiResponse<AdminUser>>(`/admin-management/${id}/toggle-status`),
  
  delete: (id: string) => 
    api.delete<ApiResponse>(`/admin-management/${id}`),
  
  getPermissions: () => 
    api.get<ApiResponse<AdminPermission[]>>("/admin-management/permissions"),
  
  getRoles: () => 
    api.get<ApiResponse<AdminRole[]>>("/admin-management/roles")
};
```

## State Management

### Admin Management Slice
**File**: `src/store/slices/adminManagementSlice.ts` (new)

```typescript
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
  };
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
```

**Actions**:
- `fetchAdminUsers` - Load admin users with filters
- `createAdminUser` - Create new admin user
- `updateAdminUser` - Update existing admin user
- `toggleAdminStatus` - Toggle admin user status
- `deleteAdminUser` - Delete admin user
- `setFilters` - Update filter criteria
- `setSelectedAdmin` - Set admin for editing
- `fetchPermissions` - Load available permissions
- `fetchRoles` - Load available roles

## Error Handling

### Form Validation
- **Required Fields**: Username, email, first name, last name, role
- **Email Validation**: Valid email format
- **Password Validation**: Minimum 8 characters, complexity requirements
- **Username Validation**: Unique username check
- **Role Validation**: Must be valid admin role

### API Error Handling
- **Network Errors**: Display retry option with toast notification
- **Validation Errors**: Show field-specific error messages
- **Permission Errors**: Redirect to appropriate page or show access denied
- **Server Errors**: Display generic error message with support contact

### User Experience
- **Loading States**: Show spinners during API calls
- **Empty States**: Display helpful messages when no data
- **Success Feedback**: Toast notifications for successful operations
- **Confirmation Dialogs**: Confirm destructive actions (delete, status change)

## Testing Strategy

### Unit Tests
**Files**: `src/components/__tests__/`
- `ManageAdmin.test.tsx` - Main component functionality
- `AdminTable.test.tsx` - Table rendering and interactions
- `AdminModal.test.tsx` - Form validation and submission
- `AdminFilters.test.tsx` - Filter functionality

**Test Coverage**:
- Component rendering with different props
- Form validation scenarios
- API call mocking and error handling
- User interaction simulation (clicks, form inputs)
- State management actions and reducers

### Integration Tests
- **Routing**: Navigation to manage admin page
- **API Integration**: Mock API responses and error scenarios
- **State Management**: Redux store integration
- **Form Submission**: End-to-end form workflows

### Accessibility Tests
- **Keyboard Navigation**: Tab order and keyboard shortcuts
- **Screen Reader**: ARIA labels and semantic HTML
- **Color Contrast**: Ensure sufficient contrast ratios
- **Focus Management**: Proper focus handling in modals

## Security Considerations

### Permission Checks
- **Route Protection**: Verify admin management permissions before rendering
- **API Authorization**: Server-side permission validation
- **Role-Based Access**: Different capabilities based on admin role
- **Audit Logging**: Track admin management actions

### Data Validation
- **Input Sanitization**: Prevent XSS attacks
- **SQL Injection Prevention**: Parameterized queries on backend
- **Rate Limiting**: Prevent abuse of admin creation endpoints
- **Password Security**: Enforce strong password policies

## Performance Optimizations

### Component Optimization
- **React.memo**: Prevent unnecessary re-renders
- **useMemo/useCallback**: Optimize expensive calculations
- **Lazy Loading**: Code splitting for admin management components
- **Virtual Scrolling**: Handle large admin user lists efficiently

### API Optimization
- **Pagination**: Load admin users in chunks
- **Caching**: Cache frequently accessed data
- **Debounced Search**: Prevent excessive API calls during typing
- **Optimistic Updates**: Update UI before API confirmation

## Styling and UI

### CSS Classes
Following existing patterns in the codebase:
- `.admin-management` - Main container
- `.admin-table` - Table styling consistent with DataTable.css
- `.admin-modal` - Modal styling
- `.admin-filters` - Filter controls styling
- `.admin-form` - Form styling consistent with existing forms

### Responsive Design
- **Mobile First**: Ensure mobile compatibility
- **Tablet Layout**: Optimize for tablet screens
- **Desktop Layout**: Full feature set for desktop users
- **Touch Interactions**: Proper touch targets for mobile devices

### Theme Integration
- **Color Scheme**: Use existing CSS custom properties
- **Typography**: Consistent with existing font hierarchy
- **Spacing**: Follow established spacing patterns
- **Icons**: Use Lucide React icons consistently