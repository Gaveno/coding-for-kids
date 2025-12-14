/**
 * Audio - Sound effects manager for Magic Garden
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

    playSeed() {
        // Soft plop
        this.playTone(150, 0.15, 'triangle');
    }

    playWater() {
        // Splashing
        this.playTone(400, 0.1, 'sine');
        setTimeout(() => this.playTone(350, 0.08, 'sine'), 50);
        setTimeout(() => this.playTone(380, 0.08, 'sine'), 100);
    }

    playSun() {
        // Warm chime
        this.playTone(523, 0.2, 'sine');
        setTimeout(() => this.playTone(659, 0.15, 'sine'), 80);
    }

    playMusic() {
        // Musical note
        this.playTone(440, 0.3, 'sine');
    }

    playMagic() {
        // Sparkle
        const notes = [800, 1000, 1200, 1000];
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.1, 'sine'), i * 50);
        });
    }

    playGrowth() {
        // Ascending tones
        const notes = [262, 330, 392];
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.15, 'sine'), i * 100);
        });
    }

    playSuccess() {
        // Celebration arpeggio
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.2, 'sine'), i * 100);
        });
    }

    playError() {
        // Sad wah wah
        this.playTone(300, 0.2, 'sawtooth');
        setTimeout(() => this.playTone(250, 0.3, 'sawtooth'), 200);
    }

    playAction(action) {
        switch (action) {
            case '🌱': this.playSeed(); break;
            case '💧': this.playWater(); break;
            case '☀️': this.playSun(); break;
            case '🎵': this.playMusic(); break;
            case '✨': this.playMagic(); break;
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}
