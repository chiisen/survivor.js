export class PlayerCombat {
    constructor(core) {
        this.core = core;
        
        this.baseFireRate = 0.5;
        this.fireRate = this.baseFireRate;
        this.fireCooldown = 0;
        this.damage = 1;
        this.projectileSpeed = 400;
        this.projectileCount = 3;
        
        this.attackAnimationTime = 0;
        this.attackDuration = 0.15;
        this.attackAngle = 0;
        
        this.critChance = 0;
        this.critDamage = 1.5;
        this.lifesteal = 0;
        this.expBonus = 0;
        
        this.skillCooldown = 0;
        this.skillCooldownDuration = 30;
        
        this.hasFireRateBuff = false;
        this.fireRateBuffTime = 0;
        this.fireRateBuffDuration = 5;
        
        this.skillDamageBonus = 0;
        this.penetrate = 0;
        this.burnDamage = 0;
        this.freezeChance = 0;
        this.thorns = 0;

        this.upgradeStats = {
            fireRate: 0,
            damage: 0,
            projectileSpeed: 0,
            projectileCount: 0,
            critChance: 0,
            critDamage: 0,
            lifesteal: 0,
            expBonus: 0
        };
    }
    
    update(dt) {
        if (this.fireCooldown > 0) {
            this.fireCooldown -= dt;
        }
        if (this.attackAnimationTime > 0) {
            this.attackAnimationTime -= dt;
        }
        
        if (this.hasFireRateBuff) {
            this.fireRateBuffTime -= dt;
            if (this.fireRateBuffTime <= 0) {
                this.hasFireRateBuff = false;
                this.fireRate = this.baseFireRate;
            }
        }
    }
    
    canFire() {
        return this.fireCooldown <= 0;
    }
    
    fire(targetX, targetY) {
        this.fireCooldown = this.fireRate;
        this.attackAnimationTime = this.attackDuration;
        this.attackAngle = Math.atan2(targetY - this.core.y, targetX - this.core.x);
        this.core.facingAngle = this.attackAngle;
    }
    
    activateFireRateBuff() {
        this.hasFireRateBuff = true;
        this.fireRateBuffTime = this.fireRateBuffDuration;
        this.fireRate = this.baseFireRate * 0.7;
    }
    
    rollCrit() {
        if (this.critChance > 0 && Math.random() < this.critChance) {
            return this.critDamage;
        }
        return 1;
    }
    
    heal(amount) {
        this.core.hp = Math.min(this.core.maxHp, this.core.hp + amount);
    }
    
    canUseSkill() {
        return this.skillCooldown <= 0;
    }
    
    useSkill() {
        this.skillCooldown = this.skillCooldownDuration;
    }
    
    updateSkillCooldown(dt) {
        if (this.skillCooldown > 0) {
            this.skillCooldown -= dt;
        }
    }
    
    takeDamage(rawDamage) {
        const actualDamage = Math.max(1, rawDamage - this.core.armor);
        
        if (this.core.shield > 0) {
            if (this.core.shield >= actualDamage) {
                this.core.shield -= actualDamage;
                return { hpChanged: true, isDead: false };
            } else {
                const remainingDamage = actualDamage - this.core.shield;
                this.core.shield = 0;
                this.core.hp -= remainingDamage;
                if (this.core.hp <= 0) {
                    this.core.hp = 0;
                    return { hpChanged: true, isDead: true };
                }
                return { hpChanged: true, isDead: false };
            }
        }
        
        if (this.core.invincibleTime > 0) {
            return { hpChanged: false, isDead: false };
        }
        
        this.core.hp -= actualDamage;
        if (this.core.hp <= 0) {
            this.core.hp = 0;
            return { hpChanged: true, isDead: true };
        }
        
        this.core.invincibleTime = 1;
        this.core.flashTime = 1;
        return { hpChanged: true, isDead: false };
    }
    
    applyUpgrade(upgrade) {
        this.upgradeStats[upgrade.type]++;
        
        switch (upgrade.type) {
            case 'fireRate':
                this.baseFireRate = Math.max(0.1, this.baseFireRate - upgrade.value);
                if (!this.hasFireRateBuff) {
                    this.fireRate = this.baseFireRate;
                }
                break;
            case 'damage':
                this.damage += upgrade.value;
                break;
            case 'projectileSpeed':
                this.projectileSpeed += upgrade.value;
                break;
            case 'projectileCount':
                this.projectileCount += upgrade.value;
                break;
            case 'critChance':
                this.critChance += upgrade.value;
                break;
            case 'critDamage':
                this.critDamage += upgrade.value;
                break;
            case 'lifesteal':
                this.lifesteal += upgrade.value;
                break;
            case 'expBonus':
                this.expBonus += upgrade.value;
                break;
            case 'skillDamage':
                this.skillDamageBonus += upgrade.value;
                break;
            case 'skillCooldownReduce':
                this.skillCooldownDuration = Math.max(5, this.skillCooldownDuration - upgrade.value);
                break;
            case 'penetrate':
                this.penetrate += upgrade.value;
                break;
            case 'burnDamage':
                this.burnDamage += upgrade.value;
                break;
            case 'freezeChance':
                this.freezeChance += upgrade.value;
                break;
            case 'thorns':
                this.thorns += upgrade.value;
                break;
        }
    }
}