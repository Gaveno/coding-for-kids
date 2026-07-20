/**
 * WordData - Master picture-word list for Word Safari
 *
 * A single list of words is shared by BOTH game modes: kids first learn to
 * RECOGNISE each word in read mode, then SPELL the very same words in write
 * mode, so reading practice feeds spelling success. Words are in ascending
 * length order (easy -> hard); the play order is shuffled within each length
 * band per session.
 */

/** Every picture word, shortest-first (used by both read and write modes) */
export const WORDS = [
    // 2 letters - easiest
    { word: 'ox',     emoji: '🐂' },
    { word: 'ax',     emoji: '🪓' },
    // 3 letters
    { word: 'cat',    emoji: '🐱' },
    { word: 'dog',    emoji: '🐶' },
    { word: 'sun',    emoji: '☀️' },
    { word: 'bee',    emoji: '🐝' },
    { word: 'pig',    emoji: '🐷' },
    { word: 'egg',    emoji: '🥚' },
    { word: 'hen',    emoji: '🐔' },
    { word: 'web',    emoji: '🕸️' },
    { word: 'nut',    emoji: '🥜' },
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
    { word: 'fish',   emoji: '🐟' },
    { word: 'frog',   emoji: '🐸' },
    { word: 'duck',   emoji: '🦆' },
    { word: 'star',   emoji: '⭐' },
    { word: 'book',   emoji: '📖' },
    { word: 'ball',   emoji: '⚽' },
    { word: 'lamp',   emoji: '💡' },
    { word: 'nest',   emoji: '🪺' },
    { word: 'gift',   emoji: '🎁' },
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
    { word: 'apple',  emoji: '🍎' },
    { word: 'house',  emoji: '🏠' },
    { word: 'snake',  emoji: '🐍' },
    { word: 'train',  emoji: '🚂' },
    { word: 'plant',  emoji: '🌱' },
    { word: 'grape',  emoji: '🍇' },
    { word: 'crown',  emoji: '👑' },
    { word: 'whale',  emoji: '🐳' },
    { word: 'horse',  emoji: '🐴' },
    { word: 'pizza',  emoji: '🍕' },
    { word: 'robot',  emoji: '🤖' },
    { word: 'clock',  emoji: '⏰' },
    { word: 'mouse',  emoji: '🐭' },
    { word: 'sword',  emoji: '⚔️' },
    { word: 'tooth',  emoji: '🦷' },
    { word: 'bread',  emoji: '🍞' },
    // 6 letters - hardest
    { word: 'banana', emoji: '🍌' },
    { word: 'monkey', emoji: '🐵' },
    { word: 'rocket', emoji: '🚀' },
    { word: 'guitar', emoji: '🎸' },
    { word: 'dragon', emoji: '🐉' },
    { word: 'cheese', emoji: '🧀' },
    { word: 'planet', emoji: '🪐' },
    { word: 'bridge', emoji: '🌉' },
    { word: 'flower', emoji: '🌸' },
    { word: 'spider', emoji: '🕷️' },
    { word: 'orange', emoji: '🍊' },
    { word: 'pencil', emoji: '✏️' },
    { word: 'turtle', emoji: '🐢' },
    { word: 'rabbit', emoji: '🐰' },
    { word: 'castle', emoji: '🏰' },
    { word: 'window', emoji: '🪟' }
];

// Both modes draw from the same master list so recognition feeds spelling.
export const CHOICE_WORDS = WORDS;
export const TYPING_WORDS = WORDS;

/**
 * Extra words used only as wrong answers. Words that share a first letter AND
 * length already cover each other (the decoy pool includes every picture
 * word), so these fillers exist for the letter+length groups that have only a
 * single picture word - guaranteeing every review level has 2 tricky decoys.
 */
export const DECOYS = [
    'on', 'of', 'or', 'go', 'in', 'up', 'me', 'we', 'am', 'an',
    'ant', 'bat', 'bed', 'big', 'bug', 'can', 'cap', 'cot', 'cub', 'cup',
    'den', 'dig', 'dot', 'ear', 'eat', 'elf', 'eye', 'jam', 'jog', 'jar',
    'leg', 'map', 'mud', 'mat', 'net', 'owl', 'pan', 'pen', 'pin', 'pot',
    'sea', 'sit', 'six', 'ham', 'hop', 'wet', 'wig', 'nap', 'fan', 'fig',
    'kid', 'keg',
    'bath', 'bell', 'bird', 'boat', 'boot', 'corn', 'dark', 'desk', 'door',
    'dust', 'farm', 'five', 'fork', 'nose', 'ring', 'sand', 'sock', 'step',
    'stop', 'wolf', 'lock', 'leaf', 'neck', 'gate', 'goat', 'moth', 'mask',
    'cave', 'coat', 'tent', 'tail', 'king', 'kiwi',
    'alarm', 'ankle', 'apron', 'chair', 'cloud', 'hands', 'happy', 'heart',
    'sheep', 'smile', 'snail', 'stone', 'table', 'teeth', 'tiger', 'truck',
    'plate', 'paint', 'glass', 'grass', 'water', 'wheel', 'robin', 'river',
    'money', 'music', 'brush', 'beach',
    'basket', 'bottle', 'bubble', 'button', 'candle', 'garden', 'market',
    'mitten', 'mother', 'ribbon', 'rubber', 'garlic', 'donkey', 'dinner',
    'pepper', 'forest', 'fridge', 'shadow', 'saddle', 'orchid', 'oyster',
    'ticket', 'tunnel', 'winter', 'wizard'
];
