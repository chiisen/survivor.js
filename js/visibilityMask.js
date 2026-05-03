export class VisibilityMask {
    constructor() {
        this.visibleRadius = 350;
        this.fadeDistance = 250;
        this.darkness = 0.85;
        this.blurStrength = 15;
    }
    
    draw(ctx, canvasWidth, canvasHeight, playerX, playerY) {
        ctx.save();
        
        const outerRadius = this.visibleRadius + this.fadeDistance;
        const maxDist = Math.sqrt(canvasWidth * canvasWidth + canvasHeight * canvasHeight) / 2;
        const gradient = ctx.createRadialGradient(
            playerX, playerY, this.visibleRadius * 0.3,
            playerX, playerY, Math.min(outerRadius, maxDist)
        );
        
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(0.3, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(0.5, 'rgba(10, 10, 30, 0.4)');
        gradient.addColorStop(0.7, `rgba(15, 15, 40, ${this.darkness * 0.7})`);
        gradient.addColorStop(1, `rgba(5, 5, 20, ${this.darkness})`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(-50, -50, canvasWidth + 100, canvasHeight + 100);
        
        this.drawVignetteCorners(ctx, canvasWidth, canvasHeight, playerX, playerY);
        
        ctx.restore();
    }
    
    drawVignetteCorners(ctx, canvasWidth, canvasHeight, playerX, playerY) {
        const cornerSize = 200;
        const corners = [
            { x: 0, y: 0 },
            { x: canvasWidth, y: 0 },
            { x: 0, y: canvasHeight },
            { x: canvasWidth, y: canvasHeight }
        ];
        
        corners.forEach(corner => {
            const gradient = ctx.createRadialGradient(
                corner.x, corner.y, 0,
                corner.x, corner.y, cornerSize
            );
            
            gradient.addColorStop(0, 'rgba(5, 5, 20, 0.95)');
            gradient.addColorStop(0.5, 'rgba(10, 10, 30, 0.6)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(
                corner.x - cornerSize,
                corner.y - cornerSize,
                cornerSize * 2,
                cornerSize * 2
            );
        });
    }
    
    drawFogOfWar(ctx, canvasWidth, canvasHeight, playerX, playerY, enemies) {
        ctx.save();
        
        ctx.globalCompositeOperation = 'source-over';
        
        const gradient = ctx.createRadialGradient(
            playerX, playerY, 0,
            playerX, playerY, this.visibleRadius + this.fadeDistance
        );
        
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(0.6, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(0.8, 'rgba(10, 10, 30, 0.5)');
        gradient.addColorStop(1, 'rgba(5, 5, 20, 0.9)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        ctx.restore();
    }
    
    setVisibleRadius(radius) {
        this.visibleRadius = Math.max(100, Math.min(600, radius));
    }
    
    setFadeDistance(distance) {
        this.fadeDistance = Math.max(50, Math.min(400, distance));
    }
    
    setDarkness(level) {
        this.darkness = Math.max(0, Math.min(1, level));
    }
}