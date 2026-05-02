import { randomInt } from './utils.js';

const UPGRADES = [
    { type: 'maxHp', name: '生命強化', description: '最大生命值 +20', value: 20, icon: '❤️' },
    { type: 'speed', name: '疾風步', description: '移動速度 +30', value: 30, icon: '💨' },
    { type: 'pickupRange', name: '磁力手套', description: '拾取範圍 +30', value: 30, icon: '🧲' },
    { type: 'attackRange', name: '鹰眼', description: '攻擊範圍 +50', value: 50, icon: '👁️' },
    { type: 'fireRate', name: '急速射擊', description: '射擊間隔 -0.08秒', value: 0.08, icon: '⚡' },
    { type: 'damage', name: '魔力增幅', description: '傷害 +1', value: 1, icon: '✨' },
    { type: 'projectileSpeed', name: '子彈加速', description: '子彈速度 +100', value: 100, icon: '🚀' },
    { type: 'projectileCount', name: '多重射擊', description: '同時發射 +1 顆子彈', value: 1, icon: '🎯' },
];

export function getRandomUpgrades(count = 3) {
    const shuffled = [...UPGRADES].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

export { UPGRADES };