/**
 * main.js - Entry point for Music Box Composer
 */
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.init();
    
    // Expose for debugging
    window.game = game;
});
