/**
 * Audio - Sound effects manager
 */
export class Audio {
    constructor() {
        this.enabled = true;
        this.context = null;
    }

    init() {
        if (this.context) return;
        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio not supported');
            this.enabled = false;
        }
    }

    playTone(frequency, duration = 0.1, type = 'sine') {
        if (!this.enabled || !this.context) return;
        
        try {
            const oscillator = this.context.createOscillator();
            const gainNode = this.context.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.context.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(0.3, this.context.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);
            
            oscillator.start(this.context.currentTime);
            oscillator.stop(this.context.currentTime + duration);
        } catch (e) {
            // Ignore audio errors
        }
    }

    playGrab() {
        this.playTone(440, 0.1, 'square');
    }

    playDrop() {
        this.playTone(220, 0.15, 'triangle');
    }

    playMove() {
        this.playTone(330, 0.05, 'sine');
    }

    playSuccess() {
        // Play ascending arpeggio
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.2, 'sine'), i * 100);
        });
    }

    playError() {
        this.playTone(200, 0.3, 'sawtooth');
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}
