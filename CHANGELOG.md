# Changelog

All notable changes to Link Stacker will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/a5ah1/link-stacker/compare/v0.2.3...HEAD
[0.2.3]: https://github.com/a5ah1/link-stacker/compare/v0.2.2...v0.2.3
[0.2.2]: https://github.com/a5ah1/link-stacker/releases/tag/v0.2.2
