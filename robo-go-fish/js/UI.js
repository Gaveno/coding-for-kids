/**
 * UI - DOM rendering for Robo Go Fish. No game rules live here.
 */
import { PART_TYPES } from './Deck.js';
import { countType, typesInHand } from './Hand.js';

export class UI {
    constructor() {
        this.els = {
            robotCards: document.getElementById('robotCards'),
            robotBubble: document.getElementById('robotBubble'),
            robotAvatar: document.getElementById('robotAvatar'),
            robotChassis: document.getElementById('robotChassis'),
            playerChassis: document.getElementById('playerChassis'),
            playerBubble: document.getElementById('playerBubble'),
            playerHand: document.getElementById('playerHand'),
            pondBtn: document.getElementById('pondBtn'),
            pondCount: document.getElementById('pondCount'),
            turnIndicator: document.getElementById('turnIndicator'),
            winCount: document.getElementById('winCount'),
            gameOverOverlay: document.getElementById('gameOverOverlay'),
            gameOverIcon: document.getElementById('gameOverIcon'),
            gameOverScore: document.getElementById('gameOverScore'),
            helpOverlay: document.getElementById('helpOverlay')
        };
        this.onAsk = null; // set by Game
    }

    /** Render every dynamic region from game state */
    renderAll({ playerHand, robotHandCount, pond, playerSets, robotSets }) {
        this.renderPlayerHand(playerHand);
        this.renderRobotCards(robotHandCount);
        this.renderChassis(this.els.playerChassis, playerSets);
        this.renderChassis(this.els.robotChassis, robotSets);
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
            btn.addEventListener('pointerup', () => {
                if (this.onAsk) this.onAsk(type);
            });
            this.els.playerHand.appendChild(btn);
        });
    }

    /** Robot hand: face-down mini cards */
    renderRobotCards(count) {
        this.els.robotCards.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const card = document.createElement('div');
            card.className = 'mini-card';
            card.textContent = '🤖';
            this.els.robotCards.appendChild(card);
        }
    }

    /** Chassis: 6 slots, filled with collected part emojis */
    renderChassis(el, sets) {
        el.innerHTML = '';
        PART_TYPES.forEach(type => {
            const slot = document.createElement('div');
            slot.className = 'chassis-slot' + (sets.includes(type) ? ' filled' : '');
            slot.textContent = sets.includes(type) ? type : '';
            el.appendChild(slot);
        });
    }

    /** Whose turn: 'player' | 'robot' | 'fishing' | null */
    setTurn(mode) {
        const icons = { player: '👇', robot: '🤖💭', fishing: '🎣' };
        this.els.turnIndicator.textContent = icons[mode] || '';
        document.body.classList.toggle('player-turn', mode === 'player');
        this.els.pondBtn.classList.toggle('fishing', mode === 'fishing');
    }

    /** Speech bubble on one side. content = html string, e.g. '💡❓' */
    showBubble(side, content) {
        const el = side === 'robot' ? this.els.robotBubble : this.els.playerBubble;
        el.innerHTML = content;
        el.classList.add('visible');
    }

    hideBubbles() {
        this.els.robotBubble.classList.remove('visible');
        this.els.playerBubble.classList.remove('visible');
    }

    /** Animate `count` copies of an emoji flying between two elements */
    flyCards(fromEl, toEl, emoji, count) {
        const from = fromEl.getBoundingClientRect();
        const to = toEl.getBoundingClientRect();
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

    /** Sparkle burst over a chassis when a set is installed */
    celebrateSet(side, type) {
        const chassis = side === 'robot' ? this.els.robotChassis : this.els.playerChassis;
        const burst = document.createElement('div');
        burst.className = 'set-burst';
        burst.textContent = `✨${type}✨`;
        chassis.parentElement.appendChild(burst);
        setTimeout(() => burst.remove(), 1400);
        chassis.classList.add('pop');
        setTimeout(() => chassis.classList.remove('pop'), 600);
    }

    robotEmote(emoji, ms = 1200) {
        const el = this.els.robotAvatar;
        const original = el.textContent;
        el.textContent = emoji;
        setTimeout(() => { el.textContent = original; }, ms);
    }

    setWins(wins) {
        this.els.winCount.textContent = wins;
    }

    showGameOver(playerWon, playerSets, robotSets) {
        this.els.gameOverIcon.textContent = playerWon ? '🎉🏆🎉' : '🤖🏆';
        this.els.gameOverScore.innerHTML =
            `<span class="score-side">🙂 ${playerSets.join('')}</span>` +
            `<span class="score-side">🤖 ${robotSets.join('')}</span>`;
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
}
