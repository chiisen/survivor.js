import { Game } from './game.js';

const canvas = document.getElementById('game-canvas');
const game = new Game(canvas);

let selectedDifficulty = 'normal';

const startScreen = document.getElementById('start-screen');
const settingsScreen = document.getElementById('settings-screen');
const gameContainer = document.getElementById('game-container');
const startBtn = document.getElementById('start-btn');
const settingsBtn = document.getElementById('settings-btn');
const settingsBackBtn = document.getElementById('settings-back-btn');
const backToMenuBtn = document.getElementById('back-to-menu-btn');
const difficultyBtns = document.querySelectorAll('.difficulty-btn');

const masterVolumeSlider = document.getElementById('master-volume');
const sfxVolumeSlider = document.getElementById('sfx-volume');
const bgmVolumeSlider = document.getElementById('bgm-volume');

function updateVolumeDisplays() {
    document.querySelectorAll('.volume-value').forEach((span, index) => {
        const sliders = [masterVolumeSlider, sfxVolumeSlider, bgmVolumeSlider];
        span.textContent = sliders[index].value + '%';
    });
}

function applyVolumeSettings() {
    const masterVolume = masterVolumeSlider.value / 100;
    const sfxVolume = sfxVolumeSlider.value / 100;
    const bgmVolume = bgmVolumeSlider.value / 100;
    
    game.audio.setMasterVolume(masterVolume);
    game.audio.setSfxVolume(sfxVolume);
    game.audio.setBgmVolume(bgmVolume);
}

difficultyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        difficultyBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedDifficulty = btn.dataset.difficulty;
    });
});

startBtn.addEventListener('click', () => {
    startScreen.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    game.setDifficulty(selectedDifficulty);
    applyVolumeSettings();
    game.start();
});

settingsBtn.addEventListener('click', () => {
    settingsScreen.classList.remove('hidden');
});

settingsBackBtn.addEventListener('click', () => {
    settingsScreen.classList.add('hidden');
    applyVolumeSettings();
});

backToMenuBtn.addEventListener('click', () => {
    game.isRunning = false;
    gameContainer.classList.add('hidden');
    startScreen.classList.remove('hidden');
});

masterVolumeSlider.addEventListener('input', updateVolumeDisplays);
sfxVolumeSlider.addEventListener('input', updateVolumeDisplays);
bgmVolumeSlider.addEventListener('input', updateVolumeDisplays);

updateVolumeDisplays();
applyVolumeSettings();