# Link Stacker Help

## Getting Started

Welcome to Link Stacker! This Chrome extension replaces your new tab page with a customizable, Trello-inspired interface for organizing your links into columns.

### First Steps

1. **Open a new tab** to see your Link Stacker dashboard
2. **Click the settings icon** or go to `chrome://extensions/` and click "Options" next to Link Stacker
3. **Start adding columns** to organize your links
4. **Customize the appearance** to match your preferences

## Managing Content

### Working with Columns

**Adding Columns:**
- Click the "Add Column" button in the Content tab
- Give your column a descriptive name
- Use the drag handle to reorder columns

**Column Options:**
- **Title**: The name displayed at the top of the column
- **Custom Classes**: Add CSS classes for advanced styling
- **Reordering**: Drag columns using the grip handle
- **Deletion**: Click the trash icon to remove a column

### Managing Links

**Adding Links:**
- Click "Add Link" within any column
- Enter the URL and title
- Optionally add a custom icon or favicon

**Link Options:**
- **URL**: The destination when clicked (HTTPS, localhost, and IP addresses allowed; chrome:// URLs can be entered but won't function)
- **Title**: Display name for the link
- **Icon**: Upload custom icon files or specify a custom domain for favicon fetching
- **Custom Classes**: Add CSS classes for advanced styling

**Link Features:**
- **Favicon Support**: Automatically fetches favicons from websites
- **Custom Icons**: Upload your own icon files or specify custom domains
- **Custom Domain for Favicons**: Enter a domain (e.g., "google.com") to fetch favicons when the default is missing
- **Drag & Drop**: Reorder links within columns
- **URL Validation**: HTTPS URLs are required for external sites; localhost and IP addresses are also supported

### Dividers

Add visual separators within columns to group related links:
- Click "Add Divider" to insert a separator
- Optionally add a title to create a labeled section
- Use custom classes for styling

## Appearance Customization

### Themes

Choose from several built-in themes:
- **Light**: Clean, bright interface
- **Dark**: Comfortable dark mode
- **Browser**: Follows your system preference
- **Custom**: Create your own theme with CSS

### Background Customization

**Background Color:**
- Set a solid background color that works with any theme
- Use the color picker or enter hex values
- Easily clear to return to theme default

**Background Images:**
- Upload custom background images
- Control image positioning, sizing, and repeat behavior
- Preview changes in real-time
- Supported formats: JPG, PNG, GIF, WebP

### Custom CSS

For advanced users, the Custom theme allows complete visual control:
- Full CSS editor with syntax highlighting
- Live preview functionality
- Dark/light editor theme follows system preference
- CSS is automatically sanitized for security

**CSS Tips:**
- Use CSS custom properties (variables) for consistent styling
- Target specific elements with existing classes
- Test changes with the preview feature
- Back up your CSS before making major changes

## Data Management

### Export Options

**Content Export:**
- Export only your columns and links
- Perfect for sharing collections or content-only backups
- File format: `link-stacker-content-YYYY-MM-DD_HH-MM-SS.json`

**Complete Theme Export:**
- Export everything: content, themes, CSS, backgrounds, settings
- Ideal for full backups or sharing complete setups
- File format: `link-stacker-theme-YYYY-MM-DD_HH-MM-SS.json`

### Import Features

**Smart Import:**
- Automatically detects file format and validates structure
- Supports legacy formats with automatic migration
- Cross-compatibility between content and theme files
- Safety prompts suggest backups before importing

**Import Safety:**
- Always create a backup before importing
- Confirmation dialogs for destructive operations
- File validation prevents corrupt imports
- Legacy compatibility handles old export formats

### Storage Information

Monitor your extension's storage usage:
- View current data size
- Track storage quota usage
- Automatic cleanup of unused data
- Migration system for data structure updates

## General Settings

### Display Options

**Icon Visibility:**
- Toggle link icons on/off globally
- Applies to both custom icons and favicons
- Useful for minimal, text-only layouts

**URL Display:**
- Show/hide URLs under link titles
- Helpful for identifying similar links
- Can be disabled for cleaner appearance

**Column Headers:**
- Toggle column title visibility
- Useful for ultra-minimal layouts
- Headers remain functional even when hidden

### Accessibility Features

- Full keyboard navigation support
- ARIA labels for screen readers
- High contrast theme compatibility
- Semantic HTML structure

## Security & Privacy

### URL Security

- HTTPS URLs are required for external sites; localhost and IP addresses are also supported
- chrome:// URLs can be entered but won't function in extensions
- Automatic URL validation prevents malicious links
- No external script execution
- Content Security Policy (CSP) protection

### Data Privacy

- All data stored locally in Chrome storage
- No external servers or cloud storage
- No analytics or tracking
- Open source and auditable code

### CSS Security

- Custom CSS is automatically sanitized
- Dangerous constructs (@import, javascript:) are removed
- No external resource loading in CSS
- Safe expression evaluation

## Troubleshooting

### Common Issues

**Links Not Opening:**
- Ensure URLs start with https:// (chrome:// URLs won't work in extensions)
- For local development, use localhost or IP addresses
- Check for typos in the URL
- Verify the website is accessible

**Theme Not Applying:**
- Refresh the new tab page
- Check if custom CSS has syntax errors
- Try switching themes to isolate the issue

**Images Not Loading:**
- Verify image URLs are accessible
- Check file size limits (5MB for backgrounds)
- Ensure image formats are supported

**Import Problems:**
- Verify file format is correct JSON
- Check if file is corrupted
- Try a smaller import file
- Ensure sufficient storage space

### Performance Tips

**Optimize Performance:**
- Limit background image file sizes
- Use efficient CSS selectors
- Avoid complex animations in custom CSS
- Keep link counts reasonable per column

**Storage Management:**
- Regularly export backups
- Remove unused custom CSS
- Clean up duplicate links
- Monitor storage usage

### Browser Compatibility

**Supported Browsers:**
- Chrome (latest)
- Chromium-based browsers
- Extension follows Chrome Manifest V3 standards

**Not Supported:**
- Firefox (different extension API)
- Safari (different extension system)
- Internet Explorer (deprecated)

## Advanced Usage

### Custom CSS Examples

**Custom Column Styling:**
```css
.column {
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}
```

**Link Hover Effects:**
```css
.link:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease;
}
```

**Custom Color Scheme:**
```css
:root {
  --bg-primary: #1a1a1a;
  --text-primary: #ffffff;
  --accent: #007acc;
}
```

### CSS Custom Properties

Available CSS variables for theming:
- `--bg-primary`: Primary background color
- `--bg-secondary`: Secondary background color
- `--text-primary`: Primary text color
- `--text-secondary`: Secondary text color
- `--accent`: Accent color for links and buttons
- `--border-color`: Border color for elements

### Keyboard Shortcuts

**Navigation:**
- `Tab`: Navigate between interactive elements
- `Enter`: Activate buttons and links
- `Escape`: Close modals and dropdowns
- `Arrow Keys`: Navigate within lists

**Editing:**
- `Ctrl+S`: Save changes (auto-save is enabled)
- `Ctrl+Z`: Undo in CSS editor
- `Ctrl+F`: Find in CSS editor

## Support

### Getting Help

**Documentation:**
- This help guide covers most common scenarios
- Check the troubleshooting section for specific issues
- Review the advanced usage section for customization tips

**Community:**
- [GitHub Repository](https://github.com/a5ah1/link-stacker) for source code and documentation
- [GitHub Issues](https://github.com/a5ah1/link-stacker/issues) for bug reports and feature requests
- Community discussions for usage questions
- Share your custom themes and CSS with others

### Contributing

Link Stacker is open source and welcomes contributions:
- [Report bugs and suggest features](https://github.com/a5ah1/link-stacker/issues) on GitHub
- [Submit pull requests](https://github.com/a5ah1/link-stacker/pulls) for improvements
- Share custom themes and CSS snippets
- Help improve documentation

### Version Information

Current version: 0.2.2
- Chrome Manifest V3 compatible
- Regular updates and improvements
- Backward compatibility maintained
- Migration system for data structure changes

## About This Extension

Link Stacker is a Chrome extension designed for power users who want complete control over their new tab experience. It transforms your new tab page into a customizable, Trello-inspired dashboard where you can organize links into columns, apply custom themes, and create your own CSS styling.

Built with vanilla JavaScript and following Chrome Manifest V3 standards, Link Stacker prioritizes privacy, security, and user customization. All data is stored locally, and the extension includes comprehensive import/export functionality for easy backup and sharing.

**Source Code:** [GitHub Repository](https://github.com/a5ah1/link-stacker)

This Chrome extension uses the following third-party libraries, bundled in the /vendor directory. We thank their creators!

### Ace Editor
- Repository: [https://github.com/ajaxorg/ace-builds/](https://github.com/ajaxorg/ace-builds/)
- License: BSD-3-Clause

Copyright (c) 2010, Ajax.org B.V.
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL AJAX.ORG B.V. BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

### Animate CSS
- Repository: [https://github.com/animate-css/animate.css](https://github.com/animate-css/animate.css)
- License: MIT

The MIT License (MIT)

Copyright (c) 2021 Daniel Eden

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

### JSZip (using MIT option)
- Repository: [https://github.com/Stuk/jszip](https://github.com/Stuk/jszip)
- License: MIT or GPLv3 (MIT chosen for this project)

The MIT License (MIT)

Copyright (c) 2009-2016 Stuart Knightley, David Duponchel, Franz Buchinger, António Afonso

[Full MIT text as above, with the specific copyright.]

### Marked
- Repository: [https://github.com/markedjs/marked/](https://github.com/markedjs/marked/)
- License: MIT

The MIT License (MIT)

Copyright (c) 2011-2024, [Christopher Jeffrey](https://github.com/chjj/)

[Full MIT text as above.]

### Sortable JS
- Repository: [https://github.com/SortableJS/Sortable/](https://github.com/SortableJS/Sortable/)
- License: MIT

MIT License

Copyright (c) 2019 All contributors to Sortable

[Full MIT text as above.]

---

*Last updated: Version 0.2.2*