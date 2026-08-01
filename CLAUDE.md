# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A suite of browser games teaching programming fundamentals to **pre-literate children**.
Static HTML/CSS/JS with **zero dependencies** — no npm, no build step, no CDN imports,
no `package.json`. `.nojekyll` at the root indicates it is published as a static site.

Two other instruction files already exist and remain authoritative for style detail:
- `AGENTS.md` — repo/folder conventions, gotchas
- `.github/copilot-instructions.md` + `.github/instructions/*.instructions.md` — per-language rules (JS, CSS, HTML, testing)

Read those before writing code. This file covers the things that only become visible
after reading several files at once.

## Running and testing

There is no build, no lint, and no CLI test runner.

```bash
npx serve .
```

**Always serve from the repo root and enter through `http://localhost:3000/`.** `serve.json`
sets `trailingSlash: true`; navigating straight to `/robot-path-painter` (no slash) breaks the
relative paths that every game uses for its CSS and ES modules. Reaching games via the home
page avoids this.

`python -m http.server 8000` also works. A plain `file://` open will fail for every game
except music-box-composer, because ES modules require an HTTP origin.

**Tests** are browser pages, one runner per game:

```
robot-path-painter/tests/index.html
block-builder/tests/index.html
magic-garden/tests/index.html
ant-leaf-trail/tests/index.html
robo-go-fish/tests/index.html
word-safari/tests/index.html
math-quest/tests/index.html
music-box-composer/tests/v9-serialization.test.html   (different shape — see below)
```

Each runner auto-runs on load and shows total/passed/failed. To run a single suite, comment
out the other entries in the runner's `testSuites` array, or open the browser console after
importing the one `*.test.js` module directly.

There is no shared test framework. Each `*.test.js` file:
- exports one `runXTests()` that returns `[{ name, passed, error }]`
- **redefines its own local `test()` and `assertEqual()` helpers at the bottom of the file**

That duplication is the existing convention — match it when adding a test file rather than
introducing a shared helper module, unless you're deliberately refactoring all of them.

`music-box-composer` predates this pattern: its single test page is self-contained HTML
covering song serialization only, and it has no `tests/index.html`.

## Architecture

### Per-game shape

```
game-name/
├── index.html      # all DOM up front; JS never builds the page skeleton, only fills it
├── styles/         # one file per component, all <link>ed from index.html in order
├── js/
│   ├── main.js     # 8 lines: on DOMContentLoaded, `new Game()`
│   ├── Game.js     # orchestrator — owns all other modules and all DOM refs
│   └── *.js        # pure-ish domain modules (Robot, Grid, Deck, Levels, Audio, …)
└── tests/          # unit tests for the domain modules only
```

`Game.js` is the only module that touches the DOM by id. It caches every element in a
single `this.elements = {...}` map in `initializeElements()`, then wires modules together
by passing **callbacks** (`onAddCommand`, `onReorder`, `onRemove`, …) rather than letting
modules reach back into the game. Domain modules (`Robot`, `Grid`, `Deck`, `Sequence`,
`Levels`) hold no DOM references, which is exactly why they're the testable ones.

Levels are plain data in `Levels.js` — grid size, start position, targets, obstacles.
Adding a level is a data edit, and the level tests assert bounds/validity over the data.

### Shared "visual programming language"

`shared/` holds the parts that must feel identical across games:

| File | Role |
|------|------|
| `shared/js/BaseSequence.js` | command list + loop blocks; index bookkeeping for `activeLoopIndex` across every move/remove operation |
| `shared/js/BaseDragDrop.js` | pointer-based drag, drop placeholders, trash zone, reordering |
| `shared/styles/sequence.css` | sequence items, loop blocks, drag states, trash zone |

Games extend these: `class Sequence extends BaseSequence`, `class DragDrop extends BaseDragDrop`.
Subclasses must implement `insertAt`, `insertIntoLoop`, `flatten` (sequence) and
`setupPaletteButtons`, `startDrag`, `handleDrop`, `getDragGhostContent` (drag-drop) — the base
throws for the sequence ones.

**Only `robot-path-painter`, `block-builder`, and `magic-garden` use `shared/`.** If you change
a base class, those three are the blast radius. `ant-leaf-trail` deliberately has its own
`Sequence.js` (per-block repeat counts and a single reusable function, rather than loop blocks);
`robo-go-fish`, `word-safari`, and `music-box-composer` have no command sequence at all.

### Known inconsistencies (don't "fix" these by accident)

- **`music-box-composer` does not use ES modules.** Its `index.html` loads ~15 classic
  `<script>` tags in dependency order and each file ends with `window.Track = Track;`.
  Adding a module there means adding a `<script>` tag in the right position, not an `import`.
- **`robot-path-painter` loads a single monolithic `styles.css`.** Its `styles/` directory
  exists but **nothing links it** — edits there have no effect. Change `styles.css`.
- **File-size limits are aspirational.** The rules say 200 lines/JS and 300 lines/CSS;
  `music-box-composer/js/Game.js` is ~4200 lines and `block-builder/js/Game.js` ~1140.
  Hold new code to the limit; don't take the big files as the pattern to copy.

### Persistence

No backend. State lives in `localStorage` under a versioned key
(`ant-leaf-trail-progress-v1`), wrapped in try/catch so private mode degrades to
"play without saving". `music-box-composer` additionally encodes whole songs into the URL
for sharing (`navigator.share` when available) — hence the serialization test page and the
`*_DATA_SIZE_ANALYSIS.md` docs.

## Non-negotiable product constraints

These come from the audience, not from taste:

- **No text.** Emojis and icons only. `aria-label` carries the meaning for screen readers.
- **Touch first.** `pointer*` events, never `mouse*` alone. `touchstart` handlers need
  `{ passive: false }` to allow `preventDefault()`. 44×44px minimum targets, 48px+ preferred.
- **Nothing snaps.** Movement between cells animates (300ms, `ease-out`, CSS `transform`),
  and the JS must `await` that duration before the next command.
- **Icon vocabulary is fixed across games:** 🔄 loop/reset, ▶️ play, 🗑️ trash, 💾 save-as-function,
  🏠 home (every game needs the home link back to `../index.html`).
- **Audio needs a user gesture** before it will play — same for `speechSynthesis` on iOS
  (`word-safari/js/Speech.js` speaks a silent utterance on first tap to unlock it).

## Adding a game

1. New `game-name/` folder following the shape above.
2. Register it in the root `index.html` games grid (`<a class="game-card available">` with an emoji icon).
3. Write the domain-module tests first, plus a `tests/index.html` copied from an existing game.
4. Reuse `shared/` for anything sequence- or drag-related before writing your own.

Commit messages follow `feat:` / `fix:` / `test:` / `refactor:` with a short scope.
