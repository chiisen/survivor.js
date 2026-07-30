import { describe, it, expect } from 'vitest';
import { EnemyBehaviors } from '../js/enemyBehaviors.js';

describe('EnemyBehaviors.js', () => {
    // 1. 測試建構函式初始化
    it('應正確初始化屬性', () => {
        const type = {
            canShoot: true,
            shootInterval: 3,
            isStealth: true
        };
        const core = {
            x: 100,
            y: 200,
            revealTime: 0,
            currentAlpha: 1,
            baseAlpha: 0.2
        };
        
        const behaviors = new EnemyBehaviors(type, core);
        
        expect(behaviors.canShoot).toBe(true);
        expect(behaviors.shootInterval).toBe(3);
        expect(behaviors.shootCooldown).toBe(0);
        expect(behaviors.isStealth).toBe(true);
        expect(behaviors.revealTime).toBe(0);
        expect(behaviors.core).toBe(core);
        expect(behaviors.type).toBe(type);
    });

    it('應正確處理預設屬性 (非隱形、無法射擊)', () => {
        const type = {
            canShoot: false,
            shootInterval: 0
        };
        const core = {};
        
        const behaviors = new EnemyBehaviors(type, core);
        expect(behaviors.isStealth).toBe(false);
    });

    // 2. 測試 reveal 方法
    describe('reveal', () => {
        it('如果是隱形敵人，應設定 core.revealTime = 2', () => {
            const type = { isStealth: true };
            const core = { revealTime: 0 };
            const behaviors = new EnemyBehaviors(type, core);
            
            behaviors.reveal();
            expect(behaviors.core.revealTime).toBe(2);
        });

        it('如果非隱形敵人，不應設定 core.revealTime', () => {
            const type = { isStealth: false };
            const core = {};
            const behaviors = new EnemyBehaviors(type, core);
            
            behaviors.reveal();
            expect(behaviors.core.revealTime).toBeUndefined();
        });
    });

    // 3. 測試 shoot 方法
    describe('shoot', () => {
        it('應正確計算射擊方向並返回投射物資料', () => {
            const type = { canShoot: true };
            const core = { x: 0, y: 0 };
            const behaviors = new EnemyBehaviors(type, core);
            
            // 往 (3, 4) 射擊，方向向量正常化後應為 (0.6, 0.8)
            // 速度為 150 -> vx = 90, vy = 120
            const projectile = behaviors.shoot(3, 4);
            
            expect(projectile.x).toBe(0);
            expect(projectile.y).toBe(0);
            expect(projectile.vx).toBeCloseTo(90);
            expect(projectile.vy).toBeCloseTo(120);
            expect(projectile.damage).toBe(5);
            expect(projectile.radius).toBe(5);
            expect(projectile.color).toBe('#9b59b6');
        });
    });

    // 4. 測試 update 方法中的 Stealth 邏輯
    describe('update - 隱形邏輯', () => {
        it('當有 revealTime 時，應隨時間扣減且 currentAlpha 為 1', () => {
            const type = { isStealth: true };
            const core = { revealTime: 2, currentAlpha: 0.2, baseAlpha: 0.2 };
            const behaviors = new EnemyBehaviors(type, core);
            
            behaviors.update(0.5, 0, 0);
            
            expect(behaviors.core.revealTime).toBe(1.5);
            expect(behaviors.core.currentAlpha).toBe(1);
        });

        it('當 revealTime 扣減至 0 且在下一次更新後，應恢復為 baseAlpha', () => {
            const type = { isStealth: true };
            const core = { revealTime: 0.1, currentAlpha: 1, baseAlpha: 0.2 };
            const behaviors = new EnemyBehaviors(type, core);
            
            behaviors.update(0.2, 0, 0); // 第一次更新：revealTime 變為 -0.1，currentAlpha 仍為 1
            behaviors.update(0.1, 0, 0); // 第二次更新：此時 revealTime <= 0，currentAlpha 恢復為 0.2
            
            expect(behaviors.core.revealTime).toBeLessThanOrEqual(0);
            expect(behaviors.core.currentAlpha).toBe(0.2);
        });
    });

    // 5. 測試 update 方法中的射擊冷卻邏輯
    describe('update - 射擊邏輯', () => {
        it('無法射擊時，不應執行射擊動作且回傳 null', () => {
            const type = { canShoot: false };
            const core = { x: 0, y: 0 };
            const behaviors = new EnemyBehaviors(type, core);
            
            const actions = behaviors.update(1, 100, 100);
            expect(actions).toBeNull();
        });

        it('可射擊且冷卻時間到時，應觸發射擊並回傳動作列表', () => {
            const type = { canShoot: true, shootInterval: 2 };
            const core = { x: 0, y: 0 };
            const behaviors = new EnemyBehaviors(type, core);
            
            // 初始 cooldown 為 0，更新時會立刻觸發射擊
            const actions = behaviors.update(1, 100, 0); // 往 (100, 0) 射擊
            
            expect(actions).not.toBeNull();
            expect(actions.length).toBe(1);
            expect(actions[0].vx).toBe(150); // 往 x 方向正向，速度為 150 * 1 = 150
            expect(behaviors.shootCooldown).toBe(2); // 冷卻重置為 shootInterval
        });

        it('未達冷卻時間時，應扣減冷卻且回傳 null', () => {
            const type = { canShoot: true, shootInterval: 2 };
            const core = { x: 0, y: 0 };
            const behaviors = new EnemyBehaviors(type, core);
            
            // 手動設定 cooldown 還有 1.5 秒
            behaviors.shootCooldown = 1.5;
            
            const actions = behaviors.update(0.5, 100, 100); // 扣減 0.5 秒，餘 1.0 秒
            
            expect(actions).toBeNull();
            expect(behaviors.shootCooldown).toBe(1.0);
        });
    });
});
