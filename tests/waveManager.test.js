import { describe, it, expect, beforeEach } from 'vitest';
import { WaveManager } from '../js/waveManager.js';

describe('WaveManager', () => {
    /** @type {WaveManager} */
    let wm;

    beforeEach(() => {
        wm = new WaveManager();
    });

    describe('constructor', () => {
        it('初始狀態正確', () => {
            expect(wm.currentWave).toBe(0);
            expect(wm.waveTimer).toBe(0);
            expect(wm.isBreak).toBe(false);
            expect(wm.isBossWave).toBe(false);
            expect(wm.bossSpawned).toBe(false);
            expect(wm.enemiesSpawned).toBe(0);
            expect(wm.showAnnouncement).toBe(false);
        });
    });

    describe('update', () => {
        it('第一次 update 將 currentWave 設為 1', () => {
            wm.update(0.1, 0);
            expect(wm.currentWave).toBe(1);
        });

        it('第一次 update 觸發公告', () => {
            wm.update(0.1, 0);
            expect(wm.showAnnouncement).toBe(true);
            expect(wm.announcementText).toBe('第 1 波開始！');
        });

        it('戰鬥中累計 waveTimer', () => {
            wm.update(0.1, 0); // wave 1, timer=0
            wm.update(1, 0.1);
            expect(wm.waveTimer).toBe(1);
            wm.update(2, 1.1);
            expect(wm.waveTimer).toBe(3);
        });

        it('waveDuration 到達後進入休息', () => {
            wm.update(0.1, 0); // wave 1
            wm.update(60, 0.1); // 到達 waveDuration
            expect(wm.isBreak).toBe(true);
        });

        it('休息結束後進入下一波', () => {
            wm.update(0.1, 0); // wave 1
            wm.update(60, 0.1); // 進入休息
            wm.update(5, 60.1); // 休息結束
            expect(wm.isBreak).toBe(false);
            expect(wm.currentWave).toBe(2);
        });

        it('休息結束後重置 enemiesSpawned', () => {
            wm.update(0.1, 0);
            wm.enemiesSpawned = 10;
            wm.update(60, 0.1); // 進入休息
            wm.update(5, 60.1); // 休息結束
            expect(wm.enemiesSpawned).toBe(0);
        });

        it('休息結束後重置 bossSpawned', () => {
            wm.update(0.1, 0);
            wm.bossSpawned = true;
            wm.update(60, 0.1); // 進入休息
            wm.update(5, 60.1); // 休息結束
            expect(wm.bossSpawned).toBe(false);
        });

        it('敵人全滅時進入休息（有已生成敵人）', () => {
            wm.update(0.1, 0); // wave 1
            wm.enemiesSpawned = 5;
            wm.update(1, 0.1); // enemyCount=0, enemiesSpawned>0
            expect(wm.isBreak).toBe(true);
        });

        it('敵人全滅但未生成過敵人時不進入休息', () => {
            wm.update(0.1, 0); // wave 1
            wm.update(1, 0.1); // enemyCount=0, enemiesSpawned=0
            expect(wm.isBreak).toBe(false);
        });

        it('Boss 波中敵人全滅不進入休息', () => {
            wm.update(0.1, 0); // wave 1
            // 快速到波次 5 (boss wave)
            for (let i = 0; i < 5; i++) {
                wm.update(0.1, i); // 累計 timer
                if (wm.isBreak) wm.update(5, i); // 休息
            }
            // 強制設為 boss wave
            wm.currentWave = 5;
            wm.isBossWave = true;
            wm.enemiesSpawned = 5;
            wm.isBreak = false;
            wm.waveTimer = 0;
            wm.update(1, 0); // enemyCount=0
            expect(wm.isBreak).toBe(false);
        });

        it('公告計時器倒數並關閉', () => {
            wm.update(0.1, 0); // 觸發公告
            expect(wm.showAnnouncement).toBe(true);
            wm.update(2, 0.1); // 倒數 2 秒
            expect(wm.showAnnouncement).toBe(false);
        });
    });

    describe('shouldSpawnEnemy', () => {
        it('休息時不生成', () => {
            wm.update(0.1, 0);
            wm.isBreak = true;
            expect(wm.shouldSpawnEnemy(100)).toBe(false);
        });

        it('未達目標數量時生成', () => {
            wm.update(0.1, 0);
            const result = wm.shouldSpawnEnemy(100);
            expect(result).toBe(true);
            expect(wm.enemiesSpawned).toBe(1);
        });

        it('達到目標數量時不生成', () => {
            wm.update(0.1, 0);
            wm.enemiesSpawned = wm.getTargetEnemyCount();
            expect(wm.shouldSpawnEnemy(100)).toBe(false);
        });

        it('每次呼叫累加 enemiesSpawned', () => {
            wm.update(0.1, 0);
            wm.shouldSpawnEnemy(100);
            wm.shouldSpawnEnemy(100);
            wm.shouldSpawnEnemy(100);
            expect(wm.enemiesSpawned).toBe(3);
        });
    });

    describe('shouldSpawnBoss', () => {
        it('非 Boss 波不生成', () => {
            wm.update(0.1, 0);
            expect(wm.shouldSpawnBoss()).toBe(false);
        });

        it('Boss 波但時間未到不生成', () => {
            wm.currentWave = 5;
            wm.isBossWave = true;
            wm.waveTimer = 0;
            expect(wm.shouldSpawnBoss()).toBe(false);
        });

        it('Boss 波且時間到達時生成', () => {
            wm.currentWave = 5;
            wm.isBossWave = true;
            wm.waveTimer = 30; // waveDuration * 0.5 = 30
            expect(wm.shouldSpawnBoss()).toBe(true);
            expect(wm.bossSpawned).toBe(true);
        });

        it('Boss 已生成後不再生成', () => {
            wm.currentWave = 5;
            wm.isBossWave = true;
            wm.waveTimer = 30;
            wm.shouldSpawnBoss();
            expect(wm.shouldSpawnBoss()).toBe(false);
        });
    });

    describe('getTargetEnemyCount', () => {
        it('第 1 波目標敵人數合理', () => {
            wm.currentWave = 1;
            const count = wm.getTargetEnemyCount();
            // growth = 1 + 1*0.5 + 1*0.05 = 1.55, floor(20*1.55) = 31
            expect(count).toBe(31);
        });

        it('波次越高敵人越多', () => {
            wm.currentWave = 1;
            const count1 = wm.getTargetEnemyCount();
            wm.currentWave = 10;
            const count10 = wm.getTargetEnemyCount();
            expect(count10).toBeGreaterThan(count1);
        });

        it('Boss 波敵人數量為一般的 60%', () => {
            wm.currentWave = 5;
            wm.isBossWave = false;
            const normal = wm.getTargetEnemyCount();
            wm.isBossWave = true;
            const boss = wm.getTargetEnemyCount();
            expect(boss).toBeLessThan(normal);
            expect(boss).toBe(Math.floor(normal * 0.6));
        });
    });

    describe('getSpawnInterval', () => {
        it('第 1 波間隔合理', () => {
            wm.currentWave = 1;
            const interval = wm.getSpawnInterval();
            // baseInterval=1.2, reduction=1*0.08=0.08, max(0.1, 1.12) = 1.12
            expect(interval).toBeCloseTo(1.12);
        });

        it('波次越高間隔越短', () => {
            wm.currentWave = 1;
            const interval1 = wm.getSpawnInterval();
            wm.currentWave = 15;
            const interval15 = wm.getSpawnInterval();
            expect(interval15).toBeLessThan(interval1);
        });

        it('間隔不會低於 0.1 秒', () => {
            wm.currentWave = 100;
            expect(wm.getSpawnInterval()).toBeGreaterThanOrEqual(0.1);
        });
    });

    describe('getEnemyHpMultiplier', () => {
        it('Boss 波 HP 乘數為 1', () => {
            wm.currentWave = 5;
            wm.isBossWave = true;
            expect(wm.getEnemyHpMultiplier()).toBe(1);
        });

        it('第 1 波 HP 乘數為 1', () => {
            wm.currentWave = 1;
            wm.isBossWave = false;
            expect(wm.getEnemyHpMultiplier()).toBe(1);
        });

        it('波次越高 HP 乘數越大', () => {
            wm.isBossWave = false;
            wm.currentWave = 1;
            const hp1 = wm.getEnemyHpMultiplier();
            wm.currentWave = 6;
            const hp6 = wm.getEnemyHpMultiplier();
            expect(hp6).toBeGreaterThan(hp1);
        });
    });

    describe('getProgress', () => {
        it('戰鬥中進度為 waveTimer / waveDuration', () => {
            wm.currentWave = 1;
            wm.waveTimer = 30;
            wm.waveDuration = 60;
            wm.isBreak = false;
            expect(wm.getProgress()).toBe(0.5);
        });

        it('休息中進度為 waveTimer / breakDuration', () => {
            wm.isBreak = true;
            wm.waveTimer = 2.5;
            wm.breakDuration = 5;
            expect(wm.getProgress()).toBe(0.5);
        });
    });

    describe('reset', () => {
        it('重置所有狀態為初始值', () => {
            wm.update(0.1, 0);
            wm.enemiesSpawned = 10;
            wm.bossSpawned = true;
            wm.reset();
            expect(wm.currentWave).toBe(0);
            expect(wm.waveTimer).toBe(0);
            expect(wm.isBreak).toBe(false);
            expect(wm.isBossWave).toBe(false);
            expect(wm.bossSpawned).toBe(false);
            expect(wm.enemiesSpawned).toBe(0);
            expect(wm.showAnnouncement).toBe(false);
        });
    });
});
