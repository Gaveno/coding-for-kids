/**
 * TweenVisualizer.js - Particle burst visualizer for Tween Mode
 */
class TweenVisualizer {
    // Note-to-color mapping (12 chromatic notes)
    static NOTE_COLORS = {
        1:  '#FF6B6B',  // C  - Red
        2:  '#FF8E53',  // C# - Orange-Red
        3:  '#FFA94D',  // D  - Orange
        4:  '#FFD93D',  // D# - Yellow-Orange
        5:  '#6BCF7F',  // E  - Yellow-Green
        6:  '#4ECDC4',  // F  - Cyan
        7:  '#45B7D1',  // F# - Light Blue
        8:  '#5B9BD5',  // G  - Blue
        9:  '#7B68EE',  // G# - Purple-Blue
        10: '#9B59B6',  // A  - Purple
        11: '#E056A8',  // A# - Magenta
        12: '#FF5E9A'   // B  - Pink
    };
    
    constructor(stageEl) {
        this.stage = stageEl;
        this.particles = [];
        this.rings = this.createRings();
    }
    
    /**
     * Create background ring elements
     */
    createRings() {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'viz-rings');
        svg.setAttribute('viewBox', '0 0 100 100');
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        
        const ring1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        ring1.setAttribute('cx', '50');
        ring1.setAttribute('cy', '50');
        ring1.setAttribute('r', '45');
        ring1.setAttribute('class', 'viz-ring ring-melody');
        
        const ring2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        ring2.setAttribute('cx', '50');
        ring2.setAttribute('cy', '50');
        ring2.setAttribute('r', '30');
        ring2.setAttribute('class', 'viz-ring ring-bass');
        
        const ring3 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        ring3.setAttribute('cx', '50');
        ring3.setAttribute('cy', '50');
        ring3.setAttribute('r', '15');
        ring3.setAttribute('class', 'viz-ring ring-percussion');
        
        svg.appendChild(ring1);
        svg.appendChild(ring2);
        svg.appendChild(ring3);
        this.stage.appendChild(svg);
        
        return { melody: ring1, bass: ring2, percussion: ring3 };
    }
    
    /**
     * Create particle burst when note plays
     * @param {number} note - Note number (1-12)
     * @param {number} trackNum - Track number (1-3)
     * @param {number} octave - Octave (2-6)
     * @param {number} velocity - Volume/velocity (0.0-1.0)
     */
    burstParticles(note, trackNum, octave, velocity) {
        const color = TweenVisualizer.NOTE_COLORS[note] || '#FFFFFF';
        const position = this.getTrackPosition(trackNum);
        const size = this.getOctaveSize(octave);
        const count = Math.floor(8 + velocity * 8); // 8-16 particles
        
        // Limit total particles on screen
        if (this.particles.length > 50) {
            this.removeOldestParticles(count);
        }
        
        for (let i = 0; i < count; i++) {
            this.createParticle(position, color, size, velocity);
        }
        
        this.pulseRing(trackNum, color);
    }
    
    /**
     * Create single particle
     */
    createParticle(pos, color, size, velocity) {
        const particle = document.createElement('div');
        particle.className = 'viz-particle';
        
        const rect = this.stage.getBoundingClientRect();
        particle.style.left = pos.x + 'px';
        particle.style.top = pos.y + 'px';
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.backgroundColor = color;
        particle.style.opacity = 0.6 + velocity * 0.4;
        
        // Random direction (360 degrees)
        const angle = Math.random() * Math.PI * 2;
        const distance = 50 + velocity * 100;
        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance;
        
        particle.style.setProperty('--dx', dx + 'px');
        particle.style.setProperty('--dy', dy + 'px');
        
        this.stage.appendChild(particle);
        this.particles.push(particle);
        
        // Remove after animation
        setTimeout(() => {
            particle.remove();
            const idx = this.particles.indexOf(particle);
            if (idx > -1) this.particles.splice(idx, 1);
        }, 800);
    }
    
    /**
     * Remove oldest particles to maintain performance
     */
    removeOldestParticles(count) {
        const toRemove = this.particles.splice(0, count);
        toRemove.forEach(p => p.remove());
    }
    
    /**
     * Get position for track (thirds of stage width)
     */
    getTrackPosition(trackNum) {
        const rect = this.stage.getBoundingClientRect();
        const thirds = rect.width / 3;
        const x = thirds * (trackNum - 0.5);
        const y = rect.height / 2;
        return { x, y };
    }
    
    /**
     * Get particle size based on octave
     */
    getOctaveSize(octave) {
        if (!octave || octave <= 2) return 30;
        if (octave <= 4) return 20;
        return 12;
    }
    
    /**
     * Pulse ring when track plays
     */
    pulseRing(trackNum, color) {
        const ringMap = { 1: 'melody', 2: 'bass', 3: 'percussion' };
        const ring = this.rings[ringMap[trackNum]];
        if (!ring) return;
        
        ring.style.stroke = color;
        ring.classList.add('pulse');
        setTimeout(() => ring.classList.remove('pulse'), 300);
    }
    
    /**
     * Play celebration animation
     */
    celebrate() {
        // Create burst from center
        const center = {
            x: this.stage.offsetWidth / 2,
            y: this.stage.offsetHeight / 2
        };
        
        // Multiple color bursts
        const colors = ['#FF6B6B', '#FFD93D', '#6BCF7F', '#5B9BD5', '#9B59B6'];
        colors.forEach((color, i) => {
            setTimeout(() => {
                for (let j = 0; j < 12; j++) {
                    this.createParticle(center, color, 25, 1.0);
                }
            }, i * 100);
        });
    }
    
    /**
     * Reset visualizer
     */
    reset() {
        this.particles.forEach(p => p.remove());
        this.particles = [];
    }
    
    /**
     * Cleanup when destroying visualizer
     */
    destroy() {
        this.reset();
        if (this.rings.melody && this.rings.melody.parentNode) {
            this.rings.melody.parentNode.remove();
        }
    }
}
