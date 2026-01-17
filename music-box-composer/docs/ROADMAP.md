# Music Box Composer - Feature Roadmap

## Overview

This roadmap outlines the next major features to evolve Music Box Composer from a simple sequencer into a comprehensive music creation tool with age-appropriate complexity tiers.

**Important:** This project serves novices of all ages (3-13+). Each new feature must be evaluated for whether it maintains focus on teaching programming concepts through music creation, rather than becoming a professional DAW. Features should remain accessible, visual, and fun.

---

## Current State (v3)

| Feature | Status |
|---------|--------|
| 3-track timeline (high piano, low piano, percussion) | ✅ Complete |
| Piano keyboard with 12 chromatic notes | ✅ Complete |
| Key signature selection (16 keys) | ✅ Complete |
| 64-beat song length | ✅ Complete |
| Note duration (1-8 beats) | ✅ Complete |
| URL serialization & QR code sharing | ✅ Complete |
| 4 playback speeds | ✅ Complete |
| Loop playback | ✅ Complete |

---

## Versioning Strategy

Each major feature release increments the major version number:

| Version | Feature | Status |
|---------|---------|--------|
| v3.0 | Current - Piano keyboard, key signatures, 64 beats | ✅ Complete |
| v4.0 | Multi-Mode Complexity System | 🔲 Not Started |
| v5.0 | Pattern Library & Loop Builder | 🔲 Not Started |
| v6.0 | Live Performance / Jam Mode | 🔲 Not Started |

### Backward Compatibility Requirements

**All existing URLs and QR codes must continue to work.**

1. **Never delete old deserializer methods** - Each `deserializeVX()` in `Game.js` is frozen once released
2. **Test old URLs** - Before releasing any new version, test v1, v2, v3 URLs still load correctly
3. **Version detection** - URL format `?c=vX_` enables automatic version detection
4. **Graceful defaults** - Missing data in old formats uses sensible defaults (e.g., mode defaults to Kid Mode)
5. **Migration strategy** - Old songs load into the most appropriate mode for their complexity

#### Version Migration Rules

| Old Version | New Features Added | Migration Behavior |
|-------------|-------------------|--------------------|
| v1, v2, v3 → v4 | Mode selection | Load as Kid Mode (simplest) |
| v4 → v5 | Pattern library | Load with empty pattern library |
| v5 → v6 | Jam mode | Load in sequencer mode (no jam features) |

**Testing Checklist for Each Release:**
- [ ] v1 URLs load with all default features
- [ ] v2 URLs load with correct durations
- [ ] v3 URLs load with correct key signatures
- [ ] New URLs include version prefix (e.g., `?c=v4_...`)
- [ ] QR codes generated from old URLs still scan and load

---

## Feature Roadmap

### 🎚️ Feature 1: Multi-Mode Complexity System (v4.0)
**Priority:** HIGH | **Complexity:** Medium | **Impact:** High

Three distinct experience modes that unlock features progressively:
- 🧸 **Kid Mode** (ages 3-6): Current experience, simplified
- 🎸 **Tween Mode** (ages 7-12): Intermediate features
- 🎛️ **Studio Mode** (ages 13+): Full DAW-lite experience

**Status:** 🔲 Not Started

**Design Doc:** [docs/features/MODE_SYSTEM.md](features/MODE_SYSTEM.md)

**Mobile Considerations:**
- Mode selector must be discoverable on small screens
- Touch-friendly mode switching (large tap targets)
- Test mode persistence across mobile browser sessions
- Ensure all modes work with touch-only input (no hover states required)

**URL Serialization:**
- Add 2 bits to header for mode selection (0=Kid, 1=Tween, 2=Studio)
- v3 URLs without mode bits default to Kid Mode
- Mode must persist in shared URLs and QR codes

---

### 🎼 Feature 2: Pattern Library & Loop Builder (v5.0)
**Priority:** HIGH | **Complexity:** High | **Impact:** High

Reusable pattern blocks that teach abstraction/functions:
- Save custom patterns as reusable blocks
- Pre-made pattern library
- Macro timeline for pattern arrangement

**Status:** 🔲 Not Started

**Design Doc:** [docs/features/PATTERN_LIBRARY.md](features/PATTERN_LIBRARY.md)

**Mobile Considerations:**
- Pattern drag-drop must work smoothly on touch devices
- Pattern library drawer should slide from bottom on mobile (not sidebar)
- Long-press to edit pattern (since hover not available)
- Test pattern creation workflow on tablets (primary target device)

**URL Serialization:**
- Patterns stored as compressed sequences (reuse existing note encoding)
- Pattern library as separate data section in URL
- May require URL length optimization for songs with many patterns
- Consider pattern ID system to reference pre-made patterns (smaller footprint)

---

### 🎤 Feature 3: Live Performance / Jam Mode (v6.0)
**Priority:** MEDIUM | **Complexity:** Medium | **Impact:** Medium

Real-time instrument and recording capabilities:
- Tap-to-play immediate sound
- Record mode with quantization
- Loop jam for layering
- Optional duet/multiplayer mode

**Status:** 🔲 Not Started

**Design Doc:** [docs/features/JAM_MODE.md](features/JAM_MODE.md)

**Mobile Considerations:**
- **Audio latency is CRITICAL** - Touch-to-sound delay must be <50ms
- Test extensively on iOS Safari and Android Chrome (different audio APIs)
- Multi-touch piano requires careful event handling (prevent scroll interference)
- Record button must be easily accessible during performance (thumbs-reach zone)
- Screen should not sleep during recording sessions

**URL Serialization:**
- Recorded performances serialize same as manual note placement
- Jam mode state (enabled/disabled) saved as 1 bit in header
- Performance metadata (tempo, quantization settings) may need additional bits

---

## Feature Branch Workflow

**All feature development must be done in feature branches, not on master.**

### Starting a New Feature

```bash
# 1. Ensure you're on master and up to date
git checkout master
git pull origin master

# 2. Create feature branch (use version number)
git checkout -b feature/v4-mode-system
# or
git checkout -b feature/v5-pattern-library

# 3. Work on feature, commit regularly
git add .
git commit -m "feat: add mode selector UI"

# 4. Push feature branch
git push origin feature/v4-mode-system

# 5. When complete, merge to master
git checkout master
git merge feature/v4-mode-system
git push origin master

# 6. Delete feature branch (optional)
git branch -d feature/v4-mode-system
```

### Branch Naming Convention

```
feature/v{version}-{short-description}
```

Examples:
- `feature/v4-mode-system`
- `feature/v5-pattern-library`
- `feature/v6-jam-mode`
- `feature/v4-mode-system-mobile-fix`

---

## Implementation Order

```
Phase 1: Mode System Foundation (v4.0)
    ├── Establish feature flagging infrastructure
    ├── Enable gating of future features by mode
    └── User Testing Checkpoint #1
    
Phase 2: Pattern Library (v5.0 - depends on Phase 1)
    ├── Use mode system to gate complexity
    ├── Kid Mode: pre-made patterns only
    ├── Tween/Studio: custom pattern creation
    └── User Testing Checkpoint #2
    
Phase 3: Jam Mode (v6.0 - depends on Phase 1)
    ├── Use mode system to gate features
    ├── Recording complexity varies by mode
    └── User Testing Checkpoint #3
```

---

## User Testing Checkpoints

### Checkpoint #1: Mode System (After v4.0)

**Test Group:**
- 5 children ages 3-6 (Kid Mode)
- 5 children ages 7-12 (Tween Mode)
- 3 teens ages 13-16 (Studio Mode)

**Test Procedure:**
1. **Discoverability Test** - Present app without instructions
   - Can users find mode selector?
   - Do they understand what modes do?
   - Time to first mode switch: Target <2 minutes

2. **Appropriateness Test** - Let users create songs in their mode
   - Kid Mode: Can 3-6 year olds complete a 4-beat song without frustration?
   - Tween Mode: Do 7-12 year olds use the intermediate features (loops, etc.)?
   - Studio Mode: Do teens find the full features useful?

3. **Mode Switching Test** - Ask users to try other modes
   - Does switching work without confusion?
   - Do users understand feature differences?
   - Do they have a preferred mode?

**Expected Behaviors:**
- ✅ Kids in Kid Mode complete simple songs independently
- ✅ Tweens explore Tween Mode features within 5 minutes
- ✅ Teens request additional Studio Mode features
- ✅ Mode selector is found within 2 minutes without help
- ✅ No crashes or broken features when switching modes

**Failure Criteria (triggers redesign):**
- ❌ >50% of users can't find mode selector
- ❌ Kids get frustrated in Kid Mode
- ❌ Tweens ignore Tween Mode features (too complex or not interesting)
- ❌ Mode switching causes confusion or errors

---

### Checkpoint #2: Pattern Library (After v5.0)

**Test Group:**
- 5 children ages 7-12 (primary target for patterns)
- 3 teens ages 13-16 (advanced pattern usage)

**Test Procedure:**
1. **Pattern Discovery Test** - No instructions given
   - Can users find pre-made patterns?
   - Time to first pattern use: Target <3 minutes
   - Do they understand drag-from-library concept?

2. **Pattern Creation Test** (Tween/Studio modes only)
   - Can users save their own patterns?
   - Do they understand pattern naming?
   - Can they reuse their saved patterns?

3. **Macro Timeline Test** - Multi-pattern songs
   - Can users arrange 3+ patterns into a song?
   - Do they understand pattern repetition?
   - Time to create 16-beat pattern-based song: Target <5 minutes

**Expected Behaviors:**
- ✅ Users find and use pre-made patterns within 3 minutes
- ✅ Tweens successfully save and reuse custom patterns
- ✅ Users create longer songs (>32 beats) with patterns
- ✅ Pattern drag-drop works smoothly on tablets
- ✅ Users understand patterns teach "functions" concept

**Failure Criteria:**
- ❌ Users don't discover pattern library
- ❌ Pattern creation workflow is confusing
- ❌ Drag-drop doesn't work reliably on touch devices
- ❌ Users revert to manual note placement instead of using patterns

---

### Checkpoint #3: Jam Mode (After v6.0)

**Test Group:**
- 8 children ages 5-12 (primary target for jam mode)
- 3 teens ages 13-16 (recording features)

**Test Procedure:**
1. **Tap-to-Play Test** - Let users discover live piano
   - Time to first sound: Target <30 seconds
   - Do they understand immediate playback?
   - Audio latency measurement: Target <50ms

2. **Recording Test** - Ask users to record a simple melody
   - Can they find record button?
   - Do they understand recording feedback (visual indicator)?
   - Success rate: Target >80% complete a 4-beat recording

3. **Quantization Test** (Tween/Studio only)
   - Play deliberately off-beat
   - Does quantization improve rhythm?
   - Do users understand the correction?

4. **Device-Specific Test** - Critical for jam mode
   - Test on iOS Safari (iPad, iPhone)
   - Test on Android Chrome (tablet, phone)
   - Measure audio latency on each platform

**Expected Behaviors:**
- ✅ Users discover tap-to-play within 30 seconds
- ✅ Audio latency feels immediate (<50ms perceived delay)
- ✅ Recording workflow is intuitive
- ✅ Multi-touch piano works on tablets
- ✅ No scroll interference during performance

**Failure Criteria:**
- ❌ Audio latency >100ms (feels laggy)
- ❌ Recording confuses users
- ❌ Touch gestures trigger unwanted browser behaviors (zoom, scroll)
- ❌ iOS Safari has significantly worse latency than Android

---

## Technical Dependencies

### Browser APIs

| Feature | Required API | Compatibility Risks |
|---------|-------------|--------------------|
| All features | Web Audio API | ✅ Universal support |
| Jam Mode | Low-latency audio | ⚠️ iOS Safari has higher latency (~40-80ms) |
| Pattern Library | IndexedDB (optional) | ✅ Universal support, URL fallback available |
| QR Sharing | Canvas API | ✅ Universal support |
| URL Sharing | Web Share API | ⚠️ Fallback to clipboard required |

### Performance Requirements

| Feature | Requirement | Risk Mitigation |
|---------|------------|----------------|
| Timeline rendering | 60fps with 64 beats | Use CSS transforms, minimize reflows |
| Pattern drag-drop | Smooth touch tracking | Use `requestAnimationFrame`, pointer events |
| Jam mode audio | <50ms touch-to-sound | Pre-load audio buffers, optimize synthesis |
| URL serialization | <500ms encode/decode | Optimize bit packing, use Web Workers if needed |

### Mobile Platform Issues

#### iOS Safari
- **Audio Context** requires user gesture to start (✅ already handled)
- **Audio latency** typically 40-80ms (higher than Android)
- **Touch events** may conflict with system gestures
- **Audio buffer size** cannot be adjusted (fixed at ~23ms)

**Mitigation:**
- Test audio latency on real iOS devices early
- Consider iOS-specific audio optimizations
- Use `touch-action: none` to prevent gesture conflicts

#### Android Chrome
- **Audio latency** typically 20-40ms (better than iOS)
- **Performance** varies widely by device
- **Touch events** generally more predictable

**Mitigation:**
- Test on low-end Android devices (3+ years old)
- Optimize for 2GB RAM devices
- Use passive touch listeners where possible

### External Dependencies

**Current (v3):** NONE ✅

**Future Considerations:**
- Pattern Library: May want IndexedDB for local pattern storage (optional)
- Jam Mode: May want AudioWorklet for lower latency (optional)
- All features: Must remain vanilla JS/CSS/HTML (NO npm packages)

---

## Future Ideas / Not Planned

These ideas have been considered but are **not on the current roadmap**. They may be revisited based on user feedback or after completing the planned features.

### Feature Ideas

| Idea | Why Not Now | Revisit When |
|------|-------------|-------------|
| **Collaborative editing** | Requires server infrastructure | After v6, if user demand exists |
| **Cloud save/accounts** | Adds complexity, goes against URL-only approach | If URL size becomes prohibitive |
| **MIDI export** | Limited audience (needs desktop DAW) | After v6, if teens request it |
| **Instrument packs** | Would increase audio file size significantly | After testing current sound set |
| **Tutorial system** | Must remain pre-literate (no text) | Consider visual tutorial in v7 |
| **Song gallery/sharing feed** | Requires moderation, server, accounts | Not aligned with privacy-first approach |
| **Note velocity/dynamics** | Adds complexity to UI and data model | After v6, if Studio Mode users request |
| **Audio effects (reverb, delay)** | Scope creep toward professional DAW | Only if teaching effect programming concepts |
| **Multiple instruments per track** | Complicates UI and data model | After pattern library proves useful |
| **Custom percussion sounds** | File upload adds security concerns | Maybe in Studio Mode if requested |

### Technical Improvements

| Idea | Why Not Now | Revisit When |
|------|-------------|-------------|
| **Service Worker caching** | Offline support is nice-to-have | After v6, for PWA consideration |
| **Compressed URL encoding** | Current URLs are already efficient | If Pattern Library causes size issues |
| **WebAssembly audio** | JS performance is sufficient | Only if latency issues on old devices |
| **Web Workers for serialization** | Serialization is fast enough (<500ms) | If Pattern Library makes it slow |

### Design Ideas

| Idea | Why Not Now | Revisit When |
|------|-------------|-------------|
| **Dark mode** | Nice-to-have, not educational | After v6, easy polish task |
| **Customizable themes** | Scope creep, adds preferences complexity | Not priority for learning tool |
| **Animated character conductor** | Already have character reactions | Consider if user testing shows confusion |
| **Visual music notation** | Requires music literacy (conflicts with pre-literate goal) | Maybe in Studio Mode for older users |

**Note:** This section should be reviewed after each user testing checkpoint. User feedback may elevate ideas from "Not Planned" to the roadmap.

---

## Success Metrics

### Technical Metrics

| Metric | Target |
|--------|--------|
| Mode switch works without page reload | ✅ Required |
| All existing v3 features work in Kid Mode | ✅ Required |
| URL serialization includes mode selection | ✅ Required |
| Mobile touch support for all new features | ✅ Required |
| Each JS file stays under 200 lines | ✅ Required |
| Pattern drag-drop 60fps on 5-year-old tablets | ✅ Required |
| Jam mode audio latency <100ms on iOS | ✅ Required |
| v1, v2, v3 URLs continue to load correctly | ✅ Required |

### User Experience Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Mode selector is discoverable | <2 min to find | User testing |
| Kids complete songs in Kid Mode | >80% success | User testing |
| Pattern library reduces frustration | Users create longer songs | Analytics / observation |
| Jam mode feels immediate | >80% positive feedback | User testing |
| Feature branch workflow followed | 100% of features | Code review |

---

## Document Maintenance

### Keeping This Roadmap Updated

1. **When starting a feature:** Update status from 🔲 to 🔨
2. **When completing a feature:** Update status from 🔨 to ✅
3. **When adding new features:** Add to roadmap with priority and link to design doc
4. **After each review:** Note the review date and any architectural changes

### Status Legend

| Icon | Meaning |
|------|---------|
| 🔲 | Not Started |
| 🔨 | In Progress |
| ⏸️ | Paused/Blocked |
| ✅ | Complete |

---

## Related Documents

- [V3 Implementation Tasks](../V3_IMPLEMENTATION_TASKS.md) - Previous version implementation
- [Design Document](../DESIGN.md) - Core architecture and data models
- Feature-specific docs in [docs/features/](features/)
