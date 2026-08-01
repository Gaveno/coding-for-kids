/**
 * TypingMode - Build the answer one digit at a time
 *
 * Digits fill empty slots inside the equation's answer spot; the number is
 * checked when every slot is full. After 2 wrong tries the digits appear
 * as faded hints.
 */
const HINT_AFTER_TRIES = 2;

export class TypingMode {
    /**
     * @param {Object} callbacks - { onCorrect(), onWrong() }
     */
    constructor(callbacks) {
        this.onCorrect = callbacks.onCorrect;
        this.onWrong = callbacks.onWrong;
        this.container = null;
        this.digits = [];
        this.typed = [];
        this.tries = 0;
        this.locked = false;
    }

    /**
     * Show empty digit slots for a problem
     * @param {number} answer - The number to type
     * @param {HTMLElement} container - The equation's answer slot
     */
    start(answer, container) {
        this.container = container;
        this.digits = String(answer).split('');
        this.typed = [];
        this.tries = 0;
        this.locked = false;
        this.container.textContent = '';
        this.container.classList.add('typing');
        this.render();
    }

    render() {
        this.container.innerHTML = '';
        const showHints = this.tries >= HINT_AFTER_TRIES;
        this.digits.forEach((digit, i) => {
            const slot = document.createElement('div');
            slot.className = 'digit-slot';
            if (i < this.typed.length) {
                slot.textContent = this.typed[i];
                slot.classList.add('filled');
            } else if (showHints) {
                slot.textContent = digit;
                slot.classList.add('hint');
            }
            if (i === this.typed.length) slot.classList.add('next');
            this.container.appendChild(slot);
        });
    }

    addDigit(digit) {
        if (this.locked || !this.container) return;
        if (this.typed.length >= this.digits.length) return;
        this.typed.push(digit);
        this.render();
        if (this.typed.length === this.digits.length) this.check();
    }

    erase() {
        if (this.locked || this.typed.length === 0) return;
        this.typed.pop();
        this.render();
    }

    check() {
        if (this.typed.join('') === this.digits.join('')) {
            this.locked = true;
            this.container.querySelectorAll('.digit-slot').forEach(s => s.classList.add('right'));
            this.onCorrect();
        } else {
            this.tries += 1;
            this.container.classList.add('shake');
            this.onWrong(this.container);
            setTimeout(() => {
                this.container.classList.remove('shake');
                this.typed = [];
                this.render();
            }, 600);
        }
    }
}
