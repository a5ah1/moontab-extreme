# Changelog

All notable changes to Moontab Extreme will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.5.0] - 2025-10-21

### Added
- **NEW: Hybrid Theme System** (In Progress - Backend Complete, UI Pending)
  - Three theme modes: Browser (follows system), Preset Theme (dropdown), Custom CSS
  - Six preset themes: Light, Dark, Glass Light, Glass Dark, Acrylic Light, Acrylic Dark
  - Glass and Acrylic themes feature glassmorphism effects with backdrop blur and noise textures
  - Per-theme CSS enhancement system: add custom CSS on top of any preset theme
  - Preset themes support optional theme-specific CSS (variables + CSS for complex effects)
- **NEW: Shine Effect**
  - Subtle cursor-following glow effect on link cards and group elements
  - Conditional rendering based on user setting and `prefers-reduced-motion`
  - Available on all themes (Light, Dark, Browser, Glass, Acrylic), can be toggled globally
  - Customizable via CSS variables: `--shine-color`, `--shine-opacity`, `--shine-size`, `--shine-blend-mode`, `--shine-internal`, `--shine-internal-opacity`
  - Performance-optimized with CSS custom properties (`--mouse-x`, `--mouse-y`)
  - Theme-appropriate colors (neutral grays for light themes, lighter grays for dark themes)
  - Blend mode system allows darkening on light themes and lightening on dark themes
  - Fixed positioning bug where shine tracked only with first group in container
  - Shine effect properly contained within element boundaries via `overflow: hidden`
- **NEW: Display Scale Settings** (Backend Ready, UI Pending)
  - Base Font Size setting (12-24px, default 16px) - applies to all themes
  - UI Scale setting (0.8-1.5, default 1.0) - scales all interface elements
  - Addresses Chrome limitation: zoom unavailable on new tab pages
  - Settings applied to `:root` before theme variables for consistency

### Changed
- **Theme System Architecture Refactored**
  - Replaced `THEMES` with `PRESET_THEMES` registry including metadata
  - Theme data structure: `{ name, category, description, supportsShineEffect, variables, css }`
  - Themes grouped by category: "default" (Light/Dark), "modern" (Glass/Acrylic)
  - Default theme changed from Light to Browser (follows system preference)
  - Shine effect targets `.link-card` and `.group` elements (not columns)
- **Storage Schema Enhanced**
  - Added `themeMode` field: 'browser' | 'preset' | 'custom' (replaces legacy `theme` field)
  - Added `selectedPresetTheme` field for preset mode selection
  - Added `shineEffectEnabled`, `baseFontSize`, `uiScale` fields
  - Added per-theme CSS fields for all 6 preset themes (e.g., `glassLightCss`, `acrylicDarkCss`)
  - Import validation updated for new theme mode values
- **ThemeManager Modernized**
  - `init()` now takes full settings object instead of individual parameters
  - Added `applyGlobalScaleSettings()` method for font size and UI scale
  - Added `applyPresetTheme()` method (replaces `applyBuiltinTheme()`)
  - Added `removePresetThemeCSS()` cleanup method
  - Added `getPresetThemeMetadata()` and `getPresetThemesByCategory()` helpers
  - Updated `applyBrowserTheme()` and `applyCustomTheme()` for new architecture
  - `initializeTheming()` simplified to pass complete settings object
- **SettingsManager Extended**
  - Added `updateThemeMode()`, `updateSelectedPresetTheme()` methods
  - Added `updateShineEffectEnabled()`, `updateBaseFontSize()`, `updateUiScale()` methods
  - Removed legacy `updateTheme()` method (replaced by mode-based system)

### Fixed
- **Shine Effect Improvements**
  - Fixed positioning bug where shine effect stayed on first group when hovering over subsequent groups
  - Added `position: relative` and `overflow: hidden` to `.group` elements for proper pseudo-element positioning
  - Shine effect now properly contained within element boundaries
- **Column Minimum Height**
  - Column minimum height now only applies to empty columns (no groups or only empty groups)
  - Non-empty columns no longer have unnecessary minimum height constraint
  - Added `empty-column` class detection in JavaScript for conditional styling

### Technical Details
- **Glassmorphism Implementation**
  - Backdrop blur (12px) with saturation (140%) for depth
  - Semi-transparent backgrounds (0.7 opacity) for see-through effect
  - Browser fallbacks for non-supporting browsers (`@supports` queries)
  - Z-index layering: content (z:1) > shine effect (z:2) > noise texture (z:0)
- **Acrylic Material Implementation**
  - Glass effect base + SVG noise texture overlay
  - Noise generated via `feTurbulence` filter (fractal noise, 0.85 frequency, 3 octaves)
  - Opacity tuned per theme: 0.12 (light), 0.15 (dark)
  - Pointer events disabled on texture layer to preserve interactivity
- **Shine Effect CSS Pattern**
  - Uses `::before` pseudo-element for border glow on link cards and groups
  - Additional `::after` pseudo-element for internal surface glow (all themes with shine support)
  - Radial gradient follows cursor via CSS custom properties (`--mouse-x`, `--mouse-y`)
  - Mask composite technique creates border-only effect on `::before`
  - Conditional: only active when `body.shine-effect-enabled` class present
  - Customizable via multiple CSS variables:
    - `--shine-color`, `--shine-opacity`, `--shine-size` (border glow)
    - `--shine-internal`, `--shine-internal-opacity`, `--shine-blend-mode` (internal glow)
  - Blend mode system: `normal` for all themes, customizable for user CSS
  - Internal shine uses black (0,0,0) on light themes for darkening effect
  - Internal shine uses white (255,255,255) on dark themes for lightening effect
  - Smooth transitions (0.3s ease) for opacity changes
  - Applied to `.link-card` and `.group` elements only
  - Requires `position: relative` and `overflow: hidden` on parent elements
- **Architecture Preservation**
  - Strict CSS cascade maintained: skeleton.css → theme variables → preset theme CSS → user CSS
  - No build process - remains pure vanilla JavaScript/CSS
  - All effects degradable: fallbacks for older browsers, respects accessibility preferences

### Developer Notes
- **Breaking Changes:** None (zero users, fresh start)
- **Migration:** Not required (new architecture, no legacy data)
- **Implementation Status:** Complete - all backend and frontend code implemented
  - ✅ Storage schema updated with new theme system fields
  - ✅ PRESET_THEMES registry with 6 themes (Light, Dark, Glass Light/Dark, Acrylic Light/Dark)
  - ✅ ThemeManager refactored for hybrid mode system (browser/preset/custom)
  - ✅ Appearance panel HTML with theme mode selector cards
  - ✅ Display Scale settings (base font size, UI scale)
  - ✅ Shine effect implemented on `.link-card` and `.group` elements
  - ✅ Theme mode selector styling added (card-based layout)
- **Testing Status:** Ready for manual testing in browser
- **Reference:** See `.claude/TODO.md` for testing checklist

## [0.4.4] - 2025-10-20

### Fixed
- Fixed custom CSS editor not initializing when switching to Custom theme
  - Custom CSS editor (Ace Editor) now initializes automatically when switching to Custom theme from another theme
  - Previously required a page refresh to see the editor after switching to Custom theme
  - Added theme change callback system between ThemeSelector and AppearanceManager (options/ThemeSelector.js:7, options/AppearanceManager.js:16-18, 39-44)

### Changed
- Improved dark theme contrast for better visual hierarchy
  - Adjusted link card hover background: `#2d2d2d` → `#3b3b3b` (lighter, more visible)
  - Adjusted column background: `#2d2d2d` → `#232323` (darker, creates separation)
  - Adjusted column hover background: `#3a3a3a` → `#2a2a2a` (more subtle hover effect)
  - Adjusted group hover background: `#3a3a3a` → `#2a2a2a` (matches column hover)
  - Link cards now stand out more clearly against column/group backgrounds when hovered

## [0.4.3] - 2025-10-20

### Changed
- Removed deprecated "Dividers" section from CSS variables reference grid in options page
  - Dividers were replaced by groups in v0.2.0 but documentation remained
  - Cleaned up options.html CSS variables help template
- Removed deprecated divider CSS variables from theme definitions
  - Removed `--divider-border-color` and `--divider-radius` from light and dark themes
  - Variables were unused after migration to group-based architecture
- Hidden scrollbars while maintaining scroll functionality
  - Horizontal scrollbar on board container now hidden
  - Vertical scrollbar on groups container now hidden
  - Mouse wheel, touchpad, and drag-scroll still work normally
  - Creates cleaner, more immersive visual experience
- Implemented dynamic styling system for column/group box appearance
  - Groups now appear as visual boxes when column headers are hidden
  - Box appearance (background, border, shadow) shifts from columns to groups dynamically
  - Padding automatically adjusts between columns and groups based on header visibility
  - Smooth transitions between states for polished UX
  - State managed via `.hide-column-headers` class on body element

### Added
- Added comprehensive "Groups" section to CSS variables reference grid
  - Documents all group-related CSS variables for user customization
  - Includes 11 variables: background, hover, border, border-color, radius, padding, and title styling
  - Positioned after Columns section for logical flow
  - Enables advanced users to style groups independently
- Added new CSS variables for dynamic styling system
  - `--column-bg-hover-color`: Column background on hover (light: #e9ecef, dark: #3a3a3a)
  - `--group-bg-hover-color`: Group background on hover (matches column hover colors)
  - `--group-border-color`: Group border color (matches column border colors)
  - `--groups-container-padding`: Dynamic padding for groups container (default: 8px scaled)
  - `--group-padding-default`: Default padding for groups (default: 0)
  - All new variables defined in both light and dark themes
- Added state class management in newtab.js
  - Body element gets `.hide-column-headers` class when column headers are hidden
  - Enables CSS-based dynamic styling without JavaScript DOM manipulation
  - Class automatically updated when settings change

### Reviewed
- Completed comprehensive HTML/CSS naming consistency audit (Phase 2)
  - Reviewed all template structures in newtab.html and options.html
  - Analyzed CSS class naming patterns across skeleton.css, newtab.css, and options.css
  - Confirmed all naming follows consistent patterns within each context
  - Different class names between view and edit contexts are intentional and appropriate
  - Documented findings in `.claude/PHASE2-FINDINGS.md`
  - No changes needed - current architecture is well-structured

## [0.4.2] - 2025-10-19

### Fixed
- Fixed groups collapsing when deleting links from within them
  - Groups now maintain their expanded/collapsed state when links are deleted
  - Issue was caused by incorrect querySelector in state restoration logic (options/ContentManager.js:2057-2059)

### Added
- Added visible "Add link" button at bottom-right of each group
  - Green button provides clear, accessible way to add links to groups
  - Complements existing plus icon in group header
  - Differentiates from blue "Add group" buttons through color and positioning
- Added ability to drag groups between columns
  - Groups can now be dragged from one column to another using the drag handle
  - Visual feedback highlights valid drop zones during drag operations
  - Validates target column doesn't exceed 50 group limit before allowing move
  - Preserves group content (all links) during cross-column moves
  - Auto-saves changes after successful move

### Changed
- Removed deprecated divider-related code (~200 lines removed from ContentManager.js)
- Refactored state preservation logic into reusable helper methods
  - Added `captureColumnState()` and `restoreColumnState()` methods
  - Improved code maintainability and readability
- Consolidated event listener setup into reusable methods
  - Added `setupGroupActions()` for group button event listeners
  - Added `setupLinkActions()` for link button event listeners
  - Simplified `updateGroupEventListeners()` and `updateActionButtonListeners()` to use centralized helpers
  - Eliminated duplicate event listener code throughout ContentManager.js
- Standardized temporary item handling across all item types (columns, groups, links)
  - Renamed `convertTemporaryColumnToPermanent()` to `handleTemporaryColumnSave()` for consistency
  - Added `removeTemporaryColumn()` method for consistent temporary item removal
  - All three `handleTemporarySave()` methods now follow the same pattern: store old ID → find parent → generate UUID → update data → update DOM → update listeners → mark dirty
  - Improved code consistency and maintainability
- Simplified DOM update methods for better code organization
  - Extracted `updateColumnCounts()` from `updateColumnDOM()` - focused on count display only
  - Extracted `renderColumnGroups()` from `updateColumnDOM()` - handles group rendering and empty state
  - Extracted `setupColumnInteractions()` from `updateColumnDOM()` - handles drag-drop setup
  - Main `updateColumnDOM()` method now orchestrates focused helper methods (easier to understand and maintain)
- Organized and enhanced validation logic
  - Grouped all validation methods together in dedicated section for better code organization
  - Added `validateGroupCount()` to enforce 50 groups per column limit
  - Added `validateLinkCount()` to enforce 200 links per group limit
  - Applied validation checks when adding groups and links with user-friendly error messages
  - Improved enforcement of architectural limits from CLAUDE.md specification
- Reduced method length for better code maintainability
  - Extracted `setupUrlInputHandler()` from `setupLinkFormHandlers()` - handles URL input events
  - Extracted `setupTitleInputHandler()` from `setupLinkFormHandlers()` - handles title input events
  - Extracted `setupIconUrlInputHandler()` from `setupLinkFormHandlers()` - handles icon URL input events
  - Extracted `setupCustomClassesInputHandler()` from `setupLinkFormHandlers()` - handles CSS classes input events
  - Reduced `setupLinkFormHandlers()` from 134 lines to 40-line orchestrator method
  - Each handler now has focused, single responsibility (easier to understand and maintain)

## [0.4.1] - 2025-10-19

### Fixed
- Fixed scroll wheel not working for vertical scrolling in columns with overflow
  - Corrected CSS selector mismatch in drag-scroll wheel handler (was looking for `.links-container`, now correctly targets `.groups-container`)
  - Users can now use scroll wheel to scroll vertically within columns that exceed viewport height
  - Horizontal scrolling for board navigation continues to work as expected

## [0.4.0] - 2025-10-19

### Major Changes - New Group-Based Architecture

**Breaking Change:** This version introduces a fundamental restructuring of how content is organized. Moontab Extreme now uses a three-level hierarchy (Columns → Groups → Links) instead of the previous two-level structure (Columns → Items[Links|Dividers]).

### Added
- Groups as intermediate organizational layer between columns and links
- Group titles (optional) for organizing links within columns
- "Show Group Headers" display setting in General tab to show/hide group titles
- Custom CSS classes for groups (visible in advanced mode)
- Limits on groups per column (50) and links per group (200)
- New CSS custom properties for group theming and customization

### Changed
- Data schema upgraded from version 1 to version 2
- Columns now contain groups, groups contain links (was: columns contain items)
- Import/export format updated to support new group-based structure
- New tab rendering updated for three-level hierarchy
- Options page completely refactored for group management with full CRUD operations
- Storage metrics display now shows "Groups" instead of "Dividers"
- All rendering logic updated to work with groups containing links

### Removed
- Dividers (functionality replaced by groups with optional titles)
- All divider-related UI components, templates, and code
- Legacy v1 compatibility code (no migration needed for this new extension)

### Technical
- Storage version incremented to 2
- Storage key remains `moontabExtremeData`
- Added GroupManager and LinkManager classes for better data management
- Added group validation and limit checking
- New CSS variables for group theming: `--group-spacing`, `--group-title-color`, `--group-background`, etc.
- Cross-group link dragging fully implemented in options page
- Complete CSS overhaul with group-based structure in skeleton.css, newtab.css, and options.css

### User Experience
- Groups provide better semantic organization than dividers
- Optional group titles allow flexible organization (titled groups or clean link lists)
- Group headers can be globally hidden for a minimal interface
- Drag and drop works seamlessly: reorder groups within columns, reorder links within groups, move links between groups

## [0.3.0] - 2025-10-19

### Project Transition

**Moontab Extreme is Born** - This marks the first release under the new project name "Moontab Extreme". This is a new project based on Link Stacker, created from a mirror copy with complete git history preserved. While the core functionality remains the same, this represents a fresh start with its own identity and development direction.

### Changed
- Project renamed from "Link Stacker" to "Moontab Extreme" throughout all code and documentation
- Chrome storage key changed from `linkStackerData` to `moontabExtremeData` to ensure clean separation
- Export filenames now use `moontab-extreme-*` prefix instead of `link-stacker-*`
- Updated all GitHub repository references to point to `a5ah1/moontab-extreme`
- Version bumped to 0.3.0 to mark the new project identity

### Technical Notes
- This is a completely separate Chrome extension with its own extension ID
- Existing Link Stacker users will need to manually export/import their data if they wish to migrate
- All commit history from Link Stacker has been preserved in this repository

## [0.2.3] - 2025-10-18

### Fixed
- Fixed validation indicator not updating for saved links after editing URL
- Fixed favicon domain input causing console errors when entering domains with paths
- Fixed links without protocols being treated as relative paths instead of external URLs
- Removed CORS errors from title fetching that appeared in console for most websites

### Changed
- Favicon domain input now accepts full URLs and paths (e.g., "icloud.com/notes/") in addition to simple domains
- Links without a protocol now default to HTTPS while preserving any user-specified protocol (http, ftp, etc.)
- Improved placeholder text for favicon domain input to clarify accepted formats
- Link titles now default to domain name instead of attempting to fetch page title (avoids CORS errors and improves privacy)

### Improved
- Refactored Content tab link creation and editing flow for better maintainability
- Unified event listener system for both temporary and saved links (eliminates code duplication)
- Simplified temporary-to-permanent link conversion (no longer clones DOM elements)
- Improved consistency of validation behavior across link lifecycle
- Refactored Appearance tab code into modular components (ThemeSelector, CSSEditorManager, BackgroundManager, AnimationManager) for improved maintainability and reduced code duplication
- Refactored General tab into dedicated GeneralManager class for consistent architecture across all settings tabs
  - Extracted display settings logic (icon visibility, URL visibility, column headers) from main controller
  - Removed unused `saveGeneral()` method (95 lines of dead code eliminated)
  - Added panel switch hook to refresh storage info when viewing General tab
  - All settings tabs now follow the same manager pattern for better code organization

## [0.2.2] - 2025-10-18

### Added
- Privacy policy
- 32px icon size
- Screenshots and GitHub repository links
- Contributing section clarifications

### Changed
- Updated manifest configuration
- Improved extension icons

## [0.2.1] - Earlier

Initial public release with core functionality:
- Customizable columns for organizing links
- Multiple themes (Light, Dark, Browser/System, Custom)
- Custom CSS support
- Background images and colors
- Import/Export functionality
- Drag & drop organization
- Google favicon integration

[Unreleased]: https://github.com/a5ah1/moontab-extreme/compare/v0.5.0...HEAD
[0.5.0]: https://github.com/a5ah1/moontab-extreme/compare/v0.4.4...v0.5.0
[0.4.4]: https://github.com/a5ah1/moontab-extreme/compare/v0.4.3...v0.4.4
[0.4.3]: https://github.com/a5ah1/moontab-extreme/compare/v0.4.2...v0.4.3
[0.4.2]: https://github.com/a5ah1/moontab-extreme/compare/v0.4.1...v0.4.2
[0.4.1]: https://github.com/a5ah1/moontab-extreme/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/a5ah1/moontab-extreme/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/a5ah1/moontab-extreme/compare/v0.2.3...v0.3.0
[0.2.3]: https://github.com/a5ah1/moontab-extreme/compare/v0.2.2...v0.2.3
[0.2.2]: https://github.com/a5ah1/moontab-extreme/releases/tag/v0.2.2
