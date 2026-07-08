import { distance } from './utils.js';

export class MagnetItem {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 8;
        this.pulseTime = Math.random() * Math.PI * 2;
    }

    update(dt) {
        this.pulseTime += dt * 5;
    }

    draw(ctx) {
        ctx.save();
        // 繪製紅色發光背景
        const glowScale = 1 + Math.sin(this.pulseTime) * 0.15;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * glowScale * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(231, 76, 60, 0.25)';
        ctx.fill();

        // 繪製 U 型磁鐵符號
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🧲', this.x, this.y);
        ctx.restore();
    }

    isCollected(playerX, playerY, playerRadius) {
        return distance(this.x, this.y, playerX, playerY) < playerRadius + this.radius;
    }
}
