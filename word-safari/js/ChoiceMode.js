/**
 * ChoiceMode - Pick the word that matches the picture (levels 1-20)
 */
import { getChoices } from './Words.js';

export class ChoiceMode {
    /**
     * @param {HTMLElement} container - Element holding the choice buttons
     * @param {Object} callbacks - { onCorrect(), onWrong() }
     */
    constructor(container, callbacks) {
        this.container = container;
        this.onCorrect = callbacks.onCorrect;
        this.onWrong = callbacks.onWrong;
        this.word = null;
        this.locked = false;
    }

    /**
     * Show 3 word choices for a level
     * @param {Object} entry - { word, emoji }
     */
    start(entry) {
        this.word = entry.word;
        this.locked = false;
        this.container.innerHTML = '';
        this.container.classList.remove('hidden');

        getChoices(entry.word).forEach(choice => {
            const btn = document.createElement('button');
            btn.className = 'choice-word';
            btn.textContent = choice;
            btn.setAttribute('aria-label', `Word: ${choice}`);
            btn.addEventListener('pointerdown', e => {
                e.preventDefault();
                this.pick(btn, choice);
            });
            this.container.appendChild(btn);
        });
    }

    pick(btn, choice) {
        if (this.locked || btn.disabled) return;
        if (choice === this.word) {
            this.locked = true;
            btn.classList.add('right');
            this.container.querySelectorAll('.choice-word').forEach(b => {
                if (b !== btn) b.classList.add('faded');
            });
            this.onCorrect();
        } else {
            btn.disabled = true;
            btn.classList.add('wrong');
            this.onWrong();
        }
    }

    hide() {
        this.container.classList.add('hidden');
    }
}
