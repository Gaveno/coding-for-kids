/**
 * Audio.js - Web Audio API wrapper for multi-track music
 * Supports melody notes, bass notes, and percussion sounds
 */
class Audio {
    constructor() {
        this.audioContext = null;
        this.isInitialized = false;
        
        // Melody frequencies (Hz) - C4 to B5 range
        this.melodyFrequencies = {
            'C4': 261.63,
            'D4': 293.66,
            'E4': 329.63,
            'F4': 349.23,
            'G4': 392.00,
            'A4': 440.00,
            'B4': 493.88,
            'C5': 523.25,
            'D5': 587.33,
            'E5': 659.25,
            'F5': 698.46,
            'G5': 783.99,
            'A5': 880.00,
            'B5': 987.77
        };
        
        // Bass frequencies (Hz) - Lower octave
        this.bassFrequencies = {
            'C2': 65.41,
            'D2': 73.42,
            'E2': 82.41,
            'F2': 87.31,
            'G2': 98.00,
            'A2': 110.00,
            'B2': 123.47,
            'C3': 130.81,
            'D3': 146.83,
            'E3': 164.81,
            'F3': 174.61,
            'G3': 196.00,
            'A3': 220.00,
            'B3': 246.94
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
     * Play a melody note
     * @param {string} note - Note name (e.g., 'C5', 'D5')
     * @param {number} duration - Duration in seconds
     */
    playMelody(note, duration = 0.25) {
        if (!this.isInitialized) this.init();
        
        const frequency = this.melodyFrequencies[note];
        if (!frequency) return;
        
        this.playTone(frequency, 'sine', duration, 0.4);
    }

    /**
     * Play a bass note
     * @param {string} note - Note name (e.g., 'C3', 'D3')
     * @param {number} duration - Duration in seconds
     */
    playBass(note, duration = 0.3) {
        if (!this.isInitialized) this.init();
        
        const frequency = this.bassFrequencies[note];
        if (!frequency) return;
        
        this.playTone(frequency, 'triangle', duration, 0.5);
    }

    /**
     * Play a percussion sound
     * @param {string} type - Percussion type (kick, snare, hihat, clap)
     */
    playPercussion(type) {
        if (!this.isInitialized) this.init();
        
        switch (type) {
            case 'kick':
                this.playKick();
                break;
            case 'snare':
                this.playSnare();
                break;
            case 'hihat':
                this.playHihat();
                break;
            case 'clap':
                this.playClap();
                break;
        }
    }

    /**
     * Play a tone with specified parameters
     */
    playTone(frequency, waveform, duration, volume) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.type = waveform;
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(volume, now + 0.02);
        gainNode.gain.linearRampToValueAtTime(volume * 0.7, now + duration * 0.5);
        gainNode.gain.linearRampToValueAtTime(0, now + duration);

        oscillator.start(now);
        oscillator.stop(now + duration);
    }

    /**
     * Play kick drum sound
     */
    playKick() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        const now = this.audioContext.currentTime;
        
        oscillator.frequency.setValueAtTime(150, now);
        oscillator.frequency.exponentialRampToValueAtTime(40, now + 0.1);
        
        gainNode.gain.setValueAtTime(0.8, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        oscillator.start(now);
        oscillator.stop(now + 0.3);
    }

    /**
     * Play snare drum sound
     */
    playSnare() {
        // Noise component
        const bufferSize = this.audioContext.sampleRate * 0.15;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;
        
        const noiseFilter = this.audioContext.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.value = 1000;
        
        const noiseGain = this.audioContext.createGain();
        const now = this.audioContext.currentTime;
        noiseGain.gain.setValueAtTime(0.5, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.audioContext.destination);
        
        noise.start(now);
        
        // Tone component
        const oscillator = this.audioContext.createOscillator();
        const oscGain = this.audioContext.createGain();
        
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(180, now);
        oscillator.frequency.exponentialRampToValueAtTime(80, now + 0.05);
        
        oscGain.gain.setValueAtTime(0.4, now);
        oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        
        oscillator.connect(oscGain);
        oscGain.connect(this.audioContext.destination);
        
        oscillator.start(now);
        oscillator.stop(now + 0.15);
    }

    /**
     * Play hi-hat sound
     */
    playHihat() {
        const bufferSize = this.audioContext.sampleRate * 0.08;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;
        
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 7000;
        
        const gainNode = this.audioContext.createGain();
        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        
        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        noise.start(now);
    }

    /**
     * Play clap sound
     */
    playClap() {
        const now = this.audioContext.currentTime;
        
        // Multiple short noise bursts for clap texture
        for (let i = 0; i < 3; i++) {
            const bufferSize = this.audioContext.sampleRate * 0.02;
            const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
            const data = buffer.getChannelData(0);
            
            for (let j = 0; j < bufferSize; j++) {
                data[j] = Math.random() * 2 - 1;
            }
            
            const noise = this.audioContext.createBufferSource();
            noise.buffer = buffer;
            
            const filter = this.audioContext.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 2000;
            filter.Q.value = 1;
            
            const gainNode = this.audioContext.createGain();
            const startTime = now + i * 0.01;
            gainNode.gain.setValueAtTime(0.4, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);
            
            noise.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            noise.start(startTime);
        }
    }

    /**
     * Play a note based on type
     * @param {string} note - Note name or percussion type
     * @param {string} type - 'melody', 'bass', or 'percussion'
     * @param {number} duration - Duration in seconds (optional)
     */
    playNote(note, type, duration) {
        switch (type) {
            case 'melody':
                this.playMelody(note, duration);
                break;
            case 'bass':
                this.playBass(note, duration);
                break;
            case 'percussion':
                this.playPercussion(note);
                break;
        }
    }

    /**
     * Play success sound
     */
    playSuccess() {
        if (!this.isInitialized) this.init();
        
        const notes = ['C5', 'E5', 'G5'];
        notes.forEach((note, i) => {
            setTimeout(() => this.playMelody(note, 0.15), i * 80);
        });
    }
}

window.Audio = Audio;
