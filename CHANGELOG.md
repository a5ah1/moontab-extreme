# Changelog

All notable changes to Moontab Extreme will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/a5ah1/moontab-extreme/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/a5ah1/moontab-extreme/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/a5ah1/moontab-extreme/compare/v0.2.3...v0.3.0
[0.2.3]: https://github.com/a5ah1/moontab-extreme/compare/v0.2.2...v0.2.3
[0.2.2]: https://github.com/a5ah1/moontab-extreme/releases/tag/v0.2.2
