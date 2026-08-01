/**
 * Equation - Renders the current problem as a big friendly equation
 *
 * Exactly one part is unknown: the result (choice/type modes) or a hidden
 * operand (missing mode). That part renders as the answer slot; typing
 * mode fills the slot with digit boxes. Every known number carries an
 * emoji counter underneath so it can be counted rather than read.
 */
import { buildDots, dotEmoji } from './CountDots.js';

export class Equation {
    constructor(container) {
        this.container = container;
        this.answerEl = null;
        this.emoji = '🔵';
    }

    /**
     * @param {Object} problem - { opId, a, b, symbol, result, missing? }
     * @returns {HTMLElement} The answer slot element
     */
    render(problem) {
        this.container.innerHTML = '';
        this.answerEl = null;
        this.emoji = dotEmoji(problem.opId);

        const parts = [
            problem.missing === 'a' ? null : problem.a,
            problem.symbol,
            problem.missing === 'b' ? null : problem.b,
            '=',
            problem.missing ? problem.result : null
        ];
        parts.forEach((part, i) => {
            const isOperator = i === 1 || i === 3;
            if (isOperator) this.container.appendChild(this.operator(part));
            else if (part === null) this.container.appendChild(this.answerSlot());
            else this.container.appendChild(this.numberTerm(part));
        });
        return this.answerEl;
    }

    operator(symbol) {
        const el = document.createElement('span');
        el.className = 'eq-op';
        el.textContent = symbol;
        return el;
    }

    /** A known number: the numeral with its countable emojis underneath */
    numberTerm(value) {
        const term = document.createElement('span');
        term.className = 'eq-term';

        const num = document.createElement('span');
        num.className = 'eq-num';
        num.textContent = value;
        term.appendChild(num);

        const dots = buildDots(value, this.emoji);
        if (dots) term.appendChild(dots);
        return term;
    }

    /** The unknown - what the child has to work out */
    answerSlot() {
        const term = document.createElement('span');
        term.className = 'eq-term';

        const slot = document.createElement('span');
        slot.className = 'eq-answer';
        slot.textContent = '❔';
        slot.setAttribute('aria-label', 'Mystery number');
        term.appendChild(slot);

        this.answerEl = slot;
        return term;
    }

    /** Show the correct number in the answer slot */
    reveal(problem) {
        if (!this.answerEl) return;
        this.answerEl.classList.remove('typing');
        this.answerEl.textContent = problem.answer;
        this.answerEl.classList.add('solved');
    }
}
