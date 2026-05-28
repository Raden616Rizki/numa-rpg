export const SPELLS = [
  {
    id: 'fire',
    name: 'Fire',
    description: 'Serangan api',
    mpCost: 5,
    unlocksAtLevel: 2,
    /** @param {number} playerLevel @returns {number} */
    damage: (playerLevel) => 15 + playerLevel * 3,
  },
  {
    id: 'heal',
    name: 'Heal',
    description: 'Pulihkan HP',
    mpCost: 6,
    unlocksAtLevel: 3,
    /** @param {number} playerLevel @returns {number} */
    heal: (playerLevel) => 30 + playerLevel * 5,
  },
  {
    id: 'thunder',
    name: 'Thunder',
    description: 'Serangan petir',
    mpCost: 10,
    unlocksAtLevel: 5,
    /** @param {number} playerLevel @returns {number} */
    damage: (playerLevel) => 35 + playerLevel * 5,
  },
  {
    id: 'blizzard',
    name: 'Blizzard',
    description: 'Serangan es, bisa stun',
    mpCost: 14,
    unlocksAtLevel: 8,
    /** @param {number} playerLevel @returns {number} */
    damage: (playerLevel) => 50 + playerLevel * 6,
    stun: true,
  },
]

/**
 * Returns spells available for the given player level
 * @param {number} level
 * @returns {typeof SPELLS}
 */
export function getAvailableSpells(level) {
  return SPELLS.filter(s => s.unlocksAtLevel <= level)
}