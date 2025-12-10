/**
 * Supply Tests
 */
import { Supply } from '../js/Supply.js';

export function runSupplyTests() {
    const results = [];

    function test(name, fn) {
        try {
            fn();
            results.push({ name, passed: true });
        } catch (error) {
            results.push({ name, passed: false, error: error.message });
        }
    }

    function assertEqual(actual, expected, message = '') {
        if (actual !== expected) {
            throw new Error(`${message} Expected ${expected}, got ${actual}`);
        }
    }

    function assertArrayEqual(actual, expected, message = '') {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
            throw new Error(`${message} Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
        }
    }

    // Constructor tests
    test('Supply initializes with columns', () => {
        const supply = new Supply({ columns: [['🧱', '🧱'], ['🪟'], []] });
        assertEqual(supply.columnCount, 3);
    });

    test('Supply deep copies columns', () => {
        const columns = [['🧱', '🧱']];
        const supply = new Supply({ columns });
        columns[0].pop();
        assertEqual(supply.getColumnHeight(0), 2, 'Should not mutate');
    });

    // peekTop tests
    test('peekTop returns top block without removing', () => {
        const supply = new Supply({ columns: [['🧱', '🪟']] });
        assertEqual(supply.peekTop(0), '🪟');
        assertEqual(supply.getColumnHeight(0), 2);
    });

    test('peekTop returns null for empty column', () => {
        const supply = new Supply({ columns: [[]] });
        assertEqual(supply.peekTop(0), null);
    });

    test('peekTop returns null for invalid column', () => {
        const supply = new Supply({ columns: [['🧱']] });
        assertEqual(supply.peekTop(-1), null);
        assertEqual(supply.peekTop(5), null);
    });

    // takeTop tests
    test('takeTop removes and returns top block', () => {
        const supply = new Supply({ columns: [['🧱', '🪟']] });
        assertEqual(supply.takeTop(0), '🪟');
        assertEqual(supply.getColumnHeight(0), 1);
        assertEqual(supply.peekTop(0), '🧱');
    });

    test('takeTop returns null for empty column', () => {
        const supply = new Supply({ columns: [[]] });
        assertEqual(supply.takeTop(0), null);
    });

    // getColumnHeight tests
    test('getColumnHeight returns correct height', () => {
        const supply = new Supply({ columns: [['🧱', '🧱', '🧱'], ['🪟'], []] });
        assertEqual(supply.getColumnHeight(0), 3);
        assertEqual(supply.getColumnHeight(1), 1);
        assertEqual(supply.getColumnHeight(2), 0);
    });

    // getColumn tests
    test('getColumn returns copy of column contents', () => {
        const supply = new Supply({ columns: [['🧱', '🪟']] });
        const col = supply.getColumn(0);
        assertArrayEqual(col, ['🧱', '🪟']);
        col.pop();
        assertEqual(supply.getColumnHeight(0), 2, 'Original should not change');
    });

    // isEmpty tests
    test('isEmpty returns true when all columns empty', () => {
        const supply = new Supply({ columns: [[], [], []] });
        assertEqual(supply.isEmpty(), true);
    });

    test('isEmpty returns false when any column has blocks', () => {
        const supply = new Supply({ columns: [[], ['🧱'], []] });
        assertEqual(supply.isEmpty(), false);
    });

    // getTotalBlocks tests
    test('getTotalBlocks counts all blocks', () => {
        const supply = new Supply({ columns: [['🧱', '🧱'], ['🪟'], ['🚪', '🔺']] });
        assertEqual(supply.getTotalBlocks(), 5);
    });

    // getMaxHeight tests
    test('getMaxHeight returns tallest column height', () => {
        const supply = new Supply({ columns: [['🧱', '🧱', '🧱'], ['🪟'], []] });
        assertEqual(supply.getMaxHeight(), 3);
    });

    // reset tests
    test('reset restores initial state', () => {
        const supply = new Supply({ columns: [['🧱', '🧱'], ['🪟']] });
        supply.takeTop(0);
        supply.takeTop(1);
        supply.reset();
        assertEqual(supply.getColumnHeight(0), 2);
        assertEqual(supply.getColumnHeight(1), 1);
    });

    // isOverSupply tests
    test('isOverSupply checks column range', () => {
        const supply = new Supply({ columns: [['🧱'], ['🪟'], []] });
        assertEqual(supply.isOverSupply(0), true);
        assertEqual(supply.isOverSupply(2), true);
        assertEqual(supply.isOverSupply(3), false);
        assertEqual(supply.isOverSupply(-1), false);
    });

    return results;
}
