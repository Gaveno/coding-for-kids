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
     * @param {function} onLoopClick - Callback when loop is clicked
     * @param {function} onLoopIterationChange - Callback for loop iteration change
     * @param {function} onLoopCommandRemove - Callback to remove command from loop
     */
    renderSequence(sequence, onLoopClick, onLoopIterationChange, onLoopCommandRemove) {
        const { sequenceArea, sequencePlaceholder } = this.elements;
        
        // Clear existing items
        const items = sequenceArea.querySelectorAll('.sequence-item, .loop-block');
        items.forEach(item => item.remove());

        // Show/hide placeholder
        sequencePlaceholder.style.display = sequence.isEmpty() ? 'block' : 'none';

        // Render each command
        sequence.commands.forEach((cmd, index) => {
            if (cmd.type === 'loop') {
                const loopBlock = this.createLoopBlock(
                    cmd, 
                    index, 
                    sequence.activeLoopIndex === index,
                    onLoopClick,
                    onLoopIterationChange,
                    onLoopCommandRemove
                );
                sequenceArea.appendChild(loopBlock);
            } else {
                const item = document.createElement('div');
                item.className = 'sequence-item';
                
                if (cmd.type === 'function') {
                    item.classList.add('function-call');
                    item.innerHTML = `📦${cmd.id}`;
                } else if (cmd.type === 'fire') {
                    item.classList.add('fire-command');
                    item.textContent = Sequence.getFireEmoji(cmd.direction);
                } else {
                    item.textContent = Sequence.getDirectionEmoji(cmd.direction);
                }
                
                item.dataset.index = index;
                sequenceArea.appendChild(item);
            }
        });
    }

    /**
     * Create a loop block element
     * @param {object} cmd - Loop command object
     * @param {number} index - Index in sequence
     * @param {boolean} isActive - Whether this loop is being edited
     * @param {function} onLoopClick - Callback when loop is clicked
     * @param {function} onLoopIterationChange - Callback for iteration change
     * @param {function} onLoopCommandRemove - Callback to remove command from loop
     * @returns {HTMLElement}
     */
    createLoopBlock(cmd, index, isActive, onLoopClick, onLoopIterationChange, onLoopCommandRemove) {
        const loopBlock = document.createElement('div');
        loopBlock.className = 'loop-block' + (isActive ? ' active' : '');
        loopBlock.dataset.index = index;

        // Loop header with iteration controls
        const header = document.createElement('div');
        header.className = 'loop-header';
        
        const loopIcon = document.createElement('span');
        loopIcon.className = 'loop-icon';
        loopIcon.textContent = '🔄';
        header.appendChild(loopIcon);

        // Iteration controls
        const iterControls = document.createElement('div');
        iterControls.className = 'loop-iteration-controls';

        const minusBtn = document.createElement('button');
        minusBtn.className = 'iter-btn minus-btn';
        minusBtn.textContent = '➖';
        minusBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            onLoopIterationChange(index, cmd.iterations - 1);
        });

        const iterCount = document.createElement('span');
        iterCount.className = 'iter-count';
        iterCount.textContent = cmd.iterations;

        const plusBtn = document.createElement('button');
        plusBtn.className = 'iter-btn plus-btn';
        plusBtn.textContent = '➕';
        plusBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            onLoopIterationChange(index, cmd.iterations + 1);
        });

        iterControls.appendChild(minusBtn);
        iterControls.appendChild(iterCount);
        iterControls.appendChild(plusBtn);
        header.appendChild(iterControls);

        loopBlock.appendChild(header);

        // Loop body - container for commands
        const body = document.createElement('div');
        body.className = 'loop-body';

        if (cmd.commands.length === 0) {
            const placeholder = document.createElement('div');
            placeholder.className = 'loop-placeholder';
            placeholder.textContent = '👆';
            body.appendChild(placeholder);
        } else {
            cmd.commands.forEach((innerCmd, cmdIndex) => {
                const item = document.createElement('div');
                item.className = 'sequence-item loop-item';
                
                if (innerCmd.type === 'function') {
                    item.classList.add('function-call');
                    item.innerHTML = `📦${innerCmd.id}`;
                } else if (innerCmd.type === 'fire') {
                    item.classList.add('fire-command');
                    item.textContent = Sequence.getFireEmoji(innerCmd.direction);
                } else {
                    item.textContent = Sequence.getDirectionEmoji(innerCmd.direction);
                }
                
                item.dataset.loopIndex = index;
                item.dataset.cmdIndex = cmdIndex;
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    onLoopCommandRemove(index, cmdIndex);
                });
                body.appendChild(item);
            });
        }

        loopBlock.appendChild(body);

        // Click on loop block to select/deselect
        loopBlock.addEventListener('click', (e) => {
            if (e.target === loopBlock || e.target === header || e.target === body || 
                e.target === loopIcon || e.target.classList.contains('loop-placeholder')) {
                onLoopClick(isActive ? null : index);
            }
        });

        return loopBlock;
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
