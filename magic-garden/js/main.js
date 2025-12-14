/**
 * Main entry point for Magic Garden
 */
import { Game } from './Game.js';

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.init();
    
    // Show help on first visit
    if (!localStorage.getItem('magicgarden-visited')) {
        localStorage.setItem('magicgarden-visited', 'true');
        setTimeout(() => game.showHelp(), 500);
    }
});
