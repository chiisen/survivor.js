export class GroundDecoration {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.alpha = type === 'mushroom' ? 1.0 : 0.3 + Math.random() * 0.2;
        
        this.mushroomProcessedCanvas = null;
        this.mushroomImageLoaded = false;
        
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
            case 'flower':
                this.width = 8 + Math.random() * 8;
                this.height = 15 + Math.random() * 15;
                this.color = ['#e74c3c', '#f39c12', '#9b59b6', '#e91e63', '#ff9800'][Math.floor(Math.random() * 5)];
                this.swayOffset = Math.random() * Math.PI * 2;
                this.swayAmount = 2 + Math.random() * 2;
                break;
            case 'mushroom':
                this.width = 15 + Math.random() * 15;
                this.height = 12 + Math.random() * 12;
                this.color = ['#c0392b', '#e74c3c', '#d35400'][Math.floor(Math.random() * 3)];
                break;
            case 'tree_stump':
                this.width = 25 + Math.random() * 20;
                this.height = 20 + Math.random() * 15;
                this.color = '#6d4c41';
                break;
            case 'crystal':
                this.width = 12 + Math.random() * 8;
                this.height = 20 + Math.random() * 15;
                this.color = ['#3498db', '#9b59b6', '#1abc9c'][Math.floor(Math.random() * 3)];
                this.glowTime = Math.random() * Math.PI * 2;
                break;
        }
    }

    update(dt, gameTime) {
        if (this.type === 'grass' || this.type === 'flower') {
            this.swayOffset += dt * 2;
        }
        if (this.type === 'crystal') {
            this.glowTime += dt * 3;
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
            case 'flower':
                this.drawFlower(ctx);
                break;
            case 'mushroom':
                this.drawMushroom(ctx);
                break;
            case 'tree_stump':
                this.drawTreeStump(ctx);
                break;
            case 'crystal':
                this.drawCrystal(ctx);
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
    
    drawFlower(ctx) {
        const sway = Math.sin(this.swayOffset) * this.swayAmount;
        
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + sway, this.y - this.height * 0.7);
        ctx.strokeStyle = '#27ae60';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        const petalCount = 5;
        const centerX = this.x + sway;
        const centerY = this.y - this.height;
        const petalRadius = this.width * 0.3;
        
        for (let i = 0; i < petalCount; i++) {
            const angle = (Math.PI * 2 / petalCount) * i;
            const px = centerX + Math.cos(angle) * petalRadius;
            const py = centerY + Math.sin(angle) * petalRadius;
            
            ctx.beginPath();
            ctx.arc(px, py, petalRadius * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, petalRadius * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = '#f1c40f';
        ctx.fill();
    }
    
    drawMushroom(ctx) {
        if (this.mushroomImageLoaded && this.mushroomProcessedCanvas) {
            const size = 32;
            ctx.drawImage(this.mushroomProcessedCanvas, this.x - size / 2, this.y - size, size, size);
        } else {
            ctx.beginPath();
            ctx.moveTo(this.x - this.width * 0.15, this.y);
            ctx.lineTo(this.x - this.width * 0.1, this.y - this.height * 0.6);
            ctx.lineTo(this.x + this.width * 0.1, this.y - this.height * 0.6);
            ctx.lineTo(this.x + this.width * 0.15, this.y);
            ctx.closePath();
            ctx.fillStyle = '#ecf0f1';
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(this.x, this.y - this.height * 0.6, this.width * 0.5, Math.PI, 0);
            ctx.fillStyle = this.color;
            ctx.fill();
            
            for (let i = 0; i < 3; i++) {
                const dotX = this.x + (Math.random() - 0.5) * this.width * 0.3;
                const dotY = this.y - this.height * 0.6 - Math.random() * this.width * 0.2;
                ctx.beginPath();
                ctx.arc(dotX, dotY, 2, 0, Math.PI * 2);
                ctx.fillStyle = '#ecf0f1';
                ctx.fill();
            }
        }
    }
    
    drawTreeStump(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.x - this.width / 2, this.y);
        ctx.lineTo(this.x - this.width / 2, this.y - this.height);
        ctx.lineTo(this.x + this.width / 2, this.y - this.height);
        ctx.lineTo(this.x + this.width / 2, this.y);
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = '#5d4037';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        for (let i = 0; i < 3; i++) {
            const lineY = this.y - this.height * (0.2 + i * 0.3);
            ctx.beginPath();
            ctx.moveTo(this.x - this.width * 0.3, lineY);
            ctx.lineTo(this.x + this.width * 0.3, lineY);
            ctx.strokeStyle = '#5d4037';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }
    
    drawCrystal(ctx) {
        const glow = Math.sin(this.glowTime) * 0.3 + 0.7;
        
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.width / 2, this.y - this.height * 0.4);
        ctx.lineTo(this.x - this.width / 3, this.y - this.height);
        ctx.lineTo(this.x + this.width / 3, this.y - this.height);
        ctx.lineTo(this.x + this.width / 2, this.y - this.height * 0.4);
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();
        
        ctx.globalAlpha = this.alpha * glow;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.height * 0.3);
        ctx.lineTo(this.x - this.width / 4, this.y - this.height * 0.6);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

export class EnvironmentParticle {
    constructor(canvasWidth, canvasHeight, type = 'dust') {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.vx = 10 + Math.random() * 20;
        this.vy = 5 + Math.random() * 10;
        this.size = 1 + Math.random() * 2;
        this.alpha = 0.1 + Math.random() * 0.15;
        this.color = '#ecf0f1';
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.type = type;
        
        switch (type) {
            case 'firefly':
                this.vx = 5 + Math.random() * 10;
                this.vy = -5 + Math.random() * 10;
                this.size = 2 + Math.random() * 2;
                this.alpha = 0.3;
                this.color = '#f1c40f';
                this.glowPhase = Math.random() * Math.PI * 2;
                break;
            case 'leaf':
                this.vx = 20 + Math.random() * 30;
                this.vy = 15 + Math.random() * 20;
                this.rotation = Math.random() * Math.PI * 2;
                this.rotationSpeed = 1 + Math.random() * 2;
                this.size = 3 + Math.random() * 3;
                this.color = ['#27ae60', '#2ecc71', '#f39c12'][Math.floor(Math.random() * 3)];
                break;
            case 'sparkle':
                this.vx = 0;
                this.vy = 0;
                this.lifeTime = 0;
                this.maxLifeTime = 2 + Math.random() * 2;
                this.size = 1 + Math.random() * 2;
                this.color = '#fff';
                this.alpha = 0;
                break;
        }
    }

    update(dt) {
        switch (this.type) {
            case 'dust':
                this.x += this.vx * dt;
                this.y += this.vy * dt;
                
                if (this.x > this.canvasWidth + 50) {
                    this.x = -50;
                    this.y = Math.random() * this.canvasHeight;
                }
                if (this.y > this.canvasHeight + 50) {
                    this.y = -50;
                }
                break;
                
            case 'firefly':
                this.x += this.vx * dt * (Math.sin(this.glowPhase) > 0 ? 1 : -1);
                this.y += this.vy * dt;
                this.glowPhase += dt * 2;
                this.alpha = 0.2 + Math.sin(this.glowPhase) * 0.3;
                
                if (this.x < -20) this.x = this.canvasWidth + 20;
                if (this.x > this.canvasWidth + 20) this.x = -20;
                if (this.y < -20) this.y = this.canvasHeight + 20;
                if (this.y > this.canvasHeight + 20) this.y = -20;
                break;
                
            case 'leaf':
                this.x += this.vx * dt;
                this.y += this.vy * dt;
                this.rotation += this.rotationSpeed * dt;
                
                if (this.x > this.canvasWidth + 50) {
                    this.x = -50;
                    this.y = -50;
                }
                if (this.y > this.canvasHeight + 50) {
                    this.y = -50;
                    this.x = Math.random() * this.canvasWidth;
                }
                break;
                
            case 'sparkle':
                this.lifeTime += dt;
                if (this.lifeTime < this.maxLifeTime * 0.2) {
                    this.alpha = this.lifeTime / (this.maxLifeTime * 0.2) * 0.5;
                } else if (this.lifeTime > this.maxLifeTime * 0.8) {
                    this.alpha = (this.maxLifeTime - this.lifeTime) / (this.maxLifeTime * 0.2) * 0.5;
                } else {
                    this.alpha = 0.5;
                }
                
                if (this.lifeTime > this.maxLifeTime) {
                    this.x = Math.random() * this.canvasWidth;
                    this.y = Math.random() * this.canvasHeight;
                    this.lifeTime = 0;
                    this.maxLifeTime = 2 + Math.random() * 2;
                }
                break;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        
        switch (this.type) {
            case 'dust':
            case 'firefly':
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
                
                if (this.type === 'firefly') {
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(241, 196, 15, ${this.alpha * 0.3})`;
                    ctx.fill();
                }
                break;
                
            case 'leaf':
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation);
                ctx.beginPath();
                ctx.moveTo(-this.size / 2, -this.size);
                ctx.lineTo(this.size / 2, -this.size * 0.5);
                ctx.lineTo(0, this.size);
                ctx.closePath();
                ctx.fillStyle = this.color;
                ctx.fill();
                break;
                
            case 'sparkle':
                ctx.beginPath();
                ctx.moveTo(this.x, this.y - this.size * 2);
                ctx.lineTo(this.x + this.size * 0.5, this.y);
                ctx.lineTo(this.x, this.y + this.size * 2);
                ctx.lineTo(this.x - this.size * 0.5, this.y);
                ctx.closePath();
                ctx.fillStyle = this.color;
                ctx.fill();
                break;
        }
        
        ctx.restore();
    }
}

export class DecorationManager {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.decorations = [];
        this.particles = [];
        
        this.mushroomProcessedCanvas = null;
        this.mushroomImageLoaded = false;
        
        const mushroomImage = new Image();
        mushroomImage.src = 'images/mushroom.png';
        mushroomImage.onload = () => {
            this.mushroomProcessedCanvas = this.removeBlackBackground(mushroomImage);
            this.mushroomImageLoaded = true;
            
            for (const deco of this.decorations) {
                if (deco.type === 'mushroom') {
                    deco.mushroomProcessedCanvas = this.mushroomProcessedCanvas;
                    deco.mushroomImageLoaded = true;
                }
            }
        };
        
        this.generateDecorations();
        this.generateParticles();
    }

    removeBlackBackground(image) {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d');
        
        ctx.drawImage(image, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        let blackPixels = 0;
        let processedPixels = 0;
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const brightness = (r + g + b) / 3;
            
            if (brightness < 50) {
                blackPixels++;
                data[i + 3] = 0;
                processedPixels++;
            }
        }
        
        console.log(`[Mushroom] Total pixels: ${data.length / 4}, Black pixels: ${blackPixels}, Processed: ${processedPixels}`);
        
        ctx.putImageData(imageData, 0, 0);
        return canvas;
    }

    generateDecorations() {
        const decorationCount = 50;
        const types = ['rock', 'grass', 'bush', 'crack', 'flower', 'mushroom', 'tree_stump', 'crystal'];
        const weights = [0.15, 0.25, 0.15, 0.15, 0.15, 0.05, 0.05, 0.05];
        
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
            
            const deco = new GroundDecoration(x, y, type);
            
            if (type === 'mushroom' && this.mushroomImageLoaded) {
                deco.mushroomProcessedCanvas = this.mushroomProcessedCanvas;
                deco.mushroomImageLoaded = true;
            }
            
            this.decorations.push(deco);
        }
    }

    generateParticles() {
        const particleCount = 40;
        const types = ['dust', 'firefly', 'leaf', 'sparkle'];
        const weights = [0.4, 0.2, 0.2, 0.2];
        
        for (let i = 0; i < particleCount; i++) {
            const typeIndex = weights.findIndex(w => Math.random() < w);
            const type = types[typeIndex >= 0 ? typeIndex : 0];
            this.particles.push(new EnvironmentParticle(this.canvasWidth, this.canvasHeight, type));
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