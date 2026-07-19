/**
 * Audio - Sound effects manager for Robo Go Fish
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

    playTone(frequency, duration = 0.1, type = 'sine', delay = 0) {
        if (!this.enabled || !this.context) return;
        try {
            const oscillator = this.context.createOscillator();
            const gainNode = this.context.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(this.context.destination);
            oscillator.frequency.value = frequency;
            oscillator.type = type;
            const start = this.context.currentTime + delay;
            gainNode.gain.setValueAtTime(0.25, start);
            gainNode.gain.exponentialRampToValueAtTime(0.01, start + duration);
            oscillator.start(start);
            oscillator.stop(start + duration);
        } catch (e) {
            // Ignore audio errors
        }
    }

    /** Player taps a card type to ask */
    ask() {
        this.playTone(520, 0.1, 'triangle');
        this.playTone(660, 0.12, 'triangle', 0.1);
    }

    /** Cards handed over */
    gain() {
        this.playTone(440, 0.08, 'sine');
        this.playTone(550, 0.08, 'sine', 0.08);
        this.playTone(660, 0.12, 'sine', 0.16);
    }

    /** Go fish! Watery splash-ish descending tone */
    splash() {
        this.playTone(400, 0.15, 'sine');
        this.playTone(300, 0.2, 'sine', 0.1);
    }

    /** Drew a card from the pond */
    drawCard() {
        this.playTone(350, 0.08, 'triangle');
    }

    /** Completed a set - happy chime */
    chime() {
        this.playTone(523, 0.12, 'sine');
        this.playTone(659, 0.12, 'sine', 0.1);
        this.playTone(784, 0.12, 'sine', 0.2);
        this.playTone(1047, 0.25, 'sine', 0.3);
    }

    /** Robot's turn beep-boop */
    beep() {
        this.playTone(300, 0.08, 'square');
        this.playTone(420, 0.08, 'square', 0.12);
    }

    /** Victory fanfare */
    win() {
        [523, 659, 784, 1047, 784, 1047].forEach((f, i) => {
            this.playTone(f, 0.15, 'sine', i * 0.12);
        });
    }

    /** Robot won - gentle, encouraging */
    lose() {
        this.playTone(392, 0.2, 'sine');
        this.playTone(330, 0.25, 'sine', 0.2);
        this.playTone(392, 0.3, 'sine', 0.45);
    }
}
