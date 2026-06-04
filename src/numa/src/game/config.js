export const TILE_SIZE = 16;
export const CHUNK_SIZE = 32;
export const RENDER_DISTANCE = 2;

export const TILES = {
  WATER: 0,
  GRASS: 1,
  FOREST: 2,
  DENSE_FOREST: 3,
  DIRT: 4,
  STONE: 5,
  CLIFF: 6,
  VILLAGE: 7,
  CAVE_ENTRANCE: 8,
};

export const TILE_COLORS = {
  0: 0x2255aa,
  1: 0x5a9e3a,
  2: 0x2d6e22,
  3: 0x1a4a14,
  4: 0x8a6a3a,
  5: 0x7a7a7a,
  6: 0x4a4a4a,
  7: 0xd4a855,
  8: 0x1a1a2a,
};

// Warna tepi/shadow untuk tiap tile
export const TILE_EDGE_COLORS = {
  0: 0x1a3a7a,
  1: 0x3a6a25,
  2: 0x1a4a14,
  3: 0x0a2a0a,
  4: 0x5a4a25,
  5: 0x5a5a5a,
  6: 0x2a2a2a,
  7: 0xa07830,
  8: 0x0a0a1a,
};

// Elevation level tiap tile (0=rendah, 3=tinggi)
export const TILE_ELEVATION = {
  0: 0, // water
  1: 1, // grass
  2: 2, // forest
  3: 2, // dense forest
  4: 1, // dirt
  5: 3, // stone
  6: 3, // cliff
  7: 1, // village
  8: 2, // cave entrance
};

export const BLOCKED_TILES = [
  TILES.WATER,
  // TILES.DENSE_FOREST,
  TILES.STONE,
  TILES.CLIFF,
];

export const ENCOUNTER_RATE = {
  [TILES.GRASS]: 0.05,
  [TILES.FOREST]: 0.1,
  [TILES.DENSE_FOREST]: 0.13,
  [TILES.DIRT]: 0.03,
  [TILES.STONE]: 0,
  [TILES.WATER]: 0,
  [TILES.VILLAGE]: 0,
  [TILES.CAVE_ENTRANCE]: 0,
};
