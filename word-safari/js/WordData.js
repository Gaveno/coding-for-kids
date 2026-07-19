/**
 * WordData - Raw picture-word lists for Word Safari
 *
 * Kept separate from the game logic in Words.js. Lists are in ascending
 * length order (easy -> hard); the play order is shuffled per session.
 */

/** Read mode - pick the matching word (used for choice + review sub-phases) */
export const CHOICE_WORDS = [
    // 2-3 letters - easiest
    { word: 'ox',     emoji: '🐂' },
    { word: 'cat',    emoji: '🐱' },
    { word: 'dog',    emoji: '🐶' },
    { word: 'sun',    emoji: '☀️' },
    { word: 'bee',    emoji: '🐝' },
    { word: 'pig',    emoji: '🐷' },
    { word: 'egg',    emoji: '🥚' },
    { word: 'hen',    emoji: '🐔' },
    { word: 'web',    emoji: '🕸️' },
    { word: 'nut',    emoji: '🥜' },
    // 4 letters
    { word: 'fish',   emoji: '🐟' },
    { word: 'frog',   emoji: '🐸' },
    { word: 'duck',   emoji: '🦆' },
    { word: 'star',   emoji: '⭐' },
    { word: 'book',   emoji: '📖' },
    { word: 'ball',   emoji: '⚽' },
    { word: 'lamp',   emoji: '💡' },
    { word: 'nest',   emoji: '🪺' },
    { word: 'gift',   emoji: '🎁' },
    // 5 letters
    { word: 'apple',  emoji: '🍎' },
    { word: 'house',  emoji: '🏠' },
    { word: 'snake',  emoji: '🐍' },
    { word: 'train',  emoji: '🚂' },
    { word: 'plant',  emoji: '🌱' },
    { word: 'grape',  emoji: '🍇' },
    { word: 'crown',  emoji: '👑' },
    { word: 'whale',  emoji: '🐳' },
    // 6 letters - hardest
    { word: 'banana', emoji: '🍌' },
    { word: 'monkey', emoji: '🐵' },
    { word: 'rocket', emoji: '🚀' },
    { word: 'guitar', emoji: '🎸' },
    { word: 'dragon', emoji: '🐉' },
    { word: 'cheese', emoji: '🧀' },
    { word: 'planet', emoji: '🪐' },
    { word: 'bridge', emoji: '🌉' }
];

/** Write mode - type the word */
export const TYPING_WORDS = [
    // 2-3 letters
    { word: 'ax',     emoji: '🪓' },
    { word: 'cow',    emoji: '🐮' },
    { word: 'fox',    emoji: '🦊' },
    { word: 'hat',    emoji: '🎩' },
    { word: 'car',    emoji: '🚗' },
    { word: 'bus',    emoji: '🚌' },
    { word: 'key',    emoji: '🔑' },
    { word: 'pie',    emoji: '🥧' },
    { word: 'jet',    emoji: '✈️' },
    { word: 'mug',    emoji: '🍺' },
    // 4 letters
    { word: 'moon',   emoji: '🌙' },
    { word: 'cake',   emoji: '🎂' },
    { word: 'tree',   emoji: '🌳' },
    { word: 'milk',   emoji: '🥛' },
    { word: 'lion',   emoji: '🦁' },
    { word: 'ship',   emoji: '🚢' },
    { word: 'bear',   emoji: '🐻' },
    { word: 'drum',   emoji: '🥁' },
    { word: 'kite',   emoji: '🪁' },
    // 5 letters
    { word: 'horse',  emoji: '🐴' },
    { word: 'pizza',  emoji: '🍕' },
    { word: 'robot',  emoji: '🤖' },
    { word: 'clock',  emoji: '⏰' },
    { word: 'mouse',  emoji: '🐭' },
    { word: 'sword',  emoji: '⚔️' },
    { word: 'tooth',  emoji: '🦷' },
    { word: 'bread',  emoji: '🍞' },
    // 6 letters
    { word: 'flower', emoji: '🌸' },
    { word: 'spider', emoji: '🕷️' },
    { word: 'orange', emoji: '🍊' },
    { word: 'pencil', emoji: '✏️' },
    { word: 'turtle', emoji: '🐢' },
    { word: 'rabbit', emoji: '🐰' },
    { word: 'castle', emoji: '🏰' },
    { word: 'window', emoji: '🪟' }
];

/**
 * Extra words used only as wrong answers. Stocked so every choice word
 * has at least 2 decoys sharing its first letter AND length (for the
 * review phase - e.g. ball vs bell vs bath).
 */
export const DECOYS = [
    'on', 'of', 'or', 'go', 'in', 'up', 'me', 'we',
    'ant', 'bat', 'bed', 'big', 'bug', 'can', 'cap', 'cot', 'cub', 'cup',
    'den', 'dig', 'dot', 'ear', 'eat', 'elf', 'eye', 'jam', 'leg', 'map',
    'net', 'owl', 'pan', 'pen', 'pin', 'pot', 'sea', 'sit', 'six',
    'bath', 'bell', 'bird', 'boat', 'boot', 'corn', 'dark', 'desk', 'door',
    'dust', 'farm', 'five', 'fork', 'kite', 'nose', 'ring', 'sand', 'sock',
    'step', 'stop', 'wolf',
    'alarm', 'ankle', 'apron', 'bread', 'chair', 'cloud', 'hands', 'happy',
    'heart', 'mouse', 'sheep', 'smile', 'snail', 'stone', 'table', 'teeth',
    'tiger', 'truck', 'whale',
    'basket', 'bottle', 'bubble', 'button', 'candle', 'castle', 'garden',
    'market', 'mitten', 'mother', 'pencil', 'rabbit', 'ribbon', 'rubber',
    'turtle', 'window',
    // Look-alike fillers for the newer picture words
    'ham', 'hop', 'wet', 'wig', 'nap', 'lock', 'leaf', 'neck', 'gate',
    'goat', 'plate', 'paint', 'glass', 'grass', 'water', 'wheel', 'garlic',
    'donkey', 'dinner', 'pepper'
];
