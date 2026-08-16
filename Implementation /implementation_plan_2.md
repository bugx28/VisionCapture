# Implementation Plan: Project Management, Homepage Refresh & Referrals

This plan addresses a large-scale feature expansion across the Homepage, Project Manager portal, Contributor portal, and Admin dashboard.

## Proposed Changes

### 1. Database Schema Additions (`api/models`)
- **[NEW] `Project.js`**:
  - **Fields**: `title`, `category`, `payRate`, `estimatedDuration`, `country`, `shortDescription`, `fullDescription`, `requirements`, `devicesRequired`, `eligibility`, `instructions`, `deadline`, `positions`, `bannerImage`, `homepageVisible` (bool), `contributorVisible` (bool), `status` (active/inactive/archived), `createdBy` (ref User).
- **[NEW] `PlatformStats.js`**:
  - A singleton model to store Admin-editable values: `totalPayments`, `projectsDelivered`, `happyClients`.
- **[NEW] `Referral.js`**:
  - **Fields**: `contributorId`, `referredUserId`, `status` (pending/successful).
- **[NEW] `ReferralSettings.js`**:
  - **Fields**: `prizeAmounts` (JSON array of ranks/amounts), `currentMonth` (string), `manualAdjustments` (Map/JSON of user IDs to bonus points).

### 2. Backend API Routes (`api/index.js`)
- **Project Routes**: CRUD endpoints protected by the `project_manager` role. Includes routes to toggle visibility and status.
- **Public Routes**: GET endpoints for fetching homepage-visible projects and dynamic stats (calculates total contributors directly from the `User` collection).
- **Admin Routes**: Endpoints to update `PlatformStats`, configure `ReferralSettings`, and fetch/adjust the referral leaderboard.

### 3. Frontend: Homepage Refresh (`src/pages/Home.tsx` & `src/components/Hero.tsx`)
- **Hero Layout Change**: Update the CSS layout to push the "Real-World Data for Physical AI" block to the left.
- **Dynamic Projects Carousel**: Build a sleek, auto-sliding glassmorphism carousel on the right side of the Hero section. It will fetch and display projects marked as `homepageVisible`, rotating every 5-7 seconds. The "Apply Now" button will redirect to the `/contributors` registration page.
- **Live Statistics Section**: Add a new section below the Hero with animated counters for Total Contributors (auto-fetched), Total Payments, Projects Delivered, and Happy Clients.

### 4. Frontend: Project Manager Dashboard (`src/pages/ProjectManager.tsx`)
- Build the complete dashboard replacing the current placeholder.
- **Project Creation/Edit Form**: Includes all requested fields and visibility toggles.
- **Management List**: A table/grid displaying all projects with actions to Edit, Delete, Archive, and Activate/Deactivate. State changes will immediately reflect on the frontend.

### 5. Frontend: Contributor Portal & Leaderboard
- **[NEW] Active Projects Page**: A page (or section within the profile) displaying full details of all `contributorVisible` projects. Clicking "Apply" redirects to the application flow.
- **Referral Leaderboard**: A visually engaging monthly leaderboard displaying Ranks, Contributor Names, Counts, Prizes, and Badges (🥇🥈🥉).

### 6. Frontend: Admin Controls (`src/pages/Admin.tsx`)
- Add new tabs for:
  - **Platform Stats**: Form to update the manual homepage statistics.
  - **Referrals**: Interface to set monthly prize amounts, export reports (CSV generation), view history, reset the board, and manually adjust individual contributor counts.

## Open Questions for the User
> [!IMPORTANT]
> 1. **Project Banner Images**: Should PMs provide an image URL, or do we need to implement a full file upload system (e.g., S3/Cloudinary) for banner images? (For now, I will use URL inputs to keep it lightweight if preferred).
> 2. **Apply Button Action**: For the Contributor Portal's "Apply" button, does clicking it just redirect to a form, or should it automatically record their application in a new `Application` database table?

## Verification Plan
1. Ensure the Homepage Hero splits correctly and the carousel auto-rotates.
2. Log in as a PM, create a project with `homepageVisible` and `contributorVisible` set to true, and verify it appears on the respective public pages.
3. Log in as an Admin, update the Platform Stats, and verify the Homepage animated counters reflect the new numbers instantly.
