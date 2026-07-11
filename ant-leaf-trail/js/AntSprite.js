/**
 * AntSprite - Visual overlay for the ant: positioning, rotation, walk frames
 * Art frames all face UP; rotation is applied with CSS transforms.
 */
const ART = '../art/ant/__leaf_cutter_';
const FRAME_COUNT = 8;
const FRAME_MS = 45;

export class AntSprite {
    constructor(container) {
        this.container = container;
        this.walkTimer = null;
        this.frameIndex = 0;
        this.carrying = false;
        this.preload();
        this.createElements();
    }

    preload() {
        this.frames = { plain: [], leaf: [] };
        for (let i = 0; i < FRAME_COUNT; i++) {
            const n = String(i).padStart(3, '0');
            this.frames.plain.push(`${ART}move_${n}.png`);
            this.frames.leaf.push(`${ART}with_leaf_move_${n}.png`);
        }
        this.idle = { plain: `${ART}base_000.png`, leaf: `${ART}with_leaf_base_000.png` };
        [...this.frames.plain, ...this.frames.leaf, this.idle.plain, this.idle.leaf]
            .forEach(src => { const img = new Image(); img.src = src; });
    }

    createElements() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'ant-overlay';
        this.img = document.createElement('img');
        this.img.className = 'ant-img';
        this.img.alt = 'Ant';
        this.img.draggable = false;
        this.img.src = this.idle.plain;
        this.overlay.appendChild(this.img);
        this.container.appendChild(this.overlay);
    }

    /** Re-append after grid re-render wipes cells (overlay is kept, but ensure) */
    ensureAttached() {
        if (!this.overlay.isConnected) {
            this.container.appendChild(this.overlay);
        }
    }

    setCarrying(carrying) {
        this.carrying = carrying;
        this.img.src = this.walkTimer
            ? this.currentFrames()[this.frameIndex]
            : this.idle[carrying ? 'leaf' : 'plain'];
    }

    currentFrames() {
        return this.carrying ? this.frames.leaf : this.frames.plain;
    }

    /** Position over a cell. pos from Grid.getCellPosition */
    setPosition(pos, animate = true) {
        if (!pos) return;
        if (!animate) this.overlay.style.transition = 'none';
        this.overlay.style.left = `${pos.left}px`;
        this.overlay.style.top = `${pos.top}px`;
        this.overlay.style.width = `${pos.width}px`;
        this.overlay.style.height = `${pos.height}px`;
        this.overlay.style.marginLeft = `-${pos.width / 2}px`;
        this.overlay.style.marginTop = `-${pos.height / 2}px`;
        if (!animate) {
            this.overlay.offsetHeight; // force reflow
            this.overlay.style.transition = '';
        }
    }

    /** Rotate using cumulative degrees so turns always animate the short way */
    setRotation(degrees, animate = true) {
        if (!animate) this.img.style.transition = 'none';
        this.img.style.transform = `rotate(${degrees}deg)`;
        if (!animate) {
            this.img.offsetHeight; // force reflow
            this.img.style.transition = '';
        }
    }

    startWalk() {
        this.stopWalk();
        this.frameIndex = 0;
        this.walkTimer = setInterval(() => {
            this.frameIndex = (this.frameIndex + 1) % FRAME_COUNT;
            this.img.src = this.currentFrames()[this.frameIndex];
        }, FRAME_MS);
    }

    stopWalk() {
        if (this.walkTimer) {
            clearInterval(this.walkTimer);
            this.walkTimer = null;
        }
        this.img.src = this.idle[this.carrying ? 'leaf' : 'plain'];
    }

    pulse() {
        this.overlay.classList.remove('pulse');
        this.overlay.offsetHeight;
        this.overlay.classList.add('pulse');
    }

    shake() {
        this.overlay.classList.remove('shake');
        this.overlay.offsetHeight;
        this.overlay.classList.add('shake');
    }
}
