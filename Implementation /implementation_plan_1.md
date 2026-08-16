# Implementation Plan: Project Manager Portal

This plan details the addition of a Project Manager role, their dedicated access page, and the admin interface to manage their credentials.

## Proposed Changes

### 1. Database Schema
- **[MODIFY] `api/models/User.js`**: Expand the `role` enum to include `project_manager` alongside `user` and `admin`. 
- Since PMs will be created by admins, they won't need to go through the standard OTP registration process. We'll ensure the schema accommodates this by making fields like `city` and `country` optional for PMs, or providing default values, as admins will just provide email and password.

### 2. Backend API Updates
- **[MODIFY] `api/index.js`**:
  - Add a new protected endpoint `POST /api/admin/create-pm`. This will verify the admin's JWT token, hash the provided password, and insert a new user with the `project_manager` role into the database.
  - Ensure the `/api/auth/login` endpoint correctly returns the `project_manager` role so the frontend can route them appropriately.

### 3. Admin Dashboard
- **[MODIFY] `src/pages/Admin.tsx`**: 
  - Add a new tab named "Project Managers" to the Admin dashboard.
  - Build a secure form in this tab allowing the admin to input an email and password to generate a new PM account.
  - Implement a list view to display all existing project managers.

### 4. Project Manager Page
- **[NEW] `src/pages/ProjectManager.tsx`**:
  - Create a new dedicated page for project managers.
  - **Authentication Flow**: If the user is not logged in as a `project_manager`, display a login form. Once successfully authenticated (or if they are already logged in via a valid token), render the placeholder dashboard where future functionalities will be built.
- **[MODIFY] `src/App.tsx`**: Register the new `/project-manager` route.
- **[MODIFY] `src/components/Header.tsx`**: (Optional) Add a hidden or restricted link for PMs to navigate easily, or just rely on direct URL access.

## Verification Plan
1. Log in to the Admin Dashboard and verify the new "Project Managers" tab is visible.
2. Use the new admin form to successfully create a Project Manager account with an email and password.
3. Navigate to `/project-manager` in a private browsing window to view the new PM login screen.
4. Log in using the newly created credentials and verify access to the secured PM dashboard placeholder.
