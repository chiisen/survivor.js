// @ts-check
import { normalize, distance } from './utils.js';

export class Projectile {
    /**
     * 建立一個投射物實例（物件池用）
     */
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

    /**
     * 初始化投射物的位置、方向、速度與傷害
     * @param {number} x - 起始 X 座標
     * @param {number} y - 起始 Y 座標
     * @param {number} targetX - 目標 X 座標
     * @param {number} targetY - 目標 Y 座標
     * @param {number} speed - 移動速度（像素/秒）
     * @param {number} damage - 造成的傷害值
     */
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

    /**
     * 重置投射物為初始狀態（物件池回收用）
     */
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

    /**
     * 更新投射物位置與軌跡
     * @param {number} dt - 與上一幀的時間差（秒）
     */
    update(dt) {
        this.trail.unshift({ x: this.x, y: this.y });
        if (this.trail.length > this.maxTrailLength) {
            this.trail.pop();
        }

        this.x += this.vx * dt;
        this.y += this.vy * dt;
    }

    /**
     * 繪製投射物及其軌跡
     * @param {CanvasRenderingContext2D} ctx - Canvas 繪圖上下文
     */
    draw(ctx) {
        ctx.save();

        // 傷害等級決定顏色（低→橘 中→紅 高→金）
        const dmgLevel = Math.min(this.damage / 20, 1);
        let baseColor, trailR, trailG, trailB;
        if (this.isCrit) {
            baseColor = '#ff4444';
            trailR = 255; trailG = 68; trailB = 68;
        } else if (dmgLevel > 0.6) {
            baseColor = '#ffd700';
            trailR = 255; trailG = 215; trailB = 0;
        } else if (dmgLevel > 0.3) {
            baseColor = '#ff6b35';
            trailR = 255; trailG = 107; trailB = 53;
        } else {
            baseColor = '#f39c12';
            trailR = 243; trailG = 156; trailB = 18;
        }

        const sizeScale = 1 + dmgLevel * 0.3;
        const currentRadius = this.radius * sizeScale;

        // 軌跡
        for (let i = 0; i < this.trail.length; i++) {
            const alpha = (1 - i / this.trail.length) * 0.35;
            const radius = currentRadius * (1 - i / this.trail.length * 0.5);
            ctx.beginPath();
            ctx.arc(this.trail[i].x, this.trail[i].y, radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${trailR}, ${trailG}, ${trailB}, ${alpha})`;
            ctx.fill();
        }

        // 外發光
        const glowGrad = ctx.createRadialGradient(this.x, this.y, currentRadius * 0.5, this.x, this.y, currentRadius * 2);
        glowGrad.addColorStop(0, `rgba(${trailR}, ${trailG}, ${trailB}, 0.3)`);
        glowGrad.addColorStop(1, `rgba(${trailR}, ${trailG}, ${trailB}, 0)`);
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentRadius * 2, 0, Math.PI * 2);
        ctx.fillStyle = glowGrad;
        ctx.fill();

        // 主體漸層
        const gradient = ctx.createRadialGradient(
            this.x - 1, this.y - 1, 0,
            this.x, this.y, currentRadius
        );
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.3, baseColor);
        gradient.addColorStop(1, `rgba(${trailR * 0.6 | 0}, ${trailG * 0.6 | 0}, ${trailB * 0.6 | 0}, 1)`);
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // 暴擊額外光環
        if (this.isCrit) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, currentRadius + 4, 0, Math.PI * 2);
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        ctx.restore();
    }

    /**
     * 判斷投射物是否超出畫布邊界
     * @param {number} canvasWidth - 畫布寬度
     * @param {number} canvasHeight - 畫布高度
     * @returns {boolean} 是否超出邊界（含 100px 邊距）
     */
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