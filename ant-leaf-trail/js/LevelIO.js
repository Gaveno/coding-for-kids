/**
 * LevelIO - Serializes levels to the LEVELS-constant format and writes them
 * back into Levels.js using the File System Access API (local dev only).
 */

/** Format a level object exactly like an entry in the LEVELS constant. */
export function formatLevel(level) {
    const parts = [
        `gridSize: ${level.gridSize}`,
        `start: { x: ${level.start.x}, y: ${level.start.y} }`,
        `heading: '${level.heading}'`,
        `nest: '${level.nest}'`
    ];
    const arr = (name, list) =>
        (list && list.length) ? `${name}: [${list.map(k => `'${k}'`).join(', ')}]` : null;
    [arr('leaves', level.leaves), arr('obstacles', level.obstacles),
     arr('crumbs', level.crumbs)].forEach(part => { if (part) parts.push(part); });
    if (level.tunnels && level.tunnels.length === 2) parts.push(arr('tunnels', level.tunnels));
    if (level.patrol && level.patrol.path && level.patrol.path.length >= 2) {
        const path = level.patrol.path.map(k => `'${k}'`).join(', ');
        parts.push(`patrol: { path: [${path}], start: ${level.patrol.start}, dir: ${level.patrol.dir} }`);
    }
    return `{ ${parts.join(', ')} }`;
}

export function canWriteFiles() {
    return typeof window.showOpenFilePicker === 'function';
}

const clone = (obj) => JSON.parse(JSON.stringify(obj));

let fileHandle = null;

async function ensureHandle() {
    if (fileHandle &&
        await fileHandle.queryPermission({ mode: 'readwrite' }) === 'granted') {
        return fileHandle;
    }
    if (!fileHandle) {
        [fileHandle] = await window.showOpenFilePicker({
            types: [{ description: 'Levels.js', accept: { 'text/javascript': ['.js'] } }]
        });
    }
    if (await fileHandle.requestPermission({ mode: 'readwrite' }) !== 'granted') {
        throw new Error('Permission to write Levels.js was denied');
    }
    return fileHandle;
}

/** Load the current on-disk levels fresh (reflects prior saves this session). */
export async function loadLevels() {
    const mod = await import(`./Levels.js?ts=${Date.now()}`);
    return { levels: mod.LEVELS.map(clone), pars: [...mod.PAR] };
}

/**
 * Read the raw Levels.js source over HTTP (via the dev server) rather than
 * through the file handle. Fetching does not cache any state on the handle,
 * which avoids the "state changed since read from disk" write failure.
 */
async function fetchSource() {
    const url = new URL('./Levels.js', import.meta.url);
    url.searchParams.set('ts', Date.now());
    const resp = await fetch(url, { cache: 'no-store' });
    if (!resp.ok) throw new Error(`Could not read Levels.js (${resp.status})`);
    return resp.text();
}

function applyMode(levels, pars, level, mode, index) {
    if (mode === 'override') {
        levels[index] = level;
    } else if (mode === 'before') {
        levels.splice(index, 0, level);
        pars.splice(index, 0, pars[index] ?? 3);
    } else if (mode === 'after') {
        levels.splice(index + 1, 0, level);
        pars.splice(index + 1, 0, pars[index] ?? 3);
    } else {
        levels.push(level);
        pars.push(3);
    }
}

function rewrite(text, levels, pars) {
    const body = levels
        .map((lv, i) => `    // Level ${i + 1}\n    ${formatLevel(lv)}`)
        .join(',\n');
    const levelsBlock = `export const LEVELS = [\n${body}\n];`;
    const parBlock = `export const PAR = [${pars.join(', ')}];`;
    return text
        .replace(/export const LEVELS = \[[\s\S]*?\n\];/, () => levelsBlock)
        .replace(/export const PAR = \[[^\]]*\];/, () => parBlock);
}

/**
 * Splice a level into Levels.js and write the file back to disk.
 * @param {object} level - level data from the editor
 * @param {string} mode - 'override' | 'before' | 'after' | 'append'
 * @param {number} index - 0-based target index (ignored for append)
 * @returns {Promise<number>} the resulting level number (1-based)
 */
export async function saveLevel(level, mode, index) {
    const handle = await ensureHandle();
    // Load current on-disk levels FIRST so the read+write below happen
    // back-to-back with no async gap that could let OneDrive/the editor
    // touch the file and invalidate the handle's cached state.
    const { levels, pars } = await loadLevels();
    applyMode(levels, pars, clone(level), mode, index);
    await writeLevels(handle, levels, pars);
    if (mode === 'before') return index + 1;
    if (mode === 'after') return index + 2;
    if (mode === 'append') return levels.length;
    return index + 1;
}

/** Read the file text and write the regenerated version straight back. */
async function writeLevels(handle, levels, pars) {
    // Fetch source over HTTP (no cached file state on the handle), then use
    // the handle only for the write. This eliminates the InvalidStateError
    // that fires when OneDrive touches the file between getFile() and close().
    const text = await fetchSource();
    const output = rewrite(text, levels, pars);
    let lastErr = null;
    for (let attempt = 0; attempt < 5; attempt++) {
        try {
            const writable = await handle.createWritable();
            await writable.write(output);
            await writable.close();
            return;
        } catch (err) {
            lastErr = err;
            if (err && err.name === 'InvalidStateError') {
                await new Promise(r => setTimeout(r, 200 * (attempt + 1)));
                continue;
            }
            throw err;
        }
    }
    throw new Error(
        'The file kept changing on disk (likely OneDrive syncing). Pause OneDrive ' +
        'sync for this folder, or use the 📋 button to copy the level instead. ' +
        `(${lastErr && lastErr.message ? lastErr.message : lastErr})`
    );
}
