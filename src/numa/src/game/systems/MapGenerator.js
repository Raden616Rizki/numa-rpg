import Noise from "noisejs";
import { TILES, CHUNK_SIZE } from "../config";
import { getOrCreateWorldSeed } from "./SaveSystem";

let WORLD_SEED = getOrCreateWorldSeed();
if (WORLD_SEED === null) {
  WORLD_SEED = Math.floor(Math.random() * 65536);
  getOrCreateWorldSeed(WORLD_SEED);
}

/**
 * Converts noise values to tile type
 * @param {number} e - elevation 0..1
 * @param {number} m - moisture 0..1
 * @returns {number}
 */
function noiseToTile(e, m) {
  if (e < 0.3) return TILES.WATER;
  if (e < 0.38) return TILES.DIRT;
  if (e < 0.45) return TILES.GRASS;
  if (e < 0.6) return m > 0.5 ? TILES.FOREST : TILES.GRASS;
  if (e < 0.75) return m > 0.4 ? TILES.DENSE_FOREST : TILES.FOREST;
  return TILES.STONE;
}

/**
 * Generates tile data for a single chunk
 * @param {number} chunkX - chunk column index
 * @param {number} chunkY - chunk row index
 * @returns {number[][]} 2D array of tile types
 */
export function generateChunk(chunkX, chunkY) {
  const elevNoise = new Noise.Noise(WORLD_SEED);
  const moistNoise = new Noise.Noise(WORLD_SEED + 999);

  const scaleE = 0.05;
  const scaleM = 0.08;
  const tiles = [];

  for (let row = 0; row < CHUNK_SIZE; row++) {
    tiles[row] = [];
    for (let col = 0; col < CHUNK_SIZE; col++) {
      // world tile position
      const worldCol = chunkX * CHUNK_SIZE + col;
      const worldRow = chunkY * CHUNK_SIZE + row;

      const n1 = elevNoise.perlin2(worldCol * scaleE, worldRow * scaleE);
      const n2 =
        elevNoise.perlin2(worldCol * scaleE * 2, worldRow * scaleE * 2) * 0.5;
      const n3 =
        elevNoise.perlin2(worldCol * scaleE * 4, worldRow * scaleE * 4) * 0.25;
      let e = (n1 + n2 + n3) / 1.75;
      e = (e + 1) / 2;

      const m =
        (moistNoise.perlin2(worldCol * scaleM, worldRow * scaleM) + 1) / 2;

      tiles[row][col] = noiseToTile(e, m);
    }
  }

  return tiles;
}

/**
 * Returns tile type at a world tile position, generating chunk if needed
 * @param {number} worldCol
 * @param {number} worldRow
 * @param {Map<string, number[][]>} chunkCache
 * @returns {number}
 */
export function getTileAt(worldCol, worldRow, chunkCache) {
  const chunkX = Math.floor(worldCol / CHUNK_SIZE);
  const chunkY = Math.floor(worldRow / CHUNK_SIZE);
  const key = `${chunkX},${chunkY}`;

  if (!chunkCache.has(key)) {
    chunkCache.set(key, generateChunk(chunkX, chunkY));
  }

  const localCol = ((worldCol % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
  const localRow = ((worldRow % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;

  return chunkCache.get(key)[localRow][localCol];
}
