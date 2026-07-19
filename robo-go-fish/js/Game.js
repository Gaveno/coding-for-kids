/**
 * Game - Turn state machine and controller for Robo Go Fish
 */
import { buildDeck, shuffle, draw } from './Deck.js';
import { addCards, removeType, hasType } from './Hand.js';
import { Opponent } from './Opponent.js';
import { Scoring } from './Scoring.js';
import { UI } from './UI.js';
import { Audio } from './Audio.js';

const STARTING_HAND = 5;
const STATE = { PLAYER: 'player', FISHING: 'fishing', ROBOT: 'robot', BUSY: 'busy', OVER: 'over' };

export class Game {
    constructor() {
        this.ui = new UI();
        this.audio = new Audio();
        this.scoring = new Scoring(this);
        this.wins = parseInt(localStorage.getItem('robogofish-wins') || '0', 10);
    }

    init() {
        this.ui.onAsk = (type) => this.playerAsk(type);
        this.ui.els.pondBtn.addEventListener('pointerup', () => this.pondTap());
        document.getElementById('helpBtn').addEventListener('pointerup', () => this.ui.showHelp());
        document.getElementById('closeHelpBtn').addEventListener('pointerup', () => this.ui.hideHelp());
        document.getElementById('replayBtn').addEventListener('pointerup', () => this.newGame());
        document.addEventListener('pointerdown', () => this.audio.init(), { once: true });
        this.ui.setWins(this.wins);
        this.newGame();
    }

    newGame() {
        let deck = shuffle(buildDeck());
        this.playerHand = deck.slice(0, STARTING_HAND);
        this.robotHand = deck.slice(STARTING_HAND, STARTING_HAND * 2);
        this.pond = deck.slice(STARTING_HAND * 2);
        this.playerSets = [];
        this.robotSets = [];
        this.opponent = new Opponent();
        this.pendingAsk = null;
        this.state = STATE.PLAYER;
        this.ui.hideGameOver();
        this.ui.hideBubbles();
        this.render();
        this.ui.setTurn('player');
    }

    render() {
        this.ui.renderAll({
            playerHand: this.playerHand,
            robotHandCount: this.robotHand.length,
            pond: this.pond,
            playerSets: this.playerSets,
            robotSets: this.robotSets
        });
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /** Player taps a part type in their hand to ask the robot for it */
    async playerAsk(type) {
        if (this.state !== STATE.PLAYER || !hasType(this.playerHand, type)) return;
        this.state = STATE.BUSY;
        this.audio.ask();
        this.ui.showBubble('player', `${type}❓`);
        this.opponent.rememberAsk(type);
        await this.sleep(800);

        if (hasType(this.robotHand, type)) {
            const { removed, hand } = removeType(this.robotHand, type);
            this.robotHand = hand;
            this.playerHand = addCards(this.playerHand, removed);
            this.ui.flyCards(this.ui.els.robotCards, this.ui.els.playerHand, type, removed.length);
            this.audio.gain();
            await this.sleep(900);
            this.ui.hideBubbles();
            this.render();
            if (await this.scoring.collectSets('player')) return;
            this.startPlayerTurn(); // go again!
        } else {
            this.pendingAsk = type;
            this.ui.showBubble('robot', '🎣');
            this.ui.robotEmote('🤷');
            this.audio.splash();
            if (this.pond.length === 0) {
                await this.sleep(900);
                this.robotTurn();
                return;
            }
            this.state = STATE.FISHING;
            this.ui.setTurn('fishing');
        }
    }

    /** Player taps the pond to go fish */
    async pondTap() {
        if (this.state !== STATE.FISHING) return;
        this.state = STATE.BUSY;
        const { card, rest } = draw(this.pond);
        this.pond = rest;
        this.playerHand = addCards(this.playerHand, [card]);
        this.ui.flyCards(this.ui.els.pondBtn, this.ui.els.playerHand, '🌊', 1);
        this.audio.drawCard();
        await this.sleep(700);
        this.ui.hideBubbles();
        this.render();
        if (await this.scoring.collectSets('player')) return;
        if (card === this.pendingAsk) {
            this.ui.showBubble('player', `${card}❗`);
            this.audio.gain();
            await this.sleep(800);
            this.ui.hideBubbles();
            this.startPlayerTurn(); // lucky catch - go again!
        } else {
            this.robotTurn();
        }
    }

    /** Robot plays until it misses, then hands the turn back */
    async robotTurn() {
        this.state = STATE.ROBOT;
        this.ui.setTurn('robot');
        this.ui.hideBubbles();

        while (this.state === STATE.ROBOT) {
            if (this.robotHand.length === 0) this.drawToRobot();
            const type = this.opponent.chooseAsk(this.robotHand);
            if (type === null) break;
            await this.sleep(1000);
            this.audio.beep();
            this.ui.showBubble('robot', `${type}❓`);
            await this.sleep(1100);

            if (hasType(this.playerHand, type)) {
                const { removed, hand } = removeType(this.playerHand, type);
                this.playerHand = hand;
                this.robotHand = addCards(this.robotHand, removed);
                this.opponent.forget(type);
                this.ui.flyCards(this.ui.els.playerHand, this.ui.els.robotCards, type, removed.length);
                this.audio.gain();
                await this.sleep(900);
                this.ui.hideBubbles();
                this.render();
                if (await this.scoring.collectSets('robot')) return;
            } else {
                this.opponent.forget(type);
                this.ui.showBubble('player', '🎣');
                this.audio.splash();
                await this.sleep(900);
                this.drawToRobot();
                this.ui.hideBubbles();
                this.render();
                if (await this.scoring.collectSets('robot')) return;
                break;
            }
        }
        this.startPlayerTurn();
    }

    drawToRobot() {
        const { card, rest } = draw(this.pond);
        this.pond = rest;
        if (card !== null) {
            this.robotHand = addCards(this.robotHand, [card]);
            this.ui.flyCards(this.ui.els.pondBtn, this.ui.els.robotCards, '🌊', 1);
        }
    }

    async startPlayerTurn() {
        if (this.scoring.maybeGameOver()) return;
        if (this.playerHand.length === 0) {
            const { card, rest } = draw(this.pond);
            this.pond = rest;
            if (card !== null) this.playerHand = addCards(this.playerHand, [card]);
            this.render();
            if (await this.scoring.collectSets('player')) return;
            if (this.playerHand.length === 0) { this.robotTurn(); return; }
        }
        this.state = STATE.PLAYER;
        this.ui.setTurn('player');
        this.render();
    }

    showHelp() {
        this.ui.showHelp();
    }
}
