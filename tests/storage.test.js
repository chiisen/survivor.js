import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StorageManager } from '../js/storage.js';

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: vi.fn((key) => store[key] ?? null),
        setItem: vi.fn((key, value) => { store[key] = value; }),
        removeItem: vi.fn((key) => { delete store[key]; }),
        clear: vi.fn(() => { store = {}; }),
        get length() { return Object.keys(store).length; },
        key: vi.fn((i) => Object.keys(store)[i] ?? null),
    };
})();

// 掛載到 globalThis
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

// 預設空白統計
const DEFAULT_STATS = {
    highestLevel: 0,
    longestTime: 0,
    totalKills: 0,
    highestWave: 0,
    totalGames: 0,
    bossesKilled: 0
};

describe('StorageManager', () => {
    let mgr;

    beforeEach(() => {
        localStorageMock.clear();
        vi.clearAllMocks();
        mgr = new StorageManager();
    });

    describe('constructor', () => {
        it('無既有資料時初始化為預設值', () => {
            expect(mgr.stats).toEqual(DEFAULT_STATS);
            expect(mgr.leaderboard).toEqual([]);
        });

        it('有既有 stats 時從 localStorage 載入', () => {
            const saved = { highestLevel: 5, longestTime: 120, totalKills: 300, highestWave: 3, totalGames: 10, bossesKilled: 2 };
            localStorageMock.setItem('survivor_js_stats', JSON.stringify(saved));
            const m = new StorageManager();
            expect(m.stats).toEqual(saved);
        });

        it('有既有 leaderboard 時從 localStorage 載入', () => {
            const lb = [{ level: 3, kills: 50, time: 60, wave: 2, bossesKilled: 0, date: '2026/1/1' }];
            localStorageMock.setItem('survivor_js_leaderboard', JSON.stringify(lb));
            const m = new StorageManager();
            expect(m.leaderboard).toEqual(lb);
        });
    });

    describe('load', () => {
        it('localStorage 無資料時返回預設統計', () => {
            expect(mgr.load()).toEqual(DEFAULT_STATS);
        });

        it('localStorage 有合法 JSON 時解析並返回', () => {
            const data = { highestLevel: 7, longestTime: 300, totalKills: 500, highestWave: 5, totalGames: 20, bossesKilled: 3 };
            localStorageMock.setItem('survivor_js_stats', JSON.stringify(data));
            expect(mgr.load()).toEqual(data);
        });

        it('localStorage 內容為非法 JSON 時返回預設值（不拋錯）', () => {
            localStorageMock.setItem('survivor_js_stats', 'NOT_JSON');
            expect(() => mgr.load()).not.toThrow();
            expect(mgr.load()).toEqual(DEFAULT_STATS);
        });
    });

    describe('loadLeaderboard', () => {
        it('localStorage 無資料時返回空陣列', () => {
            expect(mgr.loadLeaderboard()).toEqual([]);
        });

        it('有合法 JSON 時返回排行榜陣列', () => {
            const lb = [{ level: 2, kills: 30, time: 45, wave: 1, bossesKilled: 0, date: '2026/1/1' }];
            localStorageMock.setItem('survivor_js_leaderboard', JSON.stringify(lb));
            expect(mgr.loadLeaderboard()).toEqual(lb);
        });

        it('非法 JSON 時返回空陣列（不拋錯）', () => {
            localStorageMock.setItem('survivor_js_leaderboard', '{{{');
            expect(() => mgr.loadLeaderboard()).not.toThrow();
            expect(mgr.loadLeaderboard()).toEqual([]);
        });
    });

    describe('save', () => {
        it('將統計資料序列化後寫入 localStorage', () => {
            mgr.save(DEFAULT_STATS);
            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                'survivor_js_stats',
                JSON.stringify(DEFAULT_STATS)
            );
        });

        it('localStorage 拋出錯誤時不影響程式（catch 吞掉）', () => {
            localStorageMock.setItem.mockImplementation(() => { throw new Error('quota'); });
            expect(() => mgr.save(DEFAULT_STATS)).not.toThrow();
        });
    });

    describe('saveLeaderboard', () => {
        it('將排行榜序列化後寫入 localStorage', () => {
            const lb = [{ level: 1, kills: 10, time: 30, wave: 1, bossesKilled: 0, date: '2026/1/1' }];
            mgr.saveLeaderboard(lb);
            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                'survivor_js_leaderboard',
                JSON.stringify(lb)
            );
        });

        it('localStorage 拋出錯誤時不影響程式', () => {
            localStorageMock.setItem.mockImplementation(() => { throw new Error('quota'); });
            expect(() => mgr.saveLeaderboard([])).not.toThrow();
        });
    });

    describe('update', () => {
        it('累加 totalGames 並更新 highestLevel', () => {
            mgr.update({ level: 5, time: 60, kills: 20, wave: 2, bossesKilled: 1 });
            expect(mgr.stats.totalGames).toBe(1);
            expect(mgr.stats.highestLevel).toBe(5);
        });

        it('保留歷史最高值（level 3 → 5 → 4 應保留 5）', () => {
            mgr.update({ level: 5, time: 60, kills: 20, wave: 2, bossesKilled: 0 });
            mgr.update({ level: 4, time: 50, kills: 15, wave: 1, bossesKilled: 0 });
            expect(mgr.stats.highestLevel).toBe(5);
            expect(mgr.stats.totalGames).toBe(2);
        });

        it('totalKills 累加正確', () => {
            mgr.update({ level: 1, time: 30, kills: 10, wave: 1, bossesKilled: 0 });
            mgr.update({ level: 1, time: 30, kills: 15, wave: 1, bossesKilled: 0 });
            expect(mgr.stats.totalKills).toBe(25);
        });

        it('bossesKilled 預設為 0 不會 undefined 累加', () => {
            mgr.update({ level: 1, time: 30, kills: 5, wave: 1 });
            expect(mgr.stats.bossesKilled).toBe(0);
        });

        it('bossesKilled 有值時正確累加', () => {
            mgr.update({ level: 1, time: 30, kills: 5, wave: 1, bossesKilled: 2 });
            mgr.update({ level: 1, time: 30, kills: 5, wave: 1, bossesKilled: 1 });
            expect(mgr.stats.bossesKilled).toBe(3);
        });

        it('更新後呼叫 save 並呼叫 addToLeaderboard', () => {
            mgr.update({ level: 1, time: 30, kills: 5, wave: 1, bossesKilled: 0 });
            expect(localStorageMock.setItem).toHaveBeenCalled();
            expect(mgr.leaderboard).toHaveLength(1);
        });

        it('回傳新紀錄陣列', () => {
            const records = mgr.update({ level: 1, time: 30, kills: 5, wave: 1, bossesKilled: 0 });
            expect(Array.isArray(records)).toBe(true);
        });
    });

    describe('addToLeaderboard', () => {
        it('新增一筆記錄到排行榜', () => {
            mgr.addToLeaderboard({ level: 3, kills: 50, time: 60, wave: 2, bossesKilled: 0 });
            expect(mgr.leaderboard).toHaveLength(1);
            expect(mgr.leaderboard[0].level).toBe(3);
        });

        it('記錄包含 date 欄位', () => {
            mgr.addToLeaderboard({ level: 1, kills: 10, time: 30, wave: 1, bossesKilled: 0 });
            expect(mgr.leaderboard[0].date).toBeDefined();
        });

        it('多筆記錄依 level > kills > time 降序排列', () => {
            mgr.addToLeaderboard({ level: 2, kills: 30, time: 45, wave: 1, bossesKilled: 0 });
            mgr.addToLeaderboard({ level: 3, kills: 50, time: 60, wave: 2, bossesKilled: 0 });
            mgr.addToLeaderboard({ level: 3, kills: 40, time: 50, wave: 1, bossesKilled: 0 });

            expect(mgr.leaderboard[0].level).toBe(3);
            expect(mgr.leaderboard[0].kills).toBe(50);
            expect(mgr.leaderboard[1].level).toBe(3);
            expect(mgr.leaderboard[1].kills).toBe(40);
            expect(mgr.leaderboard[2].level).toBe(2);
        });

        it('排行榜最多保留 10 筆', () => {
            for (let i = 0; i < 15; i++) {
                mgr.addToLeaderboard({ level: i, kills: i * 10, time: i * 5, wave: 1, bossesKilled: 0 });
            }
            expect(mgr.leaderboard).toHaveLength(10);
        });

        it('bossesKilled 預設為 0', () => {
            mgr.addToLeaderboard({ level: 1, kills: 10, time: 30, wave: 1 });
            expect(mgr.leaderboard[0].bossesKilled).toBe(0);
        });
    });

    describe('getLeaderboard', () => {
        it('回傳包含 formattedTime 的排行榜', () => {
            mgr.addToLeaderboard({ level: 3, kills: 50, time: 90, wave: 2, bossesKilled: 0 });
            const lb = mgr.getLeaderboard();
            expect(lb[0].formattedTime).toBe('1分30秒');
        });

        it('空排行榜回傳空陣列', () => {
            expect(mgr.getLeaderboard()).toEqual([]);
        });
    });

    describe('checkNewRecords', () => {
        it('首次遊戲（stats 全 0）所有項都算新紀錄', () => {
            const records = mgr.checkNewRecords({ level: 1, time: 30, wave: 1 });
            // level: 1 > 0-1=-1 → true, time: 30 > 0-30=-30 → true, wave: 1 > 0-1=-1 → true
            expect(records).toHaveLength(3);
            expect(records.map(r => r.type)).toContain('level');
            expect(records.map(r => r.type)).toContain('time');
            expect(records.map(r => r.type)).toContain('wave');
        });

        it('非新紀錄時回傳空陣列', () => {
            mgr.stats = { highestLevel: 10, longestTime: 200, totalKills: 100, highestWave: 5, totalGames: 5, bossesKilled: 0 };
            // level 5: 5 > 10-5=5 → false, time 50: 50 > 200-50=150 → false, wave 2: 2 > 5-2=3 → false
            const records = mgr.checkNewRecords({ level: 5, time: 50, wave: 2 });
            expect(records).toEqual([]);
        });

        it('部分新紀錄只回傳該項', () => {
            mgr.stats = { highestLevel: 10, longestTime: 200, totalKills: 100, highestWave: 5, totalGames: 5, bossesKilled: 0 };
            const records = mgr.checkNewRecords({ level: 11, time: 50, wave: 2 });
            // level 11 > 10-11=-1 → true, time 50 > 200-50=150 → false, wave 2 > 5-2=3 → false
            expect(records).toHaveLength(1);
            expect(records[0].type).toBe('level');
            expect(records[0].isNew).toBe(true);
        });
    });

    describe('getStats', () => {
        it('回傳目前 stats 的引用', () => {
            const s = mgr.getStats();
            expect(s).toEqual(DEFAULT_STATS);
        });
    });

    describe('formatTime', () => {
        it('0 秒格式化為 0分0秒', () => {
            expect(mgr.formatTime(0)).toBe('0分0秒');
        });

        it('60 秒格式化為 1分0秒', () => {
            expect(mgr.formatTime(60)).toBe('1分0秒');
        });

        it('90 秒格式化為 1分30秒', () => {
            expect(mgr.formatTime(90)).toBe('1分30秒');
        });

        it('小數秒數取 floor', () => {
            expect(mgr.formatTime(65.9)).toBe('1分5秒');
        });
    });

    describe('getFormattedStats', () => {
        it('longestTime 轉為格式化字串，longestTimeSec 保留原始值', () => {
            mgr.stats.longestTime = 90;
            const fs = mgr.getFormattedStats();
            expect(fs.longestTime).toBe('1分30秒');
            expect(fs.longestTimeSec).toBe(90);
        });

        it('所有欄位正確對應', () => {
            mgr.stats = { highestLevel: 5, longestTime: 120, totalKills: 300, highestWave: 3, totalGames: 10, bossesKilled: 2 };
            const fs = mgr.getFormattedStats();
            expect(fs.highestLevel).toBe(5);
            expect(fs.longestTime).toBe('2分0秒');
            expect(fs.longestTimeSec).toBe(120);
            expect(fs.totalKills).toBe(300);
            expect(fs.highestWave).toBe(3);
            expect(fs.totalGames).toBe(10);
            expect(fs.bossesKilled).toBe(2);
        });
    });

    describe('reset', () => {
        it('stats 重歸零', () => {
            mgr.update({ level: 5, time: 100, kills: 50, wave: 3, bossesKilled: 2 });
            mgr.reset();
            expect(mgr.stats).toEqual(DEFAULT_STATS);
        });

        it('leaderboard 清空', () => {
            mgr.addToLeaderboard({ level: 3, kills: 50, time: 60, wave: 2, bossesKilled: 0 });
            mgr.reset();
            expect(mgr.leaderboard).toEqual([]);
        });

        it('重置後呼叫 save 和 saveLeaderboard', () => {
            localStorageMock.setItem.mockClear();
            mgr.reset();
            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                'survivor_js_stats',
                JSON.stringify(DEFAULT_STATS)
            );
            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                'survivor_js_leaderboard',
                JSON.stringify([])
            );
        });
    });
});
