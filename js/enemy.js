import { normalize, distance, randomRange } from './utils.js';

export class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 15;
        this.speed = 60 + randomRange(-20, 20);
        this.hp = 1;
        this.maxHp = 1;
        this.damage = 10;
        this.color = '#e74c3c';
        this.expValue = 10;
    }

    update(dt, playerX, playerY) {
        const dx = playerX - this.x;
        const dy = playerY - this.y;
        const normalized = normalize(dx, dy);
        
        this.x += normalized.x * this.speed * dt;
        this.y += normalized.y * this.speed * dt;
    }

    draw(ctx) {
        ctx.save();
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = '#c0392b';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this.x - 4, this.y - 3, 3, 0, Math.PI * 2);
        ctx.arc(this.x + 4, this.y - 3, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(this.x - 5, this.y + 5);
        ctx.lineTo(this.x + 5, this.y + 5);
        ctx.strokeStyle = '#c0392b';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
    }

    static spawn(canvasWidth, canvasHeight, playerX, playerY) {
        const side = Math.floor(Math.random() * 4);
        let x, y;
        const margin = 50;

        switch (side) {
            case 0:
                x = randomRange(-margin, canvasWidth + margin);
                y = -margin;
                break;
            case 1:
                x = canvasWidth + margin;
                y = randomRange(-margin, canvasHeight + margin);
                break;
            case 2:
                x = randomRange(-margin, canvasWidth + margin);
                y = canvasHeight + margin;
                break;
            case 3:
                x = -margin;
                y = randomRange(-margin, canvasHeight + margin);
                break;
        }

        return new Enemy(x, y);
    }
}