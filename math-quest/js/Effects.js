/**
 * Effects - Short-lived celebration and feedback particles
 *
 * Spawns confetti pieces and emoji pops into a positioned layer and
 * removes them when their animation ends. Skips particles entirely
 * when the user prefers reduced motion.
 */
const CONFETTI_COLORS = ['#FFD54F', '#FF8A3D', '#4ECDC4', '#7C4DFF', '#FF6B6B', '#2ECC71'];
const CHEER_EMOJI = ['🎉', '✨', '🌟', '🎊'];
const OOPS_EMOJI = ['🤔', '😅', '🙈'];

const pick = list => list[Math.floor(Math.random() * list.length)];

export class Effects {
    /** @param {HTMLElement} layer - Positioned element that hosts particles */
    constructor(layer) {
        this.layer = layer;
        this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    }

    /** Right answer: card bounces, confetti + a cheer emoji burst out */
    correct(anchor, card) {
        this.pulse(card, 'happy');
        this.burst(anchor, 14);
        this.pop(anchor, CHEER_EMOJI, 'cheer-pop');
    }

    /** Wrong answer: card wobbles "no", a gentle emoji floats up */
    wrong(anchor, card) {
        this.pulse(card, 'wobble');
        this.pop(anchor, OOPS_EMOJI, 'oops-pop');
    }

    /** Track finished: a bigger confetti storm over the overlay */
    win(anchor) {
        this.burst(anchor, 26);
    }

    /** Confetti explosion from the center of an element */
    burst(anchor, count) {
        if (this.reduceMotion.matches || !anchor) return;
        const { x, y } = this.centerOf(anchor);
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.6;
            const distance = 60 + Math.random() * 90;
            const spin = (Math.random() < 0.5 ? -1 : 1) * (180 + Math.random() * 360);
            this.spawn('confetti-piece', '', x, y, {
                '--dx': `${Math.round(Math.cos(angle) * distance)}px`,
                '--dy': `${Math.round(Math.sin(angle) * distance - 40)}px`,
                '--spin': `${Math.round(spin)}deg`,
                'background': CONFETTI_COLORS[i % CONFETTI_COLORS.length]
            }, 1000);
        }
    }

    /** One emoji that pops in and floats away from an element */
    pop(anchor, emojiList, className) {
        if (this.reduceMotion.matches || !anchor) return;
        const { x, y } = this.centerOf(anchor);
        this.spawn(className, pick(emojiList), x, y, {}, 900);
    }

    /** Restart-safe one-shot animation class on a persistent element */
    pulse(el, className) {
        if (!el) return;
        el.classList.remove(className);
        void el.offsetWidth; // restart animation
        el.classList.add(className);
        setTimeout(() => el.classList.remove(className), 600);
    }

    /** Center of an element in the effects layer's coordinate space */
    centerOf(el) {
        const rect = el.getBoundingClientRect();
        const base = this.layer.getBoundingClientRect();
        return {
            x: rect.left + rect.width / 2 - base.left,
            y: rect.top + rect.height / 2 - base.top
        };
    }

    spawn(className, text, x, y, styleVars, lifeMs) {
        const el = document.createElement('div');
        el.className = className;
        el.textContent = text;
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        for (const [key, value] of Object.entries(styleVars)) {
            el.style.setProperty(key, value);
        }
        this.layer.appendChild(el);
        setTimeout(() => el.remove(), lifeMs);
    }
}
