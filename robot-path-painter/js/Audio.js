/**
 * Audio - Sound effects helper
 */
export class Audio {
    constructor() {
        this.enabled = true;
        this.context = null;
    }

    init() {
        if (!this.context) {
            try {
                this.context = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                this.enabled = false;
            }
        }
    }

    play(type) {
        if (!this.enabled) return;
        this.init();
        if (!this.context) return;

        try {
            const oscillator = this.context.createOscillator();
            const gainNode = this.context.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(this.context.destination);

            const sounds = {
                'click': { freq: 600, duration: 0.1, type: 'sine' },
                'move': { freq: 400, duration: 0.15, type: 'sine' },
                'paint': { freq: 800, duration: 0.1, type: 'sine' },
                'success': { freq: 523, duration: 0.3, type: 'sine' },
                'error': { freq: 200, duration: 0.3, type: 'sawtooth' },
                'clear': { freq: 300, duration: 0.2, type: 'triangle' },
                'save': { freq: 700, duration: 0.2, type: 'sine' },
                'incomplete': { freq: 350, duration: 0.4, type: 'sine' },
                'fire': { freq: 150, duration: 0.2, type: 'sawtooth' },
                'explosion': { freq: 80, duration: 0.4, type: 'square' }
            };

            const sound = sounds[type] || sounds.click;
            oscillator.frequency.value = sound.freq;
            oscillator.type = sound.type;
            gainNode.gain.setValueAtTime(0.3, this.context.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + sound.duration);
            oscillator.start(this.context.currentTime);
            oscillator.stop(this.context.currentTime + sound.duration);
        } catch (e) {
            // Silently fail
        }
    }

    playSuccessMelody() {
        if (!this.enabled) return;
        this.init();
        if (!this.context) return;
        [523, 659, 784].forEach((freq, i) => {
            setTimeout(() => this.playNote(freq, 0.2), i * 150);
        });
    }

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
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);
            oscillator.start(this.context.currentTime);
            oscillator.stop(this.context.currentTime + duration);
        } catch (e) {
            // Silently fail
        }
    }
}
