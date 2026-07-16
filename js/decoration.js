// @ts-check

/**
 * 地面裝飾物 — 草、花、蘑菇、岩石等場景裝飾
 */
export class GroundDecoration {
    /**
     * @param {number} x - 裝飾物 X 座標
     * @param {number} y - 裝飾物 Y 座標
     * @param {string} type - 裝飾物類型('rock'|'grass'|'bush'|'crack'|'flower'|'mushroom'|'tree_stump'|'crystal')
     */
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.alpha = 1.0;
        
        this.mushroomProcessedCanvas = null;
        this.mushroomImageLoaded = false;
        
        this.flowerProcessedCanvas = null;
        this.flowerImageLoaded = false;
        
        this.grassProcessedCanvas = null;
        this.grassImageLoaded = false;
        
        this.rockProcessedCanvas = null;
        this.rockImageLoaded = false;
        
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

    /**
     * 更新裝飾物動畫(搖曳、發光)
     * @param {number} dt - 幀間隔時間(秒)
     * @param {number} gameTime - 遊戲經過時間(秒)
     */
    update(dt, gameTime) {
        if (this.type === 'grass' || this.type === 'flower') {
            this.swayOffset += dt * 2;
        }
        if (this.type === 'crystal') {
            this.glowTime += dt * 3;
        }
    }

    /**
     * 繪製裝飾物到畫布
     * @param {CanvasRenderingContext2D} ctx - Canvas 繪圖上下文
     */
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.imageSmoothingEnabled = false;
        ctx.imageSmoothingQuality = 'high';

        // 地面陰影（非圖片型裝飾物）
        if (!this[`${this.type}ImageLoaded`]) {
            ctx.beginPath();
            ctx.ellipse(this.x + 3, this.y + 2, this.width * 0.5, this.height * 0.15, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
            ctx.fill();
        }

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

    /**
     * 繪製岩石裝飾(優先使用圖片,否則繪製多邊形)
     * @param {CanvasRenderingContext2D} ctx - Canvas 繪圖上下文
     */
    drawRock(ctx) {
        if (this.rockImageLoaded && this.rockProcessedCanvas) {
            const width = this.rockProcessedCanvas.width * 1.5;
            const height = this.rockProcessedCanvas.height * 1.5;
            ctx.drawImage(this.rockProcessedCanvas, this.x - width / 2, this.y - height, width, height);
        } else {
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
    }

    /**
     * 繪製草叢裝飾(優先使用圖片,否則繪製搖曳草葉)
     * @param {CanvasRenderingContext2D} ctx - Canvas 繪圖上下文
     */
    drawGrass(ctx) {
        if (this.grassImageLoaded && this.grassProcessedCanvas) {
            const width = this.grassProcessedCanvas.width * 1.5;
            const height = this.grassProcessedCanvas.height * 1.5;
            ctx.drawImage(this.grassProcessedCanvas, this.x - width / 2, this.y - height, width, height);
        } else {
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
    }

    /**
     * 繪製灌木叢裝飾
     * @param {CanvasRenderingContext2D} ctx - Canvas 繪圖上下文
     */
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

    /**
     * 繪製地面裂縫裝飾
     * @param {CanvasRenderingContext2D} ctx - Canvas 繪圖上下文
     */
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
    
    /**
     * 繪製花朵裝飾(優先使用圖片,否則繪製花瓣)
     * @param {CanvasRenderingContext2D} ctx - Canvas 繪圖上下文
     */
    drawFlower(ctx) {
        if (this.flowerImageLoaded && this.flowerProcessedCanvas) {
            const width = this.flowerProcessedCanvas.width * 1.5;
            const height = this.flowerProcessedCanvas.height * 1.5;
            ctx.drawImage(this.flowerProcessedCanvas, this.x - width / 2, this.y - height, width, height);
        } else {
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
    }
    
    /**
     * 繪製蘑菇裝飾(優先使用圖片,否則繪製蘑菇造型)
     * @param {CanvasRenderingContext2D} ctx - Canvas 繪圖上下文
     */
    drawMushroom(ctx) {
        if (this.mushroomImageLoaded && this.mushroomProcessedCanvas) {
            const width = this.mushroomProcessedCanvas.width * 1.5;
            const height = this.mushroomProcessedCanvas.height * 1.5;
            ctx.drawImage(this.mushroomProcessedCanvas, this.x - width / 2, this.y - height, width, height);
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
    
    /**
     * 繪製樹樁裝飾
     * @param {CanvasRenderingContext2D} ctx - Canvas 繪圖上下文
     */
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
    
    /**
     * 繪製水晶裝飾(含發光脈衝效果)
     * @param {CanvasRenderingContext2D} ctx - Canvas 繪圖上下文
     */
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

/**
 * 環境粒子 — 灰塵、螢火蟲、落葉、閃光等氛圍效果
 */
export class EnvironmentParticle {
    /**
     * @param {number} canvasWidth - 畫布寬度
     * @param {number} canvasHeight - 畫布高度
     * @param {string} [type='dust'] - 粒子類型('dust'|'firefly'|'leaf'|'sparkle')
     */
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

    /**
     * 更新粒子位置與生命週期
     * @param {number} dt - 幀間隔時間(秒)
     */
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

    /**
     * 繪製粒子到畫布
     * @param {CanvasRenderingContext2D} ctx - Canvas 繪圖上下文
     */
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

/**
 * 裝飾物管理器 — 管理所有地面裝飾與環境粒子的生成、更新、繪製
 */
export class DecorationManager {
    /**
     * @param {number} canvasWidth - 畫布寬度
     * @param {number} canvasHeight - 畫布高度
     */
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
        
        this.flowerProcessedCanvas = null;
        this.flowerImageLoaded = false;
        
        const flowerImage = new Image();
        flowerImage.src = 'images/flower.png';
        flowerImage.onload = () => {
            this.flowerProcessedCanvas = this.removeBlackBackground(flowerImage);
            this.flowerImageLoaded = true;
            
            for (const deco of this.decorations) {
                if (deco.type === 'flower') {
                    deco.flowerProcessedCanvas = this.flowerProcessedCanvas;
                    deco.flowerImageLoaded = true;
                }
            }
        };
        
        this.grassProcessedCanvas = null;
        this.grassImageLoaded = false;
        
        const grassImage = new Image();
        grassImage.src = 'images/grass.png';
        grassImage.onload = () => {
            this.grassProcessedCanvas = this.removeBlackBackground(grassImage);
            this.grassImageLoaded = true;
            
            for (const deco of this.decorations) {
                if (deco.type === 'grass') {
                    deco.grassProcessedCanvas = this.grassProcessedCanvas;
                    deco.grassImageLoaded = true;
                }
            }
        };
        
        this.rockProcessedCanvas = null;
        this.rockImageLoaded = false;
        
        const rockImage = new Image();
        rockImage.src = 'images/rock.png';
        rockImage.onload = () => {
            this.rockProcessedCanvas = this.removeBlackBackground(rockImage);
            this.rockImageLoaded = true;
            
            for (const deco of this.decorations) {
                if (deco.type === 'rock') {
                    deco.rockProcessedCanvas = this.rockProcessedCanvas;
                    deco.rockImageLoaded = true;
                }
            }
        };
        
        this.generateDecorations();
        this.generateParticles();
    }

    /**
     * 移除圖片的黑色背景(透明化處理)
     * @param {HTMLImageElement} image - 原始圖片
     * @returns {HTMLCanvasElement} 處理後的 Canvas
     */
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
        
        ctx.putImageData(imageData, 0, 0);
        return canvas;
    }

    /**
     * 按權重隨機生成地面裝飾物
     */
    generateDecorations() {
        const decorationCount = 50;
        const types = ['grass', 'flower', 'mushroom', 'rock'];
        const weights = [0.5, 0.25, 0.15, 0.1];
        
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
            
            if (type === 'flower' && this.flowerImageLoaded) {
                deco.flowerProcessedCanvas = this.flowerProcessedCanvas;
                deco.flowerImageLoaded = true;
            }
            
            if (type === 'grass' && this.grassImageLoaded) {
                deco.grassProcessedCanvas = this.grassProcessedCanvas;
                deco.grassImageLoaded = true;
            }
            
            if (type === 'rock' && this.rockImageLoaded) {
                deco.rockProcessedCanvas = this.rockProcessedCanvas;
                deco.rockImageLoaded = true;
            }
            
            this.decorations.push(deco);
        }
    }

    /**
     * 按權重隨機生成環境粒子
     */
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

    /**
     * 更新所有裝飾物與粒子
     * @param {number} dt - 幀間隔時間(秒)
     * @param {number} gameTime - 遊戲經過時間(秒)
     */
    update(dt, gameTime) {
        for (const decoration of this.decorations) {
            decoration.update(dt, gameTime);
        }
        
        for (const particle of this.particles) {
            particle.update(dt);
        }
    }

    /**
     * 繪製所有裝飾物與粒子
     * @param {CanvasRenderingContext2D} ctx - Canvas 繪圖上下文
     */
    draw(ctx) {
        for (const decoration of this.decorations) {
            decoration.draw(ctx);
        }
        
        for (const particle of this.particles) {
            particle.draw(ctx);
        }
    }

    /**
     * 畫布尺寸變更時重新生成所有裝飾物與粒子
     * @param {number} width - 新畫布寬度
     * @param {number} height - 新畫布高度
     */
    resize(width, height) {
        this.canvasWidth = width;
        this.canvasHeight = height;
        this.decorations = [];
        this.particles = [];
        this.generateDecorations();
        this.generateParticles();
    }
}