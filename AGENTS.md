# Agent Instructions for Coding 4 Kids

## Project Summary

Educational game suite teaching programming concepts to pre-literate children. Browser-based, no external dependencies.

## Repository Structure

```
coding-for-kids/
├── index.html              # Main game selection page
├── home/styles.css         # Home page styles
├── robot-path-painter/     # Puzzle game: program robot movements
├── music-box-composer/     # Music game: sequence beats/sounds
└── [future-games]/         # Follow same structure
```

## Game Folder Structure

Each game follows this pattern:
```
game-name/
├── index.html          # Entry point
├── styles/             # CSS split by component
│   ├── variables.css   # CSS custom properties
│   ├── main.css        # Global styles
│   └── [component].css # Component-specific styles
├── js/                 # JavaScript modules
│   ├── main.js         # Entry point, initialization
│   ├── Game.js         # Main controller
│   └── [Module].js     # Single responsibility modules
└── tests/              # Unit tests
    └── [Module].test.js
```

## Build & Run

No build step required. Games are static HTML/CSS/JS.

**To test locally:**
```bash
# Start any local server from repo root
npx serve .
# Or
python -m http.server 8000
```

**To run tests:**
Open `game-name/tests/index.html` in a browser.

## Code Validation

- **No linting tools configured** - Follow code style manually
- **Tests**: Browser-based, open `tests/index.html`
- **Manual testing**: Test on real mobile devices (touch interactions critical)

## Critical Constraints

1. **NO external dependencies** - No npm packages, CDN imports, or frameworks
2. **Mobile-first** - Touch is primary input, test on tablets/phones
3. **Pre-literate users** - Use emojis/icons, no text instructions
4. **File size limits** - JS files max 200 lines, CSS max 300 lines
5. **Single responsibility** - Each file does one thing

## Adding New Games

1. Create `game-name/` folder
2. Write tests first in `tests/` folder
3. Implement game logic to pass tests
4. Add UI and polish
5. Include home button: `<a href="../index.html">🏠</a>`

## Common Gotchas

- Audio requires user interaction to play (browser policy)
- Touch events need `{ passive: false }` for `preventDefault()`
- Always use `pointer*` events, not just `mouse*` events
- Test drag/drop on actual touch devices
