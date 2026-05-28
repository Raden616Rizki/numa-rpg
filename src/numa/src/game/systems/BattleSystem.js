/**
 * Calculates damage dealt from attacker to defender
 * @param {number} atk
 * @param {number} def
 * @returns {{ damage: number, isCrit: boolean }}
 */
export function calcDamage(atk, def) {
  const base = Math.max(1, atk - def);
  const variance = Math.floor(base * 0.2);
  const damage = base + Math.floor(Math.random() * variance * 2) - variance;
  const isCrit = Math.random() < 0.1;
  return {
    damage: Math.max(1, isCrit ? damage * 2 : damage),
    isCrit,
  };
}

/**
 * Calculates spell effect on target
 * @param {object} spell - spell data from spells.js
 * @param {number} playerLevel
 * @returns {{ damage?: number, heal?: number, stun?: boolean }}
 */
export function calcSpell(spell, playerLevel) {
  const result = {};
  if (spell.damage) result.damage = spell.damage(playerLevel);
  if (spell.heal) result.heal = spell.heal(playerLevel);
  if (spell.stun) result.stun = Math.random() < 0.3;
  return result;
}

/**
 * Applies item effect to player stats
 * @param {object} item - item data from items.js
 * @param {{ hp: number, maxHp: number, mp: number, maxMp: number }} playerStats
 * @returns {{ hp: number, mp: number, message: string }}
 */
export function applyItem(item, playerStats) {
  let { hp, mp } = playerStats;
  let message = "";

  if (item.effect === "heal_hp") {
    const healed = Math.min(item.value, playerStats.maxHp - hp);
    hp = hp + healed;
    message = `Menggunakan ${item.name}, pulih ${healed} HP!`;
  } else if (item.effect === "heal_mp") {
    const restored = Math.min(item.value, playerStats.maxMp - mp);
    mp = mp + restored;
    message = `Menggunakan ${item.name}, pulih ${restored} MP!`;
  }

  return { hp, mp, message };
}

/**
 * Determines monster action for this turn
 * @param {{ name: string, atk: number, def: number, hp: number, maxHp: number }} monster
 * @returns {{ type: string, message: string }}
 */
export function getMonsterAction(monster) {
  const hpRatio = monster.hp / monster.maxHp;
  const roll = Math.random();

  if (hpRatio < 0.3 && roll < 0.3) {
    return {
      type: "power_attack",
      message: `${monster.name} menyerang dengan ganas!`,
    };
  }
  if (roll < 0.75) {
    return { type: "attack", message: `${monster.name} menyerang!` };
  }
  return { type: "defend", message: `${monster.name} bersiap bertahan!` };
}

/**
 * Calculates EXP needed to reach next level
 * @param {number} level
 * @returns {number}
 */
export function expToNextLevel(level) {
  return Math.floor(100 * Math.pow(1.4, level - 1));
}

/**
 * Calculates stat gains on level up
 * @param {number} newLevel
 * @returns {{ hp: number, mp: number, atk: number, def: number }}
 */
export function calcLevelUpStats(newLevel) {
  return {
    hp: 10 + Math.floor(Math.random() * 6),
    mp: 5 + Math.floor(Math.random() * 4),
    atk: 2 + Math.floor(Math.random() * 3),
    def: 1 + Math.floor(Math.random() * 2),
  };
}
