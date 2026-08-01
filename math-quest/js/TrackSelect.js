/**
 * TrackSelect - The map of tracks: one row per operation, one button per mode
 *
 * Locked tracks show a padlock; finished tracks show their stars.
 */
import { OP_ORDER, MODE_ORDER, MODE_ICONS, trackId, isUnlocked } from './Tracks.js';
import { OPERATIONS } from './Problems.js';

export class TrackSelect {
    /**
     * @param {HTMLElement} container - Element to render the map into
     * @param {Object} callbacks - { onPick(opId, mode) }
     */
    constructor(container, callbacks) {
        this.container = container;
        this.onPick = callbacks.onPick;
    }

    /** @param {Progress} progress - Star store deciding locks and ratings */
    render(progress) {
        this.container.innerHTML = '';
        const getStars = id => progress.getStars(id);
        OP_ORDER.forEach(opId => {
            const row = document.createElement('div');
            row.className = 'track-row';

            const label = document.createElement('div');
            label.className = 'track-label';
            label.textContent = OPERATIONS[opId].example;
            label.setAttribute('aria-hidden', 'true');
            row.appendChild(label);

            MODE_ORDER.forEach(mode => {
                row.appendChild(this.trackButton(opId, mode, getStars));
            });
            this.container.appendChild(row);
        });
    }

    trackButton(opId, mode, getStars) {
        const unlocked = isUnlocked(opId, mode, getStars);
        const stars = getStars(trackId(opId, mode));

        const btn = document.createElement('button');
        btn.className = 'track-btn';
        btn.disabled = !unlocked;
        btn.setAttribute('aria-label',
            `${OPERATIONS[opId].example} ${mode} track${unlocked ? '' : ' (locked)'}`);

        const icon = document.createElement('span');
        icon.className = 'track-icon';
        icon.textContent = unlocked ? MODE_ICONS[mode] : '🔒';
        btn.appendChild(icon);

        const starsEl = document.createElement('span');
        starsEl.className = 'track-stars';
        starsEl.textContent = '⭐'.repeat(stars);
        btn.appendChild(starsEl);

        if (unlocked) {
            btn.addEventListener('pointerdown', e => {
                e.preventDefault();
                this.onPick(opId, mode);
            });
        }
        return btn;
    }
}
