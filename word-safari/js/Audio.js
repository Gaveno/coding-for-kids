/**
 * Audio - Sound effects manager for Word Safari
 */
export class Audio {
    constructor() {
        this.enabled = true;
        this.context = null;
    }

    init() {
        if (this.context) {
            this.resume();
            return;
        }
        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            this.resume();
        } catch (e) {
            console.warn('Web Audio not supported');
            this.enabled = false;
        }
    }

    /** iOS Safari starts (and re-suspends) contexts in 'suspended' state */
    resume() {
        try {
            if (this.context && this.context.state === 'suspended') {
                this.context.resume();
            }
        } catch (e) {
            // Ignore
        }
    }

    playTone(frequency, duration = 0.1, type = 'sine', delay = 0) {
        if (!this.enabled || !this.context) return;
        this.resume();
        try {
            const oscillator = this.context.createOscillator();
            const gainNode = this.context.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(this.context.destination);
            oscillator.frequency.value = frequency;
            oscillator.type = type;
            const start = this.context.currentTime + delay;
            gainNode.gain.setValueAtTime(0.22, start);
            gainNode.gain.exponentialRampToValueAtTime(0.01, start + duration);
            oscillator.start(start);
            oscillator.stop(start + duration);
        } catch (e) {
            // Ignore audio errors
        }
    }

    /** Tap a letter key */
    key() {
        this.playTone(500, 0.06, 'triangle');
    }

    /** Erase a letter */
    erase() {
        this.playTone(320, 0.08, 'triangle');
    }

    /** Correct answer - happy chime */
    correct() {
        this.playTone(523, 0.12, 'sine');
        this.playTone(659, 0.12, 'sine', 0.1);
        this.playTone(784, 0.2, 'sine', 0.2);
    }

    /** Wrong answer - gentle, not scary */
    wrong() {
        this.playTone(280, 0.15, 'sine');
        this.playTone(220, 0.2, 'sine', 0.12);
    }

    /** New level appears */
    pop() {
        this.playTone(440, 0.08, 'triangle');
        this.playTone(587, 0.1, 'triangle', 0.07);
    }

    /** Finished every level - big fanfare */
    win() {
        [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => {
            this.playTone(f, 0.16, 'sine', i * 0.12);
        });
    }
}
