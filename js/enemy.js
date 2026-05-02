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
        radius: 35,
        speed: 25,
        maxHp: 50,
        damage: 30,
        expValue: 100,
        color: '#c0392b',
        strokeColor: '#922b21',
        eyeColor: '#f1c40f',
        mouthStyle: 'boss',
        canShoot: true,
        shootInterval: 1.5,
        isBoss: true
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
    }

    update(dt, playerX, playerY) {
        const dx = playerX - this.x;
        const dy = playerY - this.y;
        const normalized = normalize(dx, dy);
        
        this.x += normalized.x * this.speed * dt;
        this.y += normalized.y * this.speed * dt;
        
        if (this.canShoot) {
            this.shootCooldown -= dt;
            if (this.shootCooldown <= 0) {
                this.shootCooldown = this.shootInterval;
                return this.shoot(playerX, playerY);
            }
        }
        
        return null;
    }

    shoot(targetX, targetY) {
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const normalized = normalize(dx, dy);
        
        return {
            x: this.x,
            y: this.y,
            vx: normalized.x * 150,
            vy: normalized.y * 150,
            damage: 5,
            radius: 5,
            color: '#9b59b6'
        };
    }

    draw(ctx) {
        ctx.save();
        
        if (this.type === EnemyTypes.BOSS) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 10, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(192, 57, 43, 0.2)';
            ctx.fill();
            
            ctx.beginPath();
            ctx.moveTo(this.x - 15, this.y - this.radius - 25);
            ctx.lineTo(this.x, this.y - this.radius - 35);
            ctx.lineTo(this.x + 15, this.y - this.radius - 25);
            ctx.lineTo(this.x + 10, this.y - this.radius - 25);
            ctx.lineTo(this.x, this.y - this.radius - 30);
            ctx.lineTo(this.x - 10, this.y - this.radius - 25);
            ctx.closePath();
            ctx.fillStyle = '#f1c40f';
            ctx.fill();
            ctx.strokeStyle = '#e67e22';
            ctx.lineWidth = 2;
            ctx.stroke();
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
                { type: EnemyTypes.NORMAL, weight: 50 },
                { type: EnemyTypes.FAST, weight: gameTime > 30 ? 25 : 10 },
                { type: EnemyTypes.TANK, weight: gameTime > 60 ? 20 : 5 },
                { type: EnemyTypes.RANGED, weight: gameTime > 45 ? 15 : 0 }
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