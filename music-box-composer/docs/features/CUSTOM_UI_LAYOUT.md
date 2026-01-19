# Feature: Custom UI Layout (Widget Repositioning)

## Overview

Allow Studio Mode users to drag major UI components around the screen to create a personalized workspace layout. Layout preferences are saved locally (not in URL) and can be reset to defaults. Only available in Studio Mode to maintain simplicity for younger users.

**Target Version:** v10.0  
**Priority:** LOW  
**Complexity:** HIGH  
**Impact:** Low (nice-to-have for power users, doesn't affect core functionality)

---

## Motivation

**Problem:**
- Users have different screen sizes and working preferences
- Some prefer piano at top, some at bottom
- Timeline might be easier to see on left vs. right on ultrawide monitors
- Vertical vs. horizontal monitor orientations need different layouts

**Solution:**
- Let users arrange components however they want
- Save preferences locally (survives page refresh)
- Provide reset button to restore default layout

**Why not in Kid/Tween Mode?**
- Adds UI complexity that younger users don't need
- Risk of accidentally entering "edit mode" and breaking layout
- Kid/Tween users benefit from consistent, optimized layout

---

## Repositionable Components (Widgets)

### Core Widgets

| Widget | Description | Default Position |
|--------|-------------|------------------|
| **Piano Keyboard** | 🎹 Piano keys for note input | Bottom center |
| **Timeline** | Track rows with note grid | Center (main area) |
| **Controls** | Play, stop, speed, share buttons | Top right |
| **Key Selector** | Key signature dropdown | Top left |
| **Time Signature** | Time signature selector (v8) | Top left (below key) |
| **Pattern Library** | Saved patterns drawer (v5) | Right sidebar |
| **Track Mixer** | Volume/pan controls (future) | Bottom right |

**v10.0 Scope:** Piano, Timeline, Controls, Key Selector, Time Signature

### Widget Constraints

**Prevent chaos:**
- Widgets snap to invisible grid (prevents pixel-perfect overlap issues)
- Widgets can't overlap (push other widgets aside)
- Widgets have minimum sizes (can't shrink to unusable size)
- Widgets stay within viewport bounds (can't drag offscreen)

---

## Edit Mode

### Entering Edit Mode

**UI Element:**
```html
<button class="edit-layout-btn" title="Customize Layout">
  🔧 Edit Layout
</button>
```

**Location:** Top-right corner, next to settings/share buttons

**Visual Changes When Entering Edit Mode:**
1. **Drag handles appear** on each widget (grab icon in corner)
2. **Outline glow** around each widget
3. **Edit panel appears** with reset button
4. **Dimmed overlay** on non-edit controls (can't play songs while editing)

```css
.widget.edit-mode {
  outline: 2px dashed var(--primary-color);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
  cursor: move;
}

.widget-drag-handle {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 32px;
  height: 32px;
  background: var(--primary-color);
  border-radius: 4px;
  cursor: grab;
  display: none; /* Show only in edit mode */
}

.widget.edit-mode .widget-drag-handle {
  display: flex;
}
```

### Edit Panel

**Appears at top of screen:**
```
┌─────────────────────────────────────────┐
│  Edit Layout Mode                       │
│  Drag widgets to reposition them.      │
│  [Reset to Default]  [Done Editing]    │
└─────────────────────────────────────────┘
```

**Buttons:**
- **Reset to Default:** Restores factory layout
- **Done Editing:** Saves layout and exits edit mode

---

## Drag Behavior

### Drag Implementation

**Pointer Events:**
```javascript
class LayoutEditor {
  constructor(game) {
    this.game = game;
    this.widgets = [];
    this.draggedWidget = null;
    this.dragOffset = { x: 0, y: 0 };
  }
  
  enableEditMode() {
    this.widgets.forEach(widget => {
      widget.classList.add('edit-mode');
      
      const handle = widget.querySelector('.widget-drag-handle');
      handle.addEventListener('pointerdown', (e) => this.startDrag(e, widget));
    });
    
    document.addEventListener('pointermove', this.onDrag.bind(this));
    document.addEventListener('pointerup', this.endDrag.bind(this));
  }
  
  startDrag(e, widget) {
    this.draggedWidget = widget;
    
    const rect = widget.getBoundingClientRect();
    this.dragOffset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    
    widget.classList.add('dragging');
    widget.style.cursor = 'grabbing';
  }
  
  onDrag(e) {
    if (!this.draggedWidget) return;
    
    const x = e.clientX - this.dragOffset.x;
    const y = e.clientY - this.dragOffset.y;
    
    // Snap to grid (16px grid)
    const snappedX = Math.round(x / 16) * 16;
    const snappedY = Math.round(y / 16) * 16;
    
    // Keep within viewport bounds
    const maxX = window.innerWidth - this.draggedWidget.offsetWidth;
    const maxY = window.innerHeight - this.draggedWidget.offsetHeight;
    
    const finalX = Math.max(0, Math.min(snappedX, maxX));
    const finalY = Math.max(0, Math.min(snappedY, maxY));
    
    this.draggedWidget.style.left = `${finalX}px`;
    this.draggedWidget.style.top = `${finalY}px`;
  }
  
  endDrag() {
    if (this.draggedWidget) {
      this.draggedWidget.classList.remove('dragging');
      this.draggedWidget.style.cursor = 'move';
      this.saveLayout();
      this.draggedWidget = null;
    }
  }
}
```

### Collision Detection

**If widget overlaps another, push it aside:**
```javascript
checkCollisions() {
  this.widgets.forEach((widget, i) => {
    this.widgets.forEach((otherWidget, j) => {
      if (i === j) return;
      
      if (this.isOverlapping(widget, otherWidget)) {
        this.pushAside(widget, otherWidget);
      }
    });
  });
}

isOverlapping(a, b) {
  const rectA = a.getBoundingClientRect();
  const rectB = b.getBoundingClientRect();
  
  return !(rectA.right < rectB.left ||
           rectA.left > rectB.right ||
           rectA.bottom < rectB.top ||
           rectA.top > rectB.bottom);
}

pushAside(dragged, other) {
  // Move 'other' widget away from 'dragged'
  const rectA = dragged.getBoundingClientRect();
  const rectB = other.getBoundingClientRect();
  
  // Determine push direction (shortest distance)
  const pushLeft = rectA.left - rectB.right;
  const pushRight = rectB.left - rectA.right;
  const pushUp = rectA.top - rectB.bottom;
  const pushDown = rectB.top - rectA.bottom;
  
  const minPush = Math.min(
    Math.abs(pushLeft),
    Math.abs(pushRight),
    Math.abs(pushUp),
    Math.abs(pushDown)
  );
  
  if (minPush === Math.abs(pushLeft)) {
    other.style.left = `${rectA.left - other.offsetWidth}px`;
  } else if (minPush === Math.abs(pushRight)) {
    other.style.left = `${rectA.right}px`;
  } else if (minPush === Math.abs(pushUp)) {
    other.style.top = `${rectA.top - other.offsetHeight}px`;
  } else {
    other.style.top = `${rectA.bottom}px`;
  }
}
```

---

## Local Storage

### Saving Layout

**Data Structure:**
```javascript
const layoutData = {
  version: 1,
  widgets: [
    { id: 'piano', x: 100, y: 500, width: 600, height: 200 },
    { id: 'timeline', x: 50, y: 100, width: 700, height: 350 },
    { id: 'controls', x: 800, y: 20, width: 150, height: 80 },
    { id: 'key-selector', x: 20, y: 20, width: 200, height: 60 },
    { id: 'time-signature', x: 20, y: 90, width: 200, height: 60 }
  ]
};

localStorage.setItem('music-box-layout-v1', JSON.stringify(layoutData));
```

**Storage Key:** `music-box-layout-v1`  
**Storage Limit:** ~5KB (plenty for layout data)

### Loading Layout

**On page load:**
```javascript
loadLayout() {
  const saved = localStorage.getItem('music-box-layout-v1');
  if (!saved) {
    this.applyDefaultLayout();
    return;
  }
  
  try {
    const layoutData = JSON.parse(saved);
    this.applyLayout(layoutData);
  } catch (e) {
    console.error('Failed to load layout, using defaults', e);
    this.applyDefaultLayout();
  }
}

applyLayout(layoutData) {
  layoutData.widgets.forEach(widgetData => {
    const widget = document.getElementById(widgetData.id);
    if (!widget) return;
    
    widget.style.position = 'absolute';
    widget.style.left = `${widgetData.x}px`;
    widget.style.top = `${widgetData.y}px`;
    widget.style.width = `${widgetData.width}px`;
    widget.style.height = `${widgetData.height}px`;
  });
}

applyDefaultLayout() {
  // Factory default positions
  const defaults = {
    'piano': { x: 100, y: 500, width: 600, height: 200 },
    'timeline': { x: 50, y: 100, width: 700, height: 350 },
    'controls': { x: 800, y: 20, width: 150, height: 80 },
    'key-selector': { x: 20, y: 20, width: 200, height: 60 },
    'time-signature': { x: 20, y: 90, width: 200, height: 60 }
  };
  
  this.applyLayout({ widgets: Object.entries(defaults).map(([id, pos]) => ({ id, ...pos })) });
}
```

### Reset to Default

**Reset button clears localStorage and reloads:**
```javascript
resetLayout() {
  if (confirm('Reset layout to default? This cannot be undone.')) {
    localStorage.removeItem('music-box-layout-v1');
    this.applyDefaultLayout();
  }
}
```

---

## Responsive Behavior

### Layout Adaptation

**Problem:** Saved layout might not fit on smaller screens

**Solutions:**
1. **Detect screen size mismatch:** If saved layout exceeds viewport, scale down proportionally
2. **Responsive presets:** Offer "Mobile", "Tablet", "Desktop" layout presets
3. **Auto-reset on major size change:** If screen width changes by >30%, offer to reset layout

**Example: Scale Down on Small Screen**
```javascript
loadLayout() {
  const layoutData = JSON.parse(localStorage.getItem('music-box-layout-v1'));
  
  // Calculate bounding box of saved layout
  const maxX = Math.max(...layoutData.widgets.map(w => w.x + w.width));
  const maxY = Math.max(...layoutData.widgets.map(w => w.y + w.height));
  
  // If layout exceeds viewport, scale it down
  const scaleX = window.innerWidth / maxX;
  const scaleY = window.innerHeight / maxY;
  const scale = Math.min(scaleX, scaleY, 1.0); // Don't scale up
  
  if (scale < 1.0) {
    console.warn(`Scaling layout by ${scale}x to fit screen`);
    layoutData.widgets.forEach(w => {
      w.x *= scale;
      w.y *= scale;
      w.width *= scale;
      w.height *= scale;
    });
  }
  
  this.applyLayout(layoutData);
}
```

---

## Mobile Considerations

**Challenge:** Drag-and-drop on touch screens can be difficult with small widgets

**Solutions:**
1. **Larger drag handles on mobile** (48px vs. 32px on desktop)
2. **Long-press to enter drag mode** (prevents accidental drags)
3. **Simplified "preset layouts" instead of free-form drag** (optional)
4. **Warning:** "Custom layouts work best on desktop/tablet"

**Alternative: Preset Layouts for Mobile**
```
┌─────────────────────────────┐
│ Choose Layout:              │
│ ○ Piano Top                 │
│ ● Piano Bottom (default)    │
│ ○ Timeline Left             │
│ ○ Compact (all small)       │
└─────────────────────────────┘
```

---

## Technical Implementation

### Widget System

**Wrap each major component:**
```html
<div class="widget" id="piano" data-widget-id="piano">
  <div class="widget-drag-handle">⋮⋮</div>
  <div class="widget-content">
    <!-- Piano keyboard here -->
  </div>
</div>

<div class="widget" id="timeline" data-widget-id="timeline">
  <div class="widget-drag-handle">⋮⋮</div>
  <div class="widget-content">
    <!-- Track rows here -->
  </div>
</div>
```

**CSS:**
```css
.widget {
  position: absolute;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--widget-bg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.widget.edit-mode {
  outline: 2px dashed var(--primary-color);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
  z-index: 1000;
}

.widget-drag-handle {
  display: none; /* Hidden by default */
  position: absolute;
  top: 4px;
  right: 4px;
  width: 32px;
  height: 32px;
  background: var(--primary-color);
  color: white;
  border-radius: 4px;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: grab;
  user-select: none;
  touch-action: none;
}

.widget.edit-mode .widget-drag-handle {
  display: flex;
}

.widget.dragging {
  z-index: 1001;
  opacity: 0.8;
}
```

---

## Testing Checklist

**Functional Tests:**
- [ ] Edit layout button appears in Studio Mode only
- [ ] Drag handles appear when entering edit mode
- [ ] Widgets can be dragged to new positions
- [ ] Widgets snap to grid (16px)
- [ ] Widgets cannot overlap (push aside)
- [ ] Widgets stay within viewport bounds
- [ ] Layout saves to localStorage
- [ ] Layout loads on page refresh
- [ ] Reset button restores default layout
- [ ] Exiting edit mode removes drag handles

**Visual Tests:**
- [ ] Edit mode outline clearly visible
- [ ] Drag handles easy to see and click
- [ ] Dragging feels smooth (60fps)
- [ ] Edit panel doesn't block important UI

**Responsive Tests:**
- [ ] Layout scales down on small screens
- [ ] Drag handles larger on mobile (48px)
- [ ] Long-press drag works on touch devices
- [ ] Preset layouts work on mobile (if implemented)

**Edge Cases:**
- [ ] localStorage full (graceful fallback to default)
- [ ] Corrupt layout data (graceful fallback)
- [ ] Screen rotated while editing (layout adapts)
- [ ] Very small widgets still usable (min size enforced)
- [ ] Widgets pushed offscreen (prevented by bounds check)

---

## Future Enhancements

**Not included in v10.0:**

| Enhancement | Reason Deferred |
|-------------|----------------|
| Resize widgets | Complex, risk of making widgets unusable |
| Custom widget colors | Nice-to-have, low priority |
| Share custom layouts | Would require URL or cloud storage |
| Widget minimize/maximize | Adds complexity, unclear value |
| Multi-monitor support | Niche use case |
| Layout presets library | Low priority, users can save locally |

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Studio Mode users try edit mode | >20% click edit button |
| Custom layouts saved | >10% save non-default layout |
| Layout resets (user confusion) | <5% reset within 1 minute |
| Mobile drag success rate | >80% successful drags on touch devices |
| Performance | 60fps during drag operations |

---

## Related Features

- **Mode System (v4)** - Only available in Studio Mode
- **Additional Tracks (v9)** - Timeline widget grows with more tracks
- **Pattern Library (v5)** - Pattern drawer is repositionable widget
- **Track Selection (v7)** - Selected track glow works with custom layouts
