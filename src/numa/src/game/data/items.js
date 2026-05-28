export const ITEMS = {
  health_potion: {
    id: 'health_potion',
    name: 'Health Potion',
    description: 'Memulihkan 50 HP',
    effect: 'heal_hp',
    value: 50,
    price: 30,
  },
  mana_potion: {
    id: 'mana_potion',
    name: 'Mana Potion',
    description: 'Memulihkan 30 MP',
    effect: 'heal_mp',
    value: 30,
    price: 25,
  },
}

export const STARTING_ITEMS = [
  { itemId: 'health_potion', quantity: 3 },
  { itemId: 'mana_potion', quantity: 2 },
]