# Copilot Instructions for Coding 4 Kids

## Project Overview

Educational game suite teaching programming concepts to **pre-literate children**. All games are visual, browser-based, and use **no external dependencies**.

---

## Core Principles

### 1. Mobile-First Development (TOP PRIORITY)
- **Touch is primary input** - All games must work on tablets and phones
- **Design for fingers** - Touch targets minimum 44x44px, prefer 48x48px+
- **Test on real devices** - Emulators miss touch issues
- **Responsive layouts** - Adapt to any screen size

### 2. Accessibility First
- **No text reliance** - Use emojis, icons, and visual cues
- **Large touch targets** - Minimum 44x44px
- **High contrast colors** - Ensure visibility

### 3. Child-Friendly Design
- **Immediate feedback** - Visual/audio response for every action
- **Safe to fail** - Mistakes are learning opportunities
- **Celebratory success** - Animations and sounds for achievements
- **Progressive difficulty** - Start simple, add complexity gradually

### 4. Smooth Animations (Required)
- **No instant snapping** - All movements between cells/positions must animate smoothly
- **Use CSS transitions** - Prefer `transform` with `transition` for GPU acceleration
- **Coordinate timing** - JS must `await` animation duration before next action
- **Standard duration** - Use 300ms (0.3s) for movement animations
- **Easing functions** - Use `ease-out` for natural deceleration

---

## Command Queue Standards

Games with command/sequence queues (robot-path-painter, block-builder, etc.) must implement these features:

### 1. Fixed Height with Scroll
- **Container height** - Use fixed height (e.g., 60px) with `overflow-y: auto`
- **Auto-scroll** - Scroll to show newest command when added
- **Smooth scroll** - Use `scrollIntoView({ behavior: 'smooth' })`

### 2. Drag-to-Reorder
- **Touch-friendly** - Use pointer events, not just mouse events
- **Drag threshold** - Require 15px movement before starting drag (prevents accidental drags)
- **Visual feedback** - Show drop placeholder where item will land
- **Reorder callback** - Implement `reorderCommand(fromIndex, toIndex)` in Game class

### 3. Zoom Prevention
- **HTML element** - Apply `touch-action: manipulation` to allow scroll but prevent zoom
- **Body element** - Apply `touch-action: none` to prevent all gestures on game area
- **Interactive elements** - Ensure buttons and controls remain responsive

### 4. Trash Zone
- **Always visible** - Show delete zone during drag operations
- **Visual states** - `.drag-active` (dragging started), `.drag-over` (item over trash)
- **Feedback** - Scale up and change color when item is over trash

### 5. Required CSS Classes
```css
.sequence-item.dragging { opacity: 0.3; }
.sequence-area.drag-active { border: 2px dashed; }
.drop-placeholder { width: 8px; background: success-color; }
.trash-zone.drag-active { opacity: 0.8; border: dashed; }
.trash-zone.drag-over { background: danger-color; transform: scale(1.1); }
```

---

## Key Constraints

| Constraint | Rule |
|------------|------|
| Dependencies | None - vanilla JS/CSS/HTML only |
| JS file size | Max 200 lines |
| CSS file size | Max 300 lines |
| Input | Touch-first, support mouse |
| Text | Emojis/icons only - no reading required |

---

## Mobile Testing Checklist

- [ ] Works on iOS Safari (iPhone & iPad)
- [ ] Works on Android Chrome
- [ ] Drag and drop works with touch
- [ ] No accidental zooming
- [ ] No scroll interference
- [ ] Portrait and landscape work
- [ ] Audio plays after user interaction

---

## Git Commit Messages

```
feat: add loop command block to robot painter
fix: robot animation jitters on mobile Safari
test: add unit tests for Grid boundary detection
refactor: extract AudioManager from Game class
```

---

## Related Instructions

- **Agent tasks**: See `AGENTS.md` in repo root
- **JavaScript**: `.github/instructions/javascript.instructions.md`
- **CSS**: `.github/instructions/css.instructions.md`
- **HTML**: `.github/instructions/html.instructions.md`
- **Testing**: `.github/instructions/testing.instructions.md`
