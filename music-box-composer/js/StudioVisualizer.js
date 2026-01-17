/**
 * StudioVisualizer.js - Professional waveform visualizer for Studio Mode
 */
class StudioVisualizer {
    constructor(stageEl) {
        this.stage = stageEl;
        this.canvas = this.createCanvas();
        this.ctx = this.canvas.getContext('2d');
        
        this.spectrumBars = 32;
        this.barValues = new Array(this.spectrumBars).fill(0);
        this.peakLevel = 0;
        this.wavePhase = 0;
        
        this.animationFrame = null;
        this.startAnimation();
        
        // Handle resize
        this.resizeObserver = new ResizeObserver(() => this.handleResize());
        this.resizeObserver.observe(this.stage);
    }
    
    /**
     * Create canvas element
     */
    createCanvas() {
        const canvas = document.createElement('canvas');
        canvas.className = 'viz-canvas';
        canvas.width = this.stage.offsetWidth || 600;
        canvas.height = this.stage.offsetHeight || 140;
        this.stage.appendChild(canvas);
        return canvas;
    }
    
    /**
     * Handle canvas resize
     */
    handleResize() {
        const width = this.stage.offsetWidth;
        const height = this.stage.offsetHeight;
        
        if (width > 0 && height > 0) {
            this.canvas.width = width;
            this.canvas.height = height;
        }
    }
    
    /**
     * Handle note play event
     * @param {number} note - Note number (1-12)
     * @param {number} trackNum - Track number (1-3)
     * @param {number} octave - Octave (2-6)
     * @param {number} velocity - Volume (0.0-1.0)
     */
    onNotePlay(note, trackNum, octave, velocity) {
        const barIndex = this.getSpectrumBarIndex(note, octave);
        
        // Set bar height based on velocity
        this.barValues[barIndex] = Math.max(
            this.barValues[barIndex],
            velocity
        );
        
        // Update peak meter
        this.peakLevel = Math.max(this.peakLevel, velocity);
    }
    
    /**
     * Map note+octave to spectrum bar index
     */
    getSpectrumBarIndex(note, octave) {
        const oct = octave || 4;
        // Map 12 notes * 5 octaves (2-6) to 32 bars
        const totalNote = (oct - 2) * 12 + note - 1; // 0-59
        const barIndex = Math.floor(totalNote / 60 * this.spectrumBars);
        return Math.max(0, Math.min(barIndex, this.spectrumBars - 1));
    }
    
    /**
     * Start animation loop
     */
    startAnimation() {
        const animate = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.drawWaveform();
            this.drawSpectrum();
            this.drawPeakMeter();
            
            // Decay values
            this.barValues = this.barValues.map(v => v * 0.92);
            this.peakLevel *= 0.95;
            this.wavePhase += 0.05;
            
            this.animationFrame = requestAnimationFrame(animate);
        };
        animate();
    }
    
    /**
     * Draw waveform in top half
     */
    drawWaveform() {
        const width = this.canvas.width;
        const height = this.canvas.height / 2;
        const centerY = height / 2;
        
        this.ctx.strokeStyle = '#00f5d4';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        
        // Sine wave affected by peak level
        for (let x = 0; x < width; x++) {
            const y = centerY + Math.sin(x * 0.05 + this.wavePhase) 
                * this.peakLevel * 25;
            
            if (x === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        
        this.ctx.stroke();
    }
    
    /**
     * Draw spectrum bars in bottom half
     */
    drawSpectrum() {
        const width = this.canvas.width - 30; // Leave space for peak meter
        const height = this.canvas.height / 2;
        const barWidth = width / this.spectrumBars;
        const startY = this.canvas.height / 2;
        
        this.barValues.forEach((value, i) => {
            const barHeight = value * height * 0.8;
            const x = i * barWidth;
            const y = startY + height - barHeight;
            
            // Gradient color based on frequency (low=blue, high=red)
            const hue = 240 - (i / this.spectrumBars) * 240;
            this.ctx.fillStyle = `hsl(${hue}, 80%, 60%)`;
            
            this.ctx.fillRect(x, y, barWidth - 2, barHeight);
        });
    }
    
    /**
     * Draw peak meter on right edge
     */
    drawPeakMeter() {
        const meterWidth = 20;
        const meterHeight = this.canvas.height * 0.8;
        const x = this.canvas.width - meterWidth - 5;
        const y = (this.canvas.height - meterHeight) / 2;
        
        // Background
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(x, y, meterWidth, meterHeight);
        
        // Peak level bar
        const peakHeight = this.peakLevel * meterHeight;
        const peakY = y + meterHeight - peakHeight;
        
        // Color based on level
        let color;
        if (this.peakLevel < 0.6) {
            color = '#6BCF7F'; // Green
        } else if (this.peakLevel < 0.85) {
            color = '#FFD93D'; // Yellow
        } else {
            color = '#FF6B6B'; // Red
        }
        
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, peakY, meterWidth, peakHeight);
    }
    
    /**
     * Play celebration animation
     */
    celebrate() {
        // Flash all spectrum bars
        this.barValues.fill(1.0);
        this.peakLevel = 1.0;
        
        setTimeout(() => {
            this.barValues.fill(0);
            this.peakLevel = 0;
        }, 400);
    }
    
    /**
     * Reset visualizer
     */
    reset() {
        this.barValues.fill(0);
        this.peakLevel = 0;
        this.wavePhase = 0;
    }
    
    /**
     * Cleanup when destroying visualizer
     */
    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        this.canvas.remove();
    }
}
