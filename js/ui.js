export class UI {
    constructor() {
        this.hpFill = document.getElementById('hp-fill');
        this.hpText = document.getElementById('hp-text');
        this.expFill = document.getElementById('exp-fill');
        this.expText = document.getElementById('exp-text');
        this.levelDisplay = document.getElementById('level-display');
        this.timerDisplay = document.getElementById('timer');
        this.upgradeModal = document.getElementById('upgrade-modal');
        this.upgradeOptions = document.getElementById('upgrade-options');
        this.gameOverScreen = document.getElementById('game-over');
        this.finalStats = document.getElementById('final-stats');
        this.restartBtn = document.getElementById('restart-btn');
        this.buffNotifications = [];
        this.buffContainer = null;
        this.createBuffContainer();
    }

    createBuffContainer() {
        this.buffContainer = document.createElement('div');
        this.buffContainer.id = 'buff-container';
        this.buffContainer.style.cssText = `
            position: fixed;
            top: 60px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 10px;
            pointer-events: none;
            z-index: 50;
        `;
        document.getElementById('game-container').appendChild(this.buffContainer);
    }

    showBuffNotification(text, duration) {
        const notification = document.createElement('div');
        notification.className = 'buff-notification';
        notification.innerHTML = `
            <span class="buff-icon">⚡</span>
            <span class="buff-text">${text}</span>
            <div class="buff-timer">
                <div class="buff-timer-fill"></div>
            </div>
        `;
        notification.style.cssText = `
            background: linear-gradient(135deg, rgba(46, 204, 113, 0.9), rgba(39, 174, 96, 0.9));
            padding: 12px 20px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
            color: white;
            font-weight: bold;
            font-size: 16px;
            box-shadow: 0 4px 15px rgba(46, 204, 113, 0.5);
            border: 2px solid rgba(255, 255, 255, 0.3);
            animation: buffSlideIn 0.3s ease;
        `;
        
        const timerFill = notification.querySelector('.buff-timer-fill');
        timerFill.style.cssText = `
            width: 100%;
            height: 4px;
            background: rgba(255, 255, 255, 0.8);
            border-radius: 2px;
            transition: width ${duration}s linear;
        `;
        
        const timerContainer = notification.querySelector('.buff-timer');
        timerContainer.style.cssText = `
            width: 100%;
            height: 4px;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 2px;
            margin-top: 5px;
        `;

        this.buffContainer.appendChild(notification);
        
        setTimeout(() => {
            timerFill.style.width = '0%';
        }, 50);

        setTimeout(() => {
            notification.style.animation = 'buffSlideOut 0.3s ease';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, duration * 1000);
    }

    updateHp(current, max) {
        const percentage = (current / max) * 100;
        this.hpFill.style.width = `${percentage}%`;
        this.hpText.textContent = `${Math.ceil(current)} / ${max}`;
    }

    updateExp(current, max) {
        const percentage = (current / max) * 100;
        this.expFill.style.width = `${percentage}%`;
        this.expText.textContent = `${Math.floor(current)} / ${max}`;
    }

    updateLevel(level) {
        this.levelDisplay.textContent = `Lv. ${level}`;
    }

    updateTimer(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        this.timerDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    showUpgradeModal(upgrades, onSelect) {
        this.upgradeModal.classList.remove('hidden');
        this.upgradeOptions.innerHTML = '';

        upgrades.forEach(upgrade => {
            const option = document.createElement('div');
            option.className = 'upgrade-option';
            option.innerHTML = `
                <h3>${upgrade.icon} ${upgrade.name}</h3>
                <p>${upgrade.description}</p>
            `;
            option.addEventListener('click', () => {
                this.hideUpgradeModal();
                onSelect(upgrade);
            });
            this.upgradeOptions.appendChild(option);
        });
    }

    hideUpgradeModal() {
        this.upgradeModal.classList.add('hidden');
    }

    showGameOver(level, kills, time) {
        this.gameOverScreen.classList.remove('hidden');
        this.finalStats.innerHTML = `
            等級: ${level}<br>
            擊殺數: ${kills}<br>
            存活時間: ${this.formatTime(time)}
        `;
    }

    hideGameOver() {
        this.gameOverScreen.classList.add('hidden');
    }

    clearBuffNotifications() {
        if (this.buffContainer) {
            this.buffContainer.innerHTML = '';
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}分${secs}秒`;
    }

    onRestart(callback) {
        this.restartBtn.addEventListener('click', callback);
    }
}