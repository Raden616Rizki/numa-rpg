import { TILES, TILE_SIZE, CHUNK_SIZE } from "../config";
import { getTileAt } from "./MapGenerator";

const VILLAGE_CHANCE = 40;

/**
 * Deterministic hash for chunk position
 * @param {number} chunkX
 * @param {number} chunkY
 * @returns {number} 0..99
 */
function chunkHash(chunkX, chunkY) {
  return Math.abs((chunkX * 73856093) ^ (chunkY * 19349663)) % 100;
}

/**
 * Checks if a chunk should have a village
 * @param {number} chunkX
 * @param {number} chunkY
 * @returns {boolean}
 */
export function shouldHaveVillage(chunkX, chunkY) {
  return chunkHash(chunkX, chunkY) < VILLAGE_CHANCE;
}

/**
 * Finds a flat grass area in a chunk suitable for a village
 * @param {number} chunkX
 * @param {number} chunkY
 * @param {Map} chunkCache
 * @returns {{ col: number, row: number } | null}
 */
function findFlatArea(chunkX, chunkY, chunkCache) {
  const startCol = chunkX * CHUNK_SIZE;
  const startRow = chunkY * CHUNK_SIZE;
  const VILLAGE_RADIUS = 3;

  for (
    let row = VILLAGE_RADIUS + 2;
    row < CHUNK_SIZE - VILLAGE_RADIUS - 2;
    row++
  ) {
    for (
      let col = VILLAGE_RADIUS + 2;
      col < CHUNK_SIZE - VILLAGE_RADIUS - 2;
      col++
    ) {
      const worldCol = startCol + col;
      const worldRow = startRow + row;

      let isFlat = true;
      for (let dy = -VILLAGE_RADIUS; dy <= VILLAGE_RADIUS; dy++) {
        for (let dx = -VILLAGE_RADIUS; dx <= VILLAGE_RADIUS; dx++) {
          const t = getTileAt(worldCol + dx, worldRow + dy, chunkCache);
          if (t !== TILES.GRASS && t !== TILES.DIRT) {
            isFlat = false;
            break;
          }
        }
        if (!isFlat) break;
      }

      if (isFlat) return { col: worldCol, row: worldRow };
    }
  }

  return null;
}

/**
 * Generates village data for a chunk
 * @param {number} chunkX
 * @param {number} chunkY
 * @param {Map} chunkCache
 * @returns {object | null}
 */
export function generateVillage(chunkX, chunkY, chunkCache) {
  if (!shouldHaveVillage(chunkX, chunkY)) return null;

  const center = findFlatArea(chunkX, chunkY, chunkCache);
  if (!center) return null;

  const hash = chunkHash(chunkX, chunkY);
  const RADIUS = 4;

  // Generate tile overrides — tile yang akan diganti jadi village
  const tileOverrides = new Map();

  // Lantai village — dirt path
  for (let dy = -RADIUS; dy <= RADIUS; dy++) {
    for (let dx = -RADIUS; dx <= RADIUS; dx++) {
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= RADIUS) {
        const key = `${center.col + dx},${center.row + dy}`;
        tileOverrides.set(key, TILES.DIRT);
      }
    }
  }

  const fencePositions = [];
  for (let dx = -RADIUS; dx <= RADIUS; dx++) {
    fencePositions.push({ col: center.col + dx, row: center.row - RADIUS });
    fencePositions.push({ col: center.col + dx, row: center.row + RADIUS });
  }
  for (let dy = -RADIUS + 1; dy < RADIUS; dy++) {
    fencePositions.push({ col: center.col - RADIUS, row: center.row + dy });
    fencePositions.push({ col: center.col + RADIUS, row: center.row + dy });
  }

  const entrances = [
    { col: center.col, row: center.row - RADIUS },
    { col: center.col, row: center.row + RADIUS },
    { col: center.col - RADIUS, row: center.row },
    { col: center.col + RADIUS, row: center.row },
  ];

  const buildings = generateBuildings(center, hash);

  // NPC positions
  const npcs = [
    {
      id: `village_merchant_${chunkX}_${chunkY}`,
      tileX: center.col - 2,
      tileY: center.row,
      isMerchant: true,
    },
    {
      id: `village_quest_${chunkX}_${chunkY}`,
      tileX: center.col + 2,
      tileY: center.row,
      isMerchant: false,
    },
  ];

  return {
    id: `village_${chunkX}_${chunkY}`,
    centerCol: center.col,
    centerRow: center.row,
    radius: RADIUS,
    tileOverrides,
    fencePositions,
    entrances,
    buildings,
    npcs,
  };
}

/**
 * Generates building positions within a village
 * @param {{ col: number, row: number }} center
 * @param {number} hash
 * @returns {{ col: number, row: number, w: number, h: number }[]}
 */
function generateBuildings(center, hash) {
  return [
    { col: center.col - 2, row: center.row - 2, w: 2, h: 2 },
    { col: center.col + 1, row: center.row - 2, w: 2, h: 2 },
  ];
}
