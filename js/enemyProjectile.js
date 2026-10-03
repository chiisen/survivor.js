// @ts-check

import { ObjectPool } from './objectPool.js';

/**
 * 敵人投射物。外觀用實心圓與拖尾，不在每幀建立 CanvasGradient。
 */
export class EnemyProjectile {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.damage = 1;
        this.radius = 5;
        this.color = '#9b59b6';
        /** @type {{x:number,y:number}[]} */
        this.trail = [];
        this.maxTrailLength = 10;
        this.active = false;
    }

    /**
     * @param {{ x:number, y:number, vx:number, vy:number, damage:number, radius:number, color:string, maxTrailLength?:number }} data
     * @returns {void}
     */
    init(data) {
        this.x = data.x;
        this.y = data.y;
        this.vx = data.vx;
        this.vy = data.vy;
        this.damage = data.damage;
        this.radius = data.radius;
        this.color = data.color;
        this.maxTrailLength = data.maxTrailLength || 10;
        this.trail.length = 0;
        this.active = true;
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @returns {void}
     */
    draw(ctx) {
        if (!Number.isFinite(this.x) || !Number.isFinite(this.y) || !Number.isFinite(this.radius)) {
            return;
        }

        ctx.save();
        for (let i = 0; i < this.trail.length; i++) {
            const alpha = (1 - i / this.trail.length) * 0.3;
            const radius = this.radius * (1 - i / this.trail.length * 0.5);
            ctx.beginPath();
            ctx.arc(this.trail[i].x, this.trail[i].y, radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(155, 89, 182, ${alpha})`;
            ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#8e44ad';
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
}

/**
 * @returns {ObjectPool}
 */
export function createEnemyProjectilePool() {
    return new ObjectPool(
        () => new EnemyProjectile(),
        (obj, data) => /** @type {EnemyProjectile} */ (obj).init(data),
        30,
        200
    );
}
