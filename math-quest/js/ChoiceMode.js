/**
 * ChoiceMode - Tap the number that completes the equation
 *
 * Used by both the multiple-choice tracks and the missing-number tracks;
 * only the number being asked for differs.
 */
export class ChoiceMode {
    /**
     * @param {HTMLElement} container - Element holding the choice buttons
     * @param {Object} callbacks - { onCorrect(), onWrong() }
     */
    constructor(container, callbacks) {
        this.container = container;
        this.onCorrect = callbacks.onCorrect;
        this.onWrong = callbacks.onWrong;
        this.answer = null;
        this.locked = false;
    }

    /**
     * @param {number[]} choices - Shuffled options including the answer
     * @param {number} answer - The correct number
     */
    start(choices, answer) {
        this.answer = answer;
        this.locked = false;
        this.container.innerHTML = '';
        this.container.classList.remove('hidden');
        choices.forEach(choice => {
            const btn = document.createElement('button');
            btn.className = 'choice-num';
            btn.textContent = choice;
            btn.setAttribute('aria-label', `Answer ${choice}`);
            btn.addEventListener('pointerdown', e => {
                e.preventDefault();
                this.pick(btn, choice);
            });
            this.container.appendChild(btn);
        });
    }

    pick(btn, choice) {
        if (this.locked || btn.disabled) return;
        if (choice === this.answer) {
            this.locked = true;
            btn.classList.add('right');
            this.container.querySelectorAll('.choice-num').forEach(b => {
                if (b !== btn) b.classList.add('faded');
            });
            this.onCorrect();
        } else {
            btn.disabled = true;
            btn.classList.add('wrong');
            this.onWrong(btn);
        }
    }

    hide() {
        this.container.classList.add('hidden');
    }
}
