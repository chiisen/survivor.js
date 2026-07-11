// @ts-check
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameLogger } from '../js/gameLogger.js';

describe('GameLogger', () => {
    /** @type {GameLogger} */
    let logger;

    beforeEach(() => {
        logger = new GameLogger();
        vi.restoreAllMocks();
    });

    describe('constructor', () => {
        it('預設日誌等級為 error', () => {
            expect(logger.logLevel).toBe('error');
        });

        it('初始化 logLevels 陣列', () => {
            expect(logger.logLevels).toEqual(['error', 'info', 'debug']);
        });

        it('初始化所有階段執行標記為 false', () => {
            expect(logger.phaseExecuted).toEqual({
                phase1: false,
                phase2: false,
                phase3: false,
                phase4: false
            });
        });
    });

    describe('setLogLevel', () => {
        it('設定日誌等級為 info', () => {
            logger.setLogLevel('info');
            expect(logger.logLevel).toBe('info');
        });

        it('設定日誌等級為 debug', () => {
            logger.setLogLevel('debug');
            expect(logger.logLevel).toBe('debug');
        });

        it('設定日誌等級為 error', () => {
            logger.setLogLevel('info');
            logger.setLogLevel('error');
            expect(logger.logLevel).toBe('error');
        });
    });

    describe('cycleLogLevel', () => {
        it('error → info', () => {
            const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
            const result = logger.cycleLogLevel();
            expect(result).toBe('info');
            expect(logger.logLevel).toBe('info');
        });

        it('info → debug', () => {
            logger.setLogLevel('info');
            const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
            const result = logger.cycleLogLevel();
            expect(result).toBe('debug');
        });

        it('debug → error (循環)', () => {
            logger.setLogLevel('debug');
            const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
            const result = logger.cycleLogLevel();
            expect(result).toBe('error');
        });

        it('每次切換都輸出 log', () => {
            const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
            logger.cycleLogLevel();
            expect(spy).toHaveBeenCalledWith('[GameLogger] Log level changed to: INFO');
        });
    });

    describe('phase', () => {
        it('debug 模式下輸出階段資訊', () => {
            logger.setLogLevel('debug');
            const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
            logger.phase('phase1', { score: 100 });
            expect(spy).toHaveBeenCalledWith('[phase1]', { score: 100 });
        });

        it('非 debug 模式下不輸出', () => {
            const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
            logger.phase('phase1');
            expect(spy).not.toHaveBeenCalled();
        });

        it('記錄階段執行標記為 true', () => {
            logger.phase('phase2');
            expect(logger.phaseExecuted.phase2).toBe(true);
        });

        it('標記不受 logLevel 影響', () => {
            logger.setLogLevel('error');
            logger.phase('phase3');
            expect(logger.phaseExecuted.phase3).toBe(true);
        });

        it('可一次設定多個階段', () => {
            logger.phase('phase1');
            logger.phase('phase2');
            logger.phase('phase3');
            logger.phase('phase4');
            expect(logger.phaseExecuted).toEqual({
                phase1: true,
                phase2: true,
                phase3: true,
                phase4: true
            });
        });
    });

    describe('error', () => {
        it('always 輸出錯誤日誌（不受 logLevel 限制）', () => {
            const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
            logger.error('測試錯誤');
            expect(spy).toHaveBeenCalledWith('[ERROR] 測試錯誤', undefined);
        });

        it('可攜帶附加資訊', () => {
            const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
            logger.error('錯誤', { code: 500 });
            expect(spy).toHaveBeenCalledWith('[ERROR] 錯誤', { code: 500 });
        });

        it('debug 模式下仍正常輸出', () => {
            logger.setLogLevel('debug');
            const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
            logger.error('測試');
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('warning', () => {
        it('error 模式下不輸出', () => {
            const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            logger.warning('警告');
            expect(spy).not.toHaveBeenCalled();
        });

        it('info 模式下輸出', () => {
            logger.setLogLevel('info');
            const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            logger.warning('警告', { detail: 'x' });
            expect(spy).toHaveBeenCalledWith('[WARNING] 警告', { detail: 'x' });
        });

        it('debug 模式下輸出', () => {
            logger.setLogLevel('debug');
            const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            logger.warning('警告');
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('info', () => {
        it('error 模式下不輸出', () => {
            const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
            logger.info('資訊');
            expect(spy).not.toHaveBeenCalled();
        });

        it('info 模式下輸出', () => {
            logger.setLogLevel('info');
            const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
            logger.info('資訊', { key: 'val' });
            expect(spy).toHaveBeenCalledWith('[INFO] 資訊', { key: 'val' });
        });

        it('debug 模式下輸出', () => {
            logger.setLogLevel('debug');
            const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
            logger.info('資訊');
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('reset', () => {
        it('所有階段執行標記重設為 false', () => {
            logger.phase('phase1');
            logger.phase('phase2');
            logger.phase('phase3');
            logger.phase('phase4');
            logger.reset();
            expect(logger.phaseExecuted).toEqual({
                phase1: false,
                phase2: false,
                phase3: false,
                phase4: false
            });
        });

        it('重設後可重新標記', () => {
            logger.phase('phase1');
            logger.reset();
            logger.phase('phase1');
            expect(logger.phaseExecuted.phase1).toBe(true);
        });

        it('不影響 logLevel', () => {
            logger.setLogLevel('debug');
            logger.reset();
            expect(logger.logLevel).toBe('debug');
        });
    });
});
