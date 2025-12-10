---
applyTo: "**/*.css"
---

# CSS Code Style

## CSS Custom Properties Required

```css
/* ✅ DO: Define variables in :root */
:root {
    --color-primary: #6C63FF;
    --color-success: #4ECDC4;
    --spacing-sm: 8px;
    --spacing-md: 16px;
    --radius-md: 16px;
    --transition-fast: 0.2s ease;
}

/* ✅ DO: Use variables throughout */
.button {
    background: var(--color-primary);
    padding: var(--spacing-md);
    border-radius: var(--radius-md);
    transition: transform var(--transition-fast);
}
```

## Mobile-First Responsive Design

```css
/* ✅ DO: Base styles for mobile, enhance for larger screens */
.grid {
    grid-template-columns: repeat(5, 1fr);
    gap: 4px;
}

@media (min-width: 768px) {
    .grid {
        gap: 8px;
    }
}

/* ✅ DO: Use relative units */
.button {
    font-size: 1.5rem;
    padding: 1em 1.5em;
}
```

## Animation Performance

```css
/* ✅ DO: Animate transform and opacity (GPU accelerated) */
.robot {
    transition: transform 0.3s ease;
}

/* ❌ DON'T: Animate layout properties */
.robot {
    transition: left 0.3s ease; /* Causes reflow */
}
```

## Touch-Friendly Styles (Critical)

```css
/* Prevent text selection during gameplay */
.game-area {
    -webkit-user-select: none;
    user-select: none;
    -webkit-touch-callout: none;
}

/* Prevent pull-to-refresh */
body {
    overscroll-behavior: none;
}

/* Disable tap highlight */
button, .interactive {
    -webkit-tap-highlight-color: transparent;
}

/* Large touch targets - minimum 44x44px, prefer 48x48px */
.game-button {
    min-width: 48px;
    min-height: 48px;
    padding: 12px;
}

/* Adequate spacing between targets */
.button-row {
    gap: 12px;
}
```

## File Limits

- **Maximum 300 lines** per CSS file
- Split by component: `variables.css`, `grid.css`, `controls.css`, `animations.css`
