import { normalize, randomRange } from './utils.js';

export class EnemyCore {
    constructor(type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.radius = type.radius;
        this.speed = type.speed + randomRange(-10, 10);
        this.maxHp = type.maxHp;
        this.hp = this.maxHp;
        this.damage = type.damage;
        this.expValue = type.expValue;
        
        this.shieldHp = type.shieldHp || 0;
        this.shieldMaxHp = type.shieldHp || 0;
        this.hasShield = this.shieldHp > 0;
        
        this.isElite = type.isElite || false;
        this.canSplit = type.canSplit || false;
        this.splitTriggered = false;
        this.explosive = type.explosive || false;
        this.explosionRadius = type.explosionRadius || 0;
        this.explosionDamage = type.explosionDamage || 0;
        this.isStealth = type.isStealth || false;
        this.baseAlpha = type.baseAlpha || 1;
        this.currentAlpha = this.baseAlpha;
        this.revealTime = 0;
    }
    
    updatePosition(dt, playerX, playerY, playerAttackRange = 300) {
        const dx = playerX - this.x;
        const dy = playerY - this.y;
        const normalized = normalize(dx, dy);
        
        const distToPlayer = Math.sqrt(dx * dx + dy * dy);
        const speedMultiplier = distToPlayer <= playerAttackRange ? 1.1 : 1.0;
        const actualSpeed = this.speed * speedMultiplier;
        
        this.x += normalized.x * actualSpeed * dt;
        this.y += normalized.y * actualSpeed * dt;
    }
    
    reveal() {
        if (this.isStealth) {
            this.revealTime = 2;
        }
    }
    
    takeDamage(damage) {
        if (this.hasShield && this.shieldHp > 0) {
            if (this.shieldHp >= damage) {
                this.shieldHp -= damage;
                return { hpChanged: true, isDead: false, shieldBroken: false };
            } else {
                const remainingDamage = damage - this.shieldHp;
                this.shieldHp = 0;
                this.hp -= remainingDamage;
                
                if (this.hp <= 0) {
                    this.hp = 0;
                    return { hpChanged: true, isDead: true, shieldBroken: true };
                }
                return { hpChanged: true, isDead: false, shieldBroken: true };
            }
        }
        
        this.hp -= damage;
        if (this.hp <= 0) {
            this.hp = 0;
            return { hpChanged: true, isDead: true, shieldBroken: false };
        }
        return { hpChanged: true, isDead: false, shieldBroken: false };
    }
}