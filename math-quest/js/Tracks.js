/**
 * Tracks - Track list, ordering and unlock rules
 *
 * A track is one operation practised in one mode. Modes chain within an
 * operation (choice → type → missing) and choice tracks chain across
 * operations, so finishing add1-choice opens both add1-type and add2-choice.
 */
export const OP_ORDER = ['add1', 'add2', 'sub1', 'sub2', 'mul1', 'div1'];
export const MODE_ORDER = ['choice', 'type', 'missing'];
export const QUESTIONS_PER_TRACK = 10;
export const MODE_ICONS = { choice: '👆', type: '⌨️', missing: '🧩' };

/** Storage/progress key for one track */
export function trackId(opId, mode) {
    return `${opId}-${mode}`;
}

/**
 * Whether a track is playable yet.
 * @param {string} opId
 * @param {string} mode
 * @param {Function} getStars - trackId => stars earned (0 if unplayed)
 */
export function isUnlocked(opId, mode, getStars) {
    const opIndex = OP_ORDER.indexOf(opId);
    if (opIndex === -1 || !MODE_ORDER.includes(mode)) return false;
    if (mode === 'choice') {
        if (opIndex === 0) return true;
        return getStars(trackId(OP_ORDER[opIndex - 1], 'choice')) > 0;
    }
    if (mode === 'type') return getStars(trackId(opId, 'choice')) > 0;
    return getStars(trackId(opId, 'type')) > 0;
}

/** Star rating for a finished track: fewer mistakes, more stars */
export function starsForMistakes(mistakes) {
    if (mistakes === 0) return 3;
    if (mistakes <= 2) return 2;
    return 1;
}
