// @ts-check
/**
 * Boss 死亡特效，用於顯示 Boss 死亡時的爆炸效果
 */
export class BossDeathEffect {
    constructor() {
        /** @type {number} 特效 X 座標 */
        this.x = 0;
        /** @type {number} 特效 Y 座標 */
        this.y = 0;
        /** @type {number} 特效持續時間（秒） */
        this.duration = 2.0;
        /** @type {number} 剩餘時間（秒） */
        this.time = 0;
        /** @type {boolean} 是否活躍 */
        this.active = false;
        /** @type {Array<Object>} 爆炸粒子陣列 */
        this.particles = [];
        /** @type {Array<Object>} 核心粒子陣列 */
        this.coreParticles = [];
        /** @type {Array<Object>} 閃電陣列 */
        this.lightningBolts = [];
        /** @type {Array<Object>} 擴散環陣列 */
        this.expandingRings = [];
        /** @type {number} 閃光半徑 */
        this.flashRadius = 0;
        /** @type {number} 閃光透明度 */
        this.flashAlpha = 1;
        
        for (let i = 0; i < 30; i++) {
            this.particles.push({
                x: 0,
                y: 0,
                vx: 0,
                vy: 0,
                radius: 0,
                color: '#e74c3c',
                alpha: 1,
                baseRadius: 6 + Math.random() * 4
            });
        }
        
        for (let i = 0; i < 15; i++) {
            this.coreParticles.push({
                x: 0,
                y: 0,
                vx: 0,
                vy: 0,
                radius: 0,
                alpha: 1,
                baseRadius: 12 + Math.random() * 8
            });
        }
        
        for (let i = 0; i < 8; i++) {
            this.lightningBolts.push({
                points: [],
                alpha: 1,
                angle: (Math.PI * 2 * i) / 8
            });
        }
        
        for (let i = 0; i < 4; i++) {
            this.expandingRings.push({
                radius: 0,
                alpha: 0.8,
                delay: i * 0.15
            });
        }
    }

    /**
     * 初始化 Boss 死亡特效
     * @param {number} x - 起始 X 座標
     * @param {number} y - 起始 Y 座標
     * @returns {void}
     */
    init(x, y) {
        this.x = x;
        this.y = y;
        this.time = this.duration;
        this.active = true;
        this.flashRadius = 0;
        this.flashAlpha = 1;
        
        for (let i = 0; i < 30; i++) {
            const angle = (Math.PI * 2 * i) / 30 + Math.random() * 0.3;
            const speed = 120 + Math.random() * 100;
            this.particles[i].x = x;
            this.particles[i].y = y;
            this.particles[i].vx = Math.cos(angle) * speed;
            this.particles[i].vy = Math.sin(angle) * speed;
            this.particles[i].radius = this.particles[i].baseRadius;
            this.particles[i].color = Math.random() > 0.3 ? '#e74c3c' : '#f39c12';
            this.particles[i].alpha = 1;
        }
        
        for (let i = 0; i < 15; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 50 + Math.random() * 40;
            this.coreParticles[i].x = x;
            this.coreParticles[i].y = y;
            this.coreParticles[i].vx = Math.cos(angle) * speed;
            this.coreParticles[i].vy = Math.sin(angle) * speed;
            this.coreParticles[i].radius = this.coreParticles[i].baseRadius;
            this.coreParticles[i].alpha = 1;
        }
        
        for (let i = 0; i < 8; i++) {
            const bolt = this.lightningBolts[i];
            bolt.alpha = 1;
            bolt.points = [];
            const length = 80 + Math.random() * 60;
            let currentX = x;
            let currentY = y;
            const segments = 6;
            
            for (let j = 0; j < segments; j++) {
                const segLength = length / segments;
                const deviation = j === 0 ? 0 : (Math.random() - 0.5) * 20;
                currentX += Math.cos(bolt.angle) * segLength + deviation * Math.cos(bolt.angle + Math.PI / 2);
                currentY += Math.sin(bolt.angle) * segLength + deviation * Math.sin(bolt.angle + Math.PI / 2);
                bolt.points.push({ x: currentX, y: currentY });
            }
        }
        
        for (let i = 0; i < 4; i++) {
            this.expandingRings[i].radius = 0;
            this.expandingRings[i].alpha = 0.8;
            this.expandingRings[i].delay = i * 0.15;
        }
    }

    /**
     * 重置 Boss 死亡特效
     * @returns {void}
     */
    reset() {
        this.x = 0;
        this.y = 0;
        this.time = 0;
        this.active = false;
        this.flashRadius = 0;
        this.flashAlpha = 1;
        
        for (const p of this.particles) {
            p.x = 0;
            p.y = 0;
            p.vx = 0;
            p.vy = 0;
            p.radius = 0;
            p.alpha = 1;
        }
        
        for (const p of this.coreParticles) {
            p.x = 0;
            p.y = 0;
            p.vx = 0;
            p.vy = 0;
            p.radius = 0;
            p.alpha = 1;
        }
        
        for (const bolt of this.lightningBolts) {
            bolt.points = [];
            bolt.alpha = 1;
        }
        
        for (const ring of this.expandingRings) {
            ring.radius = 0;
            ring.alpha = 0.8;
        }
    }

    /**
     * 更新 Boss 死亡特效
     * @param {number} dt - 時間差（秒）
     * @returns {void}
     */
    update(dt) {
        this.time -= dt;
        
        const progress = 1 - (this.time / this.duration);
        this.flashRadius = progress * 150;
        this.flashAlpha = Math.max(0, 1 - progress);
        
        for (const p of this.particles) {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vx *= 0.94;
            p.vy *= 0.94;
            p.radius *= 0.96;
            p.alpha = Math.max(0, this.time / this.duration);
        }
        
        for (const p of this.coreParticles) {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.radius *= 0.94;
            p.alpha = Math.max(0, this.time / this.duration * 0.6);
        }
        
        for (const bolt of this.lightningBolts) {
            bolt.alpha = Math.max(0, this.time / this.duration * 0.8);
        }
        
        for (const ring of this.expandingRings) {
            if (this.time < this.duration - ring.delay) {
                const ringProgress = (this.duration - this.time - ring.delay) / (this.duration - ring.delay);
                ring.radius = ringProgress * 200;
                ring.alpha = Math.max(0, 0.8 - ringProgress * 0.8);
            }
        }
    }

    /**
     * 繪製 Boss 死亡特效
     * @param {CanvasRenderingContext2D} ctx - Canvas 渲染上下文
     * @returns {void}
     */
    draw(ctx) {
        ctx.save();
        
        for (const ring of this.expandingRings) {
            if (ring.alpha <= 0) continue;
            ctx.beginPath();
            ctx.arc(this.x, this.y, ring.radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(192, 57, 43, ${ring.alpha})`;
            ctx.lineWidth = 5;
            ctx.stroke();
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, ring.radius + 10, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(241, 196, 15, ${ring.alpha * 0.5})`;
            ctx.lineWidth = 3;
            ctx.stroke();
        }
        
        if (this.flashAlpha > 0) {
            const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.flashRadius);
            gradient.addColorStop(0, `rgba(255, 255, 255, ${this.flashAlpha})`);
            gradient.addColorStop(0.3, `rgba(243, 156, 18, ${this.flashAlpha * 0.7})`);
            gradient.addColorStop(1, `rgba(192, 57, 43, ${this.flashAlpha * 0.2})`);
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.flashRadius, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
        }
        
        for (const bolt of this.lightningBolts) {
            if (bolt.alpha <= 0 || bolt.points.length < 2) continue;
            
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            for (const point of bolt.points) {
                ctx.lineTo(point.x, point.y);
            }
            ctx.strokeStyle = `rgba(255, 255, 255, ${bolt.alpha})`;
            ctx.lineWidth = 4;
            ctx.stroke();
            
            ctx.strokeStyle = `rgba(241, 196, 15, ${bolt.alpha * 0.8})`;
            ctx.lineWidth = 2;
            ctx.stroke();
            
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#f1c40f';
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
        
        for (const p of this.coreParticles) {
            if (p.alpha <= 0) continue;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(192, 57, 43, ${p.alpha})`;
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius * 0.6, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(241, 196, 15, ${p.alpha * 0.7})`;
            ctx.fill();
        }
        
        for (const p of this.particles) {
            if (p.alpha <= 0 || p.radius <= 1) continue;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            if (p.color === '#e74c3c') {
                ctx.fillStyle = `rgba(231, 76, 60, ${p.alpha})`;
            } else {
                ctx.fillStyle = `rgba(243, 156, 18, ${p.alpha})`;
            }
            ctx.fill();
        }
        
        ctx.restore();
    }

    /**
     * 檢查 Boss 死亡特效是否已完成
     * @returns {boolean} 是否已完成
     */
    isFinished() {
        return this.time <= 0;
    }
}