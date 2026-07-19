# 🎣🤖 Robo Go Fish - Design

## Concept

Classic Go Fish against 1-3 friendly robots (4 players max), with a building
twist: every completed set of 4 matching part cards installs that part onto
your robot. Collect the most parts to win!

No reading required — all icons, emojis, and animations.

## Why This Game (Learning Goals)

| Skill | Future relevance | How it's taught |
|---|---|---|
| Categorization & sets | Data types, classification, set theory | Cards belong to 13 part categories; a "set" = 4 of a kind |
| Counting & subitizing | Math foundations | Count copies in hand (1..4), see progress toward a set |
| Working memory & deduction | Debugging, logic | Everyone's asks are public — remembering them tells you who holds what |
| Information & strategy | Algorithms, game theory | Asking reveals information; robots remember YOUR asks and use them |
| Rules & constraints | Programming constraints | You may only ask for a part you already hold |
| Turn-taking state machine | Program flow | Clear visual turn indicator; actions only valid in the right state |
| Probability intuition | Statistics | Sometimes you fish and hit; mostly you don't |
| Difficulty & randomness | Probability, tuning | Easy/medium/hard changes how reliably robots remember |

## Cards

13 part types × 4 copies = 52 cards — the same count as a real deck:

⚙️ gear, 🔋 battery, 💡 bulb, 🛞 wheel, 🔩 bolt, 🧲 magnet, 📡 antenna,
🔧 wrench, 🪛 screwdriver, 🔌 plug, ⚡ spark, 🦾 arm, 📷 camera

House rules: everyone starts with 7 cards, no matter the player count.
The rest form the pond 🌊.

## Game Setup (start screen)

Before each game the player picks:

1. **Robots**: 1 🤖, 2 🤖👾, or 3 🤖👾🛸 opponents (2-4 total players).
   Each robot keeps its own face and panel color all game so kids always
   know who is who (Beep 🤖 blue, Pixel 👾 purple, Zippy 🛸 orange).
2. **Difficulty** (robot memory reliability):
   - 🌱 Easy — 75% chance a robot does NOT remember an ask
   - ⭐ Medium — 50% chance a robot does not remember an ask
   - 🔥 Hard — robots remember every ask

Choices are saved and preselected next time.

## Turn Flow (house rules: one ask per turn)

Turns rotate clockwise: You → robot 1 → robot 2 → robot 3 → You…

1. **Player turn** (👇 indicator): part types in the player's hand pulse.
   - Tap a part → it pops up selected, and every robot that holds cards
     glows with a bouncing 👆❓ hint.
   - Tap a glowing robot to ask it: speech bubble shows `[icon]❓` and the
     asked robot is spotlighted. (With a single robot, tapping the part
     asks immediately. Tap the selected part again to put it back.)
   - Robot has some → cards fly over, then **your turn is over**.
   - Robot has none → robot shows 🎣, pond pulses, player taps pond to
     draw one card. **Drawing ends your turn** (no lucky-catch go-again).
2. **Robot turn** ([face]💭 indicator, active panel glows): the robot asks
   **any** opponent — you or another robot. Its bubble shows `[icon]❓` and
   the target is spotlighted (your whole area glows when you're asked).
   A match transfers automatically; a miss means the robot draws from the
   pond. Either way its turn is over.
3. **Set completed** (4 of a kind): chime + the part installs as a badge on
   that player's robot with a sparkle.
4. **Can't ask** (empty hand, or nobody else holds cards): that player
   draws 1 from the pond and their turn is over — no asking on a turn you
   draw this way. If the pond is empty too, their turn is skipped.
5. **Game over**: play continues until every one of the 13 matches is made
   and the pond is dry (plus a stall safety net). Most installed parts
   wins — 🎉 overlay shows every player's parts with 👑 on the winner(s).

## Robot AI (fair + teachable)

- Every ask at the table is public. Each robot rolls its difficulty chance
  to record it: "player X holds part Y".
- On its turn a robot prefers its most recent usable memory (it must hold
  the part, and the remembered player must still have cards); otherwise it
  asks a random opponent for a random part from its own hand.
- Memories are dropped when used, when the cards visibly leave that
  player's hand, or when a set of that type is laid down.
- This makes the robots' behavior *learnable*: kids discover that asking
  gives information away — a first taste of strategic reasoning — and that
  harder robots punish it more reliably.

## Modules

```
robo-go-fish/
├── index.html         # Layout + setup / game over / help overlays
├── js/
│   ├── main.js        # Entry point
│   ├── Deck.js        # 52-card build, deal size, shuffle, draw (pure)
│   ├── Hand.js        # Hand counts, set detection, transfers (pure)
│   ├── Opponent.js    # Robot AI: per-player ask memory, difficulty roll,
│   │                  # target selection (pure, injectable RNG)
│   ├── Game.js        # Turn rotation state machine, controller
│   ├── Scoring.js     # Set collection, winner logic, game over
│   ├── UI.js          # DOM rendering: robot panels, hand, pond, badges
│   └── Audio.js       # WebAudio tones (same pattern as other games)
├── styles/            # variables, main, table, cards, robots, overlays,
│                      # animations, responsive
└── tests/             # Deck, Hand, Opponent + browser runner
```

## Status

✅ Playable POC
