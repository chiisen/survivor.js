// @ts-check

export class Explosion {
    /**
     * 建立爆炸特效實例（物件池用），預先分配粒子陣列
     */
    constructor() {
        this.x = 0;
        this.y = 0;
        this.particles = [];
        this.coreParticles = [];
        this.duration = 0.5;
        this.time = 0;
        this.flashRadius = 30;
        this.flashAlpha = 1;
        this.active = false;
        
        for (let i = 0; i < 12; i++) {
            this.particles.push({
                x: 0,
                y: 0,
                vx: 0,
                vy: 0,
                radius: 0,
                color: '#e74c3c',
                alpha: 1,
                baseRadius: 4 + Math.random() * 3
            });
        }
        
        for (let i = 0; i < 6; i++) {
            this.coreParticles.push({
                x: 0,
                y: 0,
                vx: 0,
                vy: 0,
                radius: 0,
                alpha: 1,
                baseRadius: 8 + Math.random() * 4
            });
        }
    }

    /**
     * 在指定位置觸發爆炸，初始化所有粒子的初始狀態
     * @param {number} x - 爆炸中心 X 座標
     * @param {number} y - 爆炸中心 Y 座標
     */
    init(x, y) {
        this.x = x;
        this.y = y;
        this.time = this.duration;
        this.flashRadius = 30;
        this.flashAlpha = 1;
        this.active = true;
        
        const particleCount = 12;
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.3;
            const speed = 80 + Math.random() * 60;
            this.particles[i].x = x;
            this.particles[i].y = y;
            this.particles[i].vx = Math.cos(angle) * speed;
            this.particles[i].vy = Math.sin(angle) * speed;
            this.particles[i].radius = this.particles[i].baseRadius;
            this.particles[i].color = Math.random() > 0.5 ? '#e74c3c' : '#f39c12';
            this.particles[i].alpha = 1;
        }
        
        for (let i = 0; i < 6; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 30 + Math.random() * 20;
            this.coreParticles[i].x = x;
            this.coreParticles[i].y = y;
            this.coreParticles[i].vx = Math.cos(angle) * speed;
            this.coreParticles[i].vy = Math.sin(angle) * speed;
            this.coreParticles[i].radius = this.coreParticles[i].baseRadius;
            this.coreParticles[i].alpha = 1;
        }
    }

    /**
     * 重置爆炸特效為初始狀態（物件池回收用）
     */
    reset() {
        this.x = 0;
        this.y = 0;
        this.time = 0;
        this.flashRadius = 30;
        this.flashAlpha = 1;
        this.active = false;
        
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
    }

    /**
     * 更新爆炸粒子位置、大小與透明度
     * @param {number} dt - 與上一幀的時間差（秒）
     */
    update(dt) {
        this.time -= dt;
        
        for (const p of this.particles) {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vx *= 0.95;
            p.vy *= 0.95;
            p.radius *= 0.97;
            p.alpha = Math.max(0, this.time / this.duration);
        }
        
        for (const p of this.coreParticles) {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.radius *= 0.95;
            p.alpha = Math.max(0, this.time / this.duration * 0.5);
        }
        
        this.flashRadius += dt * 200;
        this.flashAlpha = Math.max(0, this.time / this.duration);
    }

    /**
     * 繪製爆炸特效（閃光、核心粒子、外圍粒子）
     * @param {CanvasRenderingContext2D} ctx - Canvas 繪圖上下文
     */
    draw(ctx) {
        ctx.save();

        if (this.flashAlpha > 0) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.flashRadius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(243, 156, 18, ${this.flashAlpha * 0.3})`;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(this.x, this.y, this.flashRadius * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${this.flashAlpha * 0.5})`;
            ctx.fill();
        }

        for (const p of this.coreParticles) {
            if (p.alpha <= 0) continue;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(231, 76, 60, ${p.alpha})`;
            ctx.fill();
        }

        for (const p of this.particles) {
            if (p.alpha <= 0 || p.radius <= 0.5) continue;
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
     * 判斷爆炸動畫是否已播放完畢
     * @returns {boolean} 是否已結束
     */
    isFinished() {
        return this.time <= 0;
    }
}