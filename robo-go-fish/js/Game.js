/**
 * Game - Turn state machine and controller for Robo Go Fish.
 * 1 human + 1-3 robots, full Go Fish turn rotation: everyone can ask anyone.
 */
import { buildDeck, shuffle, draw, dealSize } from './Deck.js';
import { addCards, removeType, hasType } from './Hand.js';
import { Opponent } from './Opponent.js';
import { Scoring } from './Scoring.js';
import { UI } from './UI.js';
import { Audio } from './Audio.js';

const STATE = {
    SELECT: 'select',    // human: pick a part from your hand
    TARGET: 'target',    // human: pick which robot to ask
    FISHING: 'fishing',  // human: tap the pond to draw
    ROBOT: 'robot',      // a robot is taking its turn
    BUSY: 'busy',        // animating
    OVER: 'over'
};

/** The three possible robot opponents, in join order */
export const ROBOT_IDENTITIES = [
    { face: '🤖', name: 'Beep' },
    { face: '👾', name: 'Pixel' },
    { face: '🛸', name: 'Zippy' }
];

/** Difficulty = chance a robot remembers each ask it hears */
export const DIFFICULTIES = {
    easy: { icon: '🌱', rememberChance: 0.25 },
    medium: { icon: '⭐', rememberChance: 0.5 },
    hard: { icon: '🔥', rememberChance: 1 }
};

export class Game {
    constructor() {
        this.ui = new UI();
        this.audio = new Audio();
        this.scoring = new Scoring(this);
        this.wins = parseInt(localStorage.getItem('robogofish-wins') || '0', 10);
        this.robotCount = parseInt(localStorage.getItem('robogofish-robots') || '1', 10);
        this.difficulty = localStorage.getItem('robogofish-diff') || 'easy';
        if (!DIFFICULTIES[this.difficulty]) this.difficulty = 'easy';
        if (this.robotCount < 1 || this.robotCount > 3) this.robotCount = 1;
        this.players = [];
        this.state = STATE.OVER;
    }

    init() {
        this.ui.onCardTap = (type) => this.cardTap(type);
        this.ui.onRobotTap = (i) => this.robotTap(i);
        this.ui.els.pondBtn.addEventListener('pointerup', () => this.pondTap());
        document.getElementById('helpBtn').addEventListener('pointerup', () => this.ui.showHelp());
        document.getElementById('closeHelpBtn').addEventListener('pointerup', () => this.ui.hideHelp());
        document.getElementById('replayBtn').addEventListener('pointerup', () => this.newGame());
        document.addEventListener('pointerdown', () => this.audio.init(), { once: true });
        this.initSetupScreen();
        this.ui.setWins(this.wins);
        this.newGame();
    }

    /** Wire up the start screen: robot count + difficulty + play */
    initSetupScreen() {
        document.querySelectorAll('#robotChoices .choice-btn').forEach(btn => {
            btn.addEventListener('pointerup', () => {
                this.robotCount = parseInt(btn.dataset.robots, 10);
                this.ui.markChoice('#robotChoices', btn);
                this.audio.drawCard();
            });
        });
        document.querySelectorAll('#diffChoices .choice-btn').forEach(btn => {
            btn.addEventListener('pointerup', () => {
                this.difficulty = btn.dataset.diff;
                this.ui.markChoice('#diffChoices', btn);
                this.audio.drawCard();
            });
        });
        document.getElementById('startBtn').addEventListener('pointerup', () => {
            localStorage.setItem('robogofish-robots', String(this.robotCount));
            localStorage.setItem('robogofish-diff', this.difficulty);
            this.ui.hideSetup();
            this.audio.ask();
            this.startGame();
        });
    }

    /** Show the setup screen (game start and replay) */
    newGame() {
        this.state = STATE.OVER;
        this.ui.hideGameOver();
        this.ui.showSetup(this.robotCount, this.difficulty);
    }

    /** Deal and begin with the chosen options */
    startGame() {
        const chance = DIFFICULTIES[this.difficulty].rememberChance;
        const total = this.robotCount + 1;
        const per = dealSize(total);
        const deck = shuffle(buildDeck());

        this.players = [];
        for (let i = 0; i < total; i++) {
            const hand = deck.slice(i * per, (i + 1) * per);
            if (i === 0) {
                this.players.push({ face: '🙂', name: 'You', isRobot: false, hand, sets: [] });
            } else {
                const id = ROBOT_IDENTITIES[i - 1];
                this.players.push({
                    face: id.face, name: id.name, isRobot: true,
                    hand, sets: [], brain: new Opponent(chance)
                });
            }
        }
        this.pond = deck.slice(total * per);
        this.selectedType = null;
        this.staleTurns = 0;
        this.current = 0;
        this.ui.buildTable(this.players);
        this.ui.hideBubbles();
        this.render();
        this.startTurn(0);
    }

    render() {
        this.ui.renderAll(this.players, this.pond);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /** Opponents of player i that still hold cards */
    targetsFor(i) {
        return this.players
            .map((p, j) => ({ index: j, count: p.hand.length }))
            .filter(t => t.index !== i && t.count > 0);
    }

    /** Robot indexes the human may currently ask */
    robotTargets() {
        return this.targetsFor(0).map(t => t.index);
    }

    /** Every robot brain drops a stale/used memory about `player` + `type` */
    forgetAll(player, type) {
        this.players.forEach(p => {
            if (p.isRobot) p.brain.forget(player, type);
        });
    }

    // ===== Turn rotation =====

    async startTurn(i) {
        if (this.scoring.maybeGameOver()) return;
        this.current = i;
        const p = this.players[i];
        const canAsk = p.hand.length > 0 && this.targetsFor(i).length > 0;

        if (!canAsk) {
            // House rules: can't ask? Draw one card and your turn is over.
            // Nothing to draw either? Your turn is skipped.
            if (this.pond.length > 0) {
                this.ui.setTurn(i);
                await this.drawTo(i);
                if (await this.scoring.collectSets(i)) return;
            }
            this.nextTurn();
            return;
        }

        if (p.isRobot) {
            this.robotTurn(i);
        } else {
            this.state = STATE.SELECT;
            this.selectedType = null;
            this.ui.setSelected(null);
            this.ui.clearTargets();
            this.ui.setTurn(0);
            this.render();
        }
    }

    nextTurn() {
        if (this.state === STATE.OVER) return;
        if (this.pond.length === 0) this.staleTurns++;
        this.ui.hideBubbles();
        this.startTurn((this.current + 1) % this.players.length);
    }

    /** Draw one pond card to player i (with animation). False if pond empty. */
    async drawTo(i) {
        const { card, rest } = draw(this.pond);
        if (card === null) return false;
        this.pond = rest;
        this.players[i].hand = addCards(this.players[i].hand, [card]);
        this.ui.flyCards('pond', i, '🌊', 1);
        this.audio.drawCard();
        await this.sleep(600);
        this.render();
        return true;
    }

    /**
     * One ask, from anyone to anyone. Handles memory, cards, animation.
     * @returns {'hit'|'miss'|'over'}
     */
    async resolveAsk(asker, target, type) {
        // Every robot at the table hears the ask (and maybe remembers it)
        this.players.forEach((p, i) => {
            if (p.isRobot && i !== asker) p.brain.observeAsk(asker, type);
        });

        this.ui.showBubble(asker, `${type}❓`);
        this.ui.markAsked(target, true);
        await this.sleep(900);

        const tp = this.players[target];
        if (hasType(tp.hand, type)) {
            const { removed, hand } = removeType(tp.hand, type);
            tp.hand = hand;
            this.players[asker].hand = addCards(this.players[asker].hand, removed);
            this.forgetAll(target, type); // everyone saw those cards leave
            this.staleTurns = 0;
            this.ui.flyCards(target, asker, type, removed.length);
            this.audio.gain();
            await this.sleep(900);
            this.ui.hideBubbles();
            this.ui.markAsked(target, false);
            this.render();
            if (await this.scoring.collectSets(asker)) return 'over';
            return 'hit';
        }

        if (this.players[asker].isRobot) {
            this.players[asker].brain.forget(target, type);
        }
        this.ui.showBubble(target, '🎣');
        if (tp.isRobot) this.ui.robotEmote(target, '🤷');
        this.audio.splash();
        await this.sleep(900);
        this.ui.markAsked(target, false);
        return 'miss';
    }

    // ===== Human turn =====

    /** Tap a part in your hand: select it (or ask directly with one robot) */
    cardTap(type) {
        if (this.state !== STATE.SELECT && this.state !== STATE.TARGET) return;
        if (!hasType(this.players[0].hand, type)) return;

        // Tap the selected part again to put it back down
        if (this.state === STATE.TARGET && this.selectedType === type) {
            this.selectedType = null;
            this.state = STATE.SELECT;
            this.ui.setSelected(null);
            this.ui.clearTargets();
            return;
        }

        this.selectedType = type;
        const targets = this.robotTargets();
        if (targets.length === 1 && this.players.length === 2) {
            this.humanAsk(targets[0], type); // only one robot: ask right away
            return;
        }
        this.state = STATE.TARGET;
        this.ui.setSelected(type);
        this.ui.showTargets(targets);
        this.audio.drawCard();
    }

    /** Tap a glowing robot to ask it for the selected part */
    robotTap(i) {
        if (this.state !== STATE.TARGET) return;
        if (!this.robotTargets().includes(i)) return;
        this.humanAsk(i, this.selectedType);
    }

    async humanAsk(target, type) {
        this.state = STATE.BUSY;
        this.selectedType = null;
        this.ui.setSelected(null);
        this.ui.clearTargets();
        this.audio.ask();

        const result = await this.resolveAsk(0, target, type);
        if (result === 'over') return;
        if (result === 'hit') {
            // House rule: a correct ask ends your turn
            await this.sleep(400);
            this.nextTurn();
            return;
        }
        // Miss: go fish
        if (this.pond.length === 0) {
            await this.sleep(500);
            this.nextTurn();
            return;
        }
        this.state = STATE.FISHING;
        this.ui.setTurn(0, true);
    }

    /** Tap the pond to go fish. House rule: drawing ends your turn. */
    async pondTap() {
        if (this.state !== STATE.FISHING) return;
        this.state = STATE.BUSY;
        const { card, rest } = draw(this.pond);
        this.pond = rest;
        this.players[0].hand = addCards(this.players[0].hand, [card]);
        this.ui.flyCards('pond', 0, '🌊', 1);
        this.audio.drawCard();
        await this.sleep(700);
        this.ui.hideBubbles();
        this.render();
        if (await this.scoring.collectSets(0)) return;
        this.nextTurn();
    }

    // ===== Robot turns =====

    /** Robot makes one ask. Hit or miss, its turn ends (house rules). */
    async robotTurn(i) {
        this.state = STATE.ROBOT;
        this.ui.setTurn(i);
        this.ui.hideBubbles();

        const p = this.players[i];
        const choice = p.brain.chooseAsk(p.hand, this.targetsFor(i));
        if (choice === null) { // startTurn gates this, but be safe
            this.nextTurn();
            return;
        }

        await this.sleep(900);
        this.audio.beep();
        const result = await this.resolveAsk(i, choice.target, choice.type);
        if (result === 'over') return;
        if (result === 'hit') {
            await this.sleep(300);
            this.nextTurn();
            return;
        }

        // Miss: robot fishes, then its turn is over
        if (this.pond.length > 0) {
            await this.drawTo(i);
            this.ui.hideBubbles();
            if (await this.scoring.collectSets(i)) return;
        }
        this.nextTurn();
    }

    showHelp() {
        this.ui.showHelp();
    }
}
