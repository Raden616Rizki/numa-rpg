import { TILE_SIZE, TILES, TILE_COLORS } from "../config";

const FENCE_COLOR = 0x8a6a3a;
const FENCE_TOP = 0xaa8855;
const BUILDING_WALL = 0xcc9955;
const BUILDING_ROOF = 0x883322;
const BUILDING_DOOR = 0x553311;
const BUILDING_WIN = 0x88ccff;
const FLOOR_COLOR = 0x9a7a4a;
const ENTRANCE_COLOR = 0xc8a865;

/**
 * Renders a village onto a Phaser Graphics object
 * @param {Phaser.GameObjects.Graphics} gfx
 * @param {object} village
 */
export function renderVillage(gfx, village) {
  renderFloor(gfx, village);
  renderFences(gfx, village);
  renderEntrances(gfx, village);
  renderBuildings(gfx, village);
}

function renderFloor(gfx, village) {
  const { centerCol, centerRow, radius } = village;

  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > radius) continue;

      const px = (centerCol + dx) * TILE_SIZE;
      const py = (centerRow + dy) * TILE_SIZE;

      gfx.fillStyle(FLOOR_COLOR, 1);
      gfx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

      const hash =
        Math.abs(
          ((centerCol + dx) * 374761393) ^ ((centerRow + dy) * 668265263),
        ) % 10;
      if (hash < 3) {
        gfx.fillStyle(0x886633, 1);
        gfx.fillRect(px + 2, py + 2, 3, 3);
      } else if (hash < 5) {
        gfx.fillStyle(0xbb9966, 1);
        gfx.fillRect(px + 8, py + 9, 4, 2);
      }
    }
  }
}

function renderFences(gfx, village) {
  for (const pos of village.fencePositions) {
    const isEntrance = village.entrances.some(
      (e) => e.col === pos.col && e.row === pos.row,
    );
    if (isEntrance) continue;

    const px = pos.col * TILE_SIZE;
    const py = pos.row * TILE_SIZE;

    gfx.fillStyle(FENCE_COLOR, 1);
    gfx.fillRect(px + 1, py + 2, TILE_SIZE - 2, TILE_SIZE - 4);

    gfx.fillStyle(FENCE_TOP, 1);
    gfx.fillRect(px + 1, py + 2, TILE_SIZE - 2, 3);

    gfx.fillStyle(FENCE_TOP, 1);
    gfx.fillRect(px + 1, py + 2, 3, TILE_SIZE - 4);
    gfx.fillRect(px + TILE_SIZE - 4, py + 2, 3, TILE_SIZE - 4);
  }
}

function renderEntrances(gfx, village) {
  for (const pos of village.entrances) {
    const px = pos.col * TILE_SIZE;
    const py = pos.row * TILE_SIZE;

    gfx.fillStyle(ENTRANCE_COLOR, 1);
    gfx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

    gfx.fillStyle(FENCE_TOP, 1);
    gfx.fillRect(px + 1, py + 1, 3, TILE_SIZE - 2);
    gfx.fillRect(px + TILE_SIZE - 4, py + 1, 3, TILE_SIZE - 2);
  }
}

function renderBuildings(gfx, village) {
  for (const b of village.buildings) {
    const px = b.col * TILE_SIZE;
    const py = b.row * TILE_SIZE;
    const bw = b.w * TILE_SIZE;
    const bh = b.h * TILE_SIZE;

    gfx.fillStyle(BUILDING_WALL, 1);
    gfx.fillRect(px, py, bw, bh);

    gfx.fillStyle(BUILDING_ROOF, 1);
    gfx.fillRect(px, py, bw, 5);

    gfx.fillStyle(BUILDING_DOOR, 1);
    gfx.fillRect(px + Math.floor(bw / 2) - 2, py + bh - 6, 5, 6);

    gfx.fillStyle(BUILDING_WIN, 1);
    gfx.fillRect(px + 2, py + 6, 4, 4);
    if (b.w > 1) {
      gfx.fillRect(px + bw - 6, py + 6, 4, 4);
    }

    gfx.lineStyle(1, 0x7a5533, 1);
    gfx.strokeRect(px, py, bw, bh);
  }
}
