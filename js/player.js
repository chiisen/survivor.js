import { normalize, clamp } from './utils.js';

export class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 20;
        this.speed = 200;
        this.maxHp = 100;
        this.hp = this.maxHp;
        this.pickupRange = 80;
        this.baseAttackRange = 300;
        this.attackRange = this.baseAttackRange;
        this.invincibleTime = 0;
        this.flashTime = 0;
        this.baseFireRate = 0.5;
        this.fireRate = this.baseFireRate;
        this.fireCooldown = 0;
        this.damage = 1;
        this.projectileSpeed = 400;
        this.projectileCount = 3;
        this.attackAnimationTime = 0;
        this.attackDuration = 0.15;
        this.attackAngle = 0;
        this.facingAngle = 0;
        this.hasFireRateBuff = false;
        this.fireRateBuffTime = 0;
        this.fireRateBuffDuration = 5;
        
        this.critChance = 0;
        this.critDamage = 1.5;
        this.lifesteal = 0;
        this.shield = 0;
        this.maxShield = 0;
        this.expBonus = 0;
        this.armor = 0;
        
        this.skillCooldown = 0;
        this.skillCooldownDuration = 30;
        
        this.upgradeStats = {
            maxHp: 0,
            speed: 0,
            pickupRange: 0,
            attackRange: 0,
            fireRate: 0,
            damage: 0,
            projectileSpeed: 0,
            projectileCount: 0,
            critChance: 0,
            critDamage: 0,
            lifesteal: 0,
            shield: 0,
            expBonus: 0,
            armor: 0
        };
    }

    update(dt, keys, canvasWidth, canvasHeight) {
        let dx = 0;
        let dy = 0;

        if (keys['w'] || keys['W'] || keys['ArrowUp']) dy -= 1;
        if (keys['s'] || keys['S'] || keys['ArrowDown']) dy += 1;
        if (keys['a'] || keys['A'] || keys['ArrowLeft']) dx -= 1;
        if (keys['d'] || keys['D'] || keys['ArrowRight']) dx += 1;

        if (dx !== 0 || dy !== 0) {
            const normalized = normalize(dx, dy);
            this.x += normalized.x * this.speed * dt;
            this.y += normalized.y * this.speed * dt;
            this.facingAngle = Math.atan2(dy, dx);
        }

        this.x = clamp(this.x, this.radius, canvasWidth - this.radius);
        this.y = clamp(this.y, this.radius, canvasHeight - this.radius);

        if (this.invincibleTime > 0) {
            this.invincibleTime -= dt;
        }
        if (this.flashTime > 0) {
            this.flashTime -= dt;
        }
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

    activateFireRateBuff() {
        this.hasFireRateBuff = true;
        this.fireRateBuffTime = this.fireRateBuffDuration;
        this.fireRate = this.baseFireRate * 0.7;
    }

    canFire() {
        return this.fireCooldown <= 0;
    }

    fire(targetX, targetY) {
        this.fireCooldown = this.fireRate;
        this.attackAnimationTime = this.attackDuration;
        this.attackAngle = Math.atan2(targetY - this.y, targetX - this.x);
        this.facingAngle = this.attackAngle;
    }

    draw(ctx) {
        ctx.save();
        
        if (this.flashTime > 0) {
            ctx.globalAlpha = 0.5 + Math.sin(this.flashTime * 50) * 0.5;
        }

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.baseAttackRange, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(52, 152, 219, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();

        if (this.attackRange > this.baseAttackRange) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.attackRange, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(46, 204, 113, 0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            const extraRange = this.attackRange - this.baseAttackRange;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.baseAttackRange + extraRange / 2, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(46, 204, 113, 0.15)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        ctx.translate(this.x, this.y);
        ctx.rotate(this.facingAngle);
        ctx.translate(-this.x, -this.y);

        ctx.beginPath();
        ctx.arc(this.x, this.y - 5, this.radius * 0.9, 0, Math.PI * 2);
        const helmetGradient = ctx.createRadialGradient(
            this.x, this.y - 10, 0,
            this.x, this.y - 5, this.radius * 0.9
        );
        helmetGradient.addColorStop(0, '#95a5a6');
        helmetGradient.addColorStop(0.5, '#7f8c8d');
        helmetGradient.addColorStop(1, '#5d6d7e');
        ctx.fillStyle = helmetGradient;
        ctx.fill();
        ctx.strokeStyle = '#34495e';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(this.x - this.radius * 0.3, this.y - this.radius * 0.6);
        ctx.lineTo(this.x - this.radius * 0.1, this.y - this.radius * 1.1);
        ctx.lineTo(this.x + this.radius * 0.1, this.y - this.radius * 1.1);
        ctx.lineTo(this.x + this.radius * 0.3, this.y - this.radius * 0.6);
        ctx.fillStyle = '#5d6d7e';
        ctx.fill();
        ctx.strokeStyle = '#34495e';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(this.x - this.radius * 0.2, this.y - this.radius * 1.05);
        ctx.lineTo(this.x - this.radius * 0.4, this.y - this.radius * 1.4);
        ctx.lineTo(this.x + this.radius * 0.4, this.y - this.radius * 1.4);
        ctx.lineTo(this.x + this.radius * 0.2, this.y - this.radius * 1.05);
        ctx.fillStyle = '#5d6d7e';
        ctx.fill();
        ctx.strokeStyle = '#34495e';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this.x - 5, this.y - 6, 2, 0, Math.PI * 2);
        ctx.arc(this.x + 5, this.y - 6, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#e74c3c';
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(this.x - 8, this.y - 3);
        ctx.lineTo(this.x + 8, this.y - 3);
        ctx.strokeStyle = '#34495e';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this.x, this.y + 8, this.radius * 1.1, 0, Math.PI * 2);
        const bodyGradient = ctx.createRadialGradient(
            this.x - 5, this.y + 5, 0,
            this.x, this.y + 8, this.radius * 1.1
        );
        bodyGradient.addColorStop(0, '#bdc3c7');
        bodyGradient.addColorStop(0.4, '#95a5a6');
        bodyGradient.addColorStop(1, '#7f8c8d');
        ctx.fillStyle = bodyGradient;
        ctx.fill();
        ctx.strokeStyle = '#34495e';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(this.x - 2, this.y + 3);
        ctx.lineTo(this.x - 2, this.y + 15);
        ctx.moveTo(this.x + 2, this.y + 3);
        ctx.lineTo(this.x + 2, this.y + 15);
        ctx.strokeStyle = '#5d6d7e';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(this.x - this.radius * 0.8, this.y + 5);
        ctx.lineTo(this.x - this.radius * 1.3, this.y + 15);
        ctx.strokeStyle = '#7f8c8d';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(this.x + this.radius * 0.8, this.y + 5);
        ctx.lineTo(this.x + this.radius * 1.3, this.y + 15);
        ctx.strokeStyle = '#7f8c8d';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.stroke();

        const swordBaseAngle = -Math.PI / 4;
        const swordSwingRange = Math.PI / 2;
        let currentSwordAngle = swordBaseAngle;
        
        if (this.attackAnimationTime > 0) {
            const progress = this.attackAnimationTime / this.attackDuration;
            currentSwordAngle = swordBaseAngle + (1 - progress) * swordSwingRange;
            
            ctx.beginPath();
            ctx.arc(
                this.x + this.radius * 1.8,
                this.y,
                this.radius * 2.5,
                currentSwordAngle - 0.3,
                currentSwordAngle + 0.3
            );
            ctx.strokeStyle = 'rgba(52, 152, 219, 0.5)';
            ctx.lineWidth = 4;
            ctx.stroke();
        }

        ctx.save();
        ctx.translate(this.x + this.radius * 1.3, this.y + 10);
        ctx.rotate(currentSwordAngle);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -this.radius * 2.5);
        ctx.lineTo(3, -this.radius * 2.5);
        ctx.lineTo(3, 0);
        ctx.closePath();
        const swordGradient = ctx.createLinearGradient(0, -this.radius * 2.5, 3, 0);
        swordGradient.addColorStop(0, '#ecf0f1');
        swordGradient.addColorStop(0.5, '#bdc3c7');
        swordGradient.addColorStop(1, '#95a5a6');
        ctx.fillStyle = swordGradient;
        ctx.fill();
        ctx.strokeStyle = '#7f8c8d';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-2, 0);
        ctx.lineTo(5, 0);
        ctx.lineTo(5, 5);
        ctx.lineTo(-2, 5);
        ctx.closePath();
        ctx.fillStyle = '#f39c12';
        ctx.fill();
        ctx.strokeStyle = '#e67e22';
        ctx.lineWidth = 1;
        ctx.stroke();

        if (this.attackAnimationTime > 0) {
            ctx.beginPath();
            ctx.moveTo(1, -this.radius * 2.5);
            ctx.lineTo(1, -this.radius * 3);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        ctx.restore();

        ctx.restore();
    }

    applyUpgrade(upgrade) {
        this.upgradeStats[upgrade.type]++;
        
        switch (upgrade.type) {
            case 'maxHp':
                this.maxHp += upgrade.value;
                this.hp += upgrade.value;
                break;
            case 'speed':
                this.speed += upgrade.value;
                break;
            case 'pickupRange':
                this.pickupRange += upgrade.value;
                break;
            case 'attackRange':
                this.attackRange += upgrade.value;
                break;
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
            case 'shield':
                this.shield += upgrade.value;
                this.maxShield += upgrade.value;
                break;
            case 'expBonus':
                this.expBonus += upgrade.value;
                break;
            case 'armor':
                this.armor += upgrade.value;
                break;
        }
    }
    
    rollCrit() {
        if (this.critChance > 0 && Math.random() < this.critChance) {
            return this.critDamage;
        }
        return 1;
    }
    
    heal(amount) {
        this.hp = Math.min(this.maxHp, this.hp + amount);
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
        const actualDamage = Math.max(1, rawDamage - this.armor);
        
        if (this.shield > 0) {
            if (this.shield >= actualDamage) {
                this.shield -= actualDamage;
                return false;
            } else {
                const remainingDamage = actualDamage - this.shield;
                this.shield = 0;
                this.hp -= remainingDamage;
                if (this.hp <= 0) {
                    this.hp = 0;
                    return true;
                }
                return false;
            }
        }
        
        if (this.invincibleTime > 0) {
            return false;
        }
        
        this.hp -= actualDamage;
        if (this.hp <= 0) {
            this.hp = 0;
            return true;
        }
        
        this.invincibleTime = 1;
        this.flashTime = 1;
        return false;
    }
}