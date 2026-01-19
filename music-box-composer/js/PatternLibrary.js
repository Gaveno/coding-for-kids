/**
 * PatternLibrary.js - Pattern storage and management
 * Handles preset patterns, user patterns, CRUD operations
 */

class PatternLibrary {
    constructor() {
        this.patterns = new Map(); // id -> Pattern
        this.presets = new Map();  // id -> Pattern (presets only)
        this.userPatterns = new Map(); // id -> Pattern (user-created only)
        
        this.initializePresets();
        this.loadUserPatterns();
    }

    /**
     * Initialize preset patterns for all modes
     */
    initializePresets() {
        // Kid Mode Presets (4-beat patterns)
        const kidPresets = [
            {
                id: 'preset_happy_bounce',
                name: 'Happy Bounce',
                icon: '🌈',
                color: '#FF6B6B',
                length: 4,
                tracks: {
                    1: [[0, 0, 1], [1, 2, 1], [2, 4, 1], [3, 2, 1]], // C-E-G-E arpeggio
                    2: [],
                    3: [[0, 0, 1], [2, 0, 1]] // Kick on beats 0 and 2
                },
                isPreset: true
            },
            {
                id: 'preset_march',
                name: 'March',
                icon: '🥁',
                color: '#4ECDC4',
                length: 4,
                tracks: {
                    1: [[0, 0, 1], [1, 0, 1], [2, 0, 1], [3, 0, 1]], // Steady quarter notes
                    2: [],
                    3: [[0, 0, 1], [1, 2, 1], [2, 0, 1], [3, 2, 1]] // Kick-snare pattern
                },
                isPreset: true
            },
            {
                id: 'preset_lullaby',
                name: 'Lullaby',
                icon: '🌙',
                color: '#95E1D3',
                length: 4,
                tracks: {
                    1: [[0, 7, 1], [1, 5, 1], [2, 4, 1], [3, 2, 1]], // Descending melody
                    2: [[0, 0, 2], [2, 0, 2]], // Sustained bass notes
                    3: []
                },
                isPreset: true
            },
            {
                id: 'preset_dance',
                name: 'Dance',
                icon: '💃',
                color: '#F38181',
                length: 4,
                tracks: {
                    1: [[0, 2, 1], [1, 4, 1], [2, 2, 1], [3, 4, 1]], // Syncopated melody
                    2: [],
                    3: [[0, 0, 1], [1, 1, 1], [2, 0, 1], [3, 1, 1]] // Kick-clap pattern
                },
                isPreset: true
            },
            {
                id: 'preset_fanfare',
                name: 'Fanfare',
                icon: '🎺',
                color: '#FFD93D',
                length: 4,
                tracks: {
                    1: [[0, 0, 1], [1, 2, 1], [2, 4, 1], [3, 7, 1]], // Rising triumphant
                    2: [],
                    3: [[0, 0, 1], [2, 0, 1]] // Punctuating kicks
                },
                isPreset: true
            },
            {
                id: 'preset_rain',
                name: 'Rain',
                icon: '🌧️',
                color: '#A8DADC',
                length: 4,
                tracks: {
                    1: [[0, 12, 1], [1, 12, 1], [2, 12, 1], [3, 12, 1]], // Soft repeated notes
                    2: [],
                    3: [[0, 3, 1], [1, 3, 1], [2, 3, 1], [3, 3, 1]] // Hihat pattern
                },
                isPreset: true
            }
        ];

        // Tween Mode Additional Presets (8-beat patterns)
        const tweenPresets = [
            {
                id: 'preset_drop',
                name: 'Drop',
                icon: '🔥',
                color: '#E63946',
                length: 8,
                tracks: {
                    1: [[4, 0, 1], [5, 2, 1], [6, 4, 1], [7, 5, 1]], // EDM drop melody
                    2: [[4, 0, 1], [6, 0, 1]], // Bass hits
                    3: [[0, 0, 1], [1, 0, 1], [2, 0, 1], [3, 0, 1], [4, 0, 1]] // Build-up drums
                },
                isPreset: true
            },
            {
                id: 'preset_chill',
                name: 'Chill',
                icon: '🧊',
                color: '#457B9D',
                length: 8,
                tracks: {
                    1: [[0, 4, 1], [2, 7, 1], [4, 5, 1], [6, 9, 1]], // Lo-fi chord progression
                    2: [[0, 0, 1], [2, 2, 1], [4, 0, 1], [6, 2, 1]], // Mellow bass
                    3: [[0, 3, 1], [2, 3, 1], [4, 3, 1], [6, 3, 1]] // Soft hihat
                },
                isPreset: true
            },
            {
                id: 'preset_epic',
                name: 'Epic',
                icon: '⚔️',
                color: '#6A4C93',
                length: 8,
                tracks: {
                    1: [[0, 0, 2], [2, 2, 2], [4, 4, 2], [6, 5, 2]], // Building progression
                    2: [[0, 0, 1], [1, 0, 1], [2, 2, 1], [3, 2, 1],
                        [4, 4, 1], [5, 4, 1], [6, 5, 1], [7, 5, 1]], // Marching bass
                    3: [[0, 0, 1], [2, 2, 1], [4, 0, 1], [6, 2, 1]] // Powerful drums
                },
                isPreset: true
            },
            {
                id: 'preset_glitch',
                name: 'Glitch',
                icon: '👾',
                color: '#06FFA5',
                length: 4,
                tracks: {
                    1: [[0, 7, 1], [1, 5, 1], [2, 4, 1], [3, 6, 1]], // Irregular melody
                    2: [],
                    3: [[0, 1, 1], [1, 1, 1], [2, 1, 1], [3, 1, 1]] // Irregular claps
                },
                isPreset: true
            }
        ];

        // Register all presets
        [...kidPresets, ...tweenPresets].forEach(presetData => {
            const pattern = new Pattern(presetData);
            this.presets.set(pattern.id, pattern);
            this.patterns.set(pattern.id, pattern);
        });
    }

    /**
     * Get presets appropriate for the current mode
     */
    getPresets(mode = 'kid') {
        const allPresets = Array.from(this.presets.values());
        
        if (mode === 'kid') {
            // Kid mode: only 4-beat patterns with simple icons
            return allPresets.filter(p => p.length === 4 && p.id.startsWith('preset_') && 
                ['🌈', '🥁', '🌙', '💃', '🎺', '🌧️'].includes(p.icon));
        } else if (mode === 'tween') {
            // Tween mode: all presets
            return allPresets;
        } else {
            // Studio mode: all presets (will add more later)
            return allPresets;
        }
    }

    /**
     * Get user-created patterns
     */
    getUserPatterns() {
        return Array.from(this.userPatterns.values());
    }

    /**
     * Get pattern by ID
     */
    getPattern(id) {
        return this.patterns.get(id);
    }

    /**
     * Add a new user pattern
     */
    addPattern(patternData) {
        // Ensure index is set and within range
        if (patternData.index === undefined || patternData.index < 0 || patternData.index > 7) {
            throw new Error('Pattern index must be between 0 and 7');
        }
        
        const pattern = new Pattern({ ...patternData, isPreset: false });
        
        // Store with custom ID based on index
        const customId = `custom_${patternData.index}`;
        pattern.id = customId;
        
        this.patterns.set(pattern.id, pattern);
        this.userPatterns.set(pattern.id, pattern);
        this.saveUserPatterns();
        return pattern;
    }

    /**
     * Remove a user pattern (cannot remove presets)
     */
    removePattern(id) {
        const pattern = this.patterns.get(id);
        if (!pattern) {
            throw new Error(`Pattern ${id} not found`);
        }
        if (pattern.isPreset) {
            throw new Error('Cannot remove preset patterns');
        }
        
        this.patterns.delete(id);
        this.userPatterns.delete(id);
        this.saveUserPatterns();
    }

    /**
     * Update a user pattern (cannot update presets)
     */
    updatePattern(id, updates) {
        const pattern = this.patterns.get(id);
        if (!pattern) {
            throw new Error(`Pattern ${id} not found`);
        }
        if (pattern.isPreset) {
            throw new Error('Cannot update preset patterns');
        }

        // Preserve index
        const preservedIndex = pattern.index !== undefined ? pattern.index : updates.index;

        // Create updated pattern
        const updatedPattern = new Pattern({
            ...pattern.serialize(),
            ...updates,
            id, // Preserve ID
            index: preservedIndex, // Preserve index
            isPreset: false // Ensure it stays as user pattern
        });

        this.patterns.set(id, updatedPattern);
        this.userPatterns.set(id, updatedPattern);
        this.saveUserPatterns();
        return updatedPattern;
    }

    /**
     * Save user patterns to localStorage
     */
    saveUserPatterns() {
        try {
            const userPatternsArray = Array.from(this.userPatterns.values()).map(p => p.serialize());
            localStorage.setItem('musicbox_user_patterns', JSON.stringify(userPatternsArray));
        } catch (error) {
            console.error('Failed to save user patterns:', error);
        }
    }

    /**
     * Load user patterns from localStorage
     */
    loadUserPatterns() {
        try {
            const stored = localStorage.getItem('musicbox_user_patterns');
            if (stored) {
                const userPatternsArray = JSON.parse(stored);
                userPatternsArray.forEach(patternData => {
                    const pattern = Pattern.deserialize(patternData);
                    this.patterns.set(pattern.id, pattern);
                    this.userPatterns.set(pattern.id, pattern);
                });
            }
        } catch (error) {
            console.error('Failed to load user patterns:', error);
        }
    }

    /**
     * Clear all user patterns
     */
    clearUserPatterns() {
        this.userPatterns.forEach((pattern, id) => {
            this.patterns.delete(id);
        });
        this.userPatterns.clear();
        this.saveUserPatterns();
    }
}
