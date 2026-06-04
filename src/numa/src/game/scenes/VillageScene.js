import Phaser from "phaser";
import { TILE_SIZE, TILE_COLORS, BLOCKED_TILES, TILES } from "../config";
import { emit, on } from "../EventBus";
import { renderVillageInterior } from "../systems/VillageRenderer";

export class VillageScene extends Phaser.Scene {
  constructor() {
    super({ key: "VillageScene" });
    this.villageData = null;
    this.player = null;
    this.tileX = 0;
    this.tileY = 0;
    this.isMoving = false;
    this.inBattle = false;
    this.movePath = [];
  }

  /**
   * @param {{ villageData: object, spawnSide: string }} data
   */
  init(data) {
    this.villageData = data.villageData;
    this.spawnSide = data.spawnSide ?? "south";
  }

  create() {
    const { spawnCol, spawnRow, size } = this.villageData;

    // Spawn position berdasarkan dari mana player masuk
    const spawnPositions = {
      south: { col: spawnCol, row: spawnRow },
      north: { col: spawnCol, row: size - 2 },
      east: { col: 1, row: Math.floor(size / 2) },
      west: { col: size - 2, row: Math.floor(size / 2) },
    };

    const spawn = spawnPositions[this.spawnSide] ?? spawnPositions.south;
    this.tileX = spawn.col;
    this.tileY = spawn.row;

    this.drawVillageMap();
    this.createPlayer();
    this.setupInput();
    this.spawnNPCs();

    const mapPx = this.villageData.size * TILE_SIZE;
    this.cameras.main.setBounds(0, 0, mapPx, mapPx);
    this.cameras.main.setZoom(2.5);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.fadeIn(400, 0, 0, 0);

    on("battle:end", () => {
      this.inBattle = false;
    });
  }

  drawVillageMap() {
    const { tiles, buildings, size } = this.villageData;
    const gfx = this.add.graphics();
    gfx.setDepth(0);

    // Tile dasar
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const tileType = tiles[row][col];
        const color = TILE_COLORS[tileType] ?? 0x333333;
        gfx.fillStyle(color, 1);
        gfx.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }

    // Pagar tepi village
    gfx.lineStyle(2, 0x8a6a3a, 1);
    gfx.strokeRect(0, 0, size * TILE_SIZE, size * TILE_SIZE);

    // Render bangunan
    renderVillageInterior(gfx, buildings);
  }

  createPlayer() {
    this.player = this.add
      .rectangle(
        this.tileX * TILE_SIZE + TILE_SIZE / 2,
        this.tileY * TILE_SIZE + TILE_SIZE / 2,
        TILE_SIZE - 2,
        TILE_SIZE - 2,
        0x4488ff,
      )
      .setDepth(10);
  }

  setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });

    this.input.on("pointerdown", (pointer) => {
      const world = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      const col = Math.floor(world.x / TILE_SIZE);
      const row = Math.floor(world.y / TILE_SIZE);
      this.setMoveTarget(col, row);
    });
  }

  spawnNPCs() {
    for (const npc of this.villageData.npcs) {
      const worldX = npc.tileX * TILE_SIZE + TILE_SIZE / 2;
      const worldY = npc.tileY * TILE_SIZE + TILE_SIZE / 2;

      const color = npc.isMerchant
        ? 0x44aa66
        : npc.isInnkeeper
          ? 0xcc6666
          : 0xf0c040;

      const sprite = this.add
        .rectangle(worldX, worldY, TILE_SIZE - 2, TILE_SIZE - 2, color)
        .setDepth(9);

      sprite.setInteractive({ useHandCursor: true });
      sprite.on("pointerdown", () => {
        emit("npc:interact", { npc });
      });

      // Label nama
      this.add
        .text(worldX, worldY - TILE_SIZE, npc.name, {
          fontSize: "5px",
          fill: "#ffffff",
          backgroundColor: "#000000cc",
          padding: { x: 2, y: 1 },
          fontFamily: "Courier New",
        })
        .setOrigin(0.5)
        .setDepth(11);
    }
  }

  /**
   * @param {number} col
   * @param {number} row
   * @returns {boolean}
   */
  isWalkable(col, row) {
    const { tiles, size } = this.villageData;
    if (col < 0 || row < 0 || col >= size || row >= size) return false;

    // Cek exit tiles — selalu bisa dilewati
    const isExit = this.villageData.exits.some(
      (e) => e.col === col && e.row === row,
    );
    if (isExit) return true;

    const tile = tiles[row][col];
    return !BLOCKED_TILES.includes(tile) && tile !== TILES.STONE;
  }

  /**
   * @param {number} targetCol
   * @param {number} targetRow
   */
  setMoveTarget(targetCol, targetRow) {
    if (targetCol === this.tileX && targetRow === this.tileY) return;

    const queue = [{ col: this.tileX, row: this.tileY, path: [] }];
    const visited = new Set();
    visited.add(`${this.tileX},${this.tileY}`);

    const dirs = [
      { dc: 0, dr: -1 },
      { dc: 0, dr: 1 },
      { dc: -1, dr: 0 },
      { dc: 1, dr: 0 },
    ];

    while (queue.length > 0) {
      const current = queue.shift();
      for (const dir of dirs) {
        const nextCol = current.col + dir.dc;
        const nextRow = current.row + dir.dr;
        const key = `${nextCol},${nextRow}`;
        if (visited.has(key)) continue;
        if (!this.isWalkable(nextCol, nextRow)) continue;
        visited.add(key);
        const newPath = [...current.path, { col: nextCol, row: nextRow }];
        if (nextCol === targetCol && nextRow === targetRow) {
          this.movePath = newPath;
          return;
        }
        queue.push({ col: nextCol, row: nextRow, path: newPath });
        if (visited.size > 1024) break;
      }
    }
  }

  /**
   * @param {number} dx
   * @param {number} dy
   */
  stepPlayer(dx, dy) {
    const newCol = this.tileX + dx;
    const newRow = this.tileY + dy;

    if (!this.isWalkable(newCol, newRow)) return;

    this.tileX = newCol;
    this.tileY = newRow;
    this.isMoving = true;

    emit("player:position", { tileX: newCol, tileY: newRow });

    // Cek apakah player keluar dari village
    const exit = this.villageData.exits.find(
      (e) => e.col === newCol && e.row === newRow,
    );

    const world = {
      x: newCol * TILE_SIZE + TILE_SIZE / 2,
      y: newRow * TILE_SIZE + TILE_SIZE / 2,
    };

    this.tweens.add({
      targets: this.player,
      x: world.x,
      y: world.y,
      duration: 100,
      ease: "Linear",
      onComplete: () => {
        this.isMoving = false;
        if (exit) this.exitVillage(exit);
      },
    });
  }

  /** @param {{ direction: string }} exit */
  exitVillage(exit) {
    this.cameras.main.fade(400, 0, 0, 0, false, (cam, progress) => {
      if (progress === 1) {
        emit("village:exit", {
          villageId: this.villageData.villageId,
          exitDirection: exit.direction,
        });
        this.scene.stop("VillageScene");
      }
    });
  }

  update() {
    if (this.inBattle || this.isMoving) return;

    let dx = 0,
      dy = 0;

    if (this.cursors.left.isDown || this.wasd.left.isDown) dx = -1;
    else if (this.cursors.right.isDown || this.wasd.right.isDown) dx = 1;
    else if (this.cursors.up.isDown || this.wasd.up.isDown) dy = -1;
    else if (this.cursors.down.isDown || this.wasd.down.isDown) dy = 1;

    if (dx !== 0 || dy !== 0) {
      this.movePath = [];
      this.stepPlayer(dx, dy);
      return;
    }

    if (this.movePath.length > 0) {
      const next = this.movePath.shift();
      this.stepPlayer(next.col - this.tileX, next.row - this.tileY);
    }
  }
}
