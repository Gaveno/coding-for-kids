/**
 * NumberPad - Big-button 0-9 pad for little fingers
 *
 * Also listens to the physical keyboard so it works on desktop.
 */
const ROWS = [['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], ['⌫', '0']];

export class NumberPad {
    /**
     * @param {HTMLElement} container - Element to render the pad into
     * @param {Object} callbacks - { onDigit(digit), onErase() }
     */
    constructor(container, callbacks) {
        this.container = container;
        this.onDigit = callbacks.onDigit;
        this.onErase = callbacks.onErase;
        this.active = false;
        this.render();
        this.bindPhysicalKeys();
    }

    render() {
        this.container.innerHTML = '';
        ROWS.forEach(row => {
            const rowEl = document.createElement('div');
            rowEl.className = 'pad-row';
            row.forEach(key => {
                const isErase = key === '⌫';
                const btn = document.createElement('button');
                btn.className = isErase ? 'pad-key pad-erase' : 'pad-key';
                if (!isErase) btn.dataset.digit = key;
                btn.textContent = key;
                btn.setAttribute('aria-label', isErase ? 'Erase digit' : `Digit ${key}`);
                btn.addEventListener('pointerdown', e => {
                    e.preventDefault();
                    this.press(btn, () => (isErase ? this.onErase() : this.onDigit(key)));
                });
                rowEl.appendChild(btn);
            });
            this.container.appendChild(rowEl);
        });
    }

    /** Visual pop + callback, only while the pad is active */
    press(btn, action) {
        if (!this.active) return;
        btn.classList.remove('pressed');
        void btn.offsetWidth; // restart animation
        btn.classList.add('pressed');
        action();
    }

    bindPhysicalKeys() {
        document.addEventListener('keydown', e => {
            if (!this.active) return;
            if (/^[0-9]$/.test(e.key)) {
                const btn = this.container.querySelector(`[data-digit="${e.key}"]`);
                if (btn) this.press(btn, () => this.onDigit(e.key));
            } else if (e.key === 'Backspace') {
                const btn = this.container.querySelector('.pad-erase');
                if (btn) this.press(btn, () => this.onErase());
            }
        });
    }

    setActive(active) {
        this.active = active;
        this.container.classList.toggle('hidden', !active);
    }
}
