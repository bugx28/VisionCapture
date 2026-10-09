# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Features (Project Manager)
- **ProjectManager.tsx**: Replaced the static `<select>` dropdown for Device Name filtering with a dynamic text input featuring a `<datalist>` autocomplete. Project Managers can now type partial strings to filter Egocentric Video applications by smartphone model.
- **ProjectManager.tsx (Messaging)**: Completely redesigned the PM Messages tab. Added real-time counters for "Unread Messages" and "Ongoing Conversations". Added quick filters to show only users with new messages, ongoing conversations, or by contributor type. Replaced the full-screen chat takeover with a responsive split-view, displaying the selected user's Profile Details side-by-side with the chat.

### Features (Contributor Dashboard)
- **Profile.tsx**: Separated Personal Details and Payment Details into side-by-side dedicated sections rather than stacking them, significantly improving UI readability.
- **Profile.tsx**: Payment details (crypto network and address) are now explicitly optional.
- **Profile.tsx**: Added detailed Egocentric Video Payment Cycle text directly to the Overview tab (1st-15th work is paid between 16th-22nd, and 16th-31st work is paid between 1st-7th of the next month) to provide clear expectations to contributors.

### UI & Styling Improvements
- **Header.tsx**: Changed the header positioning to `sticky` and removed generic top padding `pt-24`/`pt-32` across pages, fixing a critical issue on mobile devices where content would overlap with the menu bar when expanded.
- **Header.tsx**: The "Discuss Your Project" call-to-action button now properly redirects to the `/partner-with-us` page.
- **Theme**: Removed the "Night Theme" completely from the application per business requirements; standardizing on a clean, light-mode interface.
- **ProjectChat.tsx**: Fixed a scrolling UX bug where selecting a PM to message would aggressively jump to the center of the viewport. The message container now gracefully slides into view at the top (`block: 'start'`).
- **Hero.tsx**: Rebuilt the Hero section to be more impactful. The background video now loads across all devices (mobile and desktop) instantly. Applied a dark gradient overlay (`bg-slate-900/60` mix-blend) to make the video pop and the white text highly readable.
- **Hero.tsx**: Added a custom `TypewriterText` component to animate the typing of the main paragraph text.
- **Hero.tsx**: Fixed an issue where the "Egocentric Video Contributors" project card text was overflowing and hiding under the section on mobile by expanding the container `min-h` from `420px` to `520px`. Removed the "India's Premier Data Infrastructure" badge.

### Performance & Bug Fixes
- **Media Optimization**: Optimized all `/public` MP4 video files using `ffmpeg` compression (H.264, `-crf 28`, stripped audio) to ensure incredibly fast load times on both mobile and desktop.
- **Video Fallbacks**: Fixed a critical crash (`TypeError: undefined is not an object (evaluating 'videoSrc.replace')`) in `Hero.tsx` and `SampleVideoData.tsx` caused by missing video sources by applying safe optional chaining (`?.replace()`).
- **Profile.tsx**: Implemented strict validation for Phone Numbers, ensuring it throws an error if exactly 10 digits are not provided, ignoring formatting characters.
- **App.tsx**: Disabled massive background blur divs (`blur-[100px]`, `mix-blend-multiply`) on mobile to stop constant GPU layer compositing and prevent scroll jank/battery drain.
- **Home.tsx & App.tsx (Loading Fix)**: Reverted over-aggressive `React.lazy()` on the homepage and its sections. The homepage (`Home`, `Hero`, `LiveStats`, etc.) is now eagerly imported so it renders instantly with the Header — no spinners. Only authenticated dashboard pages (`Profile`, `Admin`, `ProjectManager`) remain lazy-loaded.
- **vite.config.ts**: Added `manualChunks` to split vendor libraries (`react`, `motion`, `@tanstack/react-query`) into separate cached bundles, preventing the main app chunk from bloating.
- **SampleVideoData.tsx & ProcessFlow.tsx**: Implemented zero-download video posters on mobile. Instead of autoplaying or downloading video files, mobile views now enforce `preload="metadata"` with `#t=0.001` to instantly fetch only the first frame as a static image, saving massive amounts of data.
- **index.css**: Added global CSS overrides to strictly disable all CSS and JS animations/transitions (`animation-duration: 0.001s`) on devices under 768px, ensuring snappy, layout-thrash-free scrolling.
- **Bundle Optimization**: Unified animation imports across all components (switched any `framer-motion` imports to `motion/react`) to remove duplicate library bundling, saving ~2KB gzip.

### Features (Opportunity Manager)
- **OpportunityManager.tsx**: Completely rebuilt the Opportunity Manager page UI to allow PMs to dynamically post and manage external opportunities via form fields, styled similarly to modern job cards (e.g., Micro1).
- **Opportunities.tsx**: Redesigned the public opportunities page to display posts as horizontal cards with tags, location, and direct application links, matching the new design system.
- **Backend (Opportunity)**: Added new `Opportunity` Mongoose model and REST API endpoints (`/api/opportunities`, `/api/pm/opportunities`) to support creating, reading, updating, and deleting external opportunity cards securely by Project Managers.

### Removed
- **Global Messaging (User-Admin)**: Removed the unused user-admin global messaging feature. Deleted `Message.js` model, `/api/messages` routes, and the messaging chat UI from `Admin.tsx`. Project Manager messaging (`ProjectMessage.js`) remains intact.

### Reverted
- **Signup.tsx**: Reverted custom `DropdownSelect` and `MultiSelectDropdown` implementations for form fields (Experience, How Found Us, Projects) back to native HTML `<select>` and `<button>` toggles per user request. Removed the custom component files.
