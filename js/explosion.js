export class Explosion {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.particles = [];
        this.duration = 0.5;
        this.time = this.duration;
        
        const particleCount = 12;
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.3;
            const speed = 80 + Math.random() * 60;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: 4 + Math.random() * 3,
                color: Math.random() > 0.5 ? '#e74c3c' : '#f39c12',
                alpha: 1
            });
        }
        
        this.coreParticles = [];
        for (let i = 0; i < 6; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 30 + Math.random() * 20;
            this.coreParticles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: 8 + Math.random() * 4,
                alpha: 1
            });
        }
        
        this.flashRadius = 30;
        this.flashAlpha = 1;
    }

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
            ctx.fillStyle = p.color.replace(')', `, ${p.alpha})`).replace('rgb', 'rgba').replace('#e74c3c', `rgba(231, 76, 60, ${p.alpha})`).replace('#f39c12', `rgba(243, 156, 18, ${p.alpha})`);
            ctx.fill();
        }

        ctx.restore();
    }

    isFinished() {
        return this.time <= 0;
    }
}