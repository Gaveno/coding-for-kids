/**
 * Scoring - Set collection, game-over detection, and end-of-game flow.
 * Operates on the Game instance to keep Game.js focused on turn flow.
 */
import { PART_TYPES } from './Deck.js';
import { completedSets, extractSet } from './Hand.js';

/** With an empty pond, this many turns without progress ends the game */
const STALL_LIMIT_PER_PLAYER = 8;

export class Scoring {
    /** @param {import('./Game.js').Game} game */
    constructor(game) {
        this.game = game;
    }

    /** Move any completed sets onto player i's robot. Returns true if game ended. */
    async collectSets(i) {
        const g = this.game;
        const p = g.players[i];
        for (const type of completedSets(p.hand)) {
            p.hand = extractSet(p.hand, type);
            p.sets.push(type);
            // A finished set is public: no robot should hunt that part anymore
            g.players.forEach(q => {
                if (q.isRobot) q.brain.forgetType(type);
            });
            g.staleTurns = 0;
            g.audio.chime();
            g.ui.celebrateSet(i, type);
            if (p.isRobot) g.ui.robotEmote(i, '🥳');
            g.render();
            await g.sleep(900);
        }
        return this.maybeGameOver();
    }

    /**
     * Check end conditions; runs the game-over flow if met.
     * House rules: play continues until every match is made and the pond
     * is empty. Most matches wins.
     */
    maybeGameOver() {
        const g = this.game;
        if (g.players.length === 0) return false;
        const claimed = g.players.reduce((n, p) => n + p.sets.length, 0);
        const allClaimed = claimed === PART_TYPES.length;
        // Safety nets: nobody left to trade with, or no progress in ages
        const withCards = g.players.filter(p => p.hand.length > 0).length;
        const exhausted = g.pond.length === 0 && withCards <= 1;
        const stalled = g.pond.length === 0 &&
            g.staleTurns > g.players.length * STALL_LIMIT_PER_PLAYER;
        if (!allClaimed && !exhausted && !stalled) return false;
        this.endGame();
        return true;
    }

    async endGame() {
        const g = this.game;
        g.state = 'over';
        g.ui.setTurn(null);
        const best = Math.max(...g.players.map(p => p.sets.length));
        const playerWon = g.players[0].sets.length === best;
        if (playerWon) {
            g.wins += 1;
            localStorage.setItem('robogofish-wins', String(g.wins));
            g.ui.setWins(g.wins);
            g.audio.win();
        } else {
            g.audio.lose();
        }
        g.players.forEach((p, i) => {
            if (p.isRobot) g.ui.robotEmote(i, p.sets.length === best ? '🥳' : '👏', 2500);
        });
        await g.sleep(1200);
        g.ui.showGameOver(playerWon, g.players, best);
    }
}
