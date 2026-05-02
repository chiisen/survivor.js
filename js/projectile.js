import { normalize, distance } from './utils.js';

export class Projectile {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.radius = 8;
        this.vx = 0;
        this.vy = 0;
        this.damage = 1;
        this.color = '#f39c12';
        this.trail = [];
        this.maxTrailLength = 10;
        this.active = false;
        this.isCrit = false;
    }

    init(x, y, targetX, targetY, speed, damage) {
        this.x = x;
        this.y = y;
        const dir = normalize(targetX - x, targetY - y);
        this.vx = dir.x * speed;
        this.vy = dir.y * speed;
        this.damage = damage;
        this.trail = [];
        this.active = true;
        this.isCrit = false;
    }

    reset() {
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.damage = 1;
        this.trail = [];
        this.active = false;
        this.isCrit = false;
    }

    update(dt) {
        this.trail.unshift({ x: this.x, y: this.y });
        if (this.trail.length > this.maxTrailLength) {
            this.trail.pop();
        }

        this.x += this.vx * dt;
        this.y += this.vy * dt;
    }

    draw(ctx) {
        ctx.save();
        
        const baseColor = this.isCrit ? '#e74c3c' : '#f39c12';
        const trailColor = this.isCrit ? 'rgba(231, 76, 60,' : 'rgba(243, 156, 18,';

        for (let i = 0; i < this.trail.length; i++) {
            const alpha = (1 - i / this.trail.length) * 0.3;
            const radius = this.radius * (1 - i / this.trail.length * 0.5);
            ctx.beginPath();
            ctx.arc(this.trail[i].x, this.trail[i].y, radius, 0, Math.PI * 2);
            ctx.fillStyle = `${trailColor} ${alpha})`;
            ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = baseColor;
        ctx.fill();

        if (this.isCrit) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 4, 0, Math.PI * 2);
            ctx.strokeStyle = '#f1c40f';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        const gradient = ctx.createRadialGradient(
            this.x - 2, this.y - 2, 0,
            this.x, this.y, this.radius
        );
        gradient.addColorStop(0, '#fff');
        gradient.addColorStop(0.3, baseColor);
        gradient.addColorStop(1, this.isCrit ? '#c0392b' : '#e67e22');
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.restore();
    }

    isOutOfBounds(canvasWidth, canvasHeight) {
        const margin = 100;
        return (
            this.x < -margin ||
            this.x > canvasWidth + margin ||
            this.y < -margin ||
            this.y > canvasHeight + margin
        );
    }
}