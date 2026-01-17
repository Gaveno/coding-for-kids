/**
 * Audio.js - Web Audio API wrapper for multi-track music
 * Supports piano notes with octave transposition and percussion sounds
 */
class Audio {
    constructor() {
        this.audioContext = null;
        this.isInitialized = false;
        
        // Waveform settings per track (for Studio Mode)
        this.trackWaveforms = {
            1: 'sine',      // High piano
            2: 'triangle',  // Low piano
            3: null         // Percussion (N/A)
        };
        
        // Effects state (for Studio Mode)
        this.effectsEnabled = {
            reverb: [false, false, false], // Per track
            delay: [false, false, false]   // Per track
        };
        
        // Note to frequency mapping (A4 = 440 Hz)
        this.noteFrequencies = {
            'C': 261.63,
            'C#': 277.18,
            'D': 293.66,
            'D#': 311.13,
            'E': 329.63,
            'F': 349.23,
            'F#': 369.99,
            'G': 392.00,
            'G#': 415.30,
            'A': 440.00,
            'A#': 466.16,
            'B': 493.88
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
     * Get octave for a track number
     * @param {number} trackNumber - Track number (1 = high piano, 2 = low piano, 3 = percussion)
     * @returns {number|null} - Octave number or null for percussion
     */
    getOctaveForTrack(trackNumber) {
        if (trackNumber === 1) return 5; // High piano
        if (trackNumber === 2) return 3; // Low piano
        return null; // Percussion (no octave)
    }

    /**
     * Calculate frequency for note with octave
     * @param {string} note - Note name (e.g., 'C', 'D#')
     * @param {number} octave - Octave number (e.g., 3, 5)
     * @returns {number} - Frequency in Hz
     */
    noteToFrequency(note, octave) {
        const baseFreq = this.noteFrequencies[note];
        if (!baseFreq) return 0;
        
        // Base frequencies are at octave 4
        // Each octave doubles the frequency
        const octaveDiff = octave - 4;
        return baseFreq * Math.pow(2, octaveDiff);
    }

    /**
     * Play a piano note with octave transposition
     * @param {string} note - Note name (e.g., 'C', 'D#')
     * @param {number} trackNumber - Track number (1 or 2)
     * @param {number} duration - Duration in seconds
     * @param {number} velocity - Note velocity 0.0-1.0 (default 0.8)
     * @param {number|null} octave - Optional octave override (null = use track default)
     */
    playPianoNote(note, trackNumber, duration = 0.25, velocity = 0.8, octave = null) {
        if (!this.isInitialized) this.init();
        
        // Use provided octave or fall back to track default
        const finalOctave = octave !== null ? octave : this.getOctaveForTrack(trackNumber);
        if (finalOctave === null) return;
        
        const frequency = this.noteToFrequency(note, finalOctave);
        if (!frequency) return;
        
        // Use different waveforms for different tracks (can be overridden in Studio Mode)
        const waveform = this.trackWaveforms[trackNumber] || (trackNumber === 1 ? 'sine' : 'triangle');
        const baseVolume = trackNumber === 1 ? 0.4 : 0.5;
        
        this.playTone(frequency, waveform, duration, baseVolume * velocity);
    }

    /**
     * Play a percussion sound
     * @param {string} type - Percussion type (kick, snare, hihat, clap)
     * @param {number} velocity - Note velocity 0.0-1.0 (default 0.8)
     */
    playPercussion(type, velocity = 0.8) {
        if (!this.isInitialized) this.init();
        
        switch (type) {
            case 'kick':
                this.playKick(velocity);
                break;
            case 'snare':
                this.playSnare(velocity);
                break;
            case 'hihat':
                this.playHihat(velocity);
                break;
            case 'clap':
                this.playClap(velocity);
                break;
            case 'tom':
                this.playTom(velocity);
                break;
            case 'cymbal':
                this.playCymbal(velocity);
                break;
            case 'shaker':
                this.playShaker(velocity);
                break;
            case 'cowbell':
                this.playCowbell(velocity);
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
     * @param {number} velocity - Note velocity 0.0-1.0 (default 0.8)
     */
    playKick(velocity = 0.8) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        const now = this.audioContext.currentTime;
        
        oscillator.frequency.setValueAtTime(150, now);
        oscillator.frequency.exponentialRampToValueAtTime(40, now + 0.1);
        
        gainNode.gain.setValueAtTime(0.8 * velocity, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        oscillator.start(now);
        oscillator.stop(now + 0.3);
    }

    /**
     * Play snare drum sound
     * @param {number} velocity - Note velocity 0.0-1.0 (default 0.8)
     */
    playSnare(velocity = 0.8) {
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
        noiseGain.gain.setValueAtTime(0.5 * velocity, now);
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
        
        oscGain.gain.setValueAtTime(0.4 * velocity, now);
        oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        
        oscillator.connect(oscGain);
        oscGain.connect(this.audioContext.destination);
        
        oscillator.start(now);
        oscillator.stop(now + 0.15);
    }

    /**
     * Play hi-hat sound
     * @param {number} velocity - Note velocity 0.0-1.0 (default 0.8)
     */
    playHihat(velocity = 0.8) {
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
        gainNode.gain.setValueAtTime(0.3 * velocity, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        
        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        noise.start(now);
    }

    /**
     * Play clap sound
     * @param {number} velocity - Note velocity 0.0-1.0 (default 0.8)
     */
    playClap(velocity = 0.8) {
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
            gainNode.gain.setValueAtTime(0.4 * velocity, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);
            
            noise.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            noise.start(startTime);
        }
    }

    /**
     * Play tom drum sound
     * @param {number} velocity - Note velocity 0.0-1.0 (default 0.8)
     */
    playTom(velocity = 0.8) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        const now = this.audioContext.currentTime;
        
        oscillator.frequency.setValueAtTime(120, now);
        oscillator.frequency.exponentialRampToValueAtTime(60, now + 0.2);
        
        gainNode.gain.setValueAtTime(0.7 * velocity, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

        oscillator.start(now);
        oscillator.stop(now + 0.4);
    }

    /**
     * Play cymbal sound
     * @param {number} velocity - Note velocity 0.0-1.0 (default 0.8)
     */
    playCymbal(velocity = 0.8) {
        const bufferSize = this.audioContext.sampleRate * 0.5;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;
        
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 5000;
        
        const gainNode = this.audioContext.createGain();
        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(0.2 * velocity, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        
        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        noise.start(now);
    }

    /**
     * Play shaker sound
     * @param {number} velocity - Note velocity 0.0-1.0 (default 0.8)
     */
    playShaker(velocity = 0.8) {
        const bufferSize = this.audioContext.sampleRate * 0.06;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;
        
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 8000;
        
        const gainNode = this.audioContext.createGain();
        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(0.15 * velocity, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
        
        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        noise.start(now);
    }

    /**
     * Play cowbell sound
     * @param {number} velocity - Note velocity 0.0-1.0 (default 0.8)
     */
    playCowbell(velocity = 0.8) {
        const oscillator1 = this.audioContext.createOscillator();
        const oscillator2 = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        const now = this.audioContext.currentTime;
        
        oscillator1.type = 'square';
        oscillator2.type = 'square';
        oscillator1.frequency.setValueAtTime(800, now);
        oscillator2.frequency.setValueAtTime(540, now);
        
        gainNode.gain.setValueAtTime(0.3 * velocity, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
 @param {number|null} octave - Optional octave for piano notes (null = use track default)
     */
    playNote(note, trackNumber, duration, velocity = 0.8, octave = null) {
        if (trackNumber === 3) {
            // Percussion track
            this.playPercussion(note, velocity);
        } else {
            // Piano tracks (1 or 2) - pass octave through
            this.playPianoNote(note, trackNumber, duration, velocity, octave);
        }
    }
    
    /**
     * Set waveform for a track (Studio Mode feature)
     * @param {number} trackNumber - Track number (1 or 2)
     * @param {string} waveform - Waveform type: 'sine', 'triangle', 'square', 'sawtooth'
     */
    setTrackWaveform(trackNumber, waveform) {
        if (trackNumber >= 1 && trackNumber <= 2) {
            this.trackWaveforms[trackNumber] = waveform;
        }
    }
    
    /**
     * Get current waveform for a track
     * @param {number} trackNumber - Track number
     * @returns {string} - Waveform type
     */
    getTrackWaveform(trackNumber) {
        return this.trackWaveforms[trackNumber] || 'sine';ay a note based on track number and note data
     * @param {string} note - Note name or percussion type
     * @param {number} trackNumber - Track number (1 = high piano, 2 = low piano, 3 = percussion)
     * @param {number} duration - Duration in seconds (optional)
     * @param {number} velocity - Note velocity 0.0-1.0 (default 0.8)
     */
    playNote(note, trackNumber, duration, velocity = 0.8) {
        if (trackNumber === 3) {
            // Percussion track
            this.playPercussion(note, velocity);
        } else {
            // Piano tracks (1 or 2)
            this.playPianoNote(note, trackNumber, duration, velocity);
        }
    }

    /**
     * Play success sound
     */
    playSuccess() {
        if (!this.isInitialized) this.init();
        
        const notes = ['C', 'E', 'G'];
        const octave = 5;
        notes.forEach((note, i) => {
            setTimeout(() => {
                const freq = this.noteToFrequency(note, octave);
                this.playTone(freq, 'sine', 0.15, 0.4);
            }, i * 80);
        });
    }
}

window.Audio = Audio;
