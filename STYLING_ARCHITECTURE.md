# Styling Architecture - Blackhaven Docs

## ✅ CORRECT - Single Source of Truth

### 1. **mint.json** - Mintlify Configuration
- **Purpose**: Framework-level color configuration
- **Primary Color**: `#D4FFAF` (Ozone green) - Used by Mintlify for CTA buttons
- **Location**: `f:\Blackhaven Docss\mint.json`

### 2. **styles/global.css** - All Page Styling
- **Purpose**: ALL page-wide styling (buttons, navbar, sidebar, tables, etc.)
- **Contains**:
  - Launch App button styling (all selectors and overrides)
  - Logo styling (size, borders, etc.)
  - Sidebar, navigation, tables, cards, callouts
  - Light/dark theme variables
- **Location**: `f:\Blackhaven Docss\styles\global.css`

### 3. **bunny.js** - Bunny Character ONLY
- **Purpose**: ONLY the tamagotchi bunny character behavior
- **Contains**: Movement, animations, position tracking
- **Does NOT contain**: Any page styling, CTA buttons, navigation
- **Location**: `f:\Blackhaven Docss\bunny.js`

### 4. **_snippets/head.mdx** - Bunny Visual Styling
- **Purpose**: ONLY bunny visual appearance (colors, size, speech bubble)
- **Contains**: Bunny SVG styling, speech bubble styling
- **Does NOT contain**: Page buttons, navigation, or any non-bunny elements
- **Location**: `f:\Blackhaven Docss\_snippets\head.mdx`

## ❌ REMOVED - Conflicting Files

### ~~force-button-style.js~~ - DELETED
- This file was causing conflicts by trying to override styling with JavaScript
- All button styling is now properly handled in global.css

## Architecture Rules

1. **CSS Variables** → global.css (theme colors, spacing)
2. **Page Styling** → global.css (buttons, nav, content)
3. **Mintlify Colors** → mint.json (primary color for framework defaults)
4. **Bunny Behavior** → bunny.js (JS logic only)
5. **Bunny Appearance** → head.mdx (bunny-specific styles only)

## No More Conflicts!

All styling is now properly separated:
- One file for Mintlify config (mint.json)
- One file for all page styling (global.css)
- Bunny is self-contained (bunny.js + head.mdx)
- Zero duplication or conflicts
