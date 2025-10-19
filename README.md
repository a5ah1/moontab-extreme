# Moontab Extreme

A privacy-focused, highly customizable new tab page for Chrome

[![Version](https://img.shields.io/badge/version-0.4.2-blue.svg)](manifest.json)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## Overview

Moontab Extreme transforms your Chrome new tab page into a powerful, customizable dashboard for organizing your favorite links. With an intuitive column-based interface, it gives you complete control over how you access and organize your web destinations.

Built with vanilla JavaScript and zero external dependencies, Moontab Extreme prioritizes your privacy by storing all data locally on your device. No accounts, no cloud sync, no tracking – just a fast, reliable new tab experience that's entirely yours.

## ✨ Features

- 🏗️ **Organize links in customizable columns** – Create, reorder, and manage columns to match your workflow
- 🎨 **Multiple themes** – Choose from Light, Dark, Browser (system), or create your own with custom CSS
- 🔒 **Privacy-focused** – All data stored locally with no external servers or analytics
- 📦 **Import/Export** – Full backup and restore functionality with theme packages
- 🎯 **Drag & drop** – Intuitive organization with smooth drag-and-drop support
- 🖼️ **Custom styling** – Background images, colors, and full CSS customization
- ⚡ **Lightning fast** – No build process, no frameworks, just pure performance
- 🔧 **Power user features** – Built-in CSS editor with syntax highlighting and live preview

## 📸 Screenshots

[![Moontab Extreme screenshots](screenshots/screenshots-github.jpeg)](screenshots/screenshots-github.jpeg)

Top left: the example/default set of columns, groups, and links with the light theme.  
Top right: the default dark theme.  
Bottom left: a customized theme and background.  
Bottom right: the Appearance panel in the options page.

## 🚀 Installation

### For Development

1. Clone this repository:
   ```bash
   git clone https://github.com/a5ah1/moontab-extreme.git
   cd moontab-extreme
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" in the top right

4. Click "Load unpacked" and select the `moontab-extreme` directory

5. Open a new tab to see Moontab Extreme in action!

## 📖 Usage

1. **Open a new tab** to see your Moontab Extreme dashboard
2. **Click the settings icon** (⚙️) in the top right or access via Chrome extension options
3. **Add your first column** using the "Add Column" button
4. **Add links** to your columns with titles, URLs, and optional custom icons
5. **Customize** the appearance with themes, backgrounds, and custom CSS

For detailed usage instructions, check the built-in help guide in the options page.

## 🛠️ Development

### Project Structure

```
moontab-extreme/
├── manifest.json           # Extension configuration
├── newtab.html            # New tab page
├── newtab.js              # New tab controller
├── options.html           # Settings interface
├── options.js             # Settings controller
├── popup.html             # Extension popup
├── popup.js               # Popup controller
├── help.md                # Built-in help documentation
├── options/               # Settings page managers
│   ├── ContentManager.js  # Columns, groups, links CRUD
│   ├── AppearanceManager.js
│   ├── GeneralManager.js
│   ├── DataManager.js     # Import/export
│   └── [8+ other managers]
├── scripts/               # Core utilities
│   ├── storage.js         # Data persistence
│   ├── theme-manager.js   # Theme system
│   ├── drag-scroll.js     # Scrolling behavior
│   └── utils.js           # Validation & helpers
├── styles/                # CSS files
│   ├── skeleton.css       # Layout structure
│   ├── newtab.css         # New tab styling
│   └── options.css        # Settings styling
├── vendor/                # Third-party libraries
│   ├── sortable/          # SortableJS
│   ├── ace/               # Ace Editor
│   ├── marked/            # Markdown parser
│   └── jszip/             # ZIP handling
├── assets/icons/          # Extension icons
└── screenshots/           # Project screenshots
```

### Technologies

- **Vanilla JavaScript** (ES6+) – No frameworks or build tools required
- **Chrome Extension Manifest V3** – Latest extension standards
- **Chrome Storage API** – Local data persistence
- **SortableJS** – Drag and drop functionality
- **Ace Editor** – CSS editing with syntax highlighting

### Architecture

Moontab Extreme follows a modular architecture with clear separation between the read-only new tab interface and the full-featured options page. For detailed technical documentation, see [CLAUDE.md](CLAUDE.md).

## 🤝 Contributing

This extension is developed primarily for personal use and shared openly under the MIT license. While you're welcome to fork the project and make your own modifications, please note that active development and feature requests are limited to maintaining functionality for the original use case.

If you encounter bugs or compatibility issues, feel free to open an issue - but please understand that enhancements beyond the current scope may not be implemented.

## 🔐 Privacy

Your privacy is our priority:

- ✅ All data stored locally on your device
- ✅ No user accounts or cloud sync
- ✅ No analytics or tracking
- ✅ Minimal external requests (only optional favicon fetching)
- ✅ Link titles use domain names (no page content fetching)
- ✅ Open source for complete transparency

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Contributors

- **Claude** <noreply@anthropic.com> - AI assistant for development and documentation
- **Grok** <grok@x.ai> - AI assistant for initial development work

## 🙏 Acknowledgments

Moontab Extreme includes the following open-source libraries:

- [SortableJS](https://github.com/SortableJS/Sortable/) - Drag and drop functionality
- [Ace Editor](https://github.com/ajaxorg/ace) - Code editing capabilities
- [Marked](https://github.com/markedjs/marked/) - Markdown parsing
- [JSZip](https://github.com/Stuk/jszip) - ZIP file handling
- [Animate.css](https://github.com/animate-css/animate.css) - CSS animations
