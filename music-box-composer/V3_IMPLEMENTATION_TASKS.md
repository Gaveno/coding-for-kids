# Music Box Composer v3 - Complete Implementation Task List

## Overview

This document provides a comprehensive, sequential task list for implementing all v3 features:
1. Piano keyboard with octave transposition
2. Musical key selection with visual key disabling
3. 64-beat maximum song length
4. v3 URL serialization format
5. Web Share API integration
6. QR code generation for long songs

**Total Estimated Time:** 25-36 hours

---

## ⚠️ Important: Checklist Management

**CRITICAL:** Task checklists in this document MUST be kept up-to-date throughout implementation.

### Rules:
1. **Mark items as complete** (`[x]`) as soon as they are done
2. **Do not skip ahead** - complete tasks in order within each phase
3. **Review checklist** - Each task has a final review item that must be explicitly confirmed
4. **Update estimates** - Note actual time taken vs. estimated time
5. **Document blockers** - Add notes if a task is blocked or taking longer than expected

### How to Use This Document:
- Work through phases sequentially (1→2→3...→9)
- Within each phase, complete tasks in order
- Check off each sub-item as you complete it
- **Do not mark a task complete until the review item is checked**
- Update this document in git commits as you progress

### Review Process:
Every task ends with a review checklist item:
- [ ] **REVIEW: Task complete, all acceptance criteria met, ready for next task**

This item must be explicitly checked before moving to the next task.

---

## Phase 1: Piano Keyboard System (6-8 hours)

### Task 1.1: Create PianoKeyboard.js Module
**Estimated Time:** 2-3 hours

- [x] Create `js/PianoKeyboard.js` file
- [x] Define piano note constants:
  ```javascript
  const PIANO_NOTES = ['', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const PIANO_ICONS = {
      'C': '🔴', 'C#': '🟠', 'D': '🟡', 'D#': '🟢',
      'E': '🔵', 'F': '🟣', 'F#': '🟤', 'G': '⚪',
      'G#': '🟥', 'A': '🟧', 'A#': '🟨', 'B': '🟩'
  };
  ```
- [x] Implement `PianoKeyboard` class:
  - [x] `constructor(containerElement)` - Initialize keyboard
  - [x] `render()` - Create DOM elements for 12 chromatic keys
  - [x] `getNoteData(noteIndex)` - Return {note, icon, octave: null}
  - [x] `updateDisabledKeys(allowedNoteIndices)` - Enable/disable keys
  - [x] `setDragStartHandler(callback)` - Hook for drag operations
- [x] Add keyboard layout logic:
  - [x] White keys: 7 keys (C, D, E, F, G, A, B)
  - [x] Black keys: 5 keys (C#, D#, F#, G#, A#) positioned between white keys
- [x] Add CSS classes for styling hooks:
  - [x] `.piano-key`, `.white-key`, `.black-key`
  - [x] `.enabled`, `.disabled`
  - [x] `.dragging`

**Acceptance Criteria:**
- Piano keyboard renders with 12 chromatic notes
- Visual layout mimics real piano (white and black keys)
- Keys can be enabled/disabled programmatically
- Module exports clean API for Game.js integration

**Review:**
- [x] **REVIEW: Task 1.1 complete, all acceptance criteria met, ready for next task**

---

### Task 1.2: Update Audio.js for Octave Transposition
**Estimated Time:** 1-2 hours

- [x] Open `js/Audio.js`
- [x] Update `playNote(note, trackNumber, duration)` signature
- [x] Implement octave transposition logic:
  ```javascript
  getOctaveForTrack(trackNumber) {
      if (trackNumber === 1) return 5; // High piano
      if (trackNumber === 2) return 3; // Low piano
      return null; // Percussion (no octave)
  }
  ```
- [x] Update frequency calculation:
  ```javascript
  const fullNote = octave ? `${note}${octave}` : note;
  const frequency = this.noteToFrequency(fullNote);
  ```
- [x] Test audio playback for both tracks to verify octave difference

**Acceptance Criteria:**
- Track 1 plays notes in octave 5 (high)
- Track 2 plays notes in octave 3 (low)
- Same note sounds different on different tracks
- Percussion track unaffected

**Review:**
- [x] **REVIEW: Task 1.2 complete, all acceptance criteria met, ready for next task**

---

### Task 1.3: Update Track.js Data Model
**Estimated Time:** 1 hour

- [x] Open `js/Track.js`
- [x] Update note data structure to include `octave` field:
  ```javascript
  {
      note: string,      // e.g., 'C', 'D#'
      icon: string,      // e.g., '🔴', '🟡'
      duration: number,  // 1-8
      octave: number     // 3, 5, or null
  }
  ```
- [x] Update `setNote(beat, noteData)` to accept octave
- [x] Update `serialize()` to output note indices (0-12) instead of note names
- [x] Update `deserialize()` to rebuild note objects from indices

**Acceptance Criteria:**
- Notes store octave information
- Serialization uses compact note indices
- Deserialization reconstructs full note objects

**Review:**
- [x] **REVIEW: Task 1.3 complete, all acceptance criteria met, ready for next task**

---

### Task 1.4: Update DragDrop.js for Piano Keys
**Estimated Time:** 1-2 hours

- [x] Open `js/DragDrop.js`
- [x] Update `initializePalette()` to work with PianoKeyboard component
- [x] Add check: Don't allow drag if piano key is disabled
- [x] Update `handleDrop()` to determine octave based on target track:
  ```javascript
  const octave = trackNumber === 3 ? null : (trackNumber === 1 ? 5 : 3);
  ```
- [x] Update visual feedback for disabled keys (cursor: not-allowed)
- [x] Ensure percussion notes still work (no octave)

**Acceptance Criteria:**
- Can't drag disabled piano keys
- Dropping on Track 1 sets octave=5
- Dropping on Track 2 sets octave=3
- Percussion notes work as before

**Review:**
- [x] **REVIEW: Task 1.4 complete, all acceptance criteria met, ready for next task**

---

### Task 1.5: Update HTML and CSS for Piano Keyboard
**Estimated Time:** 1-2 hours

- [x] Open `index.html`
- [x] Replace melody/bass note sections with piano keyboard container:
  ```html
  <div id="piano-keyboard-container" class="piano-keyboard"></div>
  ```
- [x] Create `styles/piano.css` (or add to existing CSS)
- [x] Style white piano keys:
  - [x] Width: 48px, Height: 120px
  - [x] White background, black border
  - [x] Display inline-block
- [x] Style black piano keys:
  - [x] Width: 32px, Height: 80px
  - [x] Black background, white text
  - [x] Position: absolute, offset between white keys
  - [x] Z-index above white keys
- [x] Style disabled state:
  - [x] Opacity: 0.5
  - [x] Filter: grayscale(100%)
  - [x] Cursor: not-allowed
  - [x] Pointer-events: none
- [x] Add responsive breakpoints for mobile
- [ ] Test on mobile devices (touch targets must be 44px+ minimum)

**Acceptance Criteria:**
- Piano keyboard looks like a real piano
- Visual distinction between white and black keys
- Disabled keys are clearly grayed out
- Works on mobile (touch-friendly)

**Review:**
- [ ] **REVIEW: Task 1.5 complete, Phase 1 complete, all acceptance criteria met, ready for Phase 2**

---

## Phase 2: Key Selection (4-6 hours)

### Task 2.1: Add Key Signature Constants
**Estimated Time:** 1 hour

- [ ] Open `js/Game.js`
- [ ] Add key signature lookup table:
  ```javascript
  static KEY_SIGNATURES = {
      'C Major':  [1, 3, 5, 6, 8, 10, 12],     // C D E F G A B
      'G Major':  [1, 3, 5, 7, 8, 10, 12],     // G A B C D E F#
      'D Major':  [1, 2, 3, 5, 7, 9, 10, 12],  // D E F# G A B C#
      'A Major':  [1, 2, 4, 6, 7, 9, 11],      // A B C# D E F# G#
      'E Major':  [1, 2, 4, 6, 8, 9, 11],      // E F# G# A B C# D#
      'B Major':  [1, 2, 4, 5, 7, 9, 11],      // B C# D# E F# G# A#
      'F Major':  [1, 3, 5, 6, 8, 10, 11],     // F G A Bb C D E
      'Bb Major': [1, 3, 4, 6, 8, 10, 11],     // Bb C D Eb F G A
      'Eb Major': [1, 3, 4, 6, 8, 9, 11],      // Eb F G Ab Bb C D
      'A Minor':  [1, 3, 4, 6, 8, 9, 11],      // A B C D E F G
      'E Minor':  [1, 3, 5, 6, 8, 10, 11],     // E F# G A B C D
      'B Minor':  [1, 2, 4, 6, 7, 9, 11],      // B C# D E F# G A
      'D Minor':  [1, 3, 4, 6, 8, 9, 10],      // D E F G A Bb C
      'G Minor':  [1, 3, 4, 5, 7, 9, 10],      // G A Bb C D Eb F
      'C Minor':  [1, 3, 4, 6, 7, 9, 10],      // C D Eb F G Ab Bb
      'Freeform': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]  // All notes
  };
  ```
- [ ] Add key names array for dropdown population:
  ```javascript
  static KEY_NAMES = Object.keys(Game.KEY_SIGNATURES);
  ```
- [ ] Verify each key signature has correct note indices

**Acceptance Criteria:**
- All 16 key signatures defined correctly
- Indices map to PIANO_NOTES array (1-12, 0=empty)
- Each key has proper musical theory notes

**Review:**
- [ ] **REVIEW: Task 2.1 complete, all acceptance criteria met, ready for next task**

---

### Task 2.2: Implement Key Selection Logic
**Estimated Time:** 1-2 hours

- [ ] In `js/Game.js`, add state variable:
  ```javascript
  this.currentKey = 'C Major'; // Default
  ```
- [ ] Implement `setKey(keyName)` method:
  ```javascript
  setKey(keyName) {
      this.currentKey = keyName;
      const allowedNotes = Game.KEY_SIGNATURES[keyName];
      this.pianoKeyboard.updateDisabledKeys(allowedNotes);
      this.updateURL();
  }
  ```
- [ ] Implement `getKeyIndex()` helper for serialization:
  ```javascript
  getKeyIndex() {
      return Game.KEY_NAMES.indexOf(this.currentKey);
  }
  ```
- [ ] Implement `getKeyNameFromIndex(index)` for deserialization

**Acceptance Criteria:**
- Changing key updates piano keyboard visual state
- Current key is tracked in game state
- Key can be converted to/from index for URL serialization

**Review:**
- [ ] **REVIEW: Task 2.2 complete, all acceptance criteria met, ready for next task**

---

### Task 2.3: Add Key Selector UI
**Estimated Time:** 1 hour

- [ ] Open `index.html`
- [ ] Add key selector dropdown in controls section:
  ```html
  <div class="key-selector">
      <label for="key-select">Key:</label>
      <select id="key-select">
          <!-- Options populated by JS -->
      </select>
  </div>
  ```
- [ ] In `js/main.js` or `js/Game.js`, populate dropdown on load:
  ```javascript
  const select = document.getElementById('key-select');
  Game.KEY_NAMES.forEach(keyName => {
      const option = document.createElement('option');
      option.value = keyName;
      option.textContent = keyName;
      select.appendChild(option);
  });
  ```
- [ ] Add change event listener:
  ```javascript
  select.addEventListener('change', (e) => {
      game.setKey(e.target.value);
  });
  ```
- [ ] Set default to "C Major"

**Acceptance Criteria:**
- Dropdown appears in controls area
- All 16 keys listed
- Selecting a key updates piano keyboard immediately
- Default is C Major on page load

**Review:**
- [ ] **REVIEW: Task 2.3 complete, all acceptance criteria met, ready for next task**

---

### Task 2.4: Style Key Selector
**Estimated Time:** 30 minutes

- [ ] Open `styles/controls.css` (or relevant CSS file)
- [ ] Style `.key-selector` container:
  - [ ] Display inline-block or flex
  - [ ] Margin/padding for spacing
- [ ] Style `#key-select` dropdown:
  - [ ] Font size: 16px (prevents zoom on mobile)
  - [ ] Padding: 8px
  - [ ] Min-width: 120px
  - [ ] Border-radius: 4px
  - [ ] Touch-friendly size (44px height minimum)
- [ ] Add responsive styling for mobile
- [ ] Test appearance on multiple screen sizes

**Acceptance Criteria:**
- Key selector looks cohesive with other controls
- Touch-friendly on mobile (no accidental zoom)
- Readable text

**Review:**
- [ ] **REVIEW: Task 2.4 complete, all acceptance criteria met, ready for next task**

---

### Task 2.5: Test All Key Signatures
**Estimated Time:** 1 hour

- [ ] Manually test each key signature:
  - [ ] Select key from dropdown
  - [ ] Verify correct piano keys are enabled/disabled
  - [ ] Visually confirm grayed-out keys match musical theory
  - [ ] Try dragging disabled keys (should not work)
  - [ ] Try dragging enabled keys (should work)
- [ ] Create test songs in different keys
- [ ] Verify audio sounds harmonious (notes in key should sound good together)
- [ ] Document any issues

**Acceptance Criteria:**
- All 16 keys work correctly
- Visual feedback matches enabled state
- Drag behavior respects key selection

**Review:**
- [ ] **REVIEW: Task 2.5 complete, Phase 2 complete, all acceptance criteria met, ready for Phase 3**

---

## Phase 3: 64-Beat Support (2-3 hours)

### Task 3.1: Update Length Constants
**Estimated Time:** 30 minutes

- [ ] Open `js/Game.js`
- [ ] Update max length constant:
  ```javascript
  static MAX_BEATS = 64; // Was 32
  ```
- [ ] Update length options:
  ```javascript
  static LENGTH_OPTIONS = [16, 32, 48, 64]; // Was [8, 16, 24, 32]
  ```
- [ ] Update default length if needed:
  ```javascript
  this.songLength = 32; // Still reasonable default
  ```

**Acceptance Criteria:**
- Constants updated
- Game can handle up to 64 beats

**Review:**
- [ ] **REVIEW: Task 3.1 complete, all acceptance criteria met, ready for next task**

---

### Task 3.2: Update Timeline.js Rendering
**Estimated Time:** 1 hour

- [ ] Open `js/Timeline.js`
- [ ] Ensure rendering handles 64 beats efficiently
- [ ] Add horizontal scroll if needed:
  ```css
  .timeline-container {
      overflow-x: auto;
      overflow-y: visible;
  }
  ```
- [ ] Update beat counter display:
  ```javascript
  updateBeatCounter(currentBeat, totalBeats) {
      counterElement.textContent = `${currentBeat}/${totalBeats}`;
  }
  ```
- [ ] Test smooth scrolling on mobile
- [ ] Consider auto-scroll during playback to keep current beat visible

**Acceptance Criteria:**
- Timeline can display 64 beats
- Scrolling is smooth and intuitive
- Beat counter shows current position
- Mobile scrolling works properly

**Review:**
- [ ] **REVIEW: Task 3.2 complete, all acceptance criteria met, ready for next task**

---

### Task 3.3: Update Timeline CSS for Long Songs
**Estimated Time:** 1 hour

- [ ] Open `styles/timeline.css` or relevant CSS file
- [ ] Ensure timeline container has proper overflow handling
- [ ] Update cell sizing for better mobile UX:
  - [ ] Desktop: Show 16-24 beats at once
  - [ ] Tablet: Show 12-16 beats at once
  - [ ] Mobile: Show 8-12 beats at once
- [ ] Add smooth scrolling:
  ```css
  .timeline-container {
      scroll-behavior: smooth;
  }
  ```
- [ ] Test responsive breakpoints
- [ ] Ensure drag-and-drop still works when scrolled

**Acceptance Criteria:**
- Timeline looks good at all song lengths (16-64 beats)
- Responsive on all devices
- Scrolling feels natural
- No layout breaking on long songs

**Review:**
- [ ] **REVIEW: Task 3.3 complete, all acceptance criteria met, ready for next task**

---

### Task 3.4: Update Length Selector UI
**Estimated Time:** 30 minutes

- [ ] Open `index.html`
- [ ] Update length selector options:
  ```html
  <select id="length-select">
      <option value="16">16 beats</option>
      <option value="32" selected>32 beats</option>
      <option value="48">48 beats</option>
      <option value="64">64 beats</option>
  </select>
  ```
- [ ] Verify change handler in Game.js works with new lengths
- [ ] Test changing length with existing notes (should preserve or clear gracefully)

**Acceptance Criteria:**
- Length selector shows 16, 32, 48, 64 options
- Selecting a length updates the timeline
- Existing notes handled properly when length changes

**Review:**
- [ ] **REVIEW: Task 3.4 complete, Phase 3 complete, all acceptance criteria met, ready for Phase 4**

---

## Phase 4: v3 URL Serialization (4-5 hours)

### Task 4.1: Update Version Number
**Estimated Time:** 5 minutes

- [ ] Open `js/Game.js`
- [ ] Update encoding version:
  ```javascript
  static ENCODING_VERSION = 3; // Was 2
  ```

**Acceptance Criteria:**
- Version constant updated

**Review:**
- [ ] **REVIEW: Task 4.1 complete, all acceptance criteria met, ready for next task**

---

### Task 4.2: Implement serializeV3()
**Estimated Time:** 2-3 hours

- [ ] In `js/Game.js`, create new `serializeV3()` method
- [ ] Implement header serialization (9 bits):
  ```javascript
  serializeV3() {
      let bits = '';
      
      // Speed (2 bits)
      const speedIndex = this.speeds.indexOf(this.currentSpeed);
      bits += speedIndex.toString(2).padStart(2, '0');
      
      // Loop (1 bit)
      bits += this.loopEnabled ? '1' : '0';
      
      // Length (2 bits)
      const lengthIndex = Game.LENGTH_OPTIONS.indexOf(this.songLength);
      bits += lengthIndex.toString(2).padStart(2, '0');
      
      // Key (4 bits)
      const keyIndex = this.getKeyIndex();
      bits += keyIndex.toString(2).padStart(4, '0');
      
      // ... per-beat data
  }
  ```
- [ ] Implement per-beat serialization (17 bits per beat):
  ```javascript
  for (let beat = 0; beat < this.songLength; beat++) {
      // Piano track 1: note index (4 bits) + duration (3 bits)
      const note1 = this.tracks[0].getNoteAtBeat(beat);
      const note1Index = note1 ? PIANO_NOTES.indexOf(note1.note) : 0;
      const duration1 = note1 ? note1.duration : 1;
      bits += note1Index.toString(2).padStart(4, '0');
      bits += (duration1 - 1).toString(2).padStart(3, '0');
      
      // Piano track 2: note index (4 bits) + duration (3 bits)
      const note2 = this.tracks[1].getNoteAtBeat(beat);
      const note2Index = note2 ? PIANO_NOTES.indexOf(note2.note) : 0;
      const duration2 = note2 ? note2.duration : 1;
      bits += note2Index.toString(2).padStart(4, '0');
      bits += (duration2 - 1).toString(2).padStart(3, '0');
      
      // Percussion: note index (3 bits)
      const note3 = this.tracks[2].getNoteAtBeat(beat);
      const note3Index = note3 ? PERC_NOTES.indexOf(note3.note) : 0;
      bits += note3Index.toString(2).padStart(3, '0');
  }
  ```
- [ ] Convert bits to bytes and base64:
  ```javascript
  const bytes = [];
  for (let i = 0; i < bits.length; i += 8) {
      const byte = bits.slice(i, i + 8).padEnd(8, '0');
      bytes.push(parseInt(byte, 2));
  }
  const base64 = btoa(String.fromCharCode(...bytes))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  return `v${Game.ENCODING_VERSION}_${base64}`;
  ```
- [ ] Update `updateURL()` to use `serializeV3()`

**Acceptance Criteria:**
- Serialization creates compact binary format
- Header is exactly 9 bits
- Each beat is exactly 17 bits
- Output includes v3 version prefix
- URL is base64-encoded

**Review:**
- [ ] **REVIEW: Task 4.2 complete, all acceptance criteria met, ready for next task**

---

### Task 4.3: Implement deserializeV3()
**Estimated Time:** 2 hours

- [ ] In `js/Game.js`, create `deserializeV3(bits)` method
- [ ] Parse header (9 bits):
  ```javascript
  deserializeV3(bits) {
      let offset = 0;
      
      // Speed (2 bits)
      const speedIndex = parseInt(bits.slice(offset, offset + 2), 2);
      this.currentSpeed = this.speeds[speedIndex];
      offset += 2;
      
      // Loop (1 bit)
      this.loopEnabled = bits[offset] === '1';
      offset += 1;
      
      // Length (2 bits)
      const lengthIndex = parseInt(bits.slice(offset, offset + 2), 2);
      this.songLength = Game.LENGTH_OPTIONS[lengthIndex];
      offset += 2;
      
      // Key (4 bits)
      const keyIndex = parseInt(bits.slice(offset, offset + 4), 2);
      this.currentKey = Game.KEY_NAMES[keyIndex];
      offset += 4;
      
      // ... per-beat data
  }
  ```
- [ ] Parse per-beat data (17 bits per beat):
  ```javascript
  for (let beat = 0; beat < this.songLength; beat++) {
      // Piano track 1
      const note1Index = parseInt(bits.slice(offset, offset + 4), 2);
      offset += 4;
      const duration1 = parseInt(bits.slice(offset, offset + 3), 2) + 1;
      offset += 3;
      
      if (note1Index > 0) {
          const noteData = {
              note: PIANO_NOTES[note1Index],
              icon: PIANO_ICONS[PIANO_NOTES[note1Index]],
              duration: duration1,
              octave: 5
          };
          this.tracks[0].setNote(beat, noteData);
      }
      
      // Similar for track 2 and percussion...
  }
  ```
- [ ] Handle edge cases (corrupted URLs, invalid indices)

**Acceptance Criteria:**
- Correctly parses v3 format URLs
- Restores all game state (speed, loop, length, key, notes)
- Handles invalid data gracefully
- Sets octaves correctly (track 1=5, track 2=3)

**Review:**
- [ ] **REVIEW: Task 4.3 complete, all acceptance criteria met, ready for next task**

---

### Task 4.4: Update deserializeState() Dispatcher
**Estimated Time:** 30 minutes

- [ ] In `js/Game.js`, update `deserializeState(encodedData)` method
- [ ] Add version detection and dispatching:
  ```javascript
  deserializeState(encodedData) {
      let version = 1; // Default
      let data = encodedData;
      
      // Check for version prefix
      if (encodedData.startsWith('v2_')) {
          version = 2;
          data = encodedData.slice(3);
      } else if (encodedData.startsWith('v3_')) {
          version = 3;
          data = encodedData.slice(3);
      }
      
      // Convert base64 to bits
      const bits = this.base64ToBits(data);
      
      // Dispatch to appropriate deserializer
      if (version === 1) {
          return this.deserializeV1(bits);
      } else if (version === 2) {
          return this.deserializeV2(bits);
      } else if (version === 3) {
          return this.deserializeV3(bits);
      }
  }
  ```
- [ ] **NEVER delete `deserializeV1()` or `deserializeV2()` methods**

**Acceptance Criteria:**
- Version detection works correctly
- Dispatches to correct deserializer
- Old methods remain intact for backwards compatibility

**Review:**
- [ ] **REVIEW: Task 4.4 complete, all acceptance criteria met, ready for next task**

---

### Task 4.5: Test Backwards Compatibility
**Estimated Time:** 1 hour

- [ ] Create test URLs for v1 format (unversioned)
- [ ] Create test URLs for v2 format (`v2_...`)
- [ ] Test loading each format:
  - [ ] v1 URL loads with defaults (C Major key, octaves assigned)
  - [ ] v2 URL loads with converted notes (melody→track1, bass→track2)
  - [ ] v3 URL loads natively
- [ ] Verify no errors in console
- [ ] Verify songs play correctly after loading
- [ ] Test edge cases (empty songs, maximum songs, corrupted data)

**Acceptance Criteria:**
- All three URL formats load successfully
- Older formats gracefully upgrade to v3
- No loss of data during migration
- UI updates correctly after loading

**Review:**
- [ ] **REVIEW: Task 4.5 complete, Phase 4 complete, all acceptance criteria met, ready for Phase 5**

---

## Phase 5: Web Share API (1-2 hours)

### Task 5.1: Implement Web Share API
**Estimated Time:** 30 minutes

- [ ] In `js/Game.js`, add `shareURL()` method:
  ```javascript
  async shareURL() {
      if (navigator.share) {
          try {
              await navigator.share({
                  title: 'Music Box Composer',
                  text: 'Check out my song!',
                  url: window.location.href
              });
          } catch (err) {
              if (err.name !== 'AbortError') {
                  console.error('Share failed:', err);
                  this.fallbackCopyURL();
              }
          }
      } else {
          this.fallbackCopyURL();
      }
  }
  
  fallbackCopyURL() {
      navigator.clipboard.writeText(window.location.href);
      // Show "Copied!" message
  }
  ```

**Acceptance Criteria:**
- Uses Web Share API if available
- Falls back to copy-to-clipboard if not
- Handles user cancellation gracefully
- Works on mobile and desktop

**Review:**
- [ ] **REVIEW: Task 5.1 complete, all acceptance criteria met, ready for next task**

---

### Task 5.2: Add Share Button UI
**Estimated Time:** 30 minutes

- [ ] Open `index.html`
- [ ] Add share button to controls:
  ```html
  <button id="share-btn" class="control-btn" title="Share Song">
      💾 Share
  </button>
  ```
- [ ] In `js/main.js`, attach click handler:
  ```javascript
  document.getElementById('share-btn').addEventListener('click', () => {
      game.shareURL();
  });
  ```
- [ ] Add success message element:
  ```html
  <div id="share-message" class="message hidden">Copied to clipboard!</div>
  ```
- [ ] Show/hide message on successful copy

**Acceptance Criteria:**
- Share button appears in controls
- Click triggers share or copy
- User feedback for successful copy
- Touch-friendly on mobile

**Review:**
- [ ] **REVIEW: Task 5.2 complete, all acceptance criteria met, ready for next task**

---

### Task 5.3: Test Web Share API
**Estimated Time:** 30 minutes

- [ ] Test on desktop browser (should fallback to copy)
- [ ] Test on mobile Safari (iOS) - should show native share sheet
- [ ] Test on mobile Chrome (Android) - should show native share sheet
- [ ] Test sharing to different apps (Messages, WhatsApp, etc.)
- [ ] Verify URLs work when received and opened
- [ ] Test with songs of different lengths

**Acceptance Criteria:**
- Works on all tested devices
- Native share sheet appears on mobile
- Shared URLs are valid and load correctly
- Graceful fallback on unsupported browsers

**Review:**
- [ ] **REVIEW: Task 5.3 complete, Phase 5 complete, all acceptance criteria met, ready for Phase 6**

---

## Phase 6: QR Code Generation (4-6 hours)

### Task 6.1: Implement QR Code Encoder
**Estimated Time:** 3-4 hours

- [ ] Create `js/QRCode.js` file
- [ ] Implement QR code encoding algorithm (or use inline version of qrcode library)
- [ ] Key features needed:
  - [ ] Encode URL string to QR code
  - [ ] Support Version 4 or 5 QR codes (up to 272-370 chars)
  - [ ] Error correction level: Medium
  - [ ] Output as 2D array or canvas
- [ ] Implement rendering to canvas:
  ```javascript
  class QRCodeGenerator {
      static generate(text, size = 256) {
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          
          // ... QR encoding logic ...
          
          return canvas;
      }
  }
  ```
- [ ] **NOTE**: This is the most complex task - consider using a minimal inline QR library if available
  - [ ] Option 1: Copy qrcodegen.js from Nayuki's repo (minimal, no dependencies)
  - [ ] Option 2: Implement basic QR encoder from scratch
  - [ ] **Ensure NO external CDN dependencies - must be inline code**

**Acceptance Criteria:**
- Generates valid QR codes from URLs
- Handles URLs up to 272+ characters
- Renders as canvas element
- No external dependencies
- Scannable by phone cameras

**Review:**
- [ ] **REVIEW: Task 6.1 complete, all acceptance criteria met, ready for next task**

---

### Task 6.2: Add QR Code UI Modal
**Estimated Time:** 1 hour

- [ ] Open `index.html`
- [ ] Add QR code modal overlay:
  ```html
  <div id="qr-modal" class="modal hidden">
      <div class="modal-content">
          <h2>Share QR Code</h2>
          <canvas id="qr-canvas"></canvas>
          <p>Scan with camera or save image</p>
          <div class="modal-buttons">
              <button id="download-qr-btn">Download Image</button>
              <button id="close-qr-btn">Close</button>
          </div>
      </div>
  </div>
  ```
- [ ] Add "Share QR Code" button to controls (conditionally shown)
- [ ] Implement modal open/close logic
- [ ] Style modal for mobile and desktop

**Acceptance Criteria:**
- Modal appears when QR button clicked
- QR code is clearly visible
- Download button works
- Close button works
- Responsive on mobile

**Review:**
- [ ] **REVIEW: Task 6.2 complete, all acceptance criteria met, ready for next task**

---

### Task 6.3: Implement QR Generation Logic
**Estimated Time:** 1 hour

- [ ] In `js/Game.js`, add `generateQRCode()` method:
  ```javascript
  generateQRCode() {
      const url = window.location.href;
      const canvas = QRCodeGenerator.generate(url, 256);
      
      // Show in modal
      const modal = document.getElementById('qr-modal');
      const qrCanvas = document.getElementById('qr-canvas');
      qrCanvas.replaceWith(canvas);
      canvas.id = 'qr-canvas';
      
      modal.classList.remove('hidden');
  }
  ```
- [ ] Implement download functionality:
  ```javascript
  downloadQRCode() {
      const canvas = document.getElementById('qr-canvas');
      const link = document.createElement('a');
      link.download = 'music-box-song.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
  }
  ```
- [ ] Add conditional button visibility:
  ```javascript
  updateShareButtons() {
      const songLength = this.songLength;
      const urlLength = this.getEstimatedURLLength();
      const qrBtn = document.getElementById('qr-btn');
      
      // Show QR button for songs >32 beats or URLs >160 chars
      if (songLength > 32 || urlLength > 160) {
          qrBtn.classList.remove('hidden');
      } else {
          qrBtn.classList.add('hidden');
      }
  }
  ```

**Acceptance Criteria:**
- QR code generates correctly from current URL
- Modal displays QR code
- Download saves PNG image
- QR button shows/hides based on song length
- Generated QR codes are scannable

**Review:**
- [ ] **REVIEW: Task 6.3 complete, all acceptance criteria met, ready for next task**

---

### Task 6.4: Style QR Modal
**Estimated Time:** 30 minutes

- [ ] Create or update `styles/overlays.css`
- [ ] Style modal overlay:
  ```css
  .modal {
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
  }
  .modal.hidden { display: none; }
  .modal-content {
      background: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      max-width: 90%;
  }
  #qr-canvas {
      display: block;
      margin: 20px auto;
      border: 2px solid #ccc;
  }
  ```
- [ ] Style buttons in modal
- [ ] Test on mobile (ensure modal is scrollable if needed)
- [ ] Add close on background click

**Acceptance Criteria:**
- Modal looks polished
- QR code is prominent
- Buttons are clear
- Responsive on all screen sizes

**Review:**
- [ ] **REVIEW: Task 6.4 complete, all acceptance criteria met, ready for next task**

---

### Task 6.5: Test QR Code Sharing
**Estimated Time:** 1 hour

- [ ] Generate QR codes for different song lengths:
  - [ ] 16 beat song
  - [ ] 32 beat song
  - [ ] 48 beat song
  - [ ] 64 beat song (maximum)
- [ ] Test scanning QR codes:
  - [ ] iOS Camera app
  - [ ] Android Camera app
  - [ ] QR scanner apps
  - [ ] Social media app QR scanners
- [ ] Verify scanned URLs load correctly
- [ ] Test download functionality on multiple browsers
- [ ] Test QR button visibility toggling

**Acceptance Criteria:**
- All generated QR codes scan successfully
- Scanned URLs load the correct song
- Download works on desktop and mobile
- QR button shows for long songs, hides for short songs
- No errors in console

**Review:**
- [ ] **REVIEW: Task 6.5 complete, Phase 6 complete, all acceptance criteria met, ready for Phase 7**

---

## Phase 7: Testing & Polish (4-6 hours)

### Task 7.1: Unit Tests
**Estimated Time:** 2-3 hours

- [ ] Create or update `tests/PianoKeyboard.test.js`:
  - [ ] Test note data generation
  - [ ] Test key enabling/disabling
  - [ ] Test drag state
- [ ] Update `tests/Track.test.js`:
  - [ ] Test new note format with octave
  - [ ] Test serialization with note indices
  - [ ] Test deserialization
- [ ] Update `tests/Game.test.js`:
  - [ ] Test v3 serialization
  - [ ] Test v3 deserialization
  - [ ] Test key signature logic
  - [ ] Test backwards compatibility (v1, v2)
- [ ] Create `tests/Audio.test.js`:
  - [ ] Test octave transposition
  - [ ] Verify track 1 = octave 5, track 2 = octave 3
- [ ] Run all tests in browser (`tests/index.html`)
- [ ] Fix any failing tests

**Acceptance Criteria:**
- All unit tests pass
- New features have test coverage
- Backwards compatibility is tested
- No regressions in existing features

**Review:**
- [ ] **REVIEW: Task 7.1 complete, all acceptance criteria met, ready for next task**

---

### Task 7.2: Manual Integration Testing
**Estimated Time:** 1-2 hours

- [ ] Test complete user workflows:
  - [ ] **Create new song**: Select key → Drag notes → Extend duration → Play → Share
  - [ ] **Load old URL**: Paste v1/v2 URL → Verify loads → Verify plays → Save as v3
  - [ ] **Long song**: Create 64-beat song → Generate QR → Scan QR → Verify loads
  - [ ] **Key changes**: Create song in C Major → Change to G Major → Verify visuals update
- [ ] Test edge cases:
  - [ ] Empty song
  - [ ] Maximum notes (all beats filled, extended durations)
  - [ ] Rapid key changes
  - [ ] Drag disabled notes (should fail)
- [ ] Test error handling:
  - [ ] Corrupted URL
  - [ ] Invalid note indices
  - [ ] Missing data in URL

**Acceptance Criteria:**
- All workflows complete successfully
- Edge cases handled gracefully
- No console errors during testing
- Error messages are user-friendly

**Review:**
- [ ] **REVIEW: Task 7.2 complete, all acceptance criteria met, ready for next task**

---

### Task 7.3: Mobile Device Testing
**Estimated Time:** 1 hour

- [ ] Test on real mobile devices:
  - [ ] **iOS Safari** (iPhone/iPad)
  - [ ] **Android Chrome**
  - [ ] **Android Firefox** (optional)
- [ ] Test touch interactions:
  - [ ] Piano key drag and drop
  - [ ] Timeline scrolling
  - [ ] Note duration extension
  - [ ] Dropdown selectors (key, length, speed)
  - [ ] Share button
  - [ ] QR code modal
- [ ] Test orientation changes (portrait ↔ landscape)
- [ ] Test on different screen sizes (phone, tablet)
- [ ] Verify no accidental zoom on input focus

**Acceptance Criteria:**
- All touch interactions work smoothly
- No zoom issues
- Layout adapts to different screen sizes
- Performance is acceptable (smooth animations)
- Audio plays correctly (after user interaction)

**Review:**
- [ ] **REVIEW: Task 7.3 complete, all acceptance criteria met, ready for next task**

---

### Task 7.4: Browser Compatibility Testing
**Estimated Time:** 1 hour

- [ ] Test on multiple browsers:
  - [ ] Chrome (Windows/Mac/Android)
  - [ ] Firefox (Windows/Mac)
  - [ ] Safari (Mac/iOS)
  - [ ] Edge (Windows)
- [ ] Verify features:
  - [ ] QR code generation
  - [ ] Web Share API (with fallback)
  - [ ] Audio playback
  - [ ] Drag and drop
  - [ ] URL serialization/deserialization
  - [ ] Canvas rendering
- [ ] Check console for warnings/errors
- [ ] Test on older browser versions if possible

**Acceptance Criteria:**
- Core features work on all tested browsers
- Graceful degradation where needed
- Web Share API fallback works
- No critical errors in any browser

**Review:**
- [ ] **REVIEW: Task 7.4 complete, Phase 7 complete, all acceptance criteria met, ready for Phase 8**

---

## Phase 8: Documentation (1-2 hours)

### Task 8.1: Update README.md
**Estimated Time:** 30 minutes

- [ ] Open `README.md`
- [ ] Update features list to include:
  - [ ] Piano keyboard with chromatic notes
  - [ ] Musical key selection (16 keys + Freeform)
  - [ ] Up to 64-beat songs
  - [ ] QR code sharing for long songs
- [ ] Update screenshots if needed
- [ ] Add section on sharing:
  - [ ] URL sharing for songs ≤32 beats
  - [ ] QR code sharing for longer songs
- [ ] Note v3 format and backwards compatibility

**Acceptance Criteria:**
- README accurately describes v3 features
- Clear instructions for users
- Professional presentation

**Review:**
- [ ] **REVIEW: Task 8.1 complete, all acceptance criteria met, ready for next task**

---

### Task 8.2: Update Code Comments
**Estimated Time:** 30 minutes

- [ ] Review all modified files
- [ ] Add/update JSDoc comments:
  - [ ] Class descriptions
  - [ ] Method signatures
  - [ ] Parameter types
  - [ ] Return values
- [ ] Add inline comments for complex logic:
  - [ ] QR code generation
  - [ ] Binary serialization
  - [ ] Key signature lookups
- [ ] Remove outdated comments

**Acceptance Criteria:**
- All public methods have JSDoc comments
- Complex algorithms are explained
- No misleading or outdated comments

**Review:**
- [ ] **REVIEW: Task 8.2 complete, all acceptance criteria met, ready for next task**

---

### Task 8.3: Update Design Documents
**Estimated Time:** 30 minutes

- [ ] Verify `DESIGN.md` is accurate (already updated ✅)
- [ ] Update `IMPLEMENTATION_CHECKLIST.md` with actual times
- [ ] Create or update `CHANGELOG.md`:
  ```markdown
  ## Version 3.0.0 - [Date]
  
  ### Added
  - Piano keyboard with 12 chromatic notes
  - Musical key selection (16 keys + Freeform mode)
  - Extended song length to 64 beats
  - QR code generation for songs >32 beats
  - Web Share API integration
  - Smart sharing UI based on song length
  
  ### Changed
  - Replaced separate melody/bass with unified piano keyboard
  - Notes now have octave-based playback (high/low tracks)
  - URL format updated to v3 (backwards compatible)
  
  ### Fixed
  - SMS sharing limitation addressed with QR codes
  ```
- [ ] Archive old design documents if needed

**Acceptance Criteria:**
- All documentation reflects v3 features
- Changelog is complete and accurate
- Design documents match implementation

**Review:**
- [ ] **REVIEW: Task 8.3 complete, Phase 8 complete, all acceptance criteria met, ready for Phase 9**

---

## Phase 9: Deployment Preparation (1 hour)

### Task 9.1: Final Code Review
**Estimated Time:** 30 minutes

- [ ] Review all modified files
- [ ] Check for:
  - [ ] Console.log statements (remove debug logs)
  - [ ] TODO comments (resolve or track)
  - [ ] Hardcoded values (move to constants)
  - [ ] Magic numbers (add explanatory comments)
  - [ ] Code duplication (refactor if needed)
- [ ] Run through code quality checklist
- [ ] Ensure consistent code style

**Acceptance Criteria:**
- Code is clean and production-ready
- No debug logs remain
- Consistent style throughout
- No obvious refactoring opportunities

**Review:**
- [ ] **REVIEW: Task 9.1 complete, all acceptance criteria met, ready for next task**

---

### Task 9.2: Performance Check
**Estimated Time:** 30 minutes

- [ ] Test performance on low-end devices
- [ ] Check for:
  - [ ] Smooth animations (60fps target)
  - [ ] Quick page load
  - [ ] Responsive UI interactions
  - [ ] Audio latency
- [ ] Profile with browser DevTools if needed
- [ ] Optimize heavy operations:
  - [ ] QR code generation (use Web Worker if slow)
  - [ ] Timeline rendering for 64 beats
- [ ] Verify file sizes are reasonable

**Acceptance Criteria:**
- No performance issues on tested devices
- Animations are smooth
- Page loads quickly
- Audio plays without noticeable latency

**Review:**
- [ ] **REVIEW: Task 9.2 complete, Phase 9 complete, all acceptance criteria met, ready for final checklist**

---

## Final Checklist ✅

Before marking v3 complete, ensure:

- [ ] All Phase 1-9 tasks completed
- [ ] All unit tests passing
- [ ] Manual testing completed on multiple devices
- [ ] Browser compatibility verified
- [ ] Documentation updated
- [ ] No console errors or warnings
- [ ] Performance acceptable
- [ ] Backwards compatibility verified (v1, v2 URLs load)
- [ ] QR codes scan successfully
- [ ] Web Share API works (with fallback)
- [ ] Code reviewed and cleaned up

---

## Estimated Timeline

| Phase | Description | Hours |
|-------|-------------|-------|
| 1 | Piano Keyboard System | 6-8 |
| 2 | Key Selection | 4-6 |
| 3 | 64-Beat Support | 2-3 |
| 4 | v3 URL Serialization | 4-5 |
| 5 | Web Share API | 1-2 |
| 6 | QR Code Generation | 4-6 |
| 7 | Testing & Polish | 4-6 |
| 8 | Documentation | 1-2 |
| 9 | Deployment Prep | 1 |
| **Total** | | **27-39 hours** |

---

## Dependencies Between Tasks

```
Phase 1 (Piano) ─┬─> Phase 2 (Keys)
                 │
                 ├─> Phase 3 (64 beats) ─> Phase 4 (Serialization)
                 │
                 └─> Phase 5 (Web Share) ─┬─> Phase 6 (QR Codes)
                                           │
                                           └─> Phase 7 (Testing)
                                                    │
                                                    └─> Phase 8 (Docs) ─> Phase 9 (Deploy)
```

**Recommended Order:**
1. Complete Phases 1-4 first (core features)
2. Then Phases 5-6 (sharing features)
3. Finally Phases 7-9 (polish and ship)

---

## Notes for Implementation

### Code Organization
- Keep files under 200 lines (split if needed)
- Use consistent naming conventions
- Follow existing code style
- Add comments for complex logic

### Testing Strategy
- Write tests before implementation where possible
- Test on real devices, not just emulators
- Keep test files in `tests/` directory
- Run all tests before committing

### Git Commits
Use conventional commit messages:
```
feat: add piano keyboard with chromatic notes
fix: correct octave transposition for track 2
test: add unit tests for key signature logic
docs: update README with v3 features
```

### Performance Considerations
- QR code generation can be slow - consider caching
- Timeline with 64 beats - use virtualization if laggy
- Audio synthesis - keep voice count reasonable

### Mobile Considerations
- Touch targets: 44px minimum, 48px preferred
- Prevent zoom: use `touch-action: manipulation`
- Test on actual devices, not just browser DevTools
- Audio requires user gesture to play

---

## Success Criteria

Version 3 is successful when:

1. ✅ Users can create songs with a single piano keyboard
2. ✅ Users can select musical keys and see visual feedback
3. ✅ Users can create songs up to 64 beats long
4. ✅ Short songs (≤32 beats) share easily via URL
5. ✅ Long songs (>32 beats) have QR code option
6. ✅ Old URLs (v1, v2) continue to work
7. ✅ Mobile experience is smooth and intuitive
8. ✅ Code is clean, tested, and documented

Good luck with the implementation! 🎵
