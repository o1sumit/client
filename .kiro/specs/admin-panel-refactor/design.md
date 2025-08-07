# Design Document

## Overview

This design outlines a comprehensive refactoring of the admin panel application to address TypeScript issues, improve API handling, create reusable components, and implement better code organization. The refactoring will transform the current codebase into a maintainable, type-safe, and scalable application following React and TypeScript best practices.

## Architecture

### Current Issues Identified
1. **TypeScript Errors**: Multiple type mismatches in API response handling, form data types, and component props
2. **Inconsistent API Handling**: Mixed use of axios directly and doFetcher, inconsistent response unwrapping
3. **Scattered Interfaces**: Type definitions spread across multiple files without clear organization
4. **Repetitive Form Logic**: Manual form handling without validation framework
5. **Code Duplication**: Similar patterns repeated across components without reusable abstractions

### Proposed Architecture

```
src/
├── types/                    # Centralized type definitions
│   ├── api.ts               # API response types
│   ├── entities.ts          # Business entity interfaces
│   └── forms.ts             # Form-specific types
├── services/
│   ├── api/                 # Organized API functions
│   │   ├── applications.ts  # Applications API
│   │   ├── users.ts         # Users API
│   │   ├── accounts.ts      # Accounts API
│   │   └── rights.ts        # Rights API
│   └── fetcher.ts           # Centralized HTTP client
├── components/
│   ├── common/              # Reusable UI components
│   │   ├── forms/           # Form components
│   │   ├── modals/          # Modal components
│   │   └── tables/          # Table components
│   └── pages/               # Page-specific components
├── hooks/                   # Custom React hooks
│   ├── useApi.ts           # API interaction hooks
│   └── useForm.ts          # Form handling hooks
└── utils/                   # Utility functions
    ├── validation.ts        # Validation schemas
    └── helpers.ts           # Helper functions
```

## Components and Interfaces

### Type System Organization

#### 1. Entity Types (`src/types/entities.ts`)
```typescript
export interface Application {
  id: string;
  name: string;
  applicationId: string;
  description?: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  accountId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: string;
  name: string;
  accountId: string;
  email?: string;
  description?: string;
  accountType: AccountType;
  status: AccountStatus;
  sharedAccounts: string[];
  createdAt: string;
  updatedAt: string;
  users?: User[];
}

// Enums for better type safety
export type ApplicationStatus = 'active' | 'inactive';
export type UserRole = 'admin' | 'user' | 'manager';
export type UserStatus = 'active' | 'inactive';
export type AccountType = 'Temporary' | 'Personal' | 'Business';
export type AccountStatus = 'active' | 'inactive';
```

#### 2. API Response Types (`src/types/api.ts`)
```typescript
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}
```

#### 3. Form Types (`src/types/forms.ts`)
```typescript
export interface ApplicationFormData {
  name: string;
  applicationId: string;
  description: string;
  status: ApplicationStatus;
}

export interface UserFormData {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
}

export interface AccountFormData {
  name: string;
  accountId: string;
  email: string;
  description: string;
  accountType: AccountType;
  status: AccountStatus;
}
```

### API Service Layer

#### Centralized HTTP Client (`src/services/fetcher.ts`)
Enhanced version with proper TypeScript support and error handling:

```typescript
interface FetcherOptions extends AxiosRequestConfig {
  showToast?: boolean;
}

export const doFetcher = async <T = unknown>(
  url: string,
  method: string = 'GET',
  body?: unknown,
  options?: FetcherOptions
): Promise<ApiResponse<T>> => {
  // Implementation with proper typing and error handling
};

// Response unwrapper utility
export const unwrapApiResponse = <T>(response: AxiosResponse<ApiResponse<T>>): T => {
  if (response.data.success && response.data.data !== undefined) {
    return response.data.data;
  }
  throw new Error(response.data.message || 'API request failed');
};
```

#### Entity-Specific API Services
Each entity will have its own API service file with consistent patterns:

```typescript
// src/services/api/applications.ts
export const applicationsAPI = {
  getAll: (params?: Record<string, unknown>) => 
    doFetcher<Application[]>('/applications', 'GET', undefined, { params }),
  
  getById: (id: string) => 
    doFetcher<Application>(`/applications/${id}`, 'GET'),
  
  create: (data: ApplicationFormData) => 
    doFetcher<Application>('/applications', 'POST', data),
  
  update: (id: string, data: Partial<ApplicationFormData>) => 
    doFetcher<Application>(`/applications/${id}`, 'PUT', data),
  
  delete: (id: string) => 
    doFetcher<void>(`/applications/${id}`, 'DELETE'),
  
  toggleStatus: (id: string) => 
    doFetcher<Application>(`/applications/${id}/toggle-status`, 'PATCH'),
};
```

### Reusable Form Components

#### Form Component Architecture
Using Formik with Yup validation and reusable field components:

```typescript
// Base form component with Formik integration
interface BaseFormProps<T> {
  initialValues: T;
  validationSchema: yup.ObjectSchema<T>;
  onSubmit: (values: T) => Promise<void>;
  children: React.ReactNode;
}

// Reusable field components
interface FormFieldProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}

// Select field for enums
interface FormSelectProps<T> {
  name: string;
  label: string;
  options: Array<{ value: T; label: string }>;
  required?: boolean;
}
```

#### Modal Component System
Standardized modal components with consistent behavior:

```typescript
interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

interface FormModalProps<T> extends BaseModalProps {
  initialValues: T;
  validationSchema: yup.ObjectSchema<T>;
  onSubmit: (values: T) => Promise<void>;
  isEditing?: boolean;
}
```

### Custom Hooks

#### API Interaction Hooks
```typescript
// Generic CRUD hook
export const useEntityCRUD = <T, TForm>(
  apiService: EntityAPIService<T, TForm>
) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // CRUD operations with proper error handling
  return {
    data,
    loading,
    error,
    create: (formData: TForm) => Promise<void>,
    update: (id: string, formData: Partial<TForm>) => Promise<void>,
    delete: (id: string) => Promise<void>,
    refresh: () => Promise<void>,
  };
};

// Form handling hook
export const useFormModal = <T>(
  initialValues: T,
  validationSchema: yup.ObjectSchema<T>
) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);

  return {
    isOpen,
    editingItem,
    open: (item?: T) => void,
    close: () => void,
    isEditing: editingItem !== null,
  };
};
```

## Data Models

### Validation Schemas
Using Yup for consistent validation across forms:

```typescript
// src/utils/validation.ts
export const applicationValidationSchema = yup.object({
  name: yup.string().required('Application name is required'),
  applicationId: yup.string().required('Application ID is required'),
  description: yup.string(),
  status: yup.string().oneOf(['active', 'inactive']).required(),
});

export const userValidationSchema = yup.object({
  username: yup.string().required('Username is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters'),
  role: yup.string().oneOf(['admin', 'user', 'manager']).required(),
  status: yup.string().oneOf(['active', 'inactive']).required(),
});
```

## Error Handling

### Error Boundary Implementation
```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  // Error boundary implementation with fallback UI
}
```

### API Error Handling Strategy
1. **Network Errors**: Show retry mechanism with exponential backoff
2. **Authentication Errors**: Automatic redirect to login
3. **Validation Errors**: Display inline field-specific messages
4. **Server Errors**: Show user-friendly error messages with error reporting

## Testing Strategy

### Unit Testing Approach
1. **API Services**: Mock axios responses and test error handling
2. **Custom Hooks**: Test with React Testing Library hooks utilities
3. **Form Components**: Test validation and submission flows
4. **Utility Functions**: Test edge cases and error conditions

### Integration Testing
1. **Component Integration**: Test component interactions with API services
2. **Form Workflows**: Test complete form submission and validation flows
3. **Error Scenarios**: Test error handling and recovery mechanisms

### Testing Tools
- **Jest**: Unit testing framework
- **React Testing Library**: Component testing utilities
- **MSW (Mock Service Worker)**: API mocking for integration tests
- **Testing Library User Events**: User interaction simulation

## Performance Optimizations

### Code Splitting
- Lazy load page components
- Separate vendor bundles
- Dynamic imports for heavy dependencies

### Memoization Strategy
- React.memo for expensive components
- useMemo for expensive calculations
- useCallback for event handlers

### Bundle Optimization
- Tree shaking for unused code
- Code splitting by routes
- Optimize bundle size with webpack-bundle-analyzer

## Migration Strategy

### Phase 1: Type System and API Layer
1. Create centralized type definitions
2. Refactor API services to use doFetcher consistently
3. Fix all TypeScript errors

### Phase 2: Component Refactoring
1. Create reusable form components
2. Implement Formik integration
3. Standardize modal components

### Phase 3: Custom Hooks and Optimization
1. Extract common logic into custom hooks
2. Implement error boundaries
3. Add performance optimizations

### Phase 4: Testing and Documentation
1. Add comprehensive test coverage
2. Update documentation
3. Performance monitoring and optimization