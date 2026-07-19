/**
 * Main entry point for Word Safari
 */
import { Game } from './Game.js';

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.init();
});
