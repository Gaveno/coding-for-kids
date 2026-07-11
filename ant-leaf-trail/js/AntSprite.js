/**
 * AntSprite - Visual overlay for the ant: positioning, rotation, and all
 * frame animations (walk, idle fidget, look around, bite, die).
 * Art frames all face UP; rotation is applied with CSS transforms.
 */
const ART = '../art/ant/leaf_cutter_';
const SETS = { move: 8, idle: 20, bite: 8, die: 10 };
const WALK_FRAME_MS = 45;

function seq(name, count, leaf) {
    const prefix = ART + (leaf ? 'with_leaf_' : '');
    return Array.from({ length: count }, (_, i) =>
        `${prefix}${name}_${String(i).padStart(3, '0')}.png`);
}

export class AntSprite {
    constructor(container) {
        this.container = container;
        this.walkTimer = null;
        this.idleTimer = null;
        this.busy = false;
        this.carrying = false;
        this.frameIndex = 0;
        this.buildFrames();
        this.createElements();
        // Preload walk/base eagerly, the rest in the background
        [...this.frames.move.plain, this.idle.plain, this.idle.leaf]
            .forEach(src => { new Image().src = src; });
        setTimeout(() => this.preloadAll(), 1500);
    }

    buildFrames() {
        this.frames = {};
        for (const [name, count] of Object.entries(SETS)) {
            this.frames[name] = { plain: seq(name, count, false), leaf: seq(name, count, true) };
        }
        const look = [...seq('look_to_left', 5, false), ...seq('look_to_center_from_left', 5, false)];
        this.frames.look = { plain: look, leaf: look };
        this.idle = { plain: `${ART}base_000.png`, leaf: `${ART}with_leaf_base_000.png` };
    }

    preloadAll() {
        Object.values(this.frames).forEach(set =>
            [...set.plain, ...set.leaf].forEach(src => { new Image().src = src; }));
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

    ensureAttached() {
        if (!this.overlay.isConnected) this.container.appendChild(this.overlay);
    }

    idleFrame() {
        return this.idle[this.carrying ? 'leaf' : 'plain'];
    }

    setCarrying(carrying) {
        this.carrying = carrying;
        if (!this.busy && !this.walkTimer) this.img.src = this.idleFrame();
    }

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
            this.overlay.offsetHeight;
            this.overlay.style.transition = '';
        }
    }

    setRotation(degrees, animate = true) {
        if (!animate) this.img.style.transition = 'none';
        this.img.style.transform = `rotate(${degrees}deg)`;
        if (!animate) {
            this.img.offsetHeight;
            this.img.style.transition = '';
        }
    }

    startWalk() {
        this.stopWalk();
        this.frameIndex = 0;
        const set = this.frames.move;
        this.walkTimer = setInterval(() => {
            this.frameIndex = (this.frameIndex + 1) % set.plain.length;
            this.img.src = set[this.carrying ? 'leaf' : 'plain'][this.frameIndex];
        }, WALK_FRAME_MS);
    }

    stopWalk() {
        if (this.walkTimer) {
            clearInterval(this.walkTimer);
            this.walkTimer = null;
        }
        if (!this.busy) this.img.src = this.idleFrame();
    }

    /**
     * Play a frame set once. Resolves when finished.
     * @param {string} name - move|idle|bite|die|look
     * @param {object} opts - { fps, hold } hold keeps the last frame (death)
     */
    playOnce(name, { fps = 14, hold = false } = {}) {
        const set = this.frames[name];
        if (!set) return Promise.resolve();
        const frames = set[this.carrying && set.leaf !== set.plain ? 'leaf' : 'plain'];
        this.stopWalk();
        this.busy = true;
        return new Promise(resolve => {
            let i = 0;
            const timer = setInterval(() => {
                if (i >= frames.length) {
                    clearInterval(timer);
                    this.busy = false;
                    if (!hold) this.img.src = this.idleFrame();
                    resolve();
                    return;
                }
                this.img.src = frames[i++];
            }, 1000 / fps);
        });
    }

    async playDie() {
        await this.playOnce('die', { fps: 12, hold: true });
    }

    /** Random fidget/look animations while the kid is thinking */
    startIdleLoop() {
        this.stopIdleLoop();
        const schedule = () => {
            this.idleTimer = setTimeout(async () => {
                if (!this.busy && !this.walkTimer) {
                    await this.playOnce(Math.random() < 0.5 ? 'idle' : 'look', { fps: 12 });
                }
                schedule();
            }, 4000 + Math.random() * 4000);
        };
        schedule();
    }

    stopIdleLoop() {
        if (this.idleTimer) {
            clearTimeout(this.idleTimer);
            this.idleTimer = null;
        }
        this.busy = false;
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
