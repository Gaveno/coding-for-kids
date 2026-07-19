/**
 * UI - DOM rendering for Robo Go Fish. No game rules live here.
 * Player 0 is always the human (bottom); players 1..n are robot panels (top).
 */
import { countType, typesInHand } from './Hand.js';

export class UI {
    constructor() {
        this.els = {
            robotsRow: document.getElementById('robotsRow'),
            playerArea: document.getElementById('playerArea'),
            playerBubble: document.getElementById('playerBubble'),
            playerHand: document.getElementById('playerHand'),
            playerSets: document.getElementById('playerSets'),
            pondBtn: document.getElementById('pondBtn'),
            pondCount: document.getElementById('pondCount'),
            turnIndicator: document.getElementById('turnIndicator'),
            winCount: document.getElementById('winCount'),
            gameOverOverlay: document.getElementById('gameOverOverlay'),
            gameOverIcon: document.getElementById('gameOverIcon'),
            gameOverScore: document.getElementById('gameOverScore'),
            helpOverlay: document.getElementById('helpOverlay'),
            setupOverlay: document.getElementById('setupOverlay')
        };
        this.onCardTap = null; // set by Game
        this.onRobotTap = null; // set by Game
        /** Per-robot element refs, index 0 = player slot (unused) */
        this.robotEls = [];
        this.faces = [];
    }

    // ===== Table construction =====

    /** Build one panel per robot. Called at the start of every game. */
    buildTable(players) {
        this.faces = players.map(p => p.face);
        this.els.robotsRow.innerHTML = '';
        this.els.robotsRow.className = `robots-row robots-${players.length - 1}`;
        this.robotEls = [null]; // index 0 = human, no panel

        players.forEach((p, i) => {
            if (!p.isRobot) return;
            const panel = document.createElement('section');
            panel.className = 'robot-panel';
            panel.dataset.index = i;
            panel.setAttribute('aria-label', `${p.name} the robot`);
            panel.innerHTML =
                `<div class="ask-hint" aria-hidden="true">👆❓</div>` +
                `<div class="bubble robot-bubble" aria-live="polite"></div>` +
                `<div class="robot-avatar" aria-hidden="true">${p.face}</div>` +
                `<div class="robot-cards">` +
                    `<span class="mini-card" aria-hidden="true">🎴</span>` +
                    `<span class="robot-count" aria-label="cards held">0</span>` +
                `</div>` +
                `<div class="sets-row" aria-label="collected parts"></div>`;
            panel.addEventListener('pointerup', () => {
                if (this.onRobotTap) this.onRobotTap(i);
            });
            this.els.robotsRow.appendChild(panel);
            this.robotEls[i] = {
                panel,
                bubble: panel.querySelector('.robot-bubble'),
                avatar: panel.querySelector('.robot-avatar'),
                cards: panel.querySelector('.robot-cards'),
                count: panel.querySelector('.robot-count'),
                sets: panel.querySelector('.sets-row')
            };
        });
    }

    // ===== Rendering =====

    /** Render every dynamic region from game state */
    renderAll(players, pond) {
        this.renderPlayerHand(players[0].hand);
        this.renderSets(this.els.playerSets, players[0].sets);
        players.forEach((p, i) => {
            if (!p.isRobot) return;
            const r = this.robotEls[i];
            r.count.textContent = p.hand.length;
            r.cards.classList.toggle('empty', p.hand.length === 0);
            this.renderSets(r.sets, p.sets);
        });
        this.els.pondCount.textContent = pond.length;
        this.els.pondBtn.classList.toggle('empty', pond.length === 0);
    }

    /** Player hand: one big tappable button per held type, with a count badge */
    renderPlayerHand(hand) {
        this.els.playerHand.innerHTML = '';
        typesInHand(hand).forEach(type => {
            const btn = document.createElement('button');
            btn.className = 'hand-group';
            btn.dataset.type = type;
            btn.setAttribute('aria-label', `Ask for ${type}`);
            const count = countType(hand, type);
            btn.innerHTML =
                `<span class="hand-emoji" aria-hidden="true">${type}</span>` +
                `<span class="hand-count">${count}</span>`;
            btn.addEventListener('pointerup', (e) => {
                e.stopPropagation();
                if (this.onCardTap) this.onCardTap(type);
            });
            this.els.playerHand.appendChild(btn);
        });
    }

    /** Collected parts as installed badges */
    renderSets(el, sets) {
        el.innerHTML = '';
        sets.forEach(type => {
            const badge = document.createElement('span');
            badge.className = 'set-badge';
            badge.textContent = type;
            el.appendChild(badge);
        });
    }

    // ===== Ask flow: select a card, pick a robot =====

    /** Highlight the selected hand card (null clears) */
    setSelected(type) {
        this.els.playerHand.querySelectorAll('.hand-group').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.type === type);
            btn.classList.toggle('dimmed', type !== null && btn.dataset.type !== type);
        });
    }

    /** Make these robots glow: "tap me to ask!" */
    showTargets(indexes) {
        document.body.classList.add('targeting');
        this.robotEls.forEach((r, i) => {
            if (r) r.panel.classList.toggle('askable', indexes.includes(i));
        });
    }

    clearTargets() {
        document.body.classList.remove('targeting');
        this.robotEls.forEach(r => {
            if (r) r.panel.classList.remove('askable');
        });
    }

    /** Spotlight whoever is being asked right now */
    markAsked(i, on) {
        const el = i === 0 ? this.els.playerArea : this.robotEls[i].panel;
        el.classList.toggle('being-asked', on);
    }

    // ===== Turn + bubbles =====

    /** Whose turn: player index, or null when the game is over */
    setTurn(i, fishing = false) {
        if (i === null) {
            this.els.turnIndicator.textContent = '';
        } else if (i === 0) {
            this.els.turnIndicator.textContent = fishing ? '🎣' : '👇';
        } else {
            this.els.turnIndicator.textContent = `${this.faces[i]}💭`;
        }
        document.body.classList.toggle('player-turn', i === 0 && !fishing);
        this.els.pondBtn.classList.toggle('fishing', fishing);
        this.robotEls.forEach((r, j) => {
            if (r) r.panel.classList.toggle('active', j === i);
        });
        this.els.playerArea.classList.toggle('active', i === 0);
    }

    /** Speech bubble for player i. content = html string, e.g. '💡❓' */
    showBubble(i, content) {
        const el = i === 0 ? this.els.playerBubble : this.robotEls[i].bubble;
        el.innerHTML = content;
        el.classList.add('visible');
    }

    hideBubbles() {
        this.els.playerBubble.classList.remove('visible');
        this.robotEls.forEach(r => {
            if (r) r.bubble.classList.remove('visible');
        });
    }

    // ===== Animations =====

    /** Element cards fly from/to: player index or 'pond' */
    flySlot(who) {
        if (who === 'pond') return this.els.pondBtn;
        if (who === 0) return this.els.playerHand;
        return this.robotEls[who].cards;
    }

    /** Animate `count` copies of an emoji flying between two spots */
    flyCards(fromWho, toWho, emoji, count) {
        const from = this.flySlot(fromWho).getBoundingClientRect();
        const to = this.flySlot(toWho).getBoundingClientRect();
        for (let i = 0; i < count; i++) {
            const flier = document.createElement('div');
            flier.className = 'flying-card';
            flier.textContent = emoji;
            flier.style.left = `${from.left + from.width / 2}px`;
            flier.style.top = `${from.top + from.height / 2}px`;
            document.body.appendChild(flier);
            const dx = (to.left + to.width / 2) - (from.left + from.width / 2);
            const dy = (to.top + to.height / 2) - (from.top + from.height / 2);
            flier.style.transitionDelay = `${i * 0.12}s`;
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    flier.style.transform = `translate(${dx}px, ${dy}px) scale(0.6)`;
                    flier.style.opacity = '0.2';
                });
            });
            setTimeout(() => flier.remove(), 900 + i * 120);
        }
    }

    /** Sparkle burst over a side when a set is installed */
    celebrateSet(i, type) {
        const host = i === 0 ? this.els.playerArea : this.robotEls[i].panel;
        const burst = document.createElement('div');
        burst.className = 'set-burst';
        burst.textContent = `✨${type}✨`;
        host.appendChild(burst);
        setTimeout(() => burst.remove(), 1400);
        const setsEl = i === 0 ? this.els.playerSets : this.robotEls[i].sets;
        setsEl.classList.add('pop');
        setTimeout(() => setsEl.classList.remove('pop'), 600);
    }

    robotEmote(i, emoji, ms = 1200) {
        const r = this.robotEls[i];
        if (!r) return;
        const original = this.faces[i];
        r.avatar.textContent = emoji;
        setTimeout(() => { r.avatar.textContent = original; }, ms);
    }

    // ===== Overlays =====

    setWins(wins) {
        this.els.winCount.textContent = wins;
    }

    showGameOver(playerWon, players, best) {
        this.els.gameOverIcon.textContent = playerWon ? '🎉🏆🎉' : '🤖🏆';
        this.els.gameOverScore.innerHTML = players.map(p => {
            const crown = p.sets.length === best ? '👑' : '';
            const badges = p.sets.length > 0 ? p.sets.join('') : '·';
            return `<span class="score-side">${crown}${p.face} ${badges}</span>`;
        }).join('');
        this.els.gameOverOverlay.classList.add('visible');
    }

    hideGameOver() {
        this.els.gameOverOverlay.classList.remove('visible');
    }

    showHelp() {
        this.els.helpOverlay.classList.add('visible');
    }

    hideHelp() {
        this.els.helpOverlay.classList.remove('visible');
    }

    // ===== Setup screen =====

    showSetup(robotCount, difficulty) {
        document.querySelectorAll('#robotChoices .choice-btn').forEach(btn => {
            btn.classList.toggle('selected', parseInt(btn.dataset.robots, 10) === robotCount);
        });
        document.querySelectorAll('#diffChoices .choice-btn').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.diff === difficulty);
        });
        this.els.setupOverlay.classList.add('visible');
    }

    hideSetup() {
        this.els.setupOverlay.classList.remove('visible');
    }

    /** Mark one button selected within a setup row */
    markChoice(rowSelector, chosenBtn) {
        document.querySelectorAll(`${rowSelector} .choice-btn`).forEach(btn => {
            btn.classList.toggle('selected', btn === chosenBtn);
        });
    }
}
