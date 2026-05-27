import Noise from "noisejs";
import { TILES } from "../config";

/**
 * Converts noise values to a tile type suited for forest adventure
 * @param {number} e - elevation between 0 and 1
 * @param {number} m - moisture between 0 and 1
 * @returns {number} tile type
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
 * Generates a 2D tile map using layered Perlin noise
 * @param {number} width
 * @param {number} height
 * @param {number} seed
 * @returns {number[][]}
 */
export function generateMap(width, height, seed) {
  const elevNoise = new Noise.Noise(seed);
  const moistNoise = new Noise.Noise(seed + 999);

  const scaleE = 0.05;
  const scaleM = 0.08;
  const tiles = [];

  for (let row = 0; row < height; row++) {
    tiles[row] = [];
    for (let col = 0; col < width; col++) {
      const n1 = elevNoise.perlin2(col * scaleE, row * scaleE);
      const n2 = elevNoise.perlin2(col * scaleE * 2, row * scaleE * 2) * 0.5;
      const n3 = elevNoise.perlin2(col * scaleE * 4, row * scaleE * 4) * 0.25;
      let e = (n1 + n2 + n3) / 1.75;
      e = (e + 1) / 2;

      const m = (moistNoise.perlin2(col * scaleM, row * scaleM) + 1) / 2;

      tiles[row][col] = noiseToTile(e, m);
    }
  }

  return tiles;
}

/**
 * Finds a safe spawn tile (GRASS or DIRT) near the center of the map
 * @param {number[][]} tiles
 * @param {number} width
 * @param {number} height
 * @returns {{ col: number, row: number }}
 */
export function findSafeSpawn(tiles, width, height) {
  const centerCol = Math.floor(width / 2);
  const centerRow = Math.floor(height / 2);

  for (let radius = 0; radius < 30; radius++) {
    for (let row = centerRow - radius; row <= centerRow + radius; row++) {
      for (let col = centerCol - radius; col <= centerCol + radius; col++) {
        const t = tiles[row]?.[col];
        if (t === 1 || t === 4) {
          // GRASS or DIRT
          return { col, row };
        }
      }
    }
  }

  return { col: centerCol, row: centerRow };
}
