export const ITEMS = {
  health_potion: {
    id: "health_potion",
    name: "Health Potion",
    description: "Memulihkan 50 HP",
    effect: "heal_hp",
    value: 50,
    price: 30,
  },
  mana_potion: {
    id: "mana_potion",
    name: "Mana Potion",
    description: "Memulihkan 30 MP",
    effect: "heal_mp",
    value: 30,
    price: 25,
  },
  hi_potion: {
    id: "hi_potion",
    name: "Hi-Potion",
    description: "Memulihkan 150 HP",
    effect: "heal_hp",
    value: 150,
    price: 80,
  },
  ether: {
    id: "ether",
    name: "Ether",
    description: "Memulihkan 60 MP",
    effect: "heal_mp",
    value: 60,
    price: 70,
  },
  antidote: {
    id: "antidote",
    name: "Antidote",
    description: "Menyembuhkan racun",
    effect: "cure_poison",
    value: 1,
    price: 15,
  },
};

export const SHOP_INVENTORY = [
  { itemId: "health_potion", stock: 99 },
  { itemId: "mana_potion", stock: 99 },
  { itemId: "hi_potion", stock: 10 },
  { itemId: "ether", stock: 10 },
  { itemId: "antidote", stock: 99 },
];

export const STARTING_ITEMS = [
  { itemId: "health_potion", quantity: 3 },
  { itemId: "mana_potion", quantity: 2 },
];
