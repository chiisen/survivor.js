export class PlayerRenderer {
    draw(ctx, core, combat) {
        ctx.save();
        
        if (core.flashTime > 0) {
            ctx.globalAlpha = 0.5 + Math.sin(core.flashTime * 50) * 0.5;
        }
        
        this.drawAttackRange(ctx, core);
        
        ctx.translate(core.x, core.y);
        ctx.rotate(core.facingAngle);
        ctx.translate(-core.x, -core.y);
        
        this.drawHelmet(ctx, core);
        this.drawBody(ctx, core);
        this.drawLegs(ctx, core);
        this.drawArms(ctx, core);
        this.drawSword(ctx, core, combat);
        
        ctx.restore();
    }
    
    drawAttackRange(ctx, core) {
        ctx.beginPath();
        ctx.arc(core.x, core.y, core.baseAttackRange, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(52, 152, 219, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        if (core.attackRange > core.baseAttackRange) {
            ctx.beginPath();
            ctx.arc(core.x, core.y, core.attackRange, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(46, 204, 113, 0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            const extraRange = core.attackRange - core.baseAttackRange;
            ctx.beginPath();
            ctx.arc(core.x, core.y, core.baseAttackRange + extraRange / 2, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(46, 204, 113, 0.15)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }
    
    drawHelmet(ctx, core) {
        ctx.beginPath();
        ctx.arc(core.x, core.y - 5, core.radius * 0.9, 0, Math.PI * 2);
        const helmetGradient = ctx.createRadialGradient(
            core.x, core.y - 10, 0,
            core.x, core.y - 5, core.radius * 0.9
        );
        helmetGradient.addColorStop(0, '#95a5a6');
        helmetGradient.addColorStop(0.5, '#7f8c8d');
        helmetGradient.addColorStop(1, '#5d6d7e');
        ctx.fillStyle = helmetGradient;
        ctx.fill();
        ctx.strokeStyle = '#34495e';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(core.x - core.radius * 0.3, core.y - core.radius * 0.6);
        ctx.lineTo(core.x - core.radius * 0.1, core.y - core.radius * 1.1);
        ctx.lineTo(core.x + core.radius * 0.1, core.y - core.radius * 1.1);
        ctx.lineTo(core.x + core.radius * 0.3, core.y - core.radius * 0.6);
        ctx.fillStyle = '#5d6d7e';
        ctx.fill();
        ctx.strokeStyle = '#34495e';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(core.x - core.radius * 0.2, core.y - core.radius * 1.05);
        ctx.lineTo(core.x - core.radius * 0.4, core.y - core.radius * 1.4);
        ctx.lineTo(core.x + core.radius * 0.4, core.y - core.radius * 1.4);
        ctx.lineTo(core.x + core.radius * 0.2, core.y - core.radius * 1.05);
        ctx.fillStyle = '#5d6d7e';
        ctx.fill();
        ctx.strokeStyle = '#34495e';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(core.x - 5, core.y - 6, 2, 0, Math.PI * 2);
        ctx.arc(core.x + 5, core.y - 6, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#e74c3c';
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(core.x - 8, core.y - 3);
        ctx.lineTo(core.x + 8, core.y - 3);
        ctx.strokeStyle = '#34495e';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    drawBody(ctx, core) {
        ctx.beginPath();
        ctx.arc(core.x, core.y + 8, core.radius * 1.1, 0, Math.PI * 2);
        const bodyGradient = ctx.createRadialGradient(
            core.x - 5, core.y + 5, 0,
            core.x, core.y + 8, core.radius * 1.1
        );
        bodyGradient.addColorStop(0, '#bdc3c7');
        bodyGradient.addColorStop(0.4, '#95a5a6');
        bodyGradient.addColorStop(1, '#7f8c8d');
        ctx.fillStyle = bodyGradient;
        ctx.fill();
        ctx.strokeStyle = '#34495e';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    drawLegs(ctx, core) {
        ctx.beginPath();
        ctx.moveTo(core.x - 2, core.y + 3);
        ctx.lineTo(core.x - 2, core.y + 15);
        ctx.moveTo(core.x + 2, core.y + 3);
        ctx.lineTo(core.x + 2, core.y + 15);
        ctx.strokeStyle = '#5d6d7e';
        ctx.lineWidth = 3;
        ctx.stroke();
    }
    
    drawArms(ctx, core) {
        ctx.beginPath();
        ctx.moveTo(core.x - core.radius * 0.8, core.y + 5);
        ctx.lineTo(core.x - core.radius * 1.3, core.y + 15);
        ctx.strokeStyle = '#7f8c8d';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(core.x + core.radius * 0.8, core.y + 5);
        ctx.lineTo(core.x + core.radius * 1.3, core.y + 15);
        ctx.strokeStyle = '#7f8c8d';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.stroke();
    }
    
    drawSword(ctx, core, combat) {
        const swordBaseAngle = -Math.PI / 4;
        const swordSwingRange = Math.PI / 2;
        let currentSwordAngle = swordBaseAngle;
        
        if (combat.attackAnimationTime > 0) {
            const progress = combat.attackAnimationTime / combat.attackDuration;
            currentSwordAngle = swordBaseAngle + (1 - progress) * swordSwingRange;
            
            ctx.beginPath();
            ctx.arc(
                core.x + core.radius * 1.8,
                core.y,
                core.radius * 2.5,
                currentSwordAngle - 0.3,
                currentSwordAngle + 0.3
            );
            ctx.strokeStyle = 'rgba(52, 152, 219, 0.5)';
            ctx.lineWidth = 4;
            ctx.stroke();
        }
        
        ctx.save();
        ctx.translate(core.x + core.radius * 1.3, core.y + 10);
        ctx.rotate(currentSwordAngle);
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -core.radius * 2.5);
        ctx.lineTo(3, -core.radius * 2.5);
        ctx.lineTo(3, 0);
        ctx.closePath();
        const swordGradient = ctx.createLinearGradient(0, -core.radius * 2.5, 3, 0);
        swordGradient.addColorStop(0, '#ecf0f1');
        swordGradient.addColorStop(0.5, '#bdc3c7');
        swordGradient.addColorStop(1, '#95a5a6');
        ctx.fillStyle = swordGradient;
        ctx.fill();
        ctx.strokeStyle = '#7f8c8d';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(-2, 0);
        ctx.lineTo(5, 0);
        ctx.lineTo(5, 5);
        ctx.lineTo(-2, 5);
        ctx.closePath();
        ctx.fillStyle = '#f39c12';
        ctx.fill();
        ctx.strokeStyle = '#e67e22';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        if (combat.attackAnimationTime > 0) {
            ctx.beginPath();
            ctx.moveTo(1, -core.radius * 2.5);
            ctx.lineTo(1, -core.radius * 3);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        
        ctx.restore();
    }
}