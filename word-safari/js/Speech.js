/**
 * Speech - Speaks words aloud using the built-in Web Speech API
 *
 * No external dependencies: uses window.speechSynthesis, which is
 * available in all modern browsers. Fails silently if unsupported.
 */
export class Speech {
    constructor() {
        this.enabled = typeof window !== 'undefined' && 'speechSynthesis' in window;
        this.voice = null;
        this.unlocked = false;
        if (this.enabled) {
            this.pickVoice();
            // Voice list often loads asynchronously (always async on iOS)
            window.speechSynthesis.onvoiceschanged = () => this.pickVoice();
        }
    }

    /**
     * Prime speech from a user gesture. iOS Safari only allows speech
     * that starts inside a touch gesture until a first utterance has
     * played - so we speak a silent one on the first tap.
     */
    unlock() {
        if (!this.enabled || this.unlocked) return;
        try {
            const utterance = new SpeechSynthesisUtterance(' ');
            utterance.volume = 0;
            window.speechSynthesis.speak(utterance);
            this.unlocked = true;
        } catch (e) {
            // Ignore
        }
    }

    /** Prefer a local English voice, ideally a child-friendly one */
    pickVoice() {
        const voices = window.speechSynthesis.getVoices();
        if (!voices.length) return;
        const english = voices.filter(v => v.lang && v.lang.startsWith('en'));
        const pool = english.length ? english : voices;
        this.voice =
            pool.find(v => v.localService && /kid|junior|child/i.test(v.name)) ||
            pool.find(v => v.localService) ||
            pool[0];
    }

    /**
     * Say a word slowly and clearly
     * @param {string} word - Word to speak
     */
    say(word) {
        if (!this.enabled) return;
        try {
            const synth = window.speechSynthesis;
            synth.resume(); // iOS can leave the queue stuck in a paused state

            const speakNow = () => {
                const utterance = new SpeechSynthesisUtterance(word);
                if (this.voice) utterance.voice = this.voice;
                utterance.rate = 0.75;
                utterance.pitch = 1.1;
                utterance.volume = 1;
                synth.speak(utterance);
            };

            if (synth.speaking || synth.pending) {
                // iOS drops utterances queued immediately after cancel()
                synth.cancel();
                setTimeout(speakNow, 80);
            } else {
                speakNow();
            }
        } catch (e) {
            // Speech is a bonus - never break the game over it
        }
    }

    /** Cheer with the word, e.g. after a correct answer */
    celebrate(word) {
        this.say(`${word}!`);
    }

    stop() {
        if (!this.enabled) return;
        try {
            window.speechSynthesis.cancel();
        } catch (e) {
            // Ignore
        }
    }
}
