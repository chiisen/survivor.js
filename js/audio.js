// @ts-check

import { loadConfig } from './configLoader.js';

export class AudioManager {
    /**
     * 建立音效管理器實例，初始化 Web Audio API
     */
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
        this.loadConfig();
    }

    /**
     * 從 JSON 載入音效設定
     */
    loadConfig() {
        loadConfig('./config/audio.json').then(config => {
            if (config.defaults) {
                this.masterVolume = config.defaults.masterVolume;
                this.sfxVolume = config.defaults.sfxVolume;
                this.bgmVolume = config.defaults.bgmVolume;
            }
            if (config.sounds) {
                this.sounds = config.sounds;
            }
        });
    }

    /**
     * 初始化 AudioContext 與音效定義
     */
    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.createSounds();
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
            this.enabled = false;
        }
    }

    /**
     * 建立所有音效的參數定義（頻率、時長、波形、音量）
     */
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

    /**
     * 若 AudioContext 處於暫停狀態則恢復播放
     */
    resumeContext() {
        if (this.audioContext && this.audioContext.state === 'suspended' && this.audioStarted) {
            this.audioContext.resume();
        }
    }

    /**
     * 播放指定名稱的音效
     * @param {string} soundName - 音效名稱（如 'swing', 'hit', 'kill' 等）
     */
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

    /** 播放揮擊音效 */
    playSwing() {
        this.play('swing');
    }

    /** 播放命中音效 */
    playHit() {
        this.play('hit');
    }

    /** 播放擊殺音效 */
    playKill() {
        this.play('kill');
    }

    /** 播放連殺音效 */
    playChainKill() {
        this.play('chainKill');
    }

    /** 播放升級音效 */
    playLevelUp() {
        this.play('levelUp');
    }

    /** 播放受傷音效 */
    playDamage() {
        this.play('damage');
    }

    /** 播放拾取音效 */
    playPickup() {
        this.play('pickup');
    }

    /** 播放遊戲結束音效 */
    playGameOver() {
        this.play('gameOver');
    }

    /**
     * 啟動背景音樂（使用 LFO 調變的三角波合成）
     */
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

    /** 停止背景音樂 */
    stopBGM() {
        if (this.bgmSource) {
            this.bgmSource.oscillator.stop();
            this.bgmSource.lfo.stop();
            this.bgmSource = null;
        }
    }

    /**
     * 設定主音量
     * @param {number} value - 音量值（0 ~ 1）
     */
    setMasterVolume(value) {
        this.masterVolume = Math.max(0, Math.min(1, value));
    }

    /**
     * 設定音效音量
     * @param {number} value - 音量值（0 ~ 1）
     */
    setSfxVolume(value) {
        this.sfxVolume = Math.max(0, Math.min(1, value));
    }

    /**
     * 設定背景音樂音量
     * @param {number} value - 音量值（0 ~ 1）
     */
    setBgmVolume(value) {
        this.bgmVolume = Math.max(0, Math.min(1, value));
        if (this.bgmSource) {
            const volume = 0.1 * this.bgmVolume * this.masterVolume;
            this.bgmSource.gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        }
    }

    /** 切換音效開關 */
    toggleSfx() {
        this.enabled = !this.enabled;
    }

    /** 切換背景音樂開關 */
    toggleBgm() {
        this.bgmEnabled = !this.bgmEnabled;
        if (this.bgmEnabled) {
            this.startBGM();
        } else {
            this.stopBGM();
        }
    }

    /** 釋放所有音效資源並關閉 AudioContext */
    dispose() {
        this.stopBGM();
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}
