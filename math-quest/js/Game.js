/**
 * Game - Main controller for Math Quest
 */
import { problemFor, makeChoices } from './Problems.js';
import { QUESTIONS_PER_TRACK, MODE_ICONS, trackId, starsForMistakes } from './Tracks.js';
import { Progress } from './Progress.js';
import { Audio } from './Audio.js';
import { Equation } from './Equation.js';
import { ChoiceMode } from './ChoiceMode.js';
import { TypingMode } from './TypingMode.js';
import { NumberPad } from './NumberPad.js';
import { TrackSelect } from './TrackSelect.js';
import { Effects } from './Effects.js';

export class Game {
    init() {
        this.progress = new Progress(window.localStorage);
        this.audio = new Audio();

        this.els = {
            totalStars: document.getElementById('totalStars'),
            trackScreen: document.getElementById('trackScreen'),
            playScreen: document.getElementById('playScreen'),
            modeIcon: document.getElementById('modeIcon'),
            dots: document.getElementById('dots'),
            equationCard: document.getElementById('equationCard'),
            equation: document.getElementById('equation'),
            choices: document.getElementById('choices'),
            numberpad: document.getElementById('numberpad'),
            winOverlay: document.getElementById('winOverlay'),
            winStars: document.getElementById('winStars'),
            helpOverlay: document.getElementById('helpOverlay')
        };

        this.equation = new Equation(this.els.equation);
        this.effects = new Effects(document.querySelector('.game-container'));
        this.choiceMode = new ChoiceMode(this.els.choices, {
            onCorrect: () => this.handleCorrect(),
            onWrong: anchor => this.handleWrong(anchor)
        });
        this.typingMode = new TypingMode({
            onCorrect: () => this.handleCorrect(),
            onWrong: anchor => this.handleWrong(anchor)
        });
        this.numberPad = new NumberPad(this.els.numberpad, {
            onDigit: digit => {
                this.audio.key();
                this.typingMode.addDigit(digit);
            },
            onErase: () => {
                this.audio.erase();
                this.typingMode.erase();
            }
        });
        this.trackSelect = new TrackSelect(this.els.trackScreen, {
            onPick: (opId, mode) => this.startTrack(opId, mode)
        });

        this.bindButtons();
        this.bindAudioUnlock();
        this.showTracks();
    }

    /**
     * iOS Safari only unlocks audio from a completed touch gesture
     * (touchend/click, not pointerdown) - prime it on the first one.
     */
    bindAudioUnlock() {
        const unlock = () => this.audio.init();
        ['touchend', 'pointerup', 'click'].forEach(evt =>
            document.addEventListener(evt, unlock, { once: true, passive: true })
        );
    }

    bindButtons() {
        const tap = (id, action) => {
            document.getElementById(id).addEventListener('pointerdown', e => {
                e.preventDefault();
                action();
            });
        };
        tap('backBtn', () => this.showTracks());
        tap('helpBtn', () => this.els.helpOverlay.classList.add('visible'));
        tap('closeHelpBtn', () => this.els.helpOverlay.classList.remove('visible'));
        tap('winMapBtn', () => {
            this.els.winOverlay.classList.remove('visible');
            this.showTracks();
        });
        tap('winReplayBtn', () => {
            this.els.winOverlay.classList.remove('visible');
            this.startTrack(this.opId, this.mode);
        });
    }

    /** Show the track map (also the back-out path mid-track) */
    showTracks() {
        this.numberPad.setActive(false);
        this.els.playScreen.classList.add('hidden');
        this.els.trackScreen.classList.remove('hidden');
        this.trackSelect.render(this.progress);
        this.updateStars();
    }

    startTrack(opId, mode) {
        this.opId = opId;
        this.mode = mode;
        this.questionIndex = 0;
        this.mistakes = 0;
        this.lastProblem = null;
        this.els.trackScreen.classList.add('hidden');
        this.els.playScreen.classList.remove('hidden');
        this.els.modeIcon.textContent = MODE_ICONS[mode];
        this.nextProblem();
    }

    nextProblem() {
        let problem = problemFor(this.opId, this.mode);
        // Re-roll a few times so the same numbers don't appear twice in a row
        for (let i = 0; i < 5 && this.lastProblem
            && problem.a === this.lastProblem.a && problem.b === this.lastProblem.b; i++) {
            problem = problemFor(this.opId, this.mode);
        }
        this.lastProblem = problem;
        this.problem = problem;

        const answerEl = this.equation.render(problem);
        if (this.mode === 'type') {
            this.choiceMode.hide();
            this.numberPad.setActive(true);
            this.typingMode.start(problem.answer, answerEl);
        } else {
            this.numberPad.setActive(false);
            this.choiceMode.start(makeChoices(problem.answer), problem.answer);
        }
        this.audio.pop();
        this.renderDots();
    }

    handleCorrect() {
        this.audio.correct();
        this.equation.reveal(this.problem);
        this.effects.correct(this.equation.answerEl, this.els.equationCard);
        this.questionIndex += 1;
        this.renderDots();
        setTimeout(() => {
            if (this.questionIndex >= QUESTIONS_PER_TRACK) this.finishTrack();
            else this.nextProblem();
        }, 1200);
    }

    handleWrong(anchor) {
        this.mistakes += 1;
        this.audio.wrong();
        this.effects.wrong(anchor || this.els.equationCard, this.els.equationCard);
    }

    finishTrack() {
        const stars = starsForMistakes(this.mistakes);
        this.progress.setStars(trackId(this.opId, this.mode), stars);
        this.numberPad.setActive(false);
        this.audio.win();
        this.els.winStars.textContent = '⭐'.repeat(stars);
        this.els.winOverlay.classList.add('visible');
        this.effects.win(this.els.winStars);
        this.updateStars();
    }

    /** One dot per question, filling up as the track progresses */
    renderDots() {
        this.els.dots.innerHTML = '';
        for (let i = 0; i < QUESTIONS_PER_TRACK; i++) {
            const dot = document.createElement('span');
            dot.className = 'dot';
            if (i < this.questionIndex) dot.classList.add('done');
            else if (i === this.questionIndex) dot.classList.add('current');
            this.els.dots.appendChild(dot);
        }
    }

    updateStars() {
        this.els.totalStars.textContent = this.progress.totalStars();
    }
}
