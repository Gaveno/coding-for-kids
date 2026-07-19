/**
 * TypingMode - Spell the word with the keyboard (levels 21-40)
 *
 * Letters fill empty slots; the word is checked when all slots are full.
 * After 2 wrong tries, faded hint letters appear in the slots.
 */
const HINT_AFTER_TRIES = 2;

export class TypingMode {
    /**
     * @param {HTMLElement} container - Element holding the letter slots
     * @param {Object} callbacks - { onCorrect(), onWrong() }
     */
    constructor(container, callbacks) {
        this.container = container;
        this.onCorrect = callbacks.onCorrect;
        this.onWrong = callbacks.onWrong;
        this.word = null;
        this.typed = [];
        this.tries = 0;
        this.locked = false;
    }

    /**
     * Show empty letter slots for a level
     * @param {Object} entry - { word, emoji }
     */
    start(entry) {
        this.word = entry.word;
        this.typed = [];
        this.tries = 0;
        this.locked = false;
        this.container.classList.remove('hidden');
        this.render();
    }

    render() {
        this.container.innerHTML = '';
        const showHints = this.tries >= HINT_AFTER_TRIES;
        this.word.split('').forEach((letter, i) => {
            const slot = document.createElement('div');
            slot.className = 'letter-slot';
            if (i < this.typed.length) {
                slot.textContent = this.typed[i];
                slot.classList.add('filled');
            } else if (showHints) {
                slot.textContent = letter;
                slot.classList.add('hint');
            }
            if (i === this.typed.length) slot.classList.add('next');
            this.container.appendChild(slot);
        });
    }

    addLetter(letter) {
        if (this.locked || !this.word) return;
        if (this.typed.length >= this.word.length) return;
        this.typed.push(letter);
        this.render();
        if (this.typed.length === this.word.length) this.check();
    }

    erase() {
        if (this.locked || this.typed.length === 0) return;
        this.typed.pop();
        this.render();
    }

    check() {
        if (this.typed.join('') === this.word) {
            this.locked = true;
            this.container.querySelectorAll('.letter-slot').forEach(s => s.classList.add('right'));
            this.onCorrect();
        } else {
            this.tries += 1;
            this.container.classList.add('shake');
            this.onWrong();
            setTimeout(() => {
                this.container.classList.remove('shake');
                this.typed = [];
                this.render();
            }, 600);
        }
    }

    hide() {
        this.container.classList.add('hidden');
    }
}
