# Implementation Plan

- [x] 1. Create centralized type definitions and fix TypeScript errors




  - Create `src/types/entities.ts` with all business entity interfaces (Application, User, Account, Rights)
  - Create `src/types/api.ts` with generic API response types and error interfaces
  - Create `src/types/forms.ts` with form-specific data types
  - Update all existing components to import types from centralized files
  - Fix all TypeScript compilation errors related to type mismatches
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 3.1, 3.2, 3.3, 3.4_

- [x] 2. Refactor API layer with centralized doFetcher implementation





  - Update `src/services/fetcher.ts` to properly handle TypeScript generics and API response unwrapping
  - Create response unwrapper utility function for consistent API response handling
  - Fix environment variable usage for base URLs using VITE_ prefixed variables
  - Add proper error handling and authentication token management
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 3. Create organized API service modules





  - Create `src/services/api/applications.ts` with all application-related API functions using doFetcher
  - Create `src/services/api/users.ts` with all user-related API functions using doFetcher
  - Create `src/services/api/accounts.ts` with all account-related API functions using doFetcher
  - Create `src/services/api/rights.ts` with all rights-related API functions using doFetcher
  - Update existing API service file to re-export from organized modules
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 4. Create reusable form components with Formik integration




  - Create `src/components/common/forms/BaseForm.tsx` component with Formik integration
  - Create `src/components/common/forms/FormField.tsx` for text inputs with inline validation
  - Create `src/components/common/forms/FormSelect.tsx` for dropdown selections with validation
  - Create `src/components/common/forms/FormTextarea.tsx` for textarea inputs with validation
  - Add Yup validation schemas in `src/utils/validation.ts` for all entity forms
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 5. Create reusable modal components
  - Create `src/components/common/modals/BaseModal.tsx` with consistent styling and behavior
  - Create `src/components/common/modals/FormModal.tsx` that integrates BaseModal with Formik forms
  - Create `src/components/common/modals/ConfirmModal.tsx` for delete confirmations
  - Update existing modal implementations to use new reusable components
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 6. Create custom hooks for API interactions
  - Create `src/hooks/useEntityCRUD.ts` hook for generic CRUD operations with loading and error states
  - Create `src/hooks/useFormModal.ts` hook for managing modal state and form editing
  - Create `src/hooks/useApiCall.ts` hook for individual API calls with loading and error handling
  - Add proper TypeScript generics to all custom hooks
  - _Requirements: 6.1, 6.2, 6.3, 6.5_

- [ ] 7. Refactor Applications component to use new architecture
  - Update Applications component to use centralized types from `src/types/entities.ts`
  - Replace direct API calls with new organized API service from `src/services/api/applications.ts`
  - Implement Formik-based forms using new reusable form components
  - Use custom hooks for CRUD operations and modal management
  - Fix all TypeScript errors and ensure proper type safety
  - _Requirements: 1.1, 1.2, 2.1, 2.3, 5.1, 5.2, 5.3, 6.1_

- [ ] 8. Refactor Users component to use new architecture
  - Update Users component to use centralized types from `src/types/entities.ts`
  - Replace direct API calls with new organized API service from `src/services/api/users.ts`
  - Implement Formik-based forms using new reusable form components
  - Use custom hooks for CRUD operations and modal management
  - Fix all TypeScript errors and ensure proper type safety
  - _Requirements: 1.1, 1.2, 2.1, 2.3, 5.1, 5.2, 5.3, 6.1_

- [ ] 9. Refactor Accounts component to use new architecture
  - Update Accounts component to use centralized types from `src/types/entities.ts`
  - Replace direct API calls with new organized API service from `src/services/api/accounts.ts`
  - Implement Formik-based forms using new reusable form components
  - Use custom hooks for CRUD operations and modal management
  - Fix all TypeScript errors and ensure proper type safety
  - _Requirements: 1.1, 1.2, 2.1, 2.3, 5.1, 5.2, 5.3, 6.1_

- [ ] 10. Add error boundaries and loading states
  - Create `src/components/common/ErrorBoundary.tsx` component for catching and displaying errors
  - Create `src/components/common/LoadingSpinner.tsx` component for consistent loading indicators
  - Create `src/components/common/ErrorMessage.tsx` component for displaying error messages
  - Add error boundaries to main application routes and component trees
  - Update all components to use consistent loading and error display patterns
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 11. Implement consistent validation and error handling
  - Update all form validation to use Yup schemas with proper error messages
  - Implement inline validation error display in all form components
  - Add proper error handling for network failures with retry mechanisms
  - Ensure authentication errors redirect users appropriately
  - Add user-friendly error messages for all API error scenarios
  - _Requirements: 5.2, 5.3, 7.1, 7.2, 7.3, 7.4_

- [ ] 12. Optimize code organization and remove duplication
  - Extract common utility functions to `src/utils/helpers.ts`
  - Remove duplicate code patterns across components by using shared hooks and components
  - Ensure consistent naming conventions across all files and functions
  - Add proper TypeScript annotations to all functions and variables
  - Organize imports and remove unused dependencies
  - _Requirements: 6.1, 6.2, 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 13. Update remaining components to use new patterns
  - Update any remaining components (Rights, Dashboard, etc.) to use centralized types
  - Ensure all components use the new API service organization
  - Apply consistent form handling patterns across all components
  - Verify all components follow the established architectural patterns
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 14. Final testing and cleanup
  - Run TypeScript compiler to ensure no remaining type errors
  - Test all CRUD operations across all entity components
  - Verify form validation works correctly with inline error messages
  - Test error handling scenarios and loading states
  - Clean up any remaining console.log statements and debug code
  - _Requirements: 1.1, 5.2, 5.3, 7.1, 7.2_