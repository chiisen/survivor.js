// @ts-check
import { distance, lerp } from './utils.js';

export class ExperienceOrb {
    /**
     * 建立經驗球實例
     * @param {number} x - X 座標
     * @param {number} y - Y 座標
     * @param {number} value - 經驗值
     */
    constructor(x, y, value) {
        this.x = x;
        this.y = y;
        this.radius = 6;
        this.value = value;
        this.color = '#2ecc71';
        this.pulseTime = Math.random() * Math.PI * 2;
        this.beingAttracted = false;
    }

    /**
     * 更新經驗球狀態（脈衝動畫 + 進入拾取範圍後被吸引向玩家）
     * @param {number} dt - 與上一幀的時間差（秒）
     * @param {number} playerX - 玩家 X 座標
     * @param {number} playerY - 玩家 Y 座標
     * @param {number} pickupRange - 拾取範圍半徑
     */
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

    /**
     * 繪製經驗球（含脈衝光暈效果）
     * @param {CanvasRenderingContext2D} ctx - Canvas 繪圖上下文
     */
    draw(ctx) {
        ctx.save();

        const pulseScale = 1 + Math.sin(this.pulseTime) * 0.2;
        const currentRadius = this.radius * pulseScale;
        const t = this.pulseTime;

        // 外層脈動光暈
        const glowRadius = currentRadius + 6 + Math.sin(t * 1.5) * 2;
        const glowGrad = ctx.createRadialGradient(this.x, this.y, currentRadius * 0.5, this.x, this.y, glowRadius);
        glowGrad.addColorStop(0, 'rgba(46, 204, 113, 0.35)');
        glowGrad.addColorStop(0.6, 'rgba(46, 204, 113, 0.15)');
        glowGrad.addColorStop(1, 'rgba(46, 204, 113, 0)');
        ctx.beginPath();
        ctx.arc(this.x, this.y, glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = glowGrad;
        ctx.fill();

        // 主體漸層
        const bodyGrad = ctx.createRadialGradient(this.x - 1, this.y - 1, 0, this.x, this.y, currentRadius);
        bodyGrad.addColorStop(0, '#5dde8e');
        bodyGrad.addColorStop(0.4, '#2ecc71');
        bodyGrad.addColorStop(1, '#1a9c54');
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = bodyGrad;
        ctx.fill();

        // 外框
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 高光
        ctx.beginPath();
        ctx.arc(this.x - currentRadius * 0.25, this.y - currentRadius * 0.25, currentRadius * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.fill();

        ctx.restore();
    }

    /**
     * 判斷經驗球是否已被玩家接觸拾取
     * @param {number} playerX - 玩家 X 座標
     * @param {number} playerY - 玩家 Y 座標
     * @param {number} playerRadius - 玩家碰撞半徑
     * @returns {boolean} 是否已拾取
     */
    isCollected(playerX, playerY, playerRadius) {
        return distance(this.x, this.y, playerX, playerY) < playerRadius + this.radius;
    }
}