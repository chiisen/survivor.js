// @ts-check

import { distance } from './utils.js';

/**
 * 磁鐵道具 — 被玩家吸取後提供範圍吸取經驗球的效果
 */
export class MagnetItem {
    /**
     * @param {number} x - 初始 X 座標
     * @param {number} y - 初始 Y 座標
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 8;
        this.pulseTime = Math.random() * Math.PI * 2;
    }

    /**
     * 更新脈衝動畫時間
     * @param {number} dt - 幀間隔時間(秒)
     */
    update(dt) {
        this.pulseTime += dt * 5;
    }

    /**
     * 繪製磁鐵道具(含發光背景與磁鐵圖示)
     * @param {CanvasRenderingContext2D} ctx - Canvas 繪圖上下文
     */
    draw(ctx) {
        ctx.save();

        const pulse = Math.sin(this.pulseTime);
        const glowScale = 1 + pulse * 0.15;
        const t = this.pulseTime;

        // 外層脈動光暈
        const auraGrad = ctx.createRadialGradient(this.x, this.y, this.radius * 0.5, this.x, this.y, this.radius * 2.5);
        auraGrad.addColorStop(0, `rgba(231, 76, 60, ${0.35 + pulse * 0.1})`);
        auraGrad.addColorStop(0.5, `rgba(231, 76, 60, ${0.15 + pulse * 0.05})`);
        auraGrad.addColorStop(1, 'rgba(231, 76, 60, 0)');
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = auraGrad;
        ctx.fill();

        // 旋轉磁力線
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(t * 0.5);
        for (let i = 0; i < 4; i++) {
            const angle = (Math.PI * 2 / 4) * i;
            const lineLen = this.radius * 1.8;
            ctx.beginPath();
            ctx.moveTo(Math.cos(angle) * this.radius * 0.6, Math.sin(angle) * this.radius * 0.6);
            ctx.lineTo(Math.cos(angle) * lineLen, Math.sin(angle) * lineLen);
            ctx.strokeStyle = `rgba(255, 100, 50, ${0.3 + Math.sin(t * 3 + i) * 0.15})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }
        ctx.restore();

        // 主體漸層圓
        const bodyGrad = ctx.createRadialGradient(this.x - 2, this.y - 2, 0, this.x, this.y, this.radius);
        bodyGrad.addColorStop(0, '#ff6b6b');
        bodyGrad.addColorStop(0.5, '#e74c3c');
        bodyGrad.addColorStop(1, '#c0392b');
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * glowScale, 0, Math.PI * 2);
        ctx.fillStyle = bodyGrad;
        ctx.fill();

        // 外框
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * glowScale, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 高光
        ctx.beginPath();
        ctx.arc(this.x - 2, this.y - 2, this.radius * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fill();

        // 磁鐵圖標
        ctx.font = `${this.radius * 1.5}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🧲', this.x, this.y);

        ctx.restore();
    }

    /**
     * 判斷是否已被玩家接觸拾取
     * @param {number} playerX - 玩家 X 座標
     * @param {number} playerY - 玩家 Y 座標
     * @param {number} playerRadius - 玩家碰撞半徑
     * @returns {boolean} 是否已被拾取
     */
    isCollected(playerX, playerY, playerRadius) {
        return distance(this.x, this.y, playerX, playerY) < playerRadius + this.radius;
    }
}
