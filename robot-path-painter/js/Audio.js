/**
 * Audio class - Handles sound effects using Web Audio API
 * Single responsibility: Generate and play game sounds
 */
export class Audio {
    constructor() {
        this.enabled = true;
        this.context = null;
    }

    /**
     * Initialize audio context (must be called after user interaction)
     */
    init() {
        if (!this.context) {
            try {
                this.context = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                this.enabled = false;
            }
        }
    }

    /**
     * Play a sound effect
     * @param {string} type - Sound type: 'click', 'move', 'paint', 'success', 'error', 'clear', 'save', 'incomplete'
     */
    play(type) {
        if (!this.enabled) return;
        
        // Initialize context on first play (after user gesture)
        this.init();
        if (!this.context) return;

        try {
            const oscillator = this.context.createOscillator();
            const gainNode = this.context.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.context.destination);

            const sound = this.getSoundConfig(type);
            oscillator.frequency.value = sound.freq;
            oscillator.type = sound.type;

            gainNode.gain.setValueAtTime(0.3, this.context.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(
                0.01,
                this.context.currentTime + sound.duration
            );

            oscillator.start(this.context.currentTime);
            oscillator.stop(this.context.currentTime + sound.duration);
        } catch (e) {
            // Audio playback failed, fail silently
        }
    }

    /**
     * Get sound configuration for a sound type
     * @param {string} type - Sound type
     * @returns {object} { freq, duration, type }
     */
    getSoundConfig(type) {
        const sounds = {
            'click': { freq: 600, duration: 0.1, type: 'sine' },
            'move': { freq: 400, duration: 0.15, type: 'sine' },
            'paint': { freq: 800, duration: 0.1, type: 'sine' },
            'success': { freq: 523, duration: 0.3, type: 'sine' },
            'error': { freq: 200, duration: 0.3, type: 'sawtooth' },
            'clear': { freq: 300, duration: 0.2, type: 'triangle' },
            'save': { freq: 700, duration: 0.2, type: 'sine' },
            'incomplete': { freq: 350, duration: 0.4, type: 'sine' }
        };

        return sounds[type] || sounds.click;
    }

    /**
     * Toggle audio on/off
     * @returns {boolean} New enabled state
     */
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    /**
     * Play success melody (multiple notes)
     */
    playSuccessMelody() {
        if (!this.enabled) return;
        this.init();
        if (!this.context) return;

        const notes = [523, 659, 784]; // C, E, G
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.playNote(freq, 0.2);
            }, i * 150);
        });
    }

    /**
     * Play a single note
     * @param {number} freq - Frequency in Hz
     * @param {number} duration - Duration in seconds
     */
    playNote(freq, duration) {
        if (!this.context) return;

        try {
            const oscillator = this.context.createOscillator();
            const gainNode = this.context.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.context.destination);

            oscillator.frequency.value = freq;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, this.context.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(
                0.01,
                this.context.currentTime + duration
            );

            oscillator.start(this.context.currentTime);
            oscillator.stop(this.context.currentTime + duration);
        } catch (e) {
            // Fail silently
        }
    }
}
