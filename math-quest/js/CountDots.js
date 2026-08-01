/**
 * CountDots - Emoji counters showing how big each known number is
 *
 * A child who cannot read numerals yet can count the emojis instead. Rows of
 * five stay easy to take in at a glance, and two full rows read as ten fingers.
 * Numbers past MAX_DOTS show as a bare numeral - nobody counts 59 apples.
 */
export const DOTS_PER_ROW = 5;
export const MAX_DOTS = 20;

/** Each operation counts its own thing, so a track feels consistent */
const OP_EMOJI = {
    add1: '🍎',
    add2: '🍎',
    sub1: '🍪',
    sub2: '🍪',
    mul1: '⭐',
    div1: '🍬'
};

export function dotEmoji(opId) {
    return OP_EMOJI[opId] || '🔵';
}

/** Whether a number is small enough to be worth counting */
export function showsDots(value) {
    return Number.isInteger(value) && value >= 1 && value <= MAX_DOTS;
}

/**
 * Row lengths for a number of dots, e.g. 7 -> [5, 2]
 * @returns {number[]} Empty when the number is too big to count
 */
export function dotRows(value) {
    if (!showsDots(value)) return [];
    const rows = [];
    let remaining = value;
    while (remaining > 0) {
        rows.push(Math.min(DOTS_PER_ROW, remaining));
        remaining -= DOTS_PER_ROW;
    }
    return rows;
}

/**
 * Build the emoji counter for a number
 * @returns {HTMLElement|null} Null when the number is too big to count
 */
export function buildDots(value, emoji) {
    const rows = dotRows(value);
    if (rows.length === 0) return null;

    const wrap = document.createElement('span');
    wrap.className = 'count-dots';
    // The numeral beside it already carries the meaning for screen readers
    wrap.setAttribute('aria-hidden', 'true');

    rows.forEach(count => {
        const row = document.createElement('span');
        row.className = 'dot-row';
        for (let i = 0; i < count; i++) {
            const dot = document.createElement('span');
            dot.className = 'dot-emoji';
            dot.textContent = emoji;
            row.appendChild(dot);
        }
        wrap.appendChild(row);
    });
    return wrap;
}
