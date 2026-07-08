import { normalize, clamp } from './utils.js';

export class PlayerCore {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 20;
        this.speed = 200;
        this.maxHp = 100;
        this.hp = this.maxHp;
        this.shield = 0;
        this.maxShield = 0;
        this.armor = 0;
        this.invincibleTime = 0;
        this.flashTime = 0;
        this.pickupRange = 80;
        this.baseAttackRange = 300;
        this.attackRange = this.baseAttackRange;
        this.facingAngle = 0;
        this.magnetTimer = 0;
        
        this.upgradeStats = {
            maxHp: 0,
            speed: 0,
            pickupRange: 0,
            attackRange: 0,
            armor: 0,
            shield: 0
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
        if (this.magnetTimer > 0) {
            this.magnetTimer = Math.max(0, this.magnetTimer - dt);
        }
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
            case 'armor':
                this.armor += upgrade.value;
                break;
            case 'shield':
                this.maxShield += upgrade.value;
                this.shield += upgrade.value;
                break;
        }
    }
}