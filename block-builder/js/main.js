/**
 * Main entry point for Block Builder
 */
import { Game } from './Game.js';

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.init();
    
    // Show help on first visit
    if (!localStorage.getItem('blockbuilder-visited')) {
        localStorage.setItem('blockbuilder-visited', 'true');
        setTimeout(() => game.showHelp(), 500);
    }
});
