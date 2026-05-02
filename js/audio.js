export class AudioManager {
    constructor() {
        this.audioContext = null;
        this.masterVolume = 0.5;
        this.sfxVolume = 0.7;
        this.bgmVolume = 0.3;
        this.enabled = true;
        this.bgmEnabled = true;
        this.audioStarted = false;
        
        this.sounds = {};
        this.bgm = null;
        this.bgmSource = null;
        
        this.init();
    }

    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.createSounds();
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
            this.enabled = false;
        }
    }

    createSounds() {
        this.sounds = {
            swing: { frequency: 200, duration: 0.15, type: 'square', volume: 0.3 },
            hit: { frequency: 400, duration: 0.1, type: 'sine', volume: 0.4 },
            kill: { frequency: 800, duration: 0.3, type: 'square', volume: 0.5 },
            chainKill: { frequency: 1000, duration: 0.5, type: 'sine', volume: 0.6 },
            levelUp: { frequency: 600, duration: 0.8, type: 'sine', volume: 0.5 },
            damage: { frequency: 150, duration: 0.2, type: 'square', volume: 0.4 },
            pickup: { frequency: 500, duration: 0.1, type: 'sine', volume: 0.3 },
            gameOver: { frequency: 100, duration: 1.0, type: 'sine', volume: 0.4 }
        };
    }

    resumeContext() {
        if (this.audioContext && this.audioContext.state === 'suspended' && this.audioStarted) {
            this.audioContext.resume();
        }
    }

    play(soundName) {
        if (!this.enabled || !this.audioContext || !this.audioStarted) return;
        
        this.resumeContext();
        
        const sound = this.sounds[soundName];
        if (!sound) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = sound.type;
        oscillator.frequency.setValueAtTime(sound.frequency, this.audioContext.currentTime);
        
        if (soundName === 'levelUp') {
            oscillator.frequency.exponentialRampToValueAtTime(
                sound.frequency * 2,
                this.audioContext.currentTime + sound.duration * 0.5
            );
            oscillator.frequency.exponentialRampToValueAtTime(
                sound.frequency * 3,
                this.audioContext.currentTime + sound.duration
            );
        } else if (soundName === 'chainKill') {
            oscillator.frequency.exponentialRampToValueAtTime(
                sound.frequency * 1.5,
                this.audioContext.currentTime + sound.duration * 0.3
            );
        } else if (soundName === 'kill') {
            oscillator.frequency.exponentialRampToValueAtTime(
                sound.frequency * 0.5,
                this.audioContext.currentTime + sound.duration
            );
        }
        
        const volume = sound.volume * this.sfxVolume * this.masterVolume;
        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            this.audioContext.currentTime + sound.duration
        );
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + sound.duration);
    }

    playSwing() {
        this.play('swing');
    }

    playHit() {
        this.play('hit');
    }

    playKill() {
        this.play('kill');
    }

    playChainKill() {
        this.play('chainKill');
    }

    playLevelUp() {
        this.play('levelUp');
    }

    playDamage() {
        this.play('damage');
    }

    playPickup() {
        this.play('pickup');
    }

    playGameOver() {
        this.play('gameOver');
    }

    startBGM() {
        if (!this.enabled || !this.bgmEnabled || !this.audioContext || !this.audioStarted) return;
        
        this.resumeContext();
        
        if (this.bgmSource) {
            this.stopBGM();
        }

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const lfo = this.audioContext.createOscillator();
        const lfoGain = this.audioContext.createGain();
        
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(80, this.audioContext.currentTime);
        
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.5, this.audioContext.currentTime);
        lfoGain.gain.setValueAtTime(20, this.audioContext.currentTime);
        
        lfo.connect(lfoGain);
        lfoGain.connect(oscillator.frequency);
        
        const volume = 0.1 * this.bgmVolume * this.masterVolume;
        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        lfo.start();
        oscillator.start();
        
        this.bgmSource = { oscillator, lfo, gainNode };
    }

    stopBGM() {
        if (this.bgmSource) {
            this.bgmSource.oscillator.stop();
            this.bgmSource.lfo.stop();
            this.bgmSource = null;
        }
    }

    setMasterVolume(value) {
        this.masterVolume = Math.max(0, Math.min(1, value));
    }

    setSfxVolume(value) {
        this.sfxVolume = Math.max(0, Math.min(1, value));
    }

    setBgmVolume(value) {
        this.bgmVolume = Math.max(0, Math.min(1, value));
        if (this.bgmSource) {
            const volume = 0.1 * this.bgmVolume * this.masterVolume;
            this.bgmSource.gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        }
    }

    toggleSfx() {
        this.enabled = !this.enabled;
    }

    toggleBgm() {
        this.bgmEnabled = !this.bgmEnabled;
        if (this.bgmEnabled) {
            this.startBGM();
        } else {
            this.stopBGM();
        }
    }

    dispose() {
        this.stopBGM();
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}