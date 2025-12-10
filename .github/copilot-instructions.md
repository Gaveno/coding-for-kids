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
