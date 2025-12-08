/**
 * UI Renderer - Handles all DOM updates and user feedback
 * Single responsibility: Render game state to the DOM
 */
import { Sequence } from './Sequence.js';

export class Renderer {
    constructor(elements) {
        this.elements = elements;
        this.setupFeedbackStyle();
    }

    /**
     * Render the command sequence
     * @param {Sequence} sequence - Sequence instance
     */
    renderSequence(sequence) {
        const { sequenceArea, sequencePlaceholder } = this.elements;
        
        // Clear existing items
        const items = sequenceArea.querySelectorAll('.sequence-item');
        items.forEach(item => item.remove());

        // Show/hide placeholder
        sequencePlaceholder.style.display = sequence.isEmpty() ? 'block' : 'none';

        // Render each command
        sequence.commands.forEach((cmd, index) => {
            const item = document.createElement('div');
            item.className = 'sequence-item';
            
            if (cmd.type === 'function') {
                item.classList.add('function-call');
                item.innerHTML = `📦${cmd.id}`;
            } else {
                item.textContent = Sequence.getDirectionEmoji(cmd.direction);
            }
            
            item.dataset.index = index;
            sequenceArea.appendChild(item);
        });
    }

    /**
     * Render saved functions
     * @param {object[]} savedFunctions - Array of saved functions
     * @param {function} onDelete - Callback when delete is clicked
     * @param {function} onAdd - Callback when function is clicked to add
     */
    renderSavedFunctions(savedFunctions, onDelete, onAdd) {
        const container = this.elements.savedFunctionsContainer;
        container.innerHTML = '';

        savedFunctions.forEach((func, index) => {
            const btn = document.createElement('button');
            btn.className = 'saved-function-btn';
            btn.dataset.functionId = index;

            // Function preview
            const preview = document.createElement('span');
            preview.className = 'function-preview';
            
            const previewCommands = func.commands
                .slice(0, 3)
                .map(c => Sequence.getDirectionEmoji(c.direction))
                .join('');
            
            preview.innerHTML = `📦${index + 1}: ${previewCommands}`;
            if (func.commands.length > 3) {
                preview.innerHTML += '...';
            }

            btn.appendChild(preview);

            // Delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-function';
            deleteBtn.textContent = '✖';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                onDelete(index);
            });
            btn.appendChild(deleteBtn);

            // Click to add
            btn.addEventListener('click', () => onAdd(index));

            container.appendChild(btn);
        });
    }

    /**
     * Update level display
     * @param {number} level - Current level number
     */
    updateLevel(level) {
        this.elements.levelNum.textContent = level;
    }

    /**
     * Highlight a sequence item during execution
     * @param {number} visualIndex - Index in the visual sequence
     */
    highlightSequenceItem(visualIndex) {
        this.clearHighlights();
        const items = this.elements.sequenceArea.querySelectorAll('.sequence-item');
        if (items[visualIndex]) {
            items[visualIndex].classList.add('executing');
        }
    }

    /**
     * Clear all sequence highlights
     */
    clearHighlights() {
        const items = this.elements.sequenceArea.querySelectorAll('.sequence-item');
        items.forEach(item => item.classList.remove('executing'));
    }

    /**
     * Show success overlay
     */
    showSuccess() {
        this.elements.successOverlay.classList.add('active');
    }

    /**
     * Hide success overlay
     */
    hideSuccess() {
        this.elements.successOverlay.classList.remove('active');
    }

    /**
     * Show help overlay
     */
    showHelp() {
        this.elements.helpOverlay.classList.add('active');
    }

    /**
     * Hide help overlay
     */
    hideHelp() {
        this.elements.helpOverlay.classList.remove('active');
    }

    /**
     * Show floating feedback emoji
     * @param {string} emoji - Emoji to display
     */
    showFeedback(emoji) {
        const feedback = document.createElement('div');
        feedback.className = 'floating-feedback';
        feedback.textContent = emoji;
        document.body.appendChild(feedback);

        setTimeout(() => feedback.remove(), 800);
    }

    /**
     * Add robot moving animation
     */
    animateRobotMove() {
        const robotEmoji = document.querySelector('.robot-emoji');
        if (robotEmoji) {
            robotEmoji.classList.add('moving');
            setTimeout(() => robotEmoji.classList.remove('moving'), 300);
        }
    }

    /**
     * Set play button disabled state
     * @param {boolean} disabled
     */
    setPlayButtonDisabled(disabled) {
        this.elements.playBtn.disabled = disabled;
    }

    /**
     * Setup feedback animation style
     */
    setupFeedbackStyle() {
        if (!document.getElementById('feedbackStyle')) {
            const style = document.createElement('style');
            style.id = 'feedbackStyle';
            style.textContent = `
                .floating-feedback {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 4rem;
                    z-index: 1000;
                    animation: feedbackPop 0.8s ease forwards;
                    pointer-events: none;
                }
                @keyframes feedbackPop {
                    0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
                    50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
                    100% { transform: translate(-50%, -100%) scale(1); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
}
