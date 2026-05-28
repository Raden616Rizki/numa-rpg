import { TILES, CHUNK_SIZE, TILE_SIZE } from "../config";
import { getTileAt } from "./MapGenerator";

const NPC_NAMES = [
  "Aldric",
  "Myrna",
  "Bram",
  "Lyra",
  "Gorund",
  "Tessa",
  "Finn",
  "Isolde",
];

const NPC_DIALOGUES = [
  "Hati-hati di dalam hutan, banyak monster berbahaya!",
  "Aku punya pekerjaan untukmu jika kamu berminat.",
  "Kudengar ada makhluk aneh berkeliaran di utara.",
  "Sudah lama tidak ada petualang yang lewat sini.",
];

/**
 * Generates NPC data for a chunk if it should have one
 * @param {number} chunkX
 * @param {number} chunkY
 * @param {Map} chunkCache
 * @returns {object|null}
 */
export function generateNPCForChunk(chunkX, chunkY, chunkCache) {
  // tidak setiap chunk punya NPC
  const hash = Math.abs((chunkX * 73856093) ^ (chunkY * 19349663)) % 100;
  if (hash > 25) return null;

  // cari tile yang aman di dalam chunk
  const startCol = chunkX * CHUNK_SIZE;
  const startRow = chunkY * CHUNK_SIZE;

  for (let row = 2; row < CHUNK_SIZE - 2; row++) {
    for (let col = 2; col < CHUNK_SIZE - 2; col++) {
      const tile = getTileAt(startCol + col, startRow + row, chunkCache);
      if (tile === TILES.GRASS || tile === TILES.DIRT) {
        return {
          id: `npc_${chunkX}_${chunkY}`,
          name: NPC_NAMES[hash % NPC_NAMES.length],
          dialogue: NPC_DIALOGUES[hash % NPC_DIALOGUES.length],
          tileX: startCol + col,
          tileY: startRow + row,
          worldX: (startCol + col) * TILE_SIZE + TILE_SIZE / 2,
          worldY: (startRow + row) * TILE_SIZE + TILE_SIZE / 2,
          hasQuest: true,
          questGiven: false,
        };
      }
    }
  }

  return null;
}
