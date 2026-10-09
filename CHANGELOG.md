# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### UI & Styling Improvements
- **Hero.tsx**: Rebuilt the Hero section to be more impactful. The background video now loads across all devices (mobile and desktop) instantly. Applied a dark gradient overlay (`bg-slate-900/60` mix-blend) to make the video pop and the white text highly readable.
- **Hero.tsx**: Added a custom `TypewriterText` component to animate the typing of the main paragraph text.
- **Hero.tsx**: Fixed an issue where the "Egocentric Video Contributors" project card text was overflowing and hiding under the section on mobile by expanding the container `min-h` from `420px` to `520px`. Removed the "India's Premier Data Infrastructure" badge.

### Performance (Mobile Optimization)
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
