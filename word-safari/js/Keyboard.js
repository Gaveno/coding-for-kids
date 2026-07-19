/**
 * Keyboard - Big-button ABC on-screen keyboard for little fingers
 *
 * Also listens to the physical keyboard so it works on desktop.
 */
const ROWS = ['abcdefg', 'hijklmn', 'opqrstu', 'vwxyz'];

export class Keyboard {
    /**
     * @param {HTMLElement} container - Element to render the keyboard into
     * @param {Object} callbacks - { onLetter(letter), onErase() }
     */
    constructor(container, callbacks) {
        this.container = container;
        this.onLetter = callbacks.onLetter;
        this.onErase = callbacks.onErase;
        this.active = false;
        this.render();
        this.bindPhysicalKeys();
    }

    render() {
        this.container.innerHTML = '';
        ROWS.forEach((row, rowIndex) => {
            const rowEl = document.createElement('div');
            rowEl.className = 'kb-row';
            row.split('').forEach(letter => {
                const btn = document.createElement('button');
                btn.className = 'kb-key';
                btn.dataset.letter = letter;
                btn.textContent = letter;
                btn.setAttribute('aria-label', `Letter ${letter}`);
                btn.addEventListener('pointerdown', e => {
                    e.preventDefault();
                    this.press(btn, () => this.onLetter(letter));
                });
                rowEl.appendChild(btn);
            });
            if (rowIndex === ROWS.length - 1) {
                const back = document.createElement('button');
                back.className = 'kb-key kb-erase';
                back.textContent = '⌫';
                back.setAttribute('aria-label', 'Erase letter');
                back.addEventListener('pointerdown', e => {
                    e.preventDefault();
                    this.press(back, () => this.onErase());
                });
                rowEl.appendChild(back);
            }
            this.container.appendChild(rowEl);
        });
    }

    /** Visual pop + callback, only while the keyboard is active */
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
            if (/^[a-zA-Z]$/.test(e.key)) {
                const btn = this.container.querySelector(`[data-letter="${e.key.toLowerCase()}"]`);
                if (btn) this.press(btn, () => this.onLetter(e.key.toLowerCase()));
            } else if (e.key === 'Backspace') {
                const btn = this.container.querySelector('.kb-erase');
                if (btn) this.press(btn, () => this.onErase());
            }
        });
    }

    setActive(active) {
        this.active = active;
        this.container.classList.toggle('hidden', !active);
    }
}
