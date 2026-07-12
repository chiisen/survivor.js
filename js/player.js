import { PlayerCore } from './playerCore.js';
import { PlayerCombat } from './playerCombat.js';
import { PlayerRenderer } from './playerRenderer.js';

export class Player {
    constructor(x, y) {
        this.core = new PlayerCore(x, y);
        this.combat = new PlayerCombat(this.core);
        this.renderer = new PlayerRenderer();
    }
    
    get x() { return this.core.x; }
    set x(value) { this.core.x = value; }
    
    get y() { return this.core.y; }
    set y(value) { this.core.y = value; }
    
    get radius() { return this.core.radius; }
    get speed() { return this.core.speed; }
    set speed(value) { this.core.speed = value; }
    
    get maxHp() { return this.core.maxHp; }
    set maxHp(value) { this.core.maxHp = value; }
    
    get hp() { return this.core.hp; }
    set hp(value) { this.core.hp = value; }
    
    get shield() { return this.core.shield; }
    set shield(value) { this.core.shield = value; }
    
    get maxShield() { return this.core.maxShield; }
    set maxShield(value) { this.core.maxShield = value; }
    
    get armor() { return this.core.armor; }
    set armor(value) { this.core.armor = value; }
    
    get invincibleTime() { return this.core.invincibleTime; }
    set invincibleTime(value) { this.core.invincibleTime = value; }
    
    get flashTime() { return this.core.flashTime; }
    set flashTime(value) { this.core.flashTime = value; }
    
    get pickupRange() { return this.core.pickupRange; }
    set pickupRange(value) { this.core.pickupRange = value; }
    
    get magnetTimer() { return this.core.magnetTimer; }
    set magnetTimer(value) { this.core.magnetTimer = value; }
    
    get attackRange() { return this.core.attackRange; }
    set attackRange(value) { this.core.attackRange = value; }
    
    get baseAttackRange() { return this.core.baseAttackRange; }
    
    get facingAngle() { return this.core.facingAngle; }
    set facingAngle(value) { this.core.facingAngle = value; }
    
    get fireRate() { return this.combat.fireRate; }
    set fireRate(value) { this.combat.fireRate = value; }
    
    get baseFireRate() { return this.combat.baseFireRate; }
    set baseFireRate(value) { this.combat.baseFireRate = value; }
    
    get fireCooldown() { return this.combat.fireCooldown; }
    set fireCooldown(value) { this.combat.fireCooldown = value; }
    
    get damage() { return this.combat.damage; }
    set damage(value) { this.combat.damage = value; }
    
    get projectileSpeed() { return this.combat.projectileSpeed; }
    set projectileSpeed(value) { this.combat.projectileSpeed = value; }
    
    get projectileCount() { return this.combat.projectileCount; }
    set projectileCount(value) { this.combat.projectileCount = value; }
    
    get attackAnimationTime() { return this.combat.attackAnimationTime; }
    set attackAnimationTime(value) { this.combat.attackAnimationTime = value; }
    
    get attackDuration() { return this.combat.attackDuration; }
    get attackAngle() { return this.combat.attackAngle; }
    
    get hasFireRateBuff() { return this.combat.hasFireRateBuff; }
    
    get critChance() { return this.combat.critChance; }
    set critChance(value) { this.combat.critChance = value; }
    
    get critDamage() { return this.combat.critDamage; }
    set critDamage(value) { this.combat.critDamage = value; }
    
    get lifesteal() { return this.combat.lifesteal; }
    set lifesteal(value) { this.combat.lifesteal = value; }
    
    get expBonus() { return this.combat.expBonus; }
    set expBonus(value) { this.combat.expBonus = value; }
    
    get skillCooldown() { return this.combat.skillCooldown; }
    set skillCooldown(value) { this.combat.skillCooldown = value; }
    
    get skillCooldownDuration() { return this.combat.skillCooldownDuration; }
    
    get upgradeStats() {
        return {
            ...this.core.upgradeStats,
            ...this.combat.upgradeStats
        };
    }
    
    update(dt, keys, canvasWidth, canvasHeight) {
        this.core.update(dt, keys, canvasWidth, canvasHeight);
        this.combat.update(dt);
    }

    setAngleConfig(dirToAngle, defaultAngle) {
        this.core.setAngleConfig(dirToAngle, defaultAngle);
    }
    
    draw(ctx) {
        this.renderer.draw(ctx, this.core, this.combat);
    }
    
    applyUpgrade(upgrade) {
        if (this.core.upgradeStats.hasOwnProperty(upgrade.type)) {
            this.core.applyUpgrade(upgrade);
        } else if (this.combat.upgradeStats.hasOwnProperty(upgrade.type)) {
            this.combat.applyUpgrade(upgrade);
        }
    }
    
    canFire() {
        return this.combat.canFire();
    }
    
    fire(targetX, targetY) {
        this.combat.fire(targetX, targetY);
    }
    
    activateFireRateBuff() {
        this.combat.activateFireRateBuff();
    }
    
    rollCrit() {
        return this.combat.rollCrit();
    }
    
    heal(amount) {
        this.combat.heal(amount);
    }
    
    canUseSkill() {
        return this.combat.canUseSkill();
    }
    
    useSkill() {
        this.combat.useSkill();
    }
    
    updateSkillCooldown(dt) {
        this.combat.updateSkillCooldown(dt);
    }
    
    takeDamage(rawDamage) {
        return this.combat.takeDamage(rawDamage);
    }
}