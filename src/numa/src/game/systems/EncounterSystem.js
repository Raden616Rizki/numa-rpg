import { ENCOUNTER_RATE, TILES } from "../config";

/**
 * Determines if a random encounter happens based on tile type
 * @param {number} tileType
 * @returns {boolean}
 */
export function rollEncounter(tileType) {
  const rate = ENCOUNTER_RATE[tileType] ?? 0;
  return Math.random() < rate;
}

/**
 * Returns a random monster based on tile type
 * @param {number} tileType
 * @returns {{ name: string, hp: number, maxHp: number, atk: number, def: number, exp: number, gold: number }}
 */
export function getMonster(tileType) {
  const pool = MONSTER_POOL[tileType] ?? MONSTER_POOL[TILES.GRASS];
  const template = pool[Math.floor(Math.random() * pool.length)];
  return { ...template, hp: template.maxHp };
}

const MONSTER_POOL = {
  [TILES.GRASS]: [
    { name: "Slime", maxHp: 20, atk: 4, def: 1, exp: 10, gold: 3 },
    { name: "Giant Rat", maxHp: 28, atk: 6, def: 2, exp: 15, gold: 5 },
  ],
  [TILES.FOREST]: [
    { name: "Wolf", maxHp: 45, atk: 10, def: 4, exp: 30, gold: 10 },
    { name: "Giant Spider", maxHp: 38, atk: 8, def: 3, exp: 25, gold: 8 },
    { name: "Goblin", maxHp: 35, atk: 9, def: 3, exp: 28, gold: 9 },
  ],
  [TILES.DENSE_FOREST]: [
    { name: "Dark Wolf", maxHp: 60, atk: 14, def: 6, exp: 45, gold: 15 },
    { name: "Orc", maxHp: 70, atk: 16, def: 8, exp: 55, gold: 20 },
    { name: "Troll", maxHp: 80, atk: 18, def: 9, exp: 65, gold: 25 },
  ],
  [TILES.DIRT]: [
    { name: "Slime", maxHp: 20, atk: 4, def: 1, exp: 10, gold: 3 },
    { name: "Giant Rat", maxHp: 28, atk: 6, def: 2, exp: 15, gold: 5 },
  ],
};
