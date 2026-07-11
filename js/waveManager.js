// @ts-check

export class WaveManager {
    /**
     * 建立波次管理器實例
     */
    constructor() {
        this.currentWave = 0;
        this.waveTimer = 0;
        this.waveDuration = 60;
        this.breakDuration = 5;
        this.isBreak = false;
        this.isBossWave = false;
        this.bossSpawned = false;
        this.enemiesSpawned = 0;
        this.baseEnemiesPerWave = 20;
        this.waveAnnouncementTime = 0;
        this.showAnnouncement = false;
        this.announcementText = '';
    }

    /**
     * 更新波次狀態（休息/戰鬥/Boss 判定與公告）
     * @param {number} dt - 與上一幀的時間差（秒）
     * @param {number} gameTime - 遊戲經過的總時間（秒）
     * @param {number} enemyCount - 當前存活的敵人數量
     */
    update(dt, gameTime, enemyCount = 0) {
        this.waveTimer += dt;
        
        if (this.currentWave === 0) {
            this.currentWave = 1;
            this.waveTimer = 0;
            this.showAnnouncement = true;
            this.announcementText = `第 ${this.currentWave} 波開始！`;
            this.waveAnnouncementTime = 2;
        }

        if (!this.isBreak && !this.isBossWave && enemyCount === 0 && this.enemiesSpawned > 0) {
            this.isBreak = true;
            this.waveTimer = 0;
            this.showAnnouncement = true;
            this.announcementText = '波次結束！休息時間';
            this.waveAnnouncementTime = 2;
        }

        if (this.isBreak) {
            if (this.waveTimer >= this.breakDuration) {
                this.isBreak = false;
                this.currentWave++;
                this.waveTimer = 0;
                this.enemiesSpawned = 0;
                this.bossSpawned = false;
                this.isBossWave = this.currentWave % 5 === 0;
                this.showAnnouncement = true;
                this.announcementText = this.isBossWave ? `BOSS 波！第 ${this.currentWave} 波` : `第 ${this.currentWave} 波開始！`;
                this.waveAnnouncementTime = 2;
            }
        } else {
            if (this.waveTimer >= this.waveDuration) {
                this.isBreak = true;
                this.waveTimer = 0;
                this.showAnnouncement = true;
                this.announcementText = '波次結束！休息時間';
                this.waveAnnouncementTime = 2;
            }
        }

        if (this.showAnnouncement) {
            this.waveAnnouncementTime -= dt;
            if (this.waveAnnouncementTime <= 0) {
                this.showAnnouncement = false;
            }
        }
    }

    /**
     * 判斷是否應該生成新的小怪
     * @param {number} maxEnemies - 畫面同時存在的敵人上限
     * @returns {boolean} 是否應該生成
     */
    shouldSpawnEnemy(maxEnemies) {
        if (this.isBreak) return false;
        
        const targetEnemies = this.getTargetEnemyCount();
        if (this.enemiesSpawned >= targetEnemies) return false;
        
        this.enemiesSpawned++;
        return true;
    }

    /**
     * 判斷是否應該生成 Boss（每 5 波一次，波次中段觸發）
     * @returns {boolean} 是否應該生成 Boss
     */
    shouldSpawnBoss() {
        if (!this.isBossWave || this.bossSpawned) return false;
        
        const bossSpawnTime = this.waveDuration * 0.5;
        if (this.waveTimer >= bossSpawnTime) {
            this.bossSpawned = true;
            return true;
        }
        return false;
    }

    /**
     * 取得當前波次的目標敵人總數（二次方增長）
     * @returns {number} 目標敵人數量
     */
    getTargetEnemyCount() {
        // 使用二次方增長，讓後期敵人數量明顯增加，營造「越來越多」的感覺
        const growth = 1 + (this.currentWave * 0.5) + (Math.pow(this.currentWave, 2) * 0.05);
        if (this.isBossWave) {
            return Math.floor(this.baseEnemiesPerWave * growth * 0.6);
        }
        return Math.floor(this.baseEnemiesPerWave * growth);
    }

    /**
     * 取得當前波次的敵人生成間隔（秒）
     * @returns {number} 生成間隔，最小 0.1 秒
     */
    getSpawnInterval() {
        const baseInterval = 1.2;
        const reduction = this.currentWave * 0.08;
        return Math.max(0.1, baseInterval - reduction);
    }

    /**
     * 取得當前波次的敵人 HP 乘數
     * @returns {number} HP 乘數（Boss 波回傳 1，其餘隨波次遞增）
     */
    getEnemyHpMultiplier() {
        if (this.isBossWave) return 1;
        return 1 + Math.floor(this.currentWave / 3) * 0.5;
    }

    /**
     * 繪製波次公告文字（淡入淡出效果）
     * @param {CanvasRenderingContext2D} ctx - Canvas 繪圖上下文
     * @param {number} centerX - 畫面中心 X 座標
     * @param {number} centerY - 畫面中心 Y 座標
     */
    drawAnnouncement(ctx, centerX, centerY) {
        if (!this.showAnnouncement) return;
        
        ctx.save();
        ctx.globalAlpha = Math.min(1, this.waveAnnouncementTime);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const fontSize = 72;
        ctx.font = `bold ${fontSize}px 'Segoe UI', sans-serif`;
        
        ctx.shadowColor = this.isBossWave ? '#e74c3c' : '#f39c12';
        ctx.shadowBlur = 15;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillText(this.announcementText, centerX + 2, centerY - 50 + 2);
        
        ctx.fillStyle = this.isBossWave ? '#e74c3c' : '#f39c12';
        ctx.fillText(this.announcementText, centerX, centerY - 50);
        
        ctx.restore();
    }

    /**
     * 繪製波次資訊 HUD（波次數、Boss/休息狀態）
     * @param {CanvasRenderingContext2D} ctx - Canvas 繪圖上下文
     * @param {number} x - 繪製位置 X 座標
     * @param {number} y - 繪製位置 Y 座標
     */
    drawWaveInfo(ctx, x, y) {
        ctx.save();
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.font = 'bold 36px "Segoe UI", sans-serif';
        ctx.fillStyle = '#ecf0f1';
        
        ctx.fillText(`波次: ${this.currentWave}`, x, y);
        
        if (this.isBossWave) {
            ctx.fillStyle = '#e74c3c';
            ctx.fillText('BOSS 波！', x, y + 50);
        }
        
        if (this.isBreak) {
            ctx.fillStyle = '#2ecc71';
            ctx.fillText('休息時間', x, y + 50);
        }
        
        ctx.restore();
    }

    /**
     * 取得當前波次（或休息）的進度比例
     * @returns {number} 0 ~ 1 的進度值
     */
    getProgress() {
        if (this.isBreak) {
            return this.waveTimer / this.breakDuration;
        }
        return this.waveTimer / this.waveDuration;
    }

    /**
     * 重置波次管理器為初始狀態
     */
    reset() {
        this.currentWave = 0;
        this.waveTimer = 0;
        this.isBreak = false;
        this.isBossWave = false;
        this.bossSpawned = false;
        this.enemiesSpawned = 0;
        this.showAnnouncement = false;
    }
}