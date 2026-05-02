export class WaveManager {
    constructor() {
        this.currentWave = 0;
        this.waveTimer = 0;
        this.waveDuration = 60;
        this.breakDuration = 5;
        this.isBreak = false;
        this.isBossWave = false;
        this.bossSpawned = false;
        this.enemiesSpawned = 0;
        this.baseEnemiesPerWave = 10;
        this.waveAnnouncementTime = 0;
        this.showAnnouncement = false;
        this.announcementText = '';
    }

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

    shouldSpawnEnemy(maxEnemies) {
        if (this.isBreak) return false;
        
        const targetEnemies = this.getTargetEnemyCount();
        if (this.enemiesSpawned >= targetEnemies) return false;
        
        this.enemiesSpawned++;
        return true;
    }

    shouldSpawnBoss() {
        if (!this.isBossWave || this.bossSpawned) return false;
        
        const bossSpawnTime = this.waveDuration * 0.5;
        if (this.waveTimer >= bossSpawnTime) {
            this.bossSpawned = true;
            return true;
        }
        return false;
    }

    getTargetEnemyCount() {
        if (this.isBossWave) {
            return Math.floor(this.baseEnemiesPerWave * (1 + this.currentWave * 0.3) * 0.5);
        }
        return Math.floor(this.baseEnemiesPerWave * (1 + this.currentWave * 0.3));
    }

    getSpawnInterval() {
        const baseInterval = 1.5;
        const reduction = this.currentWave * 0.05;
        return Math.max(0.3, baseInterval - reduction);
    }

    getEnemyHpMultiplier() {
        if (this.isBossWave) return 1;
        return 1 + Math.floor(this.currentWave / 3) * 0.5;
    }

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

    getProgress() {
        if (this.isBreak) {
            return this.waveTimer / this.breakDuration;
        }
        return this.waveTimer / this.waveDuration;
    }

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