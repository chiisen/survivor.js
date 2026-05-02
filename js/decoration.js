export class GroundDecoration {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.alpha = 0.3 + Math.random() * 0.2;
        
        switch (type) {
            case 'rock':
                this.width = 20 + Math.random() * 30;
                this.height = 15 + Math.random() * 20;
                this.color = '#5d6d7e';
                break;
            case 'grass':
                this.width = 10 + Math.random() * 15;
                this.height = 20 + Math.random() * 25;
                this.color = '#27ae60';
                this.swayOffset = Math.random() * Math.PI * 2;
                this.swayAmount = 3 + Math.random() * 2;
                break;
            case 'bush':
                this.width = 30 + Math.random() * 20;
                this.height = 25 + Math.random() * 15;
                this.color = '#229954';
                break;
            case 'crack':
                this.width = 40 + Math.random() * 60;
                this.height = 2 + Math.random() * 3;
                this.color = '#34495e';
                break;
        }
    }

    update(dt, gameTime) {
        if (this.type === 'grass') {
            this.swayOffset += dt * 2;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        
        switch (this.type) {
            case 'rock':
                this.drawRock(ctx);
                break;
            case 'grass':
                this.drawGrass(ctx);
                break;
            case 'bush':
                this.drawBush(ctx);
                break;
            case 'crack':
                this.drawCrack(ctx);
                break;
        }
        
        ctx.restore();
    }

    drawRock(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.x - this.width / 2, this.y);
        ctx.lineTo(this.x - this.width / 3, this.y - this.height * 0.8);
        ctx.lineTo(this.x + this.width / 4, this.y - this.height);
        ctx.lineTo(this.x + this.width / 2, this.y - this.height * 0.5);
        ctx.lineTo(this.x + this.width / 3, this.y);
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = '#34495e';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    drawGrass(ctx) {
        const sway = Math.sin(this.swayOffset) * this.swayAmount;
        const blades = 3 + Math.floor(Math.random() * 2);
        
        for (let i = 0; i < blades; i++) {
            const offsetX = (i - blades / 2) * 5 + sway;
            ctx.beginPath();
            ctx.moveTo(this.x + i * 5, this.y);
            ctx.quadraticCurveTo(
                this.x + offsetX + i * 5,
                this.y - this.height * 0.6,
                this.x + offsetX + i * 5,
                this.y - this.height
            );
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }

    drawBush(ctx) {
        const circles = 3;
        for (let i = 0; i < circles; i++) {
            const offsetX = (i - 1) * this.width * 0.25;
            const offsetY = i === 1 ? -this.height * 0.2 : 0;
            const radius = this.width * 0.35;
            
            ctx.beginPath();
            ctx.arc(this.x + offsetX, this.y - this.height / 2 + offsetY, radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }

    drawCrack(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.x - this.width / 2, this.y);
        ctx.lineTo(this.x - this.width / 4, this.y - this.height);
        ctx.lineTo(this.x + this.width / 6, this.y);
        ctx.lineTo(this.x + this.width / 2, this.y - this.height * 0.5);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.height;
        ctx.lineCap = 'round';
        ctx.stroke();
    }
}

export class EnvironmentParticle {
    constructor(canvasWidth, canvasHeight) {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.vx = 10 + Math.random() * 20;
        this.vy = 5 + Math.random() * 10;
        this.size = 1 + Math.random() * 2;
        this.alpha = 0.1 + Math.random() * 0.15;
        this.color = '#ecf0f1';
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        
        if (this.x > this.canvasWidth + 50) {
            this.x = -50;
            this.y = Math.random() * this.canvasHeight;
        }
        if (this.y > this.canvasHeight + 50) {
            this.y = -50;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }
}

export class DecorationManager {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.decorations = [];
        this.particles = [];
        
        this.generateDecorations();
        this.generateParticles();
    }

    generateDecorations() {
        const decorationCount = 30;
        const types = ['rock', 'grass', 'bush', 'crack'];
        const weights = [0.25, 0.35, 0.2, 0.2];
        
        for (let i = 0; i < decorationCount; i++) {
            const x = Math.random() * this.canvasWidth;
            const y = Math.random() * this.canvasHeight;
            
            let type;
            const random = Math.random();
            let cumulative = 0;
            for (let j = 0; j < types.length; j++) {
                cumulative += weights[j];
                if (random <= cumulative) {
                    type = types[j];
                    break;
                }
            }
            
            this.decorations.push(new GroundDecoration(x, y, type));
        }
    }

    generateParticles() {
        const particleCount = 20;
        for (let i = 0; i < particleCount; i++) {
            this.particles.push(new EnvironmentParticle(this.canvasWidth, this.canvasHeight));
        }
    }

    update(dt, gameTime) {
        for (const decoration of this.decorations) {
            decoration.update(dt, gameTime);
        }
        
        for (const particle of this.particles) {
            particle.update(dt);
        }
    }

    draw(ctx) {
        for (const decoration of this.decorations) {
            decoration.draw(ctx);
        }
        
        for (const particle of this.particles) {
            particle.draw(ctx);
        }
    }

    resize(width, height) {
        this.canvasWidth = width;
        this.canvasHeight = height;
        this.decorations = [];
        this.particles = [];
        this.generateDecorations();
        this.generateParticles();
    }
}