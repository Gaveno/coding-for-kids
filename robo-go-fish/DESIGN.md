# 🎣🤖 Robo Go Fish - Design

## Concept

Classic Go Fish vs. a friendly robot, with a building twist: every completed
set of 4 matching part cards installs that part onto your robot. Fill your
robot's slots before your opponent fills theirs!

No reading required — all icons, emojis, and animations.

## Why This Game (Learning Goals)

| Skill | Future relevance | How it's taught |
|---|---|---|
| Categorization & sets | Data types, classification, set theory | Cards belong to 6 part categories; a "set" = 4 of a kind |
| Counting & subitizing | Math foundations | Count copies in hand (1..4), see progress toward a set |
| Working memory & deduction | Debugging, logic | The robot asks for parts — remembering what it asked tells you what it holds |
| Information & strategy | Algorithms, game theory | Asking reveals information; the robot remembers YOUR asks and uses them |
| Rules & constraints | Programming constraints | You may only ask for a part you already hold |
| Turn-taking state machine | Program flow | Clear visual turn indicator; actions only valid in the right state |
| Probability intuition | Statistics | Sometimes you fish and hit; mostly you don't |

## Cards

6 part types × 4 copies = 24 cards:

⚙️ gear, 🔋 battery, 💡 bulb, 🛞 wheel, 🔩 bolt, 🧲 magnet

Deal 5 to each side. Remaining 14 cards form the pond 🌊.

## Turn Flow

1. **Player turn** (👇 indicator): part types in the player's hand pulse.
   Tap a type to ask the robot: speech bubble shows `[icon]❓`.
   - Robot has some → cards fly over, **player goes again**.
   - Robot has none → robot shows 🎣, pond pulses, player taps pond to draw.
     Drawn card matches the ask → go again. Else robot's turn.
2. **Robot turn** (🤖 indicator): thought bubble shows `[icon]❓`.
   - Player has some → cards fly to robot automatically.
   - Player has none → player side shows 🎣, robot draws from pond.
3. **Set completed** (4 of a kind): chime + the part installs on that side's
   robot chassis with a sparkle.
4. **Empty hand**: that side draws 1 from the pond at the start of its turn.
5. **Game over**: all 6 sets are claimed, or pond and both hands are empty.
   Most installed parts wins. 🎉 overlay (robot claps either way).

## Robot AI (fair + teachable)

- Remembers the part types the player asked for (the player holds those!).
  If the robot holds a remembered type, it asks for it; memory entry is
  cleared once used or once the player no longer holds that type.
- Otherwise asks randomly among types in its hand.
- This makes the robot's behavior *learnable*: kids discover that asking
  gives information away — a first taste of strategic reasoning.

## Modules

```
robo-go-fish/
├── index.html
├── js/
│   ├── main.js        # Entry point
│   ├── Deck.js        # Card types, build, shuffle, draw (pure)
│   ├── Hand.js        # Hand counts, set detection, transfers (pure)
│   ├── Opponent.js    # Robot AI with ask-memory (pure, injectable RNG)
│   ├── Game.js        # Turn state machine, controller
│   ├── UI.js          # DOM rendering, hand/pond/robot chassis
│   └── Audio.js       # WebAudio tones (same pattern as other games)
├── styles/            # variables, main, table, cards, robots, overlays,
│                      # animations, responsive
└── tests/             # Deck, Hand, Opponent + browser runner
```

## Status

✅ Playable POC
