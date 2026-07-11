// @ts-check

import { randomInt } from './utils.js';

/**
 * 天賦升級項目結構
 * @typedef {Object} Upgrade
 * @property {string} type - 天賦唯一識別碼 (對應 player 屬性名)
 * @property {string} name - 顯示名稱
 * @property {string} description - 升級效果說明
 * @property {number} value - 升級數值 (加法效果)
 * @property {string} icon - 顯示圖示字元
 */

/** @type {Upgrade[]} 所有可用天賦清單 */
const UPGRADES = [
    { type: 'maxHp', name: '生命強化', description: '最大生命值 +20', value: 20, icon: '❤️' },
    { type: 'speed', name: '疾風步', description: '移動速度 +30', value: 30, icon: '💨' },
    { type: 'pickupRange', name: '磁力手套', description: '拾取範圍 +30', value: 30, icon: '🧲' },
    { type: 'attackRange', name: '鹰眼', description: '攻擊範圍 +50', value: 50, icon: '👁️' },
    { type: 'fireRate', name: '急速射擊', description: '射擊間隔 -0.08秒', value: 0.08, icon: '⚡' },
    { type: 'damage', name: '魔力增幅', description: '傷害 +1', value: 1, icon: '✨' },
    { type: 'projectileSpeed', name: '子彈加速', description: '子彈速度 +100', value: 100, icon: '🚀' },
    { type: 'projectileCount', name: '多重射擊', description: '同時發射 +2 顆子彈', value: 2, icon: '🎯' },
    { type: 'critChance', name: '暴击大师', description: '暴击率 +10%', value: 0.1, icon: '💥' },
    { type: 'critDamage', name: '暴击增幅', description: '暴击伤害 +50%', value: 0.5, icon: '🔥' },
    { type: 'lifesteal', name: '吸血鬼', description: '击杀回复 +5 HP', value: 5, icon: '🩸' },
    { type: 'shield', name: '护盾大师', description: '获得 +15 护盾', value: 15, icon: '🛡️' },
    { type: 'expBonus', name: '经验达人', description: '经验值获取 +20%', value: 0.2, icon: '📚' },
    { type: 'armor', name: '铁壁', description: '受到伤害 -5', value: 5, icon: '🧱' },
];

/**
 * 從天賦清單中隨機抽取指定數量的升級選項
 * @param {number} [count=3] - 欲抽取的天賦數量
 * @returns {Upgrade[]} 隨機排序的天賦陣列 (長度為 min(count, UPGRADES.length))
 */
export function getRandomUpgrades(count = 3) {
    const shuffled = [...UPGRADES].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

export { UPGRADES };
