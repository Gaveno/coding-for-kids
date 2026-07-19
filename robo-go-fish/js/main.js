/**
 * Main entry point for Robo Go Fish
 */
import { Game } from './Game.js';

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.init();

    // Show help on first visit
    if (!localStorage.getItem('robogofish-visited')) {
        localStorage.setItem('robogofish-visited', 'true');
        setTimeout(() => game.showHelp(), 500);
    }
});
