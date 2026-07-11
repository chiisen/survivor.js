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
