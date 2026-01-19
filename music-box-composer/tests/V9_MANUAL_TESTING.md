# V9 Serialization Manual Testing Guide

## Test Scenario 1: Three Tracks (v7 Format)
**Expected**: Should use v7 format for backwards compatibility

1. Open http://localhost:57228/music-box-composer/
2. Ensure only 3 tracks exist (default state)
3. Add some notes to tracks 1, 2, 3
4. Check browser console: `game.serializeState()`
5. **Verify**: Output starts with `v7_`

## Test Scenario 2: Four Tracks (v9 Format)
**Expected**: Should use v9 format

1. Click "➕ Add Track" button
2. Select Piano track
3. Add notes to track 4
4. Check browser console: `game.serializeState()`
5. **Verify**: Output starts with `v9_`

## Test Scenario 3: URL Persistence with 4+ Tracks
**Expected**: Tracks 4-6 should persist across page reloads

1. Add track 4 (piano) with some notes
2. Add track 5 (percussion) with some notes
3. Set waveform for track 4 (e.g., square)
4. Enable reverb on track 5
5. Copy the URL from address bar
6. Reload the page (F5)
7. **Verify**: All 5 tracks are present with their notes, waveforms, and effects

## Test Scenario 4: Track Type Preservation
**Expected**: Piano and percussion tracks should maintain their types

1. Add track 4 as piano
2. Add track 5 as percussion
3. Add track 6 as piano
4. Copy URL and reload page
5. **Verify**:
   - Track 4 shows piano keyboard in dropdown
   - Track 5 shows percussion icons
   - Track 6 shows piano keyboard in dropdown
   - Drag-drop works correctly for each track type

## Test Scenario 5: Settings Persistence
**Expected**: Track-specific settings should persist

1. Add track 4 (piano)
2. Click track label to open settings
3. Set waveform to "sawtooth"
4. Enable reverb and delay
5. Copy URL and reload page
6. Open track 4 settings
7. **Verify**: Waveform is "sawtooth", reverb and delay are enabled

## Test Scenario 6: Playback with Additional Tracks
**Expected**: All tracks should play during song playback

1. Add notes to tracks 1-6
2. Click play button
3. **Verify**: All tracks play their notes in sequence

## Console Commands for Testing

```javascript
// Check current track count
Object.keys(game.tracks).length

// Check track types
Object.entries(game.tracks).map(([num, track]) => [num, track.trackType])

// Force serialize to v9
game.serializeV9()

// Force serialize to v7 (only works with 3 tracks)
game.serializeV7()

// Check current format being used
game.serializeState().substring(0, 3)

// Deserialize a URL
const url = window.location.search.substring(1);
const state = game.deserializeState(url);
console.log(state);

// Check URL size
window.location.href.length
```

## Expected URL Sizes

- 3 tracks, 16 beats: ~150-200 chars (v7 format)
- 4 tracks, 16 beats: ~180-230 chars (v9 format)
- 6 tracks, 64 beats (sparse): ~300-400 chars (v9 format)
- 6 tracks, 128 beats (sparse): ~500-600 chars (v9 format)
- 6 tracks, 256 beats (sparse): Would exceed goal, needs compression

## Known Limitations

- Beat count is currently fixed at initialization
- No UI to change beat count (64/128/256) - this is a pending feature
- URL size can exceed 600 chars for dense 256-beat songs without compression
