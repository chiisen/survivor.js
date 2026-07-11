// @ts-check
/**
 * 分裂特效，用於顯示敵人分裂時的視覺效果
 */
export class SplitEffect {
    constructor() {
        /** @type {number} 特效 X 座標 */
        this.x = 0;
        /** @type {number} 特效 Y 座標 */
        this.y = 0;
        /** @type {number} 特效持續時間（秒） */
        this.duration = 0.6;
        /** @type {number} 剩餘時間（秒） */
        this.time = 0;
        /** @type {boolean} 是否活躍 */
        this.active = false;
        /** @type {Array<Object>} 擴散環陣列 */
        this.rings = [];
        /** @type {Array<Object>} 粒子陣列 */
        this.particles = [];
        
        for (let i = 0; i < 3; i++) {
            this.rings.push({
                radius: 0,
                alpha: 1,
                delay: i * 0.08
            });
        }
        
        for (let i = 0; i < 12; i++) {
            this.particles.push({
                x: 0,
                y: 0,
                vx: 0,
                vy: 0,
                radius: 0,
                alpha: 1,
                angle: (Math.PI * 2 * i) / 12
            });
        }
    }

    /**
     * 初始化分裂特效
     * @param {number} x - 起始 X 座標
     * @param {number} y - 起始 Y 座標
     * @returns {void}
     */
    init(x, y) {
        this.x = x;
        this.y = y;
        this.time = this.duration;
        this.active = true;
        
        for (let i = 0; i < 3; i++) {
            this.rings[i].radius = 0;
            this.rings[i].alpha = 1;
            this.rings[i].delay = i * 0.08;
        }
        
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 * i) / 12;
            const speed = 60 + Math.random() * 40;
            this.particles[i].x = x;
            this.particles[i].y = y;
            this.particles[i].vx = Math.cos(angle) * speed;
            this.particles[i].vy = Math.sin(angle) * speed;
            this.particles[i].radius = 4 + Math.random() * 3;
            this.particles[i].alpha = 1;
            this.particles[i].angle = angle;
        }
    }

    /**
     * 重置分裂特效
     * @returns {void}
     */
    reset() {
        this.x = 0;
        this.y = 0;
        this.time = 0;
        this.active = false;
        
        for (const ring of this.rings) {
            ring.radius = 0;
            ring.alpha = 1;
        }
        
        for (const p of this.particles) {
            p.x = 0;
            p.y = 0;
            p.vx = 0;
            p.vy = 0;
            p.radius = 0;
            p.alpha = 1;
        }
    }

    /**
     * 更新分裂特效
     * @param {number} dt - 時間差（秒）
     * @returns {void}
     */
    update(dt) {
        this.time -= dt;
        
        for (const ring of this.rings) {
            if (this.time < this.duration - ring.delay) {
                const ringProgress = (this.duration - this.time - ring.delay) / (this.duration - ring.delay);
                ring.radius = ringProgress * 50;
                ring.alpha = Math.max(0, 1 - ringProgress);
            }
        }
        
        for (const p of this.particles) {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vx *= 0.9;
            p.vy *= 0.9;
            p.radius *= 0.95;
            p.alpha = Math.max(0, this.time / this.duration);
        }
    }

    /**
     * 繪製分裂特效
     * @param {CanvasRenderingContext2D} ctx - Canvas 渲染上下文
     * @returns {void}
     */
    draw(ctx) {
        ctx.save();
        
        for (const ring of this.rings) {
            if (ring.alpha <= 0) continue;
            ctx.beginPath();
            ctx.arc(this.x, this.y, ring.radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(26, 188, 156, ${ring.alpha})`;
            ctx.lineWidth = 3;
            ctx.stroke();
        }
        
        const centerAlpha = Math.max(0, this.time / this.duration);
        ctx.beginPath();
        ctx.arc(this.x, this.y, 15, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(26, 188, 156, ${centerAlpha * 0.5})`;
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${centerAlpha * 0.6})`;
        ctx.fill();
        
        for (const p of this.particles) {
            if (p.alpha <= 0 || p.radius <= 0.5) continue;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(26, 188, 156, ${p.alpha})`;
            ctx.fill();
        }
        
        ctx.restore();
    }

    /**
     * 檢查分裂特效是否已完成
     * @returns {boolean} 是否已完成
     */
    isFinished() {
        return this.time <= 0;
    }
}