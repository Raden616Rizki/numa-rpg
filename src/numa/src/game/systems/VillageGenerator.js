import { TILES, TILE_SIZE, CHUNK_SIZE } from "../config";
import { getTileAt } from "./MapGenerator";

const VILLAGE_CHANCE = 40;
const VILLAGE_MAP_SIZE = 32; // tile

/**
 * @param {number} chunkX
 * @param {number} chunkY
 * @returns {number}
 */
function chunkHash(chunkX, chunkY) {
  return Math.abs((chunkX * 73856093) ^ (chunkY * 19349663)) % 100;
}

/**
 * @param {number} chunkX
 * @param {number} chunkY
 * @returns {boolean}
 */
export function shouldHaveVillage(chunkX, chunkY) {
  return chunkHash(chunkX, chunkY) < VILLAGE_CHANCE;
}

/**
 * Finds a flat grass area suitable for village placement
 * @param {number} chunkX
 * @param {number} chunkY
 * @param {Map} chunkCache
 * @returns {{ col: number, row: number } | null}
 */
function findFlatArea(chunkX, chunkY, chunkCache) {
  const startCol = chunkX * CHUNK_SIZE;
  const startRow = chunkY * CHUNK_SIZE;
  const CHECK_RADIUS = 2;

  for (let row = 4; row < CHUNK_SIZE - 4; row++) {
    for (let col = 4; col < CHUNK_SIZE - 4; col++) {
      const worldCol = startCol + col;
      const worldRow = startRow + row;

      let isFlat = true;
      for (let dy = -CHECK_RADIUS; dy <= CHECK_RADIUS; dy++) {
        for (let dx = -CHECK_RADIUS; dx <= CHECK_RADIUS; dx++) {
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
 * Places 3x3 village tiles on the global map
 * @param {number} chunkX
 * @param {number} chunkY
 * @param {Map} chunkCache
 * @returns {{ centerCol: number, centerRow: number, tileOverrides: Map } | null}
 */
export function placeVillageTiles(chunkX, chunkY, chunkCache) {
  if (!shouldHaveVillage(chunkX, chunkY)) return null;

  const center = findFlatArea(chunkX, chunkY, chunkCache);
  if (!center) return null;

  const overrides = new Map();

  // 3x3 tile village
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const key = `${center.col + dx},${center.row + dy}`;
      overrides.set(key, TILES.VILLAGE);
    }
  }

  return {
    centerCol: center.col,
    centerRow: center.row,
    tileOverrides: overrides,
    villageId: `village_${center.col}_${center.row}`,
  };
}

/**
 * Generates a full village interior map (32x32)
 * Village is persistent — same seed produces same layout
 * @param {string} villageId
 * @param {number} centerCol - global tile col (used as seed)
 * @param {number} centerRow - global tile row (used as seed)
 * @returns {object} village interior data
 */
export function generateVillageInterior(villageId, centerCol, centerRow) {
  const seed = Math.abs((centerCol * 374761393) ^ (centerRow * 668265263));
  const rng = seededRng(seed);
  const SIZE = VILLAGE_MAP_SIZE;
  const tiles = [];

  // Fill dengan dirt path
  for (let row = 0; row < SIZE; row++) {
    tiles[row] = [];
    for (let col = 0; col < SIZE; col++) {
      tiles[row][col] = TILES.DIRT;
    }
  }

  // Tambahkan grass di pinggir dalam
  for (let row = 1; row < SIZE - 1; row++) {
    for (let col = 1; col < SIZE - 1; col++) {
      if (row > 2 && row < SIZE - 3 && col > 2 && col < SIZE - 3) {
        tiles[row][col] = TILES.GRASS;
      }
    }
  }

  // Jalan utama horizontal dan vertikal
  const midRow = Math.floor(SIZE / 2);
  const midCol = Math.floor(SIZE / 2);
  for (let i = 1; i < SIZE - 1; i++) {
    tiles[midRow][i] = TILES.DIRT;
    tiles[i][midCol] = TILES.DIRT;
  }

  // Generate bangunan
  const buildings = generateVillageBuildings(SIZE, rng);

  // Mark tile bangunan sebagai blocked
  for (const b of buildings) {
    for (let dy = 0; dy < b.h; dy++) {
      for (let dx = 0; dx < b.w; dx++) {
        if (tiles[b.row + dy] && tiles[b.row + dy][b.col + dx] !== undefined) {
          tiles[b.row + dy][b.col + dx] = TILES.STONE; // blocked
        }
      }
    }
  }

  // Pintu keluar di 4 sisi (tengah tepi)
  const exits = [
    { col: midCol, row: 0, direction: "north" },
    { col: midCol, row: SIZE - 1, direction: "south" },
    { col: 0, row: midRow, direction: "west" },
    { col: SIZE - 1, row: midRow, direction: "east" },
  ];

  for (const exit of exits) {
    tiles[exit.row][exit.col] = TILES.DIRT;
  }

  // NPC positions
  const npcs = [
    {
      id: `${villageId}_merchant`,
      tileX: midCol - 3,
      tileY: midRow - 2,
      isMerchant: true,
      name: pickName(rng, MERCHANT_NAMES),
      dialogue: "Selamat datang! Aku menjual berbagai barang.",
    },
    {
      id: `${villageId}_quest`,
      tileX: midCol + 3,
      tileY: midRow - 2,
      isMerchant: false,
      name: pickName(rng, NPC_NAMES),
      dialogue: "Hei petualang! Ada tugas yang menunggumu.",
    },
    {
      id: `${villageId}_innkeeper`,
      tileX: midCol,
      tileY: midRow + 3,
      isMerchant: false,
      isInnkeeper: true,
      name: pickName(rng, INNKEEPER_NAMES),
      dialogue: "Selamat datang di penginapan! Mau beristirahat?",
    },
  ];

  return {
    villageId,
    tiles,
    buildings,
    exits,
    npcs,
    size: SIZE,
    spawnCol: midCol,
    spawnRow: midRow + 2,
  };
}

/**
 * Generates building layouts for village interior
 * @param {number} mapSize
 * @param {function} rng
 * @returns {{ col, row, w, h, type }[]}
 */
function generateVillageBuildings(mapSize, rng) {
  const buildings = [];
  const mid = Math.floor(mapSize / 2);

  const templates = [
    { col: mid - 8, row: mid - 7, w: 4, h: 4, type: "house" },
    { col: mid + 4, row: mid - 7, w: 4, h: 4, type: "house" },
    { col: mid - 8, row: mid + 3, w: 4, h: 4, type: "house" },
    { col: mid + 4, row: mid + 3, w: 4, h: 4, type: "house" },
    { col: mid - 2, row: mid + 4, w: 4, h: 5, type: "inn" },
    { col: mid - 2, row: mid - 8, w: 4, h: 4, type: "shop" },
  ];

  for (const b of templates) {
    if (
      b.col > 1 &&
      b.row > 1 &&
      b.col + b.w < mapSize - 1 &&
      b.row + b.h < mapSize - 1
    ) {
      buildings.push(b);
    }
  }

  return buildings;
}

function seededRng(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function pickName(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

const NPC_NAMES = ["Aldric", "Myrna", "Bram", "Lyra", "Gorund", "Tessa"];
const MERCHANT_NAMES = ["Pedagang Tua", "Bartel", "Wren"];
const INNKEEPER_NAMES = ["Ibu Sari", "Pak Budi", "Nona Rima"];
