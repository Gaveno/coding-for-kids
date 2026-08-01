/**
 * Equation - Renders the current problem as a big friendly equation
 *
 * Exactly one part is unknown: the result (choice/type modes) or a hidden
 * operand (missing mode). That part renders as the answer slot; typing
 * mode fills the slot with digit boxes.
 */
export class Equation {
    constructor(container) {
        this.container = container;
        this.answerEl = null;
    }

    /**
     * @param {Object} problem - { a, b, symbol, result, missing? }
     * @returns {HTMLElement} The answer slot element
     */
    render(problem) {
        this.container.innerHTML = '';
        this.answerEl = null;
        const parts = [
            problem.missing === 'a' ? null : problem.a,
            problem.symbol,
            problem.missing === 'b' ? null : problem.b,
            '=',
            problem.missing ? problem.result : null
        ];
        parts.forEach((part, i) => {
            const isOperator = i === 1 || i === 3;
            const span = document.createElement('span');
            if (part === null) {
                span.className = 'eq-answer';
                span.textContent = '❔';
                span.setAttribute('aria-label', 'Mystery number');
                this.answerEl = span;
            } else {
                span.className = isOperator ? 'eq-op' : 'eq-num';
                span.textContent = part;
            }
            this.container.appendChild(span);
        });
        return this.answerEl;
    }

    /** Show the correct number in the answer slot */
    reveal(problem) {
        if (!this.answerEl) return;
        this.answerEl.classList.remove('typing');
        this.answerEl.textContent = problem.answer;
        this.answerEl.classList.add('solved');
    }
}
