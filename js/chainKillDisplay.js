export class ChainKillDisplay {
    constructor() {
        this.activeDisplays = [];
    }

    trigger(chainCount) {
        let text = '';
        let color = '#fff';
        let scale = 1;

        if (chainCount === 2) {
            text = 'DOUBLE KILL!';
            color = '#f39c12';
            scale = 1.2;
        } else if (chainCount === 3) {
            text = 'TRIPLE KILL!';
            color = '#e67e22';
            scale = 1.5;
        } else if (chainCount === 4) {
            text = 'QUAD KILL!';
            color = '#e74c3c';
            scale = 1.8;
        } else if (chainCount === 5) {
            text = 'MEGA KILL!';
            color = '#c0392b';
            scale = 2.0;
        } else if (chainCount >= 6 && chainCount < 10) {
            text = 'ULTRA KILL!';
            color = '#9b59b6';
            scale = 2.2;
        } else if (chainCount >= 10) {
            text = 'GODLIKE!';
            color = '#8e44ad';
            scale = 2.5;
        }

        if (text) {
            this.activeDisplays.push({
                text,
                color,
                scale,
                startTime: performance.now(),
                duration: 1.5,
                alpha: 1,
                currentScale: 0,
                y: 0
            });
        }
    }

    update(dt) {
        for (let i = this.activeDisplays.length - 1; i >= 0; i--) {
            const display = this.activeDisplays[i];
            const elapsed = (performance.now() - display.startTime) / 1000;
            
            if (elapsed > display.duration) {
                this.activeDisplays.splice(i, 1);
                continue;
            }

            const progress = elapsed / display.duration;
            
            if (elapsed < 0.3) {
                display.currentScale = (elapsed / 0.3) * display.scale;
                display.alpha = 1;
            } else if (elapsed < 1.0) {
                display.currentScale = display.scale;
                display.alpha = 1;
            } else {
                display.currentScale = display.scale;
                display.alpha = 1 - (elapsed - 1.0) / 0.5;
            }

            if (elapsed < 0.5) {
                display.y = (elapsed / 0.5) * -30;
            }
        }
    }

    draw(ctx, centerX, centerY) {
        for (const display of this.activeDisplays) {
            if (display.alpha <= 0) continue;

            ctx.save();
            ctx.globalAlpha = display.alpha;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const fontSize = 48 * display.currentScale;
            ctx.font = `bold ${fontSize}px 'Segoe UI', sans-serif`;

            ctx.shadowColor = display.color;
            ctx.shadowBlur = 20;

            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillText(display.text, centerX + 3, centerY + display.y + 3);

            ctx.fillStyle = display.color;
            ctx.fillText(display.text, centerX, centerY + display.y);

            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.strokeText(display.text, centerX, centerY + display.y);

            ctx.restore();
        }
    }

    clear() {
        this.activeDisplays = [];
    }
}