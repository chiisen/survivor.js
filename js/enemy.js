import { normalize, distance, randomRange } from './utils.js';

const EnemyTypes = {
    NORMAL: {
        name: 'normal',
        radius: 15,
        speed: 60,
        maxHp: 1,
        damage: 10,
        expValue: 10,
        color: '#e74c3c',
        strokeColor: '#c0392b',
        eyeColor: '#fff',
        mouthStyle: 'angry',
        canShoot: false,
        shootInterval: 0
    },
    FAST: {
        name: 'fast',
        radius: 12,
        speed: 100,
        maxHp: 1,
        damage: 8,
        expValue: 12,
        color: '#27ae60',
        strokeColor: '#229954',
        eyeColor: '#fff',
        mouthStyle: 'neutral',
        canShoot: false,
        shootInterval: 0
    },
    TANK: {
        name: 'tank',
        radius: 22,
        speed: 35,
        maxHp: 3,
        damage: 20,
        expValue: 25,
        color: '#7f8c8d',
        strokeColor: '#5d6d7e',
        eyeColor: '#e74c3c',
        mouthStyle: 'wide',
        canShoot: false,
        shootInterval: 0
    },
    RANGED: {
        name: 'ranged',
        radius: 14,
        speed: 40,
        maxHp: 2,
        damage: 10,
        expValue: 15,
        color: '#9b59b6',
        strokeColor: '#8e44ad',
        eyeColor: '#f1c40f',
        mouthStyle: 'shooter',
        canShoot: true,
        shootInterval: 2.0
    },
    BOSS: {
        name: 'boss',
        radius: 160,
        speed: 18,
        maxHp: 200,
        damage: 50,
        expValue: 300,
        color: '#c0392b',
        strokeColor: '#922b21',
        eyeColor: '#f1c40f',
        mouthStyle: 'boss',
        canShoot: true,
        shootInterval: 1.0,
        isBoss: true
    },
    ELITE: {
        name: 'elite',
        radius: 25,
        speed: 45,
        maxHp: 8,
        damage: 25,
        expValue: 50,
        color: '#e67e22',
        strokeColor: '#d35400',
        eyeColor: '#fff',
        mouthStyle: 'elite',
        canShoot: false,
        shootInterval: 0,
        isElite: true,
        shieldHp: 5,
        shieldMaxHp: 5
    },
    SPLITTER: {
        name: 'splitter',
        radius: 18,
        speed: 50,
        maxHp: 2,
        damage: 10,
        expValue: 15,
        color: '#16a085',
        strokeColor: '#138d75',
        eyeColor: '#fff',
        mouthStyle: 'split',
        canShoot: false,
        shootInterval: 0,
        canSplit: true
    },
    EXPLOSIVE: {
        name: 'explosive',
        radius: 16,
        speed: 55,
        maxHp: 2,
        damage: 15,
        expValue: 20,
        color: '#d35400',
        strokeColor: '#bf4a1a',
        eyeColor: '#f39c12',
        mouthStyle: 'explosive',
        canShoot: false,
        shootInterval: 0,
        explosive: true,
        explosionRadius: 60,
        explosionDamage: 20
    },
    STEALTH: {
        name: 'stealth',
        radius: 13,
        speed: 80,
        maxHp: 1,
        damage: 15,
        expValue: 18,
        color: '#5d6d7e',
        strokeColor: '#4a5a6a',
        eyeColor: '#3498db',
        mouthStyle: 'stealth',
        canShoot: false,
        shootInterval: 0,
        isStealth: true,
        baseAlpha: 0.3
    }
};

export class Enemy {
    constructor(x, y, type = EnemyTypes.NORMAL) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.radius = type.radius;
        this.speed = type.speed + randomRange(-10, 10);
        this.maxHp = type.maxHp;
        this.hp = this.maxHp;
        this.damage = type.damage;
        this.color = type.color;
        this.strokeColor = type.strokeColor;
        this.expValue = type.expValue;
        this.eyeColor = type.eyeColor;
        this.mouthStyle = type.mouthStyle;
        
        this.canShoot = type.canShoot;
        this.shootInterval = type.shootInterval;
        this.shootCooldown = 0;
        this.projectiles = [];
        
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
        
        this.shieldHp = type.shieldHp || 0;
        this.shieldMaxHp = type.shieldHp || 0;
        this.hasShield = this.shieldHp > 0;
        
        this.phase = 1;
        this.rageMode = false;
        this.spawnCooldown = 0;
    }

    update(dt, playerX, playerY, playerAttackRange = 300) {
        const dx = playerX - this.x;
        const dy = playerY - this.y;
        const normalized = normalize(dx, dy);
        
        const distToPlayer = Math.sqrt(dx * dx + dy * dy);
        const speedMultiplier = distToPlayer <= playerAttackRange ? 1.1 : 1.0;
        const actualSpeed = this.speed * speedMultiplier;
        
        if (this.type.isBoss) {
            const hpPercentage = this.hp / this.maxHp;
            
            if (hpPercentage <= 0.3 && !this.rageMode) {
                this.rageMode = true;
                this.phase = 3;
                this.speed *= 1.5;
                this.shootInterval *= 0.5;
            } else if (hpPercentage <= 0.6 && this.phase < 2) {
                this.phase = 2;
                this.shootInterval *= 0.7;
            }
            
            if (this.phase >= 2 && this.spawnCooldown <= 0) {
                this.spawnCooldown = 5;
                return { type: 'spawn_minion', x: this.x, y: this.y };
            }
            
            if (this.spawnCooldown > 0) {
                this.spawnCooldown -= dt;
            }
        }
        
        this.x += normalized.x * actualSpeed * dt;
        this.y += normalized.y * actualSpeed * dt;
        
        if (this.isStealth) {
            if (this.revealTime > 0) {
                this.revealTime -= dt;
                this.currentAlpha = 1;
            } else {
                this.currentAlpha = this.baseAlpha;
            }
        }
        
        if (this.canShoot) {
            this.shootCooldown -= dt;
            if (this.shootCooldown <= 0) {
                this.shootCooldown = this.shootInterval;
                return this.shoot(playerX, playerY);
            }
        }
        
        return null;
    }

    reveal() {
        if (this.isStealth) {
            this.revealTime = 2;
        }
    }

    shoot(targetX, targetY) {
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const normalized = normalize(dx, dy);
        
        const projectileData = {
            x: this.x,
            y: this.y,
            vx: normalized.x * 150,
            vy: normalized.y * 150,
            damage: 5,
            radius: 5,
            color: '#9b59b6',
            trail: [],
            maxTrailLength: 10
        };
        
        return projectileData;
    }

    draw(ctx) {
        ctx.save();
        
        if (this.isStealth) {
            if (this.revealTime > 0) {
                const flashRate = Math.sin(this.revealTime * 10) * 0.3 + 0.7;
                ctx.globalAlpha = flashRate;
                
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius + 8, 0, Math.PI * 2);
                ctx.strokeStyle = '#3498db';
                ctx.lineWidth = 3;
                ctx.globalAlpha = flashRate * 0.6;
                ctx.stroke();
                
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius + 12, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(52, 152, 219, 0.3)';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                ctx.globalAlpha = flashRate;
            } else {
                ctx.globalAlpha = this.baseAlpha;
            }
        }
        
        if (this.type === EnemyTypes.BOSS) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 10, 0, Math.PI * 2);
            ctx.fillStyle = this.rageMode ? 'rgba(231, 76, 60, 0.4)' : 'rgba(192, 57, 43, 0.2)';
            ctx.fill();
            
            if (this.rageMode) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius + 20, 0, Math.PI * 2);
                ctx.strokeStyle = '#e74c3c';
                ctx.lineWidth = 4;
                ctx.stroke();
                
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius + 30, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(231, 76, 60, 0.3)';
                ctx.lineWidth = 3;
                ctx.stroke();
                
                for (let i = 0; i < 8; i++) {
                    const flameAngle = (Math.PI * 2 / 8) * i + Math.sin(Date.now() / 100) * 0.2;
                    const flameX = this.x + Math.cos(flameAngle) * (this.radius + 15);
                    const flameY = this.y + Math.sin(flameAngle) * (this.radius + 15);
                    ctx.beginPath();
                    ctx.arc(flameX, flameY, 5, 0, Math.PI * 2);
                    ctx.fillStyle = '#f39c12';
                    ctx.fill();
                }
            }
            
            ctx.beginPath();
            ctx.moveTo(this.x - 15, this.y - this.radius - 25);
            ctx.lineTo(this.x, this.y - this.radius - 35);
            ctx.lineTo(this.x + 15, this.y - this.radius - 25);
            ctx.lineTo(this.x + 10, this.y - this.radius - 25);
            ctx.lineTo(this.x, this.y - this.radius - 30);
            ctx.lineTo(this.x - 10, this.y - this.radius - 25);
            ctx.closePath();
            ctx.fillStyle = this.rageMode ? '#e74c3c' : '#f1c40f';
            ctx.fill();
            ctx.strokeStyle = this.rageMode ? '#c0392b' : '#e67e22';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        
        if (this.type === EnemyTypes.ELITE) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 8, 0, Math.PI * 2);
            ctx.strokeStyle = '#f1c40f';
            ctx.lineWidth = 3;
            ctx.stroke();
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 12, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(241, 196, 15, 0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            if (this.hasShield && this.shieldHp > 0) {
                const shieldAlpha = 0.4 + (this.shieldHp / this.shieldMaxHp) * 0.3;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius + 18, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(52, 152, 219, ${shieldAlpha})`;
                ctx.fill();
                ctx.strokeStyle = '#3498db';
                ctx.lineWidth = 3;
                ctx.stroke();
                
                const shieldBarWidth = this.radius * 1.5;
                const shieldBarHeight = 4;
                const shieldBarY = this.y - this.radius - 18;
                
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.fillRect(this.x - shieldBarWidth / 2, shieldBarY, shieldBarWidth, shieldBarHeight);
                
                ctx.fillStyle = '#3498db';
                ctx.fillRect(this.x - shieldBarWidth / 2, shieldBarY, shieldBarWidth * (this.shieldHp / this.shieldMaxHp), shieldBarHeight);
            }
        }
        
        if (this.type === EnemyTypes.SPLITTER) {
            ctx.beginPath();
            ctx.moveTo(this.x - this.radius * 0.3, this.y - this.radius * 1.2);
            ctx.lineTo(this.x + this.radius * 0.3, this.y - this.radius * 1.2);
            ctx.lineTo(this.x, this.y - this.radius * 0.8);
            ctx.closePath();
            ctx.fillStyle = '#1abc9c';
            ctx.fill();
        }
        
        if (this.type === EnemyTypes.EXPLOSIVE) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 6, 0, Math.PI * 2);
            ctx.strokeStyle = '#f39c12';
            ctx.lineWidth = 3;
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(this.x - this.radius * 0.4, this.y - this.radius);
            ctx.lineTo(this.x, this.y - this.radius * 1.3);
            ctx.lineTo(this.x + this.radius * 0.4, this.y - this.radius);
            ctx.fillStyle = '#f39c12';
            ctx.fill();
        }
        
        if (this.type === EnemyTypes.TANK) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 4, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(127, 140, 141, 0.3)';
            ctx.fill();
        }
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = this.strokeColor;
        ctx.lineWidth = this.type === EnemyTypes.BOSS ? 4 : 2;
        ctx.stroke();

        if (this.type === EnemyTypes.FAST) {
            const angle = Math.atan2(this.vy || 0, this.vx || 0);
            ctx.beginPath();
            ctx.moveTo(this.x - this.radius * 0.5, this.y - this.radius * 0.8);
            ctx.lineTo(this.x, this.y - this.radius * 1.5);
            ctx.lineTo(this.x + this.radius * 0.5, this.y - this.radius * 0.8);
            ctx.fillStyle = this.color;
            ctx.fill();
        }

        if (this.type === EnemyTypes.RANGED) {
            ctx.beginPath();
            ctx.arc(this.x, this.y - this.radius * 0.5, this.radius * 0.4, 0, Math.PI * 2);
            ctx.fillStyle = '#8e44ad';
            ctx.fill();
            ctx.strokeStyle = '#7d3c98';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(this.x - this.radius * 0.3, this.y - this.radius * 0.2, this.radius * 0.2, 0, Math.PI * 2);
        ctx.arc(this.x + this.radius * 0.3, this.y - this.radius * 0.2, this.radius * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = this.eyeColor;
        ctx.fill();

        ctx.beginPath();
        switch (this.mouthStyle) {
            case 'angry':
                ctx.moveTo(this.x - this.radius * 0.35, this.y + this.radius * 0.35);
                ctx.lineTo(this.x + this.radius * 0.35, this.y + this.radius * 0.35);
                break;
            case 'neutral':
                ctx.arc(this.x, this.y + this.radius * 0.3, this.radius * 0.15, 0, Math.PI);
                break;
            case 'wide':
                ctx.arc(this.x, this.y + this.radius * 0.3, this.radius * 0.4, 0, Math.PI);
                break;
            case 'shooter':
                ctx.arc(this.x, this.y + this.radius * 0.35, this.radius * 0.25, Math.PI * 0.2, Math.PI * 0.8);
                break;
            case 'boss':
                ctx.arc(this.x, this.y + this.radius * 0.35, this.radius * 0.5, Math.PI, 0, true);
                break;
            case 'elite':
                ctx.moveTo(this.x - this.radius * 0.4, this.y + this.radius * 0.3);
                ctx.lineTo(this.x - this.radius * 0.2, this.y + this.radius * 0.5);
                ctx.lineTo(this.x + this.radius * 0.2, this.y + this.radius * 0.5);
                ctx.lineTo(this.x + this.radius * 0.4, this.y + this.radius * 0.3);
                break;
            case 'split':
                ctx.moveTo(this.x - this.radius * 0.3, this.y + this.radius * 0.25);
                ctx.lineTo(this.x, this.y + this.radius * 0.5);
                ctx.lineTo(this.x + this.radius * 0.3, this.y + this.radius * 0.25);
                break;
            case 'explosive':
                ctx.arc(this.x, this.y + this.radius * 0.35, this.radius * 0.35, 0, Math.PI);
                ctx.closePath();
                ctx.fillStyle = '#f39c12';
                ctx.fill();
                break;
            case 'stealth':
                ctx.moveTo(this.x - this.radius * 0.25, this.y + this.radius * 0.3);
                ctx.lineTo(this.x + this.radius * 0.25, this.y + this.radius * 0.3);
                break;
        }
        ctx.strokeStyle = this.strokeColor;
        ctx.lineWidth = this.type === EnemyTypes.BOSS ? 4 : 2;
        ctx.stroke();

        if (this.maxHp > 1) {
            const hpPercentage = this.hp / this.maxHp;
            const barWidth = this.type === EnemyTypes.BOSS ? this.radius * 2.5 : this.radius * 1.5;
            const barHeight = this.type === EnemyTypes.BOSS ? 6 : 4;
            const barY = this.y - this.radius - (this.type === EnemyTypes.BOSS ? 12 : 8);
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(this.x - barWidth / 2, barY, barWidth, barHeight);
            
            ctx.fillStyle = this.type === EnemyTypes.BOSS 
                ? (hpPercentage > 0.5 ? '#e74c3c' : '#922b21')
                : (hpPercentage > 0.5 ? '#2ecc71' : '#e74c3c');
            ctx.fillRect(this.x - barWidth / 2, barY, barWidth * hpPercentage, barHeight);
            
            if (this.type === EnemyTypes.BOSS) {
                ctx.strokeStyle = '#922b21';
                ctx.lineWidth = 1;
                ctx.strokeRect(this.x - barWidth / 2, barY, barWidth, barHeight);
            }
        }

        ctx.restore();
    }

    static spawn(canvasWidth, canvasHeight, playerX, playerY, gameTime, isBoss = false, hpMultiplier = 1) {
        const side = Math.floor(Math.random() * 4);
        let x, y;
        const margin = 50;

        switch (side) {
            case 0:
                x = randomRange(-margin, canvasWidth + margin);
                y = -margin;
                break;
            case 1:
                x = canvasWidth + margin;
                y = randomRange(-margin, canvasHeight + margin);
                break;
            case 2:
                x = randomRange(-margin, canvasWidth + margin);
                y = canvasHeight + margin;
                break;
            case 3:
                x = -margin;
                y = randomRange(-margin, canvasHeight + margin);
                break;
        }

        let type;
        
        if (isBoss) {
            type = EnemyTypes.BOSS;
        } else {
            const typeWeights = [
                { type: EnemyTypes.NORMAL, weight: 40 },
                { type: EnemyTypes.FAST, weight: gameTime > 30 ? 20 : 10 },
                { type: EnemyTypes.TANK, weight: gameTime > 60 ? 15 : 5 },
                { type: EnemyTypes.RANGED, weight: gameTime > 45 ? 12 : 0 },
                { type: EnemyTypes.ELITE, weight: gameTime > 90 ? 10 : 0 },
                { type: EnemyTypes.SPLITTER, weight: gameTime > 60 ? 12 : 0 },
                { type: EnemyTypes.EXPLOSIVE, weight: gameTime > 45 ? 10 : 0 },
                { type: EnemyTypes.STEALTH, weight: gameTime > 75 ? 8 : 0 }
            ];
            
            const totalWeight = typeWeights.reduce((sum, t) => sum + t.weight, 0);
            let random = Math.random() * totalWeight;
            
            for (const tw of typeWeights) {
                random -= tw.weight;
                if (random <= 0) {
                    type = tw.type;
                    break;
                }
            }
        }
        
        if (!type) type = EnemyTypes.NORMAL;

        const enemy = new Enemy(x, y, type);
        
        if (!isBoss && hpMultiplier > 1) {
            enemy.maxHp = Math.ceil(enemy.maxHp * hpMultiplier);
            enemy.hp = enemy.maxHp;
        }
        
        return enemy;
    }
}

export { EnemyTypes };