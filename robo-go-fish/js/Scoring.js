/**
 * Scoring - Set collection, game-over detection, and end-of-game flow.
 * Operates on the Game instance to keep Game.js focused on turn flow.
 */
import { PART_TYPES } from './Deck.js';
import { completedSets, extractSet } from './Hand.js';

export class Scoring {
    /** @param {import('./Game.js').Game} game */
    constructor(game) {
        this.game = game;
    }

    /** Move any completed sets onto the chassis. Returns true if game ended. */
    async collectSets(who) {
        const g = this.game;
        const hand = who === 'player' ? g.playerHand : g.robotHand;
        const sets = who === 'player' ? g.playerSets : g.robotSets;
        for (const type of completedSets(hand)) {
            if (who === 'player') g.playerHand = extractSet(g.playerHand, type);
            else g.robotHand = extractSet(g.robotHand, type);
            sets.push(type);
            g.audio.chime();
            g.ui.celebrateSet(who, type);
            if (who === 'robot') g.ui.robotEmote('🥳');
            g.render();
            await g.sleep(900);
        }
        return this.maybeGameOver();
    }

    /** Check end conditions; runs the game-over flow if met. */
    maybeGameOver() {
        const g = this.game;
        const allClaimed = g.playerSets.length + g.robotSets.length === PART_TYPES.length;
        const exhausted = g.pond.length === 0 &&
            g.playerHand.length === 0 && g.robotHand.length === 0;
        if (!allClaimed && !exhausted) return false;
        this.endGame();
        return true;
    }

    async endGame() {
        const g = this.game;
        g.state = 'over';
        g.ui.setTurn(null);
        const playerWon = g.playerSets.length >= g.robotSets.length;
        if (playerWon) {
            g.wins += 1;
            localStorage.setItem('robogofish-wins', String(g.wins));
            g.ui.setWins(g.wins);
            g.audio.win();
        } else {
            g.audio.lose();
        }
        g.ui.robotEmote(playerWon ? '👏' : '🥳', 2500);
        await g.sleep(1200);
        g.ui.showGameOver(playerWon, g.playerSets, g.robotSets);
    }
}
