export class BossSpawnEffect {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.duration = 1.5;
        this.time = 0;
        this.active = false;
        this.warningParticles = [];
        this.ringRadius = 0;
        this.shakeIntensity = 0;
        
        for (let i = 0; i < 20; i++) {
            this.warningParticles.push({
                x: 0,
                y: 0,
                vx: 0,
                vy: 0,
                radius: 0,
                alpha: 0,
                angle: (Math.PI * 2 * i) / 20
            });
        }
    }

    init(x, y) {
        this.x = x;
        this.y = y;
        this.time = this.duration;
        this.active = true;
        this.ringRadius = 0;
        this.shakeIntensity = 8;
        
        for (let i = 0; i < 20; i++) {
            const angle = (Math.PI * 2 * i) / 20;
            const distance = 60 + Math.random() * 40;
            this.warningParticles[i].x = x + Math.cos(angle) * distance;
            this.warningParticles[i].y = y + Math.sin(angle) * distance;
            this.warningParticles[i].vx = Math.cos(angle) * -30;
            this.warningParticles[i].vy = Math.sin(angle) * -30;
            this.warningParticles[i].radius = 3 + Math.random() * 2;
            this.warningParticles[i].alpha = 0.8;
            this.warningParticles[i].angle = angle;
        }
    }

    reset() {
        this.x = 0;
        this.y = 0;
        this.time = 0;
        this.active = false;
        this.ringRadius = 0;
        this.shakeIntensity = 0;
        
        for (const p of this.warningParticles) {
            p.x = 0;
            p.y = 0;
            p.vx = 0;
            p.vy = 0;
            p.radius = 0;
            p.alpha = 0;
        }
    }

    update(dt) {
        this.time -= dt;
        
        const progress = 1 - (this.time / this.duration);
        
        this.ringRadius = progress * 80;
        this.shakeIntensity = Math.max(0, 8 - progress * 10);
        
        for (const p of this.warningParticles) {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.alpha = Math.max(0, this.time / this.duration);
            p.radius *= 0.98;
        }
    }

    getShakeOffset() {
        if (this.shakeIntensity <= 0) return { x: 0, y: 0 };
        return {
            x: (Math.random() - 0.5) * this.shakeIntensity,
            y: (Math.random() - 0.5) * this.shakeIntensity
        };
    }

    draw(ctx) {
        ctx.save();
        
        if (this.ringRadius > 0) {
            for (let i = 0; i < 3; i++) {
                const radius = this.ringRadius + i * 15;
                const alpha = Math.max(0, 0.3 - i * 0.1) * (this.time / this.duration);
                ctx.beginPath();
                ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(192, 57, 43, ${alpha})`;
                ctx.lineWidth = 4 - i;
                ctx.stroke();
            }
            
            const innerRadius = this.ringRadius * 0.5;
            const innerAlpha = 0.5 * (this.time / this.duration);
            ctx.beginPath();
            ctx.arc(this.x, this.y, innerRadius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(241, 196, 15, ${innerAlpha * 0.3})`;
            ctx.fill();
        }
        
        for (const p of this.warningParticles) {
            if (p.alpha <= 0 || p.radius <= 0.5) continue;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(192, 57, 43, ${p.alpha})`;
            ctx.fill();
        }
        
        if (this.time > 1.0) {
            const warningAlpha = Math.min(1, (this.time - 1.0) / 0.5);
            ctx.font = 'bold 48px "Segoe UI", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = `rgba(192, 57, 43, ${warningAlpha})`;
            ctx.fillText('⚠ BOSS 來襲！ ⚠', this.x, this.y - 100);
            
            ctx.strokeStyle = `rgba(241, 196, 15, ${warningAlpha * 0.8})`;
            ctx.lineWidth = 2;
            ctx.strokeText('⚠ BOSS 來襲！ ⚠', this.x, this.y - 100);
        }
        
        ctx.restore();
    }

    isFinished() {
        return this.time <= 0;
    }
}