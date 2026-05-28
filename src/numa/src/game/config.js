export const TILE_SIZE = 16;
export const MAP_WIDTH = 128;
export const MAP_HEIGHT = 128;

export const TILES = {
  WATER: 0,
  GRASS: 1,
  FOREST: 2,
  DENSE_FOREST: 3,
  DIRT: 4,
  STONE: 5,
};

export const TILE_COLORS = {
  0: 0x2255aa,
  1: 0x5a9e3a,
  2: 0x2d6e22,
  3: 0x1a4a14,
  4: 0x8a6a3a,
  5: 0x7a7a7a,
};

export const BLOCKED_TILES = [TILES.WATER, TILES.DENSE_FOREST, TILES.STONE];

export const ENCOUNTER_RATE = {
  [TILES.GRASS]: 0.05,
  [TILES.FOREST]: 0.1,
  [TILES.DENSE_FOREST]: 0,
  [TILES.DIRT]: 0.03,
  [TILES.STONE]: 0,
  [TILES.WATER]: 0,
};
