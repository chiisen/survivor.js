import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { countIf } from '../js/enemyList.js';
import { runPhaseCheck } from '../js/gameValidator.js';
import { UI } from '../js/ui.js';

describe('每幀統計不配置 filter', () => {
    it('countIf 計算一般敵人與擊殺數時不呼叫 filter', () => {
        const enemies = [
            { type: { isBoss: false }, hp: 1, _alive: true },
            { type: { isBoss: true }, hp: 1, _alive: true },
            { type: { isBoss: false }, hp: 0, _alive: false },
        ];
        const original = Array.prototype.filter;
        let calls = 0;
        Array.prototype.filter = function (...args) {
            calls++;
            return original.apply(this, args);
        };
        try {
            expect(countIf(enemies, (enemy) => !enemy.type.isBoss)).toBe(2);
            expect(countIf(enemies, (enemy) => enemy.hp > 0)).toBe(2);
        } finally {
            Array.prototype.filter = original;
        }
        expect(calls).toBe(0);
    });
});

describe('驗證器開關', () => {
    it('關閉時不呼叫階段檢查，開啟時會呼叫', () => {
        let calls = 0;
        const validator = {
            enabled: false,
            validatePhase2() {
                calls++;
            },
        };
        expect(runPhaseCheck(validator, 'validatePhase2')).toBe(0);
        expect(calls).toBe(0);
        validator.enabled = true;
        expect(runPhaseCheck(validator, 'validatePhase2')).toBe(1);
        expect(calls).toBe(1);
    });
});

describe('金幣髒檢查', () => {
    let writes;

    beforeEach(() => {
        writes = 0;
        const goldDisplay = {};
        Object.defineProperty(goldDisplay, 'textContent', {
            set() { writes++; },
            get() { return ''; },
        });
        const element = () => ({
            textContent: '',
            style: {},
            appendChild() {},
        });
        vi.stubGlobal('document', {
            getElementById(id) {
                if (id === 'gold-display') return goldDisplay;
                return element();
            },
            createElement: element,
        });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('相同金幣不再寫入 DOM', () => {
        const ui = new UI();
        ui.updateGold(10);
        const afterFirst = writes;
        ui.updateGold(10);
        expect(writes).toBe(afterFirst);
        ui.updateGold(11);
        expect(writes).toBe(afterFirst + 1);
    });
});
