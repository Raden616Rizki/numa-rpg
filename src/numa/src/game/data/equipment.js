export const EQUIPMENT_SLOTS = {
  WEAPON: 'weapon',
  ARMOR:  'armor',
  ACCESSORY: 'accessory',
}

export const EQUIPMENT = {
  // Weapons
  wooden_sword: {
    id: 'wooden_sword',
    name: 'Wooden Sword',
    slot: EQUIPMENT_SLOTS.WEAPON,
    stats: { atk: 5 },
    description: 'Pedang kayu sederhana',
    price: 50,
  },
  iron_sword: {
    id: 'iron_sword',
    name: 'Iron Sword',
    slot: EQUIPMENT_SLOTS.WEAPON,
    stats: { atk: 12 },
    description: 'Pedang besi yang kokoh',
    price: 150,
  },
  steel_sword: {
    id: 'steel_sword',
    name: 'Steel Sword',
    slot: EQUIPMENT_SLOTS.WEAPON,
    stats: { atk: 22 },
    description: 'Pedang baja tajam',
    price: 350,
  },
  magic_staff: {
    id: 'magic_staff',
    name: 'Magic Staff',
    slot: EQUIPMENT_SLOTS.WEAPON,
    stats: { atk: 8, mp: 20 },
    description: 'Meningkatkan kekuatan sihir',
    price: 280,
  },
  // Armors
  leather_armor: {
    id: 'leather_armor',
    name: 'Leather Armor',
    slot: EQUIPMENT_SLOTS.ARMOR,
    stats: { def: 5 },
    description: 'Armor kulit ringan',
    price: 80,
  },
  chain_mail: {
    id: 'chain_mail',
    name: 'Chain Mail',
    slot: EQUIPMENT_SLOTS.ARMOR,
    stats: { def: 12 },
    description: 'Baju rantai yang kuat',
    price: 200,
  },
  plate_armor: {
    id: 'plate_armor',
    name: 'Plate Armor',
    slot: EQUIPMENT_SLOTS.ARMOR,
    stats: { def: 22 },
    description: 'Armor pelat baja berat',
    price: 400,
  },
  // Accessories
  power_ring: {
    id: 'power_ring',
    name: 'Power Ring',
    slot: EQUIPMENT_SLOTS.ACCESSORY,
    stats: { atk: 5, hp: 10 },
    description: 'Meningkatkan kekuatan',
    price: 180,
  },
  guard_ring: {
    id: 'guard_ring',
    name: 'Guard Ring',
    slot: EQUIPMENT_SLOTS.ACCESSORY,
    stats: { def: 5, hp: 15 },
    description: 'Meningkatkan pertahanan',
    price: 180,
  },
  mana_ring: {
    id: 'mana_ring',
    name: 'Mana Ring',
    slot: EQUIPMENT_SLOTS.ACCESSORY,
    stats: { mp: 25 },
    description: 'Meningkatkan max MP',
    price: 160,
  },
}

export const SHOP_EQUIPMENT = [
  'wooden_sword', 'iron_sword', 'steel_sword', 'magic_staff',
  'leather_armor', 'chain_mail', 'plate_armor',
  'power_ring', 'guard_ring', 'mana_ring',
]

export const DEFAULT_EQUIPMENT = {
  [EQUIPMENT_SLOTS.WEAPON]:    null,
  [EQUIPMENT_SLOTS.ARMOR]:     null,
  [EQUIPMENT_SLOTS.ACCESSORY]: null,
}

/**
 * Calculates total stat bonuses from all equipped items
 * @param {{ weapon: string|null, armor: string|null, accessory: string|null }} equipped
 * @returns {{ atk: number, def: number, hp: number, mp: number }}
 */
export function calcEquipmentStats(equipped) {
  const totals = { atk: 0, def: 0, hp: 0, mp: 0 }
  for (const itemId of Object.values(equipped)) {
    if (!itemId) continue
    const eq = EQUIPMENT[itemId]
    if (!eq) continue
    for (const [stat, val] of Object.entries(eq.stats)) {
      totals[stat] = (totals[stat] ?? 0) + val
    }
  }
  return totals
}