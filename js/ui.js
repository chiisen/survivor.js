// @ts-check
export class UI {
    /**
     * 建構 UI 管理實例，取得所有必要的 DOM 元素參考
     */
    constructor() {
        this.shieldFill = document.getElementById('shield-fill');
        this.shieldText = document.getElementById('shield-text');
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

    /**
     * 建立增益效果通知的容器元素並附加到遊戲容器
     */
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

    /**
     * 顯示增益效果通知，帶有計時器動畫效果
     * @param {string} text - 通知文字內容
     * @param {number} duration - 持續時間（秒）
     */
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

    /**
     * 更新生命值進度條顯示
     * @param {number} current - 當前生命值
     * @param {number} max - 最大生命值
     */
    updateHp(current, max) {
        const percentage = (current / max) * 100;
        this.hpFill.style.width = `${percentage}%`;
        this.hpText.textContent = `${Math.ceil(current)} / ${max}`;
    }
    
    /**
     * 更新護盾進度條顯示，若無護盾則隱藏
     * @param {number} current - 當前護盾值
     * @param {number} max - 最大護盾值
     */
    updateShield(current, max) {
        if (max <= 0) {
            this.shieldFill.parentElement.style.display = 'none';
            return;
        }
        
        this.shieldFill.parentElement.style.display = 'block';
        
        const percentage = (current / max) * 100;
        this.shieldFill.style.width = `${percentage}%`;
        this.shieldText.textContent = `${Math.ceil(current)} / ${max}`;
        
        if (current <= 0) {
            this.shieldFill.parentElement.style.opacity = '0.3';
        } else {
            this.shieldFill.parentElement.style.opacity = '1';
        }
    }

    /**
     * 更新經驗值進度條顯示
     * @param {number} current - 當前經驗值
     * @param {number} max - 升級所需經驗值
     */
    updateExp(current, max) {
        const percentage = (current / max) * 100;
        this.expFill.style.width = `${percentage}%`;
        this.expText.textContent = `${Math.floor(current)} / ${max}`;
    }

    /**
     * 更新玩家等級顯示
     * @param {number} level - 當前等級
     */
    updateLevel(level) {
        this.levelDisplay.textContent = `Lv. ${level}`;
    }

    /**
     * 更新遊戲計時器顯示（MM:SS 格式）
     * @param {number} seconds - 當前經過的秒數
     */
    updateTimer(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        this.timerDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * 顯示升級選擇模態框
     * @param {Array<{icon: string, name: string, description: string}>} upgrades - 升級選項陣列
     * @param {function(object): void} onSelect - 選擇升級時的回調函式
     */
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

    /**
     * 隱藏升級選擇模態框
     */
    hideUpgradeModal() {
        this.upgradeModal.classList.add('hidden');
    }

    /**
     * 檢查升級模態框是否開啟
     * @returns {boolean} 模態框是否可見
     */
    isUpgradeModalOpen() {
        return !this.upgradeModal.classList.contains('hidden');
    }

    /**
     * 清除所有增益效果通知
     */
    clearBuffNotifications() {
        if (this.buffContainer) {
            this.buffContainer.innerHTML = '';
        }
    }

    /**
     * 顯示遊戲結束畫面，包含本次成績、歷史紀錄、排行榜與新成就
     * @param {{level: number, kills: number, bossesKilled: number, wave: number, time: number}} gameStats - 本次遊戲成績
     * @param {{highestLevel: number, longestTime: string, totalKills: number, highestWave: number, bossesKilled: number, totalGames: number}} historicalStats - 歷史統計資料
     * @param {{type: string, isNew: boolean}[]} newRecords - 本次刷新的紀錄
     * @param {{icon: string, name: string, description: string}[]} [newAchievements] - 新解鎖的成就
     * @param {{level: number, kills: number, formattedTime: string, wave: number}[]} [leaderboard] - 排行榜資料
     */
    showGameOver(gameStats, historicalStats, newRecords, newAchievements = [], leaderboard = []) {
        this.gameOverScreen.classList.remove('hidden');
        
        const achievementHtml = newAchievements.length > 0 ? `
            <div style="border-top: 1px solid #5d6d7e; padding-top: 15px; margin-top: 15px;">
                <h3 style="color: #f1c40f; margin-bottom: 10px;">🏆 新成就解锁！</h3>
                ${newAchievements.map(a => `
                    <div style="color: #2ecc71; margin-bottom: 5px;">
                        ${a.icon} ${a.name} - ${a.description}
                    </div>
                `).join('')}
            </div>
        ` : '';
        
        this.finalStats.innerHTML = `
            <div style="margin-bottom: 20px;">
                <h3 style="color: #f39c12; margin-bottom: 10px;">本次成績</h3>
                等級: ${gameStats.level}${newRecords.find(r => r.type === 'level')?.isNew ? ' 🏆' : ''}<br>
                擊殺數: ${gameStats.kills}<br>
                Boss擊殺: ${gameStats.bossesKilled}<br>
                最高波次: ${gameStats.wave}${newRecords.find(r => r.type === 'wave')?.isNew ? ' 🏆' : ''}<br>
                存活時間: ${this.formatTime(gameStats.time)}${newRecords.find(r => r.type === 'time')?.isNew ? ' 🏆' : ''}
            </div>
            ${achievementHtml}
            <div style="border-top: 1px solid #5d6d7e; padding-top: 15px; margin-top: 15px;">
                <button id="show-history-btn" style="background: linear-gradient(135deg, #3498db, #2980b9); color: white; border: none; padding: 15px 30px; font-size: 24px; border-radius: 8px; cursor: pointer; width: 100%; margin-bottom: 10px;">查看歷史紀錄</button>
                <div id="history-content" style="display: none; color: #ecf0f1;">
                    最高等級: ${historicalStats.highestLevel}<br>
                    最長時間: ${historicalStats.longestTime}<br>
                    總擊殺數: ${historicalStats.totalKills}<br>
                    最高波次: ${historicalStats.highestWave}<br>
                    Boss擊殺: ${historicalStats.bossesKilled}<br>
                    總遊戲次: ${historicalStats.totalGames}
                </div>
            </div>
            ${leaderboard.length > 0 ? `
            <div style="border-top: 1px solid #5d6d7e; padding-top: 15px; margin-top: 15px;">
                <button id="show-leaderboard-btn" style="background: linear-gradient(135deg, #9b59b6, #8e44ad); color: white; border: none; padding: 15px 30px; font-size: 24px; border-radius: 8px; cursor: pointer; width: 100%; margin-bottom: 10px;">查看排行榜 TOP 10</button>
                <div id="leaderboard-content" style="display: none;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="color: #3498db; font-weight: bold; border-bottom: 1px solid #5d6d7e;">
                            <td style="padding: 5px;">排名</td>
                            <td style="padding: 5px;">等级</td>
                            <td style="padding: 5px;">击杀</td>
                            <td style="padding: 5px;">时间</td>
                            <td style="padding: 5px;">波次</td>
                        </tr>
                        ${leaderboard.map((entry, index) => `
                            <tr style="${index === 0 ? 'color: #f1c40f; font-weight: bold;' : 'color: #ecf0f1;'}">
                                <td style="padding: 5px;">${index + 1}</td>
                                <td style="padding: 5px;">Lv.${entry.level}</td>
                                <td style="padding: 5px;">${entry.kills}</td>
                                <td style="padding: 5px;">${entry.formattedTime}</td>
                                <td style="padding: 5px;">${entry.wave}</td>
                            </tr>
                        `).join('')}
                    </table>
                </div>
            </div>
            ` : ''}
        `;
        
        const showHistoryBtn = document.getElementById('show-history-btn');
        const historyContent = document.getElementById('history-content');
        if (showHistoryBtn && historyContent) {
            showHistoryBtn.addEventListener('click', () => {
                if (historyContent.style.display === 'none') {
                    historyContent.style.display = 'block';
                    showHistoryBtn.textContent = '隱藏歷史紀錄';
                } else {
                    historyContent.style.display = 'none';
                    showHistoryBtn.textContent = '查看歷史紀錄';
                }
            });
        }
        
        const showLeaderboardBtn = document.getElementById('show-leaderboard-btn');
        const leaderboardContent = document.getElementById('leaderboard-content');
        if (showLeaderboardBtn && leaderboardContent) {
            showLeaderboardBtn.addEventListener('click', () => {
                if (leaderboardContent.style.display === 'none') {
                    leaderboardContent.style.display = 'block';
                    showLeaderboardBtn.textContent = '隱藏排行榜';
                } else {
                    leaderboardContent.style.display = 'none';
                    showLeaderboardBtn.textContent = '查看排行榜 TOP 10';
                }
            });
        }
    }

    /**
     * 隱藏遊戲結束畫面
     */
    hideGameOver() {
        this.gameOverScreen.classList.add('hidden');
    }

    /**
     * 將秒數格式化為「X分X秒」的文字
     * @param {number} seconds - 秒數
     * @returns {string} 格式化後的時間字串
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}分${secs}秒`;
    }

    /**
     * 設定重新開始按鈕的點擊事件處理函式
     * @param {function(): void} callback - 點擊重新開始時的回調函式
     */
    onRestart(callback) {
        this.restartBtn.addEventListener('click', callback);
    }
}