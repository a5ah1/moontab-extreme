![Moontab Extreme](/img/marquee.jpeg)

# Moontab Extreme

Hey, you! Tired of that vanilla Chrome new tab? Meet Moontab Extreme—your privacy-obsessed, super-customizable dashboard that turns it into a link-organizing powerhouse. No fluff, just pure awesomeness.

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](manifest.json)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## Overview

Picture this: Moontab Extreme takes your new tab and hands you the reins to build a slick, column-based hub for all your go-to sites. Drag, drop, theme it up—it's like playing Tetris with your bookmarks, but way more satisfying.

We built this bad boy with straight-up vanilla JS, zero sneaky dependencies, and a fierce commitment to your privacy. Everything stays locked on your device—no accounts, no creepy cloud stuff, no "hey, can we track you?" nonsense. It's quick, it's yours, and it's ready to rock without the drama.

## ✨ Features

- 🏗️ **Column chaos (the good kind)** – Whip up columns, shuffle 'em around, and stuff 'em with links to fit your vibe.
- 🎨 **Theme overload** – Pick from 22 ready-to-go looks (Light, Dark, Glass, Material, Gruvbox, Nord, Tailwind palettes—you name it), sync with your browser's mood, or go rogue with custom CSS. Because why settle for boring?
- 🔒 **Privacy ninja** – All your data chills locally. No servers peeking in, no analytics spying—just you and your tabs.
- 📦 **Backup buddies** – Import/export everything, including themes. Lost your setup? Boom, restore like nothing happened.
- 🎯 **Drag & drop delight** – Reorganize with a flick of the wrist. Smooth as butter.
- 🖼️ **Style it silly** – Slap on backgrounds, tweak colors, or unleash full CSS wizardry.
- ⚡ **Speed demon** – No bloated builds or frameworks—loads faster than you can say "new tab."
- 🔧 **Power moves** – Built-in CSS editor with fancy highlighting and instant previews. For when you feel like tinkering.

## 📸 Screenshots

[![Moontab Extreme screenshots](/img/all-screenshots.jpeg)](/img/all-screenshots.jpeg)

Top left: The starter pack—default columns, groups, and links rocking the light theme. Cute, right?

Top right: Default dark mode, because sometimes you gotta embrace the shadows.

Bottom left: A wild custom theme with a fancy background. Go nuts!

Bottom right: Peeking into the Appearance panel on the options page. Where the magic happens.

## 🚀 Installation

### From Chrome Web Store

**Coming Soon!** Moontab Extreme will be available on the Chrome Web Store. Once published, you'll be able to install it with a single click:

1. Visit the [Chrome Web Store listing](#) (link will be added after publication)
2. Click "Add to Chrome"
3. Open a new tab and start customizing!

### For Development

1. Snag the repo like this:
   ```bash
   git clone https://github.com/a5ah1/moontab-extreme.git
   cd moontab-extreme
   ```

2. Fire up Chrome, head to `chrome://extensions/`

3. Flip on "Developer mode" up top-right (you rebel)

4. Hit "Load unpacked" and point it at the `moontab-extreme` folder

5. Pop open a new tab and watch the magic unfold!

## 📖 Usage

1. Crack open a new tab—bam, dashboard time.
2. Spot the settings gear (⚙️) in the top right? Click it, or sneak in via Chrome's extension options.
3. Smash that "Add Column" button to kick things off.
4. Toss in links with snazzy titles, URLs, and maybe a custom icon for flair.
5. Customize the looks with themes, pics, and CSS hacks.

Wanna dive deeper? The options page has a built-in help guide that's basically your new best friend.

## 🛠️ Development

### Project Structure

Here's the lay of the land—kept tidy so you don't lose your mind digging around:

```
moontab-extreme/
├── manifest.json           # The boss file for extension setup
├── newtab.html            # Your shiny new tab home
├── newtab.js              # The brains behind the new tab
├── options.html           # Where you tweak all the things
├── options.js             # Options page puppet master
├── popup.html             # Quick popup menu
├── popup.js               # Popup's little helper
├── help.md                # In-app cheat sheet
├── options/               # The manager squad for settings
│   ├── ContentManager.js  # Handles columns, groups, links—like a digital organizer
│   ├── AppearanceManager.js  # Makes it pretty
│   ├── GeneralManager.js  # The everyday stuff
│   ├── DataManager.js     # Import/export wizardry
│   └── [8+ other managers]  # Yeah, we've got a full team
├── scripts/               # Utility belt
│   ├── storage.js         # Keeps your data safe and sound
│   ├── theme-manager.js   # Theme-switching superhero
│   ├── drag-scroll.js     # Smooth scrolling tricks
│   └── utils.js           # Grab-bag of helpers and validators
├── styles/                # Looking good
│   ├── skeleton.css       # Basic bones for layout
│   ├── newtab.css         # New tab glow-up
│   └── options.css        # Options page polish
├── vendor/                # Borrowed goodies
│   ├── sortable/          # For that drag-and-drop magic (SortableJS)
│   ├── ace/               # Code editor for CSS fun
│   ├── marked/            # Markdown muncher
│   ├── jszip/             # ZIP zippers
│   └── animate/           # Slick CSS animations
├── assets/icons/          # Icon stash
└── img/                   # Images for README
```

### Technologies

- **Vanilla JS** (ES6+ vibes) – No frameworks, no build hassle. Keep it simple, stupid!
- **Chrome Extension Manifest V3** – Staying fresh with the latest rules.
- **Chrome Storage API** – Your local data vault.
- **SortableJS** – For effortless dragging.
- **Ace Editor** – Syntax highlights your CSS dreams.

### Architecture

We went modular: New tab is read-only and speedy, options page is your playground. Data's stacked in a neat hierarchy (Columns → Groups → Links), with version control and backup smarts to keep things from going sideways.

## 🤝 Contributing

This is mostly my pet project, shared for kicks under MIT. Fork it, tweak it, make it yours! But heads up—I'm keeping dev focused on my needs, so feature wishes might get a polite "maybe later." Bugs? Holler via issues, and I'll squish 'em if they bite.

## 🔐 Privacy

Privacy's not just a buzzword here—it's the whole point:

- ✅ Data's all local, no wandering off.
- ✅ No sign-ups or sync shenanigans.
- ✅ Zero tracking—because who needs Big Brother?
- ✅ Bare-minimum web calls (just favicons if you want 'em).
- ✅ Links use domain names only—no snooping on pages.
- ✅ Fully open source, so peek under the hood anytime.

## 📄 License

MIT all the way—check the [LICENSE](LICENSE) for the deets.

## 👥 Contributors

- **Claude** <noreply@anthropic.com> - AI assistant for development and documentation
- **Grok** <grok@x.ai> - AI assistant for initial development work

## 🙏 Acknowledgments

Big shoutout to the open-source heroes we borrowed from:

- [SortableJS](https://github.com/SortableJS/Sortable/) - Drag and drop functionality
- [Ace Editor](https://github.com/ajaxorg/ace) - Code editing capabilities
- [Marked](https://github.com/markedjs/marked/) - Markdown parsing
- [JSZip](https://github.com/Stuk/jszip) - ZIP file handling
- [Animate.css](https://github.com/animate-css/animate.css) - CSS animations
