import { TILE_SIZE } from "../config";

const COLORS = {
  wall: 0xcc9955,
  roof: 0x883322,
  roofInn: 0x224488,
  roofShop: 0x226633,
  door: 0x553311,
  window: 0x88ccff,
  outline: 0x7a5533,
  sign: 0xaa7722,
};

/**
 * Renders building sprites inside village interior
 * @param {Phaser.GameObjects.Graphics} gfx
 * @param {{ col, row, w, h, type }[]} buildings
 */
export function renderVillageInterior(gfx, buildings) {
  for (const b of buildings) {
    const px = b.col * TILE_SIZE;
    const py = b.row * TILE_SIZE;
    const bw = b.w * TILE_SIZE;
    const bh = b.h * TILE_SIZE;

    const roofColor =
      b.type === "inn"
        ? COLORS.roofInn
        : b.type === "shop"
          ? COLORS.roofShop
          : COLORS.roof;

    // Dinding
    gfx.fillStyle(COLORS.wall, 1);
    gfx.fillRect(px, py, bw, bh);

    // Atap
    gfx.fillStyle(roofColor, 1);
    gfx.fillRect(px, py, bw, 6);

    // Pintu
    gfx.fillStyle(COLORS.door, 1);
    gfx.fillRect(px + Math.floor(bw / 2) - 3, py + bh - 7, 6, 7);

    // Jendela kiri
    gfx.fillStyle(COLORS.window, 1);
    gfx.fillRect(px + 3, py + 8, 5, 5);

    // Jendela kanan (kalau cukup lebar)
    if (bw >= 32) {
      gfx.fillRect(px + bw - 8, py + 8, 5, 5);
    }

    // Outline
    gfx.lineStyle(1, COLORS.outline, 1);
    gfx.strokeRect(px, py, bw, bh);

    // Label tipe bangunan
    if (b.type === "inn" || b.type === "shop") {
      gfx.fillStyle(COLORS.sign, 1);
      gfx.fillRect(px + Math.floor(bw / 2) - 4, py - 4, 8, 4);
    }
  }
}

/**
 * Renders village as a 3x3 marker on the global map
 * @param {Phaser.GameObjects.Graphics} gfx
 * @param {number} centerCol
 * @param {number} centerRow
 */
export function renderVillageMarker(gfx, centerCol, centerRow) {
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const px = (centerCol + dx) * TILE_SIZE;
      const py = (centerRow + dy) * TILE_SIZE;

      // Tile dasar
      gfx.fillStyle(0xd4a855, 1);
      gfx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

      // Atap rumah kecil di tengah
      if (dx === 0 && dy === 0) {
        gfx.fillStyle(0x883322, 1);
        gfx.fillRect(px + 3, py + 2, 10, 5);
        gfx.fillStyle(0xcc9955, 1);
        gfx.fillRect(px + 4, py + 7, 8, 6);
      }
    }
  }
}
