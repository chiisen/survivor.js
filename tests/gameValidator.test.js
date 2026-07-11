import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameValidator } from '../js/gameValidator.js';

describe('GameValidator', () => {
    let game;
    let validator;

    beforeEach(() => {
        game = {
            enemyGrid: {
                getTotalEntities: vi.fn().mockReturnValue(0),
                getNearby: vi.fn().mockReturnValue([]),
            },
            enemies: [],
            player: {
                x: 0,
                y: 0,
                fireCooldown: 0,
                attackRange: 100,
            },
            projectilePool: {
                getActiveObjects: vi.fn().mockReturnValue([]),
            },
        };
        validator = new GameValidator(game);
    });

    describe('constructor', () => {
        it('儲存 game 引用並初始化預設值', () => {
            expect(validator.game).toBe(game);
            expect(validator.lastFireCooldown).toBe(0);
            expect(validator.lastProjectileCount).toBe(0);
            expect(validator.enabled).toBe(false);
        });
    });

    describe('validatePhase1', () => {
        it('Grid 實體數與敵人數一致時回傳 true', () => {
            game.enemyGrid.getTotalEntities.mockReturnValue(3);
            game.enemies = [{ x: 1 }, { x: 2 }, { x: 3 }];

            expect(validator.validatePhase1()).toBe(true);
        });

        it('Grid 實體數 ≠ 敵人數時丟出錯誤', () => {
            game.enemyGrid.getTotalEntities.mockReturnValue(5);
            game.enemies = [{ x: 1 }, { x: 2 }];

            expect(() => validator.validatePhase1()).toThrow('Phase 1 失敗');
        });

        it('兩者皆為 0 時通過', () => {
            expect(validator.validatePhase1()).toBe(true);
        });
    });

    describe('validatePhase2', () => {
        it('fireCooldown 為 0 時直接通過', () => {
            game.player.fireCooldown = 0;
            expect(validator.validatePhase2()).toBe(true);
        });

        it('fireCooldown 遞減時通過', () => {
            validator.lastFireCooldown = 10;
            game.player.fireCooldown = 8;

            expect(validator.validatePhase2()).toBe(true);
            expect(validator.lastFireCooldown).toBe(8);
        });

        it('fireCooldown 未變化且 > 0 時丟出錯誤', () => {
            validator.lastFireCooldown = 5;
            game.player.fireCooldown = 5;

            expect(() => validator.validatePhase2()).toThrow('Phase 2 失敗');
        });

        it('連續呼叫時更新 lastFireCooldown', () => {
            game.player.fireCooldown = 10;
            validator.validatePhase2();
            expect(validator.lastFireCooldown).toBe(10);

            game.player.fireCooldown = 7;
            validator.validatePhase2();
            expect(validator.lastFireCooldown).toBe(7);
        });
    });

    describe('validatePhase3', () => {
        it('無子彈時直接通過', () => {
            game.projectilePool.getActiveObjects.mockReturnValue([]);
            game.enemies = [{ x: 10, y: 10 }];

            expect(validator.validatePhase3()).toBe(true);
        });

        it('無敵人時直接通過', () => {
            game.projectilePool.getActiveObjects.mockReturnValue([{ active: true }]);
            game.enemies = [];

            expect(validator.validatePhase3()).toBe(true);
        });

        it('附近有敵人且 Grid 回傳非空時通過', () => {
            game.projectilePool.getActiveObjects.mockReturnValue([{ active: true }]);
            game.enemies = [{ x: 50, y: 0 }];
            game.player.x = 0;
            game.player.y = 0;
            game.player.attackRange = 100;
            game.enemyGrid.getNearby.mockReturnValue([{ x: 50, y: 0 }]);

            expect(validator.validatePhase3()).toBe(true);
        });

        it('附近有敵人但 Grid 回傳空陣列時丟出錯誤', () => {
            game.projectilePool.getActiveObjects.mockReturnValue([{ active: true }]);
            game.enemies = [{ x: 30, y: 0 }]; // 距離 30，attackRange=100
            game.player.x = 0;
            game.player.y = 0;
            game.player.attackRange = 100;
            game.enemyGrid.getNearby.mockReturnValue([]);

            expect(() => validator.validatePhase3()).toThrow('Phase 3 失敗');
        });

        it('敵人在範圍外時不觸發 Grid 查詢，直接通過', () => {
            game.projectilePool.getActiveObjects.mockReturnValue([{ active: true }]);
            game.enemies = [{ x: 500, y: 500 }]; // 距離 ~707，attackRange=100
            game.player.x = 0;
            game.player.y = 0;
            game.player.attackRange = 100;

            expect(validator.validatePhase3()).toBe(true);
            expect(game.enemyGrid.getNearby).not.toHaveBeenCalled();
        });

        it('僅計算 active 子彈', () => {
            game.projectilePool.getActiveObjects.mockReturnValue([
                { active: false },
                { active: false },
            ]);
            game.enemies = [{ x: 10, y: 0 }];

            expect(validator.validatePhase3()).toBe(true);
        });
    });

    describe('validateAll', () => {
        it('停用時直接回傳 true 不執行驗證', () => {
            validator.enabled = false;

            expect(validator.validateAll()).toBe(true);
            expect(game.enemyGrid.getTotalEntities).not.toHaveBeenCalled();
        });

        it('啟用且全部通過時回傳 true', () => {
            validator.enable();
            game.enemyGrid.getTotalEntities.mockReturnValue(1);
            game.enemies = [{ x: 1 }];
            game.player.fireCooldown = 0;

            expect(validator.validateAll()).toBe(true);
        });

        it('Phase 1 失敗時回傳 false', () => {
            validator.enable();
            game.enemyGrid.getTotalEntities.mockReturnValue(5);
            game.enemies = [];

            expect(validator.validateAll()).toBe(false);
        });

        it('Phase 2 失敗時回傳 false', () => {
            validator.enable();
            game.enemyGrid.getTotalEntities.mockReturnValue(1);
            game.enemies = [{ x: 1 }];
            validator.lastFireCooldown = 5;
            game.player.fireCooldown = 5;

            expect(validator.validateAll()).toBe(false);
        });
    });

    describe('enable / disable', () => {
        it('enable 設定 enabled 為 true', () => {
            validator.enable();
            expect(validator.enabled).toBe(true);
        });

        it('disable 設定 enabled 為 false', () => {
            validator.enable();
            validator.disable();
            expect(validator.enabled).toBe(false);
        });
    });
});
