/**
 * Audio.js - Web Audio API wrapper for playing musical notes
 */
class Audio {
    constructor() {
        this.audioContext = null;
        this.isInitialized = false;
        
        // Note frequencies (Hz)
        this.frequencies = {
            'C4': 261.63,
            'D4': 293.66,
            'E4': 329.63,
            'F4': 349.23,
            'G4': 392.00,
            'A4': 440.00,
            'B4': 493.88
        };
    }

    /**
     * Initialize the audio context (must be called after user interaction)
     */
    init() {
        if (this.isInitialized) return;
        
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.isInitialized = true;
    }

    /**
     * Play a musical note
     * @param {string} note - Note name (e.g., 'C4', 'D4')
     * @param {number} duration - Duration in seconds
     */
    playNote(note, duration = 0.3) {
        if (!this.isInitialized) {
            this.init();
        }

        const frequency = this.frequencies[note];
        if (!frequency) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Use a softer waveform for child-friendly sound
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

        // Envelope for smooth sound
        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.5, now + 0.05); // Attack
        gainNode.gain.linearRampToValueAtTime(0.3, now + duration * 0.5); // Decay
        gainNode.gain.linearRampToValueAtTime(0, now + duration); // Release

        oscillator.start(now);
        oscillator.stop(now + duration);
    }

    /**
     * Play a success sound
     */
    playSuccess() {
        if (!this.isInitialized) {
            this.init();
        }

        const notes = ['C4', 'E4', 'G4'];
        notes.forEach((note, index) => {
            setTimeout(() => this.playNote(note, 0.2), index * 100);
        });
    }
}

// Export for use in other modules
window.Audio = Audio;
