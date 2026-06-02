import { TILE_ELEVATION, CHUNK_SIZE } from "../config";
import { getTileAt } from "./MapGenerator";

/**
 * Deterministic hash based on world position
 * @param {number} col
 * @param {number} row
 * @returns {number} 0..99
 */
function posHash(col, row) {
  return Math.abs((col * 73856093) ^ (row * 19349663)) % 100;
}

/**
 * Checks if a ramp/gap exists between two adjacent tiles
 * allowing movement between different elevations
 * @param {number} fromCol
 * @param {number} fromRow
 * @param {number} toCol
 * @param {number} toRow
 * @param {Map} chunkCache
 * @returns {boolean}
 */
export function hasRamp(fromCol, fromRow, toCol, toRow, chunkCache) {
  const fromTile = getTileAt(fromCol, fromRow, chunkCache);
  const toTile = getTileAt(toCol, toRow, chunkCache);
  const fromElev = TILE_ELEVATION[fromTile] ?? 1;
  const toElev = TILE_ELEVATION[toTile] ?? 1;

  // Sama ketinggian — selalu bisa lewat (ditangani isWalkable)
  if (fromElev === toElev) return true;

  // Selisih lebih dari 1 — tidak bisa lewat sama sekali
  if (Math.abs(fromElev - toElev) > 1) return false;

  // Selisih tepat 1 — cek apakah posisi ini adalah celah
  // Gunakan hash dari posisi tengah antara dua tile
  const midCol = fromCol + toCol;
  const midRow = fromRow + toRow;
  const hash = posHash(midCol, midRow);

  // ~30% edge punya celah
  return hash < 30;
}

/**
 * Returns visual ramp color for rendering
 * @param {number} tileType
 * @returns {number} hex color
 */
export function getRampColor(tileType) {
  const RAMP_COLORS = {
    1: 0x7ab84a, // grass ramp
    2: 0x4a8a35, // forest ramp
    4: 0xaa8855, // dirt ramp
    5: 0x9a9a8a, // stone ramp
  };
  return RAMP_COLORS[tileType] ?? 0x888888;
}

/**
 * Gets all ramp positions on the edges of a chunk for rendering
 * @param {number} chunkX
 * @param {number} chunkY
 * @param {number[][]} tiles
 * @param {Map} chunkCache
 * @returns {{ col: number, row: number, dir: string, tileType: number }[]}
 */
export function getChunkRamps(chunkX, chunkY, tiles, chunkCache) {
  const ramps = [];

  for (let row = 0; row < CHUNK_SIZE; row++) {
    for (let col = 0; col < CHUNK_SIZE; col++) {
      const worldCol = chunkX * CHUNK_SIZE + col;
      const worldRow = chunkY * CHUNK_SIZE + row;
      const tileType = tiles[row][col];
      const myElev = TILE_ELEVATION[tileType] ?? 1;

      const dirs = [
        { dc: 0, dr: -1, dir: "top" },
        { dc: 0, dr: 1, dir: "bottom" },
        { dc: -1, dr: 0, dir: "left" },
        { dc: 1, dr: 0, dir: "right" },
      ];

      for (const { dc, dr, dir } of dirs) {
        const neighborTile = getTileAt(
          worldCol + dc,
          worldRow + dr,
          chunkCache,
        );
        const neighborElev = TILE_ELEVATION[neighborTile] ?? 1;

        if (Math.abs(myElev - neighborElev) === 1) {
          const midCol = worldCol * 2 + dc;
          const midRow = worldRow * 2 + dr;
          const hash = posHash(midCol, midRow);

          if (hash < 30) {
            ramps.push({ col, row, dir, tileType });
          }
        }
      }
    }
  }

  return ramps;
}
