---
applyTo: "**/*.html"
---

# HTML Guidelines

## Semantic Structure

```html
<!-- ✅ DO: Use semantic elements -->
<main class="game-area">
    <section class="grid-section" aria-label="Game Grid">
        ...
    </section>
    <section class="controls" aria-label="Game Controls">
        ...
    </section>
</main>

<!-- ❌ DON'T: Divs for everything -->
<div class="game-area">
    <div class="grid">...</div>
</div>
```

## Accessibility (Critical for Pre-Literate Users)

```html
<!-- Provide screen reader support even without text -->
<button class="move-btn" aria-label="Move Up" data-command="up">
    <span aria-hidden="true">⬆️</span>
</button>
```

## Viewport Meta (Required)

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

## Home Button (Required in Every Game)

Every game must include a home link in the header:
```html
<a href="../index.html" class="home-btn" aria-label="Back to Home">🏠</a>
```

## No External Dependencies

```html
<!-- ❌ DON'T: CDN imports -->
<script src="https://cdn.example.com/library.js"></script>

<!-- ✅ DO: Local scripts only -->
<script type="module" src="js/main.js"></script>
```

## Design for Pre-Literate Children

- Use emojis and icons instead of text labels
- Large, visually distinct buttons
- Clear visual feedback for all interactions
- No text instructions - visual cues only
