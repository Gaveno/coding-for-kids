/**
 * VisualizerManager.js - Manages mode-specific visualizers
 */
class VisualizerManager {
    constructor(stageEl) {
        this.stage = stageEl;
        this.currentMode = null;
        this.visualizer = null;
    }
    
    /**
     * Set visualizer mode
     * @param {string} mode - Mode name ('kid', 'tween', 'studio')
     */
    setMode(mode) {
        // Cleanup old visualizer
        if (this.visualizer) {
            if (this.visualizer.destroy) {
                this.visualizer.destroy();
            } else if (this.visualizer.reset) {
                this.visualizer.reset();
            }
            this.visualizer = null;
        }
        
        // Clear stage
        this.stage.innerHTML = '';
        
        // Create new visualizer based on mode
        switch(mode) {
            case 'kid':
                this.visualizer = this.createKidModeVisualizer();
                break;
            case 'tween':
                this.visualizer = new TweenVisualizer(this.stage);
                break;
            case 'studio':
                this.visualizer = new StudioVisualizer(this.stage);
                break;
            default:
                console.warn('Unknown mode:', mode);
        }
        
        this.currentMode = mode;
    }
    
    /**
     * Create Kid Mode character visualizer
     */
    createKidModeVisualizer() {
        // Create character elements
        const mainChar = this.createCharacterElement('🐱', 'main');
        const leftChar = this.createCharacterElement('🐶', 'backup left');
        const rightChar = this.createCharacterElement('🐰', 'backup right');
        
        // Create characters container
        const container = document.createElement('div');
        container.className = 'characters';
        container.appendChild(leftChar);
        container.appendChild(mainChar);
        container.appendChild(rightChar);
        this.stage.appendChild(container);
        
        // Create stage floor
        const floor = document.createElement('div');
        floor.className = 'stage-floor';
        this.stage.appendChild(floor);
        
        // Return Character instance
        return new Character(mainChar, leftChar, rightChar);
    }
    
    /**
     * Create character element
     */
    createCharacterElement(emoji, className) {
        const el = document.createElement('div');
        el.className = `character ${className}`;
        el.textContent = emoji;
        return el;
    }
    
    /**
     * Handle note play event
     * @param {number} note - Note number (1-12)
     * @param {number} trackNum - Track number (1-3)
     * @param {number} octave - Octave (2-6)
     * @param {number} velocity - Volume (0.0-1.0)
     * @param {number} duration - Note duration in beats
     */
    onNotePlay(note, trackNum, octave, velocity, duration) {
        if (!this.visualizer) return;
        
        if (this.currentMode === 'kid') {
            // Map track to Character.dance() format
            const playing = {
                melody: trackNum === 1,
                bass: trackNum === 2,
                percussion: trackNum === 3
            };
            const durations = {
                melody: trackNum === 1 ? duration : 1,
                bass: trackNum === 2 ? duration : 1,
                percussion: 1
            };
            this.visualizer.dance(playing, durations);
        } else if (this.currentMode === 'tween') {
            this.visualizer.burstParticles(note, trackNum, octave, velocity);
        } else if (this.currentMode === 'studio') {
            this.visualizer.onNotePlay(note, trackNum, octave, velocity);
        }
    }
    
    /**
     * Play celebration animation
     */
    celebrate() {
        if (this.visualizer && this.visualizer.celebrate) {
            this.visualizer.celebrate();
        }
    }
    
    /**
     * Reset visualizer
     */
    reset() {
        if (this.visualizer && this.visualizer.reset) {
            this.visualizer.reset();
        }
    }
    
    /**
     * Cleanup
     */
    destroy() {
        if (this.visualizer && this.visualizer.destroy) {
            this.visualizer.destroy();
        }
        this.visualizer = null;
    }
}
