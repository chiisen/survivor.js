import { distance, lerp } from './utils.js';

export class ExperienceOrb {
    constructor(x, y, value) {
        this.x = x;
        this.y = y;
        this.radius = 6;
        this.value = value;
        this.color = '#2ecc71';
        this.pulseTime = Math.random() * Math.PI * 2;
        this.beingAttracted = false;
    }

    update(dt, playerX, playerY, pickupRange) {
        this.pulseTime += dt * 5;
        
        const dist = distance(this.x, this.y, playerX, playerY);
        
        if (dist <= pickupRange) {
            this.beingAttracted = true;
            const speed = 300;
            const dx = playerX - this.x;
            const dy = playerY - this.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            
            if (len > 0) {
                this.x += (dx / len) * speed * dt;
                this.y += (dy / len) * speed * dt;
            }
        }
    }

    draw(ctx) {
        ctx.save();

        const pulseScale = 1 + Math.sin(this.pulseTime) * 0.2;
        const currentRadius = this.radius * pulseScale;

        ctx.beginPath();
        ctx.arc(this.x, this.y, currentRadius + 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(46, 204, 113, 0.3)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(this.x - 2, this.y - 2, currentRadius * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fill();

        ctx.restore();
    }

    isCollected(playerX, playerY, playerRadius) {
        return distance(this.x, this.y, playerX, playerY) < playerRadius + this.radius;
    }
}