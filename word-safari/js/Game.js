/**
 * Game - Main controller for Word Safari
 */
import { getLevel, getMode, TOTAL_LEVELS, PHASE_SIZE } from './Words.js';
import { Progress } from './Progress.js';
import { Speech } from './Speech.js';
import { Audio } from './Audio.js';
import { Keyboard } from './Keyboard.js';
import { ChoiceMode } from './ChoiceMode.js';
import { TypingMode } from './TypingMode.js';

export class Game {
    init() {
        this.progress = new Progress();
        this.speech = new Speech();
        this.audio = new Audio();
        this.shownTypingIntro = false;

        this.els = {
            picture: document.getElementById('picture'),
            speakBtn: document.getElementById('speakBtn'),
            starCount: document.getElementById('starCount'),
            progressFill: document.getElementById('progressFill'),
            phaseIcon: document.getElementById('phaseIcon'),
            choices: document.getElementById('choices'),
            slots: document.getElementById('slots'),
            keyboard: document.getElementById('keyboard'),
            startOverlay: document.getElementById('startOverlay'),
            typingOverlay: document.getElementById('typingOverlay'),
            winOverlay: document.getElementById('winOverlay'),
            helpOverlay: document.getElementById('helpOverlay')
        };

        this.choiceMode = new ChoiceMode(this.els.choices, {
            onCorrect: () => this.handleCorrect(),
            onWrong: () => this.handleWrong()
        });
        this.typingMode = new TypingMode(this.els.slots, {
            onCorrect: () => this.handleCorrect(),
            onWrong: () => this.handleWrong()
        });
        this.keyboard = new Keyboard(this.els.keyboard, {
            onLetter: letter => {
                this.audio.key();
                this.typingMode.addLetter(letter);
            },
            onErase: () => {
                this.audio.erase();
                this.typingMode.erase();
            }
        });

        this.bindButtons();
        this.bindAudioUnlock();
        this.updateHud();
    }

    /**
     * iOS Safari only unlocks audio/speech from a completed touch gesture
     * (touchend/click, not pointerdown) - prime both on the first one.
     */
    bindAudioUnlock() {
        const unlock = () => {
            this.audio.init();
            this.speech.unlock();
        };
        ['touchend', 'pointerup', 'click'].forEach(evt =>
            document.addEventListener(evt, unlock, { once: true, passive: true })
        );
    }

    bindButtons() {
        document.getElementById('startBtn').addEventListener('pointerdown', e => {
            e.preventDefault();
            this.audio.init(); // Needs a user gesture (browser policy)
            this.els.startOverlay.classList.remove('visible');
            this.startLevel();
        });
        this.els.speakBtn.addEventListener('pointerdown', e => {
            e.preventDefault();
            this.sayCurrentWord();
        });
        document.getElementById('typingGoBtn').addEventListener('pointerdown', e => {
            e.preventDefault();
            this.els.typingOverlay.classList.remove('visible');
            this.startLevel();
        });
        document.getElementById('replayBtn').addEventListener('pointerdown', e => {
            e.preventDefault();
            this.els.winOverlay.classList.remove('visible');
            this.shownTypingIntro = false;
            this.progress.restart();
            this.updateHud();
            this.startLevel();
        });
        document.getElementById('helpBtn').addEventListener('pointerdown', e => {
            e.preventDefault();
            this.els.helpOverlay.classList.add('visible');
        });
        document.getElementById('closeHelpBtn').addEventListener('pointerdown', e => {
            e.preventDefault();
            this.els.helpOverlay.classList.remove('visible');
        });
    }

    startLevel() {
        const level = this.progress.getLevel();
        this.entry = getLevel(level);
        const mode = getMode(level);

        // First typing level gets a friendly "now you spell it!" intro
        if (mode === 'typing' && !this.shownTypingIntro) {
            this.shownTypingIntro = true;
            this.els.typingOverlay.classList.add('visible');
            return;
        }

        this.els.picture.textContent = this.entry.emoji;
        this.els.picture.classList.remove('pop');
        void this.els.picture.offsetWidth;
        this.els.picture.classList.add('pop');

        if (mode === 'typing') {
            this.choiceMode.hide();
            this.typingMode.start(this.entry);
            this.keyboard.setActive(true);
        } else {
            this.typingMode.hide();
            this.keyboard.setActive(false);
            // Review phase: decoys share the first letter - sound it out!
            this.choiceMode.start(this.entry, { sameStart: mode === 'review' });
        }

        this.audio.pop();
        this.updateHud();
        setTimeout(() => this.sayCurrentWord(), 400);
    }

    sayCurrentWord() {
        if (this.entry) this.speech.say(this.entry.word);
        this.els.speakBtn.classList.remove('talking');
        void this.els.speakBtn.offsetWidth;
        this.els.speakBtn.classList.add('talking');
    }

    handleCorrect() {
        this.audio.correct();
        this.speech.celebrate(this.entry.word);
        this.spawnStar();
        const wasLast = this.progress.getLevel() === TOTAL_LEVELS;
        this.progress.completeLevel();
        this.updateHud();
        setTimeout(() => {
            if (wasLast) {
                this.keyboard.setActive(false);
                this.audio.win();
                this.els.winOverlay.classList.add('visible');
            } else {
                this.startLevel();
            }
        }, 1600);
    }

    handleWrong() {
        this.audio.wrong();
        setTimeout(() => this.sayCurrentWord(), 500);
    }

    /** Star flies up from the picture as a reward */
    spawnStar() {
        const star = document.createElement('div');
        star.className = 'fly-star';
        star.textContent = '⭐';
        this.els.picture.parentElement.appendChild(star);
        setTimeout(() => star.remove(), 1200);
    }

    updateHud() {
        const level = this.progress.getLevel();
        const icons = { choice: '👆', review: '👀', typing: '⌨️' };
        this.els.starCount.textContent = this.progress.getStars();
        this.els.phaseIcon.textContent = icons[getMode(level)] || '👆';

        // Progress bar fills across the current phase
        const inPhase = (level - 1) % PHASE_SIZE;
        this.els.progressFill.style.width = `${(inPhase / PHASE_SIZE) * 100}%`;
    }

    showHelp() {
        this.els.helpOverlay.classList.add('visible');
    }
}
