import { describe, it, expect, beforeEach } from 'vitest';
import { PlayerCore } from '../js/playerCore.js';
import { PlayerCombat } from '../js/playerCombat.js';

describe('PlayerCore', () => {
    /** @type {PlayerCore} */
    let core;

    beforeEach(() => {
        core = new PlayerCore(100, 200);
    });

    describe('constructor', () => {
        it('初始位置正確', () => {
            expect(core.x).toBe(100);
            expect(core.y).toBe(200);
        });

        it('初始屬性合理', () => {
            expect(core.radius).toBe(20);
            expect(core.speed).toBe(200);
            expect(core.maxHp).toBe(100);
            expect(core.hp).toBe(100);
            expect(core.shield).toBe(0);
            expect(core.armor).toBe(0);
            expect(core.pickupRange).toBe(80);
            expect(core.attackRange).toBe(300);
        });

        it('upgradeStats 初始化為 0', () => {
            expect(core.upgradeStats.maxHp).toBe(0);
            expect(core.upgradeStats.speed).toBe(0);
            expect(core.upgradeStats.armor).toBe(0);
        });
    });

    describe('update', () => {
        it('無按鍵時不移動', () => {
            const x = core.x;
            const y = core.y;
            core.update(0.1, {}, 800, 600);
            expect(core.x).toBe(x);
            expect(core.y).toBe(y);
        });

        it('按 W 向上移動', () => {
            core.update(0.1, { 'w': true }, 800, 600);
            expect(core.y).toBeLessThan(200);
        });

        it('按 S 向下移動', () => {
            core.update(0.1, { 's': true }, 800, 600);
            expect(core.y).toBeGreaterThan(200);
        });

        it('按 A 向左移動', () => {
            core.update(0.1, { 'a': true }, 800, 600);
            expect(core.x).toBeLessThan(100);
        });

        it('按 D 向右移動', () => {
            core.update(0.1, { 'd': true }, 800, 600);
            expect(core.x).toBeGreaterThan(100);
        });

        it('邊界夾限制不超出畫面', () => {
            core.x = 5;
            core.update(0.1, { 'a': true }, 800, 600);
            expect(core.x).toBeGreaterThanOrEqual(core.radius);

            core.x = 795;
            core.update(0.1, { 'd': true }, 800, 600);
            expect(core.x).toBeLessThanOrEqual(800 - core.radius);
        });

        it('invincibleTime 倒數', () => {
            core.invincibleTime = 1;
            core.update(0.5, {}, 800, 600);
            expect(core.invincibleTime).toBeCloseTo(0.5);
        });

        it('flashTime 倒數', () => {
            core.flashTime = 1;
            core.update(0.5, {}, 800, 600);
            expect(core.flashTime).toBeCloseTo(0.5);
        });

        it('magnetTimer 倒數且不低於 0', () => {
            core.magnetTimer = 0.5;
            core.update(1, {}, 800, 600);
            expect(core.magnetTimer).toBe(0);
        });
    });

    describe('applyUpgrade', () => {
        it('maxHp 升級增加 maxHp 和 hp', () => {
            core.applyUpgrade({ type: 'maxHp', value: 20 });
            expect(core.maxHp).toBe(120);
            expect(core.hp).toBe(120);
            expect(core.upgradeStats.maxHp).toBe(1);
        });

        it('speed 升級增加移動速度', () => {
            core.applyUpgrade({ type: 'speed', value: 30 });
            expect(core.speed).toBe(230);
            expect(core.upgradeStats.speed).toBe(1);
        });

        it('pickupRange 升級增加拾取範圍', () => {
            core.applyUpgrade({ type: 'pickupRange', value: 20 });
            expect(core.pickupRange).toBe(100);
        });

        it('attackRange 升級增加攻擊範圍', () => {
            core.applyUpgrade({ type: 'attackRange', value: 50 });
            expect(core.attackRange).toBe(350);
        });

        it('armor 升級增加護甲', () => {
            core.applyUpgrade({ type: 'armor', value: 5 });
            expect(core.armor).toBe(5);
        });

        it('shield 升級增加護盾', () => {
            core.applyUpgrade({ type: 'shield', value: 15 });
            expect(core.maxShield).toBe(15);
            expect(core.shield).toBe(15);
        });

        it('多次升級累加', () => {
            core.applyUpgrade({ type: 'maxHp', value: 20 });
            core.applyUpgrade({ type: 'maxHp', value: 20 });
            expect(core.maxHp).toBe(140);
            expect(core.upgradeStats.maxHp).toBe(2);
        });
    });
});

describe('PlayerCombat', () => {
    /** @type {PlayerCore} */
    let core;
    /** @type {PlayerCombat} */
    let combat;

    beforeEach(() => {
        core = new PlayerCore(100, 200);
        combat = new PlayerCombat(core);
    });

    describe('constructor', () => {
        it('初始屬性合理', () => {
            expect(combat.baseFireRate).toBe(0.5);
            expect(combat.fireRate).toBe(0.5);
            expect(combat.fireCooldown).toBe(0);
            expect(combat.damage).toBe(1);
            expect(combat.projectileSpeed).toBe(400);
            expect(combat.projectileCount).toBe(3);
            expect(combat.critChance).toBe(0);
            expect(combat.critDamage).toBe(1.5);
            expect(combat.skillCooldown).toBe(0);
        });
    });

    describe('update', () => {
        it('fireCooldown 倒數', () => {
            combat.fireCooldown = 1;
            combat.update(0.5);
            expect(combat.fireCooldown).toBeCloseTo(0.5);
        });

        it('fireCooldown 可為負數（canFire 仍回傳 true）', () => {
            combat.fireCooldown = 0.1;
            combat.update(1);
            expect(combat.fireCooldown).toBe(-0.9);
            expect(combat.canFire()).toBe(true);
        });

        it('attackAnimationTime 倒數', () => {
            combat.attackAnimationTime = 0.15;
            combat.update(0.1);
            expect(combat.attackAnimationTime).toBeCloseTo(0.05);
        });

        it('hasFireRateBuff 時 fireRateBuffTime 倒數', () => {
            combat.hasFireRateBuff = true;
            combat.fireRateBuffTime = 5;
            combat.update(1);
            expect(combat.fireRateBuffTime).toBe(4);
            expect(combat.hasFireRateBuff).toBe(true);
        });

        it('fireRateBuffTime 歸零時取消 buff', () => {
            combat.hasFireRateBuff = true;
            combat.fireRateBuffTime = 0.1;
            combat.update(0.2);
            expect(combat.hasFireRateBuff).toBe(false);
            expect(combat.fireRate).toBe(combat.baseFireRate);
        });
    });

    describe('canFire', () => {
        it('fireCooldown 為 0 時可射擊', () => {
            combat.fireCooldown = 0;
            expect(combat.canFire()).toBe(true);
        });

        it('fireCooldown 大於 0 時不可射擊', () => {
            combat.fireCooldown = 0.3;
            expect(combat.canFire()).toBe(false);
        });
    });

    describe('fire', () => {
        it('設定 fireCooldown 為 fireRate', () => {
            combat.fire(200, 200);
            expect(combat.fireCooldown).toBe(combat.fireRate);
        });

        it('設定 attackAnimationTime', () => {
            combat.fire(200, 200);
            expect(combat.attackAnimationTime).toBe(combat.attackDuration);
        });

        it('計算 attackAngle 指向目標', () => {
            combat.fire(200, 200); // 目標在右下方
            expect(combat.attackAngle).toBeCloseTo(Math.atan2(0, 100));
        });

        it('更新 core.facingAngle', () => {
            combat.fire(200, 200);
            expect(core.facingAngle).toBe(combat.attackAngle);
        });
    });

    describe('activateFireRateBuff', () => {
        it('啟動 buff 後 fireRate 降低 30%', () => {
            combat.activateFireRateBuff();
            expect(combat.hasFireRateBuff).toBe(true);
            expect(combat.fireRate).toBeCloseTo(combat.baseFireRate * 0.7);
        });

        it('buff 時間設為 duration', () => {
            combat.activateFireRateBuff();
            expect(combat.fireRateBuffTime).toBe(combat.fireRateBuffDuration);
        });
    });

    describe('rollCrit', () => {
        it('critChance 為 0 時必定不暴擊', () => {
            combat.critChance = 0;
            for (let i = 0; i < 100; i++) {
                expect(combat.rollCrit()).toBe(1);
            }
        });

        it('critChance 為 1 時必定暴擊', () => {
            combat.critChance = 1;
            combat.critDamage = 2;
            for (let i = 0; i < 100; i++) {
                expect(combat.rollCrit()).toBe(2);
            }
        });
    });

    describe('heal', () => {
        it('回復 HP 不超過 maxHp', () => {
            core.hp = 80;
            combat.heal(50);
            expect(core.hp).toBe(100);
        });

        it('回復指定量', () => {
            core.hp = 50;
            combat.heal(10);
            expect(core.hp).toBe(60);
        });
    });

    describe('skill cooldown', () => {
        it('canUseSkill 初始為 true', () => {
            expect(combat.canUseSkill()).toBe(true);
        });

        it('useSkill 設定冷卻', () => {
            combat.useSkill();
            expect(combat.skillCooldown).toBe(combat.skillCooldownDuration);
            expect(combat.canUseSkill()).toBe(false);
        });

        it('updateSkillCooldown 倒數', () => {
            combat.useSkill();
            combat.updateSkillCooldown(10);
            expect(combat.skillCooldown).toBeCloseTo(20);
        });
    });

    describe('takeDamage', () => {
        it('無護甲無護盾時直接扣 HP', () => {
            const result = combat.takeDamage(10);
            expect(core.hp).toBe(90);
            expect(result.hpChanged).toBe(true);
            expect(result.isDead).toBe(false);
        });

        it('護甲減免傷害（最少 1 點）', () => {
            core.armor = 5;
            combat.takeDamage(10);
            expect(core.hp).toBe(95); // 10-5=5
        });

        it('護甲不會讓傷害低於 1', () => {
            core.armor = 100;
            combat.takeDamage(5);
            expect(core.hp).toBe(99); // max(1, 5-100) = 1
        });

        it('護盾吸收傷害', () => {
            core.shield = 20;
            combat.takeDamage(10);
            expect(core.shield).toBe(10);
            expect(core.hp).toBe(100); // HP 不變
        });

        it('護盾不足時穿透扣 HP', () => {
            core.shield = 5;
            combat.takeDamage(10);
            expect(core.shield).toBe(0);
            expect(core.hp).toBe(95); // 10-5=5 穿透
        });

        it('無敵時間內不受傷害', () => {
            core.invincibleTime = 1;
            const result = combat.takeDamage(10);
            expect(core.hp).toBe(100);
            expect(result.hpChanged).toBe(false);
        });

        it('受到傷害後進入無敵時間', () => {
            combat.takeDamage(10);
            expect(core.invincibleTime).toBe(1);
            expect(core.flashTime).toBe(1);
        });

        it('HP 歸零時回傳 isDead', () => {
            core.hp = 5;
            const result = combat.takeDamage(10);
            expect(core.hp).toBe(0);
            expect(result.isDead).toBe(true);
        });

        it('護盾 + HP 不足時死亡', () => {
            core.shield = 5;
            core.hp = 3;
            const result = combat.takeDamage(10); // 10-5=5 穿透, 3-5=-2
            expect(core.hp).toBe(0);
            expect(result.isDead).toBe(true);
        });
    });

    describe('applyUpgrade', () => {
        it('fireRate 升級降低射擊間隔', () => {
            combat.applyUpgrade({ type: 'fireRate', value: 0.08 });
            expect(combat.baseFireRate).toBeCloseTo(0.42);
            expect(combat.fireRate).toBeCloseTo(0.42);
        });

        it('fireRate 最低 0.1', () => {
            combat.applyUpgrade({ type: 'fireRate', value: 1 });
            expect(combat.baseFireRate).toBe(0.1);
        });

        it('fireRate buff 期間不覆蓋 fireRate', () => {
            combat.activateFireRateBuff();
            const rateBefore = combat.fireRate;
            combat.applyUpgrade({ type: 'fireRate', value: 0.08 });
            expect(combat.fireRate).toBe(rateBefore); // buff 期間不變
        });

        it('damage 升級增加傷害', () => {
            combat.applyUpgrade({ type: 'damage', value: 1 });
            expect(combat.damage).toBe(2);
        });

        it('projectileSpeed 升級增加子彈速度', () => {
            combat.applyUpgrade({ type: 'projectileSpeed', value: 100 });
            expect(combat.projectileSpeed).toBe(500);
        });

        it('projectileCount 升級增加子彈數', () => {
            combat.applyUpgrade({ type: 'projectileCount', value: 2 });
            expect(combat.projectileCount).toBe(5);
        });

        it('critChance 升級增加暴擊率', () => {
            combat.applyUpgrade({ type: 'critChance', value: 0.1 });
            expect(combat.critChance).toBeCloseTo(0.1);
        });

        it('critDamage 升級增加暴擊傷害', () => {
            combat.applyUpgrade({ type: 'critDamage', value: 0.5 });
            expect(combat.critDamage).toBe(2);
        });

        it('lifesteal 升級增加吸血', () => {
            combat.applyUpgrade({ type: 'lifesteal', value: 5 });
            expect(combat.lifesteal).toBe(5);
        });

        it('expBonus 升級增加經驗加成', () => {
            combat.applyUpgrade({ type: 'expBonus', value: 0.2 });
            expect(combat.expBonus).toBeCloseTo(0.2);
        });

        it('skillCooldownReduce 升級縮短冷卻', () => {
            combat.applyUpgrade({ type: 'skillCooldownReduce', value: 3 });
            expect(combat.skillCooldownDuration).toBe(27);
        });

        it('skillCooldownReduce 最低 5 秒', () => {
            combat.applyUpgrade({ type: 'skillCooldownReduce', value: 100 });
            expect(combat.skillCooldownDuration).toBe(5);
        });

        it('penetrate 升級增加穿透', () => {
            combat.applyUpgrade({ type: 'penetrate', value: 1 });
            expect(combat.penetrate).toBe(1);
        });

        it('burnDamage 升級增加灼燒傷害', () => {
            combat.applyUpgrade({ type: 'burnDamage', value: 3 });
            expect(combat.burnDamage).toBe(3);
        });

        it('freezeChance 升級增加冰凍機率', () => {
            combat.applyUpgrade({ type: 'freezeChance', value: 0.15 });
            expect(combat.freezeChance).toBeCloseTo(0.15);
        });

        it('thorns 升級增加荊棘反傷', () => {
            combat.applyUpgrade({ type: 'thorns', value: 0.2 });
            expect(combat.thorns).toBeCloseTo(0.2);
        });

        it('upgradeStats 計數累加', () => {
            combat.applyUpgrade({ type: 'damage', value: 1 });
            combat.applyUpgrade({ type: 'damage', value: 1 });
            expect(combat.upgradeStats.damage).toBe(2);
        });
    });
});
