# 🦉📖 Word Safari - Design

## Concept

A learn-to-read game. Each level shows a big picture (emoji) and speaks the
word aloud. The player connects picture + sound to the written word — first
by recognizing it, then by spelling it.

## Why This Game (Learning Goals)

| Skill | How it's taught |
|---|---|
| Sight-word recognition | Pick the word matching the picture from 3 choices |
| Phonics / sound-letter mapping | The word is spoken aloud; player maps sounds to letters |
| Spelling | Phase 2: type the word letter by letter |
| Letter recognition | Big ABC-order on-screen keyboard |
| Confidence & progression | Words ramp 2-3 letters → 5-6 letters, twice |

## Level Structure (60 levels)

**Phase 1 — Pick the word (levels 1-20):** the picture is shown and the word
spoken; the player taps the right word out of 3 choices. Decoys always have
the same length as the answer so the shape of the word alone isn't a giveaway.
Words ramp from `ox` up to `rocket`.

**Phase 2 — Tricky picks (levels 21-40):** the same 20 words repeat, but now
the decoys start with the same letter (and same length) as the answer —
`ball` vs `bell` vs `bath`. Knowing the first letter isn't enough; the player
has to sound through more of the word.

**Phase 3 — Spell the word (levels 41-60):** difficulty resets to 2-3 letter
words and ramps up again, but now the player spells the word into letter
slots using a big ABC keyboard (physical keyboard also works). After 2 wrong
tries, faded hint letters appear in the slots.

Fresh words are used in the typing phase so it isn't pure memory.

## Audio

- **Speech**: words are spoken with the built-in Web Speech API
  (`speechSynthesis`) — no external dependencies, degrades silently if
  unsupported. Slow rate, slightly high pitch, prefers a local English voice.
  The 🔊 button repeats the word any time; wrong answers re-speak it.
- **Sound effects**: Web Audio oscillator tones (same pattern as other games):
  key taps, gentle "try again" tones, success chimes, win fanfare.
- **iOS Safari quirks handled**: speech and the AudioContext are primed on
  the first completed touch gesture (touchend — pointerdown alone doesn't
  count on iOS); a silent utterance unlocks `speechSynthesis`; suspended
  audio contexts are resumed before every tone; `resume()` is called before
  speaking and utterances aren't queued immediately after `cancel()` (iOS
  drops them). Note: the iPhone hardware silent switch mutes Web Audio.

## Feedback & Encouragement

- Correct: green bounce, flying ⭐, chime, the word is spoken again.
- Wrong: gentle shake, never punishing; the word is repeated as a hint.
- One ⭐ per completed word; progress bar fills across each phase.
- Progress saves to localStorage; replay keeps stars as a trophy count.

## Art

- Word pictures: emojis (repo convention).
- Mascot: `art/reading/owl.svg` — a reading owl on the start screen.

## Files

- `js/Words.js` — level data + choice/decoy generation (pure, tested)
- `js/Progress.js` — localStorage save (pure, tested)
- `js/Speech.js` — speechSynthesis wrapper
- `js/Audio.js` — sound effects
- `js/Keyboard.js` — on-screen ABC keyboard + physical key bridge
- `js/ChoiceMode.js` / `js/TypingMode.js` — the two play modes
- `js/Game.js` — controller, HUD, overlays
