import {
  TILE_COLORS,
  TILE_EDGE_COLORS,
  TILE_ELEVATION,
  TILE_SIZE,
  CHUNK_SIZE,
} from "../config";
import { getTileAt } from "./MapGenerator";
import { getChunkRamps, getRampColor } from "./RampSystem";

const EDGE_SIZE = 4;

/**
 * Draws a chunk with elevation edges and ramp visuals
 * @param {Phaser.GameObjects.Graphics} gfx
 * @param {number} chunkX
 * @param {number} chunkY
 * @param {number[][]} tiles
 * @param {Map} chunkCache
 */
export function drawChunkWithEdges(gfx, chunkX, chunkY, tiles, chunkCache) {
  const originX = chunkX * CHUNK_SIZE * TILE_SIZE;
  const originY = chunkY * CHUNK_SIZE * TILE_SIZE;

  // Pass 1 — gambar tile dasar
  for (let row = 0; row < CHUNK_SIZE; row++) {
    for (let col = 0; col < CHUNK_SIZE; col++) {
      const tileType = tiles[row][col];
      const color = TILE_COLORS[tileType];
      const px = originX + col * TILE_SIZE;
      const py = originY + row * TILE_SIZE;

      gfx.fillStyle(color, 1);
      gfx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

      const worldCol = chunkX * CHUNK_SIZE + col;
      const worldRow = chunkY * CHUNK_SIZE + row;
      const myElev = TILE_ELEVATION[tileType] ?? 1;

      drawEdges(gfx, px, py, myElev, worldCol, worldRow, tileType, chunkCache);
    }
  }

  // Pass 2 — gambar visual celah/ramp di atas edges
  const ramps = getChunkRamps(chunkX, chunkY, tiles, chunkCache);
  for (const ramp of ramps) {
    const px = originX + ramp.col * TILE_SIZE;
    const py = originY + ramp.row * TILE_SIZE;
    drawRampVisual(gfx, px, py, ramp.dir, ramp.tileType);
  }
}

/**
 * Draws visual indicator for a passable ramp/gap
 * @param {Phaser.GameObjects.Graphics} gfx
 * @param {number} px
 * @param {number} py
 * @param {string} dir
 * @param {number} tileType
 */
function drawRampVisual(gfx, px, py, dir, tileType) {
  const color = getRampColor(tileType);
  const gap = 6; // lebar celah dalam pixel

  gfx.fillStyle(color, 1);

  switch (dir) {
    case "bottom":
      // celah di tepi bawah tile
      gfx.fillRect(
        px + (TILE_SIZE - gap) / 2,
        py + TILE_SIZE - EDGE_SIZE,
        gap,
        EDGE_SIZE,
      );
      // titik kecil penanda
      gfx.fillStyle(lighten(color, 1.3), 1);
      gfx.fillRect(
        px + (TILE_SIZE - gap) / 2 + 1,
        py + TILE_SIZE - EDGE_SIZE,
        gap - 2,
        2,
      );
      break;

    case "top":
      gfx.fillRect(px + (TILE_SIZE - gap) / 2, py, gap, EDGE_SIZE);
      gfx.fillStyle(lighten(color, 1.3), 1);
      gfx.fillRect(px + (TILE_SIZE - gap) / 2 + 1, py + 2, gap - 2, 2);
      break;

    case "right":
      gfx.fillRect(
        px + TILE_SIZE - EDGE_SIZE,
        py + (TILE_SIZE - gap) / 2,
        EDGE_SIZE,
        gap,
      );
      gfx.fillStyle(lighten(color, 1.3), 1);
      gfx.fillRect(
        px + TILE_SIZE - EDGE_SIZE,
        py + (TILE_SIZE - gap) / 2 + 1,
        2,
        gap - 2,
      );
      break;

    case "left":
      gfx.fillRect(px, py + (TILE_SIZE - gap) / 2, EDGE_SIZE, gap);
      gfx.fillStyle(lighten(color, 1.3), 1);
      gfx.fillRect(px + 2, py + (TILE_SIZE - gap) / 2 + 1, 2, gap - 2);
      break;
  }
}

function drawEdges(
  gfx,
  px,
  py,
  myElev,
  worldCol,
  worldRow,
  tileType,
  chunkCache,
) {
  const edgeColor = TILE_EDGE_COLORS[tileType] ?? 0x000000;

  const neighbors = {
    top: getTileAt(worldCol, worldRow - 1, chunkCache),
    bottom: getTileAt(worldCol, worldRow + 1, chunkCache),
    left: getTileAt(worldCol - 1, worldRow, chunkCache),
    right: getTileAt(worldCol + 1, worldRow, chunkCache),
  };

  if (myElev > (TILE_ELEVATION[neighbors.bottom] ?? 0)) {
    gfx.fillStyle(edgeColor, 1);
    gfx.fillRect(px, py + TILE_SIZE - EDGE_SIZE, TILE_SIZE, EDGE_SIZE);
    gfx.fillStyle(darken(edgeColor, 0.7), 1);
    gfx.fillRect(px, py + TILE_SIZE - EDGE_SIZE, 2, EDGE_SIZE);
    gfx.fillRect(px + TILE_SIZE - 2, py + TILE_SIZE - EDGE_SIZE, 2, EDGE_SIZE);
  }

  if (myElev > (TILE_ELEVATION[neighbors.right] ?? 0)) {
    gfx.fillStyle(edgeColor, 1);
    gfx.fillRect(px + TILE_SIZE - EDGE_SIZE, py, EDGE_SIZE, TILE_SIZE);
  }

  if (myElev > (TILE_ELEVATION[neighbors.top] ?? 0)) {
    gfx.fillStyle(lighten(TILE_COLORS[tileType], 1.2), 0.4);
    gfx.fillRect(px, py, TILE_SIZE, EDGE_SIZE);
  }

  if (myElev > (TILE_ELEVATION[neighbors.left] ?? 0)) {
    gfx.fillStyle(edgeColor, 0.6);
    gfx.fillRect(px, py, EDGE_SIZE, TILE_SIZE);
  }

  drawCornerDetails(
    gfx,
    px,
    py,
    myElev,
    worldCol,
    worldRow,
    edgeColor,
    chunkCache,
  );
}

function drawCornerDetails(
  gfx,
  px,
  py,
  myElev,
  worldCol,
  worldRow,
  edgeColor,
  chunkCache,
) {
  const tl =
    TILE_ELEVATION[getTileAt(worldCol - 1, worldRow - 1, chunkCache)] ?? 0;
  const tr =
    TILE_ELEVATION[getTileAt(worldCol + 1, worldRow - 1, chunkCache)] ?? 0;
  const bl =
    TILE_ELEVATION[getTileAt(worldCol - 1, worldRow + 1, chunkCache)] ?? 0;
  const br =
    TILE_ELEVATION[getTileAt(worldCol + 1, worldRow + 1, chunkCache)] ?? 0;

  gfx.fillStyle(darken(edgeColor, 0.6), 0.8);
  if (myElev > bl) gfx.fillRect(px, py + TILE_SIZE - 2, 2, 2);
  if (myElev > br) gfx.fillRect(px + TILE_SIZE - 2, py + TILE_SIZE - 2, 2, 2);
  if (myElev > tl) gfx.fillRect(px, py, 2, 2);
  if (myElev > tr) gfx.fillRect(px + TILE_SIZE - 2, py, 2, 2);
}

function darken(hex, factor) {
  const r = Math.floor(((hex >> 16) & 0xff) * factor);
  const g = Math.floor(((hex >> 8) & 0xff) * factor);
  const b = Math.floor((hex & 0xff) * factor);
  return (r << 16) | (g << 8) | b;
}

function lighten(hex, factor) {
  const r = Math.min(255, Math.floor(((hex >> 16) & 0xff) * factor));
  const g = Math.min(255, Math.floor(((hex >> 8) & 0xff) * factor));
  const b = Math.min(255, Math.floor((hex & 0xff) * factor));
  return (r << 16) | (g << 8) | b;
}
