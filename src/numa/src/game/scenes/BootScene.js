import Phaser from "phaser";
import {
  TILE_SIZE,
  TILE_COLORS,
  BLOCKED_TILES,
  CHUNK_SIZE,
  RENDER_DISTANCE,
} from "../config";
import { generateChunk, getTileAt } from "../systems/MapGenerator";
import { rollEncounter, getMonster } from "../systems/EncounterSystem";
import { emit, on } from "../EventBus";
import { generateNPCForChunk } from "../systems/NPCSystem";

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
    this.tileX = 0;
    this.tileY = 0;
    this.facing = "down";
    this.isMoving = false;
    this.inBattle = false;
    this.movePath = [];
    this.chunkCache = new Map(); // key: "cx,cy" → tiles[][]
    this.chunkObjects = new Map(); // key: "cx,cy" → Phaser Graphics
    this.npcs = new Map(); // key: npc id → npc data
    this.npcSprites = new Map(); // key: npc id → Phaser objects
  }

  create() {
    this.findSafeSpawn();
    this.updateChunks();
    this.createPlayer();
    this.setupInput();

    this.cameras.main.setZoom(2.5);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    on("battle:end", () => {
      this.inBattle = false;
    });
  }

  /** Finds a safe GRASS or DIRT spawn tile near world origin */
  findSafeSpawn() {
    for (let radius = 0; radius < 50; radius++) {
      for (let row = -radius; row <= radius; row++) {
        for (let col = -radius; col <= radius; col++) {
          const tile = getTileAt(col, row, this.chunkCache);
          if (tile === 1 || tile === 4) {
            this.tileX = col;
            this.tileY = row;
            return;
          }
        }
      }
    }
  }

  /**
   * Renders a single chunk as a Graphics object
   * @param {number} chunkX
   * @param {number} chunkY
   */
  renderChunk(chunkX, chunkY) {
    const key = `${chunkX},${chunkY}`;
    if (this.chunkObjects.has(key)) return;

    const tiles = this.chunkCache.get(key) ?? generateChunk(chunkX, chunkY);
    this.chunkCache.set(key, tiles);

    const gfx = this.add.graphics();
    const originX = chunkX * CHUNK_SIZE * TILE_SIZE;
    const originY = chunkY * CHUNK_SIZE * TILE_SIZE;

    for (let row = 0; row < CHUNK_SIZE; row++) {
      for (let col = 0; col < CHUNK_SIZE; col++) {
        const tileType = tiles[row][col];
        const color = TILE_COLORS[tileType];
        gfx.fillStyle(color, 1);
        gfx.fillRect(
          originX + col * TILE_SIZE,
          originY + row * TILE_SIZE,
          TILE_SIZE,
          TILE_SIZE,
        );
      }
    }

    gfx.setDepth(0);
    this.chunkObjects.set(key, gfx);
  }

  /**
   * Destroys chunks that are too far from player
   * @param {number} playerChunkX
   * @param {number} playerChunkY
   */
  unloadFarChunks(playerChunkX, playerChunkY) {
    for (const [key, gfx] of this.chunkObjects.entries()) {
      const [cx, cy] = key.split(",").map(Number);
      const dist = Math.max(
        Math.abs(cx - playerChunkX),
        Math.abs(cy - playerChunkY),
      );
      if (dist > RENDER_DISTANCE + 1) {
        gfx.destroy();
        this.chunkObjects.delete(key);
        this.chunkCache.delete(key);
      }
    }
  }

  /**
   * Spawns NPC sprite for a chunk if applicable
   * @param {number} chunkX
   * @param {number} chunkY
   */
  spawnNPCForChunk(chunkX, chunkY) {
    const key = `${chunkX},${chunkY}`;
    if (this.npcs.has(`npc_${chunkX}_${chunkY}`)) return;

    const npc = generateNPCForChunk(chunkX, chunkY, this.chunkCache);
    if (!npc) return;

    this.npcs.set(npc.id, npc);

    const body = this.add
      .rectangle(npc.worldX, npc.worldY, TILE_SIZE - 2, TILE_SIZE - 2, 0xf0c040)
      .setDepth(9);

    const label = this.add
      .text(npc.worldX, npc.worldY - TILE_SIZE, npc.name, {
        fontSize: "5px",
        fill: "#ffffff",
        fontFamily: "Courier New",
      })
      .setOrigin(0.5)
      .setDepth(11);

    const indicator = this.add
      .text(npc.worldX, npc.worldY - TILE_SIZE * 1.8, "!", {
        fontSize: "8px",
        fill: "#e8b84b",
        fontFamily: "Courier New",
      })
      .setOrigin(0.5)
      .setDepth(11);

    body.setInteractive({ useHandCursor: true });
    body.on("pointerdown", () => {
      emit("npc:interact", { npc: this.npcs.get(npc.id) });
    });

    this.npcSprites.set(npc.id, { body, label, indicator });
  }

  /**
   * Removes NPC sprites for chunks that are too far
   * @param {number} playerChunkX
   * @param {number} playerChunkY
   */
  despawnFarNPCs(playerChunkX, playerChunkY) {
    for (const [id, sprites] of this.npcSprites.entries()) {
      const npc = this.npcs.get(id);
      if (!npc) continue;
      const npcChunkX = Math.floor(npc.tileX / CHUNK_SIZE);
      const npcChunkY = Math.floor(npc.tileY / CHUNK_SIZE);
      const dist = Math.max(
        Math.abs(npcChunkX - playerChunkX),
        Math.abs(npcChunkY - playerChunkY),
      );
      if (dist > RENDER_DISTANCE + 1) {
        sprites.body.destroy();
        sprites.label.destroy();
        sprites.indicator.destroy();
        this.npcSprites.delete(id);
      }
    }
  }

  /** Loads and renders all chunks within RENDER_DISTANCE of player */
  updateChunks() {
    const playerChunkX = Math.floor(this.tileX / CHUNK_SIZE);
    const playerChunkY = Math.floor(this.tileY / CHUNK_SIZE);

    for (let dy = -RENDER_DISTANCE; dy <= RENDER_DISTANCE; dy++) {
      for (let dx = -RENDER_DISTANCE; dx <= RENDER_DISTANCE; dx++) {
        this.renderChunk(playerChunkX + dx, playerChunkY + dy);
        this.spawnNPCForChunk(playerChunkX + dx, playerChunkY + dy);
      }
    }

    this.unloadFarChunks(playerChunkX, playerChunkY);
    this.despawnFarNPCs(playerChunkX, playerChunkY);
  }

  createPlayer() {
    const px = this.tileX * TILE_SIZE + TILE_SIZE / 2;
    const py = this.tileY * TILE_SIZE + TILE_SIZE / 2;

    this.player = this.add.rectangle(
      px,
      py,
      TILE_SIZE - 2,
      TILE_SIZE - 2,
      0x4488ff,
    );
    this.player.setDepth(10);
  }

  /** Sets up keyboard and pointer input */
  setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });

    this.input.on("pointerdown", (pointer) => {
      const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      const col = Math.floor(worldPoint.x / TILE_SIZE);
      const row = Math.floor(worldPoint.y / TILE_SIZE);
      this.setMoveTarget(col, row);
    });
  }

  /**
   * @param {number} col
   * @param {number} row
   * @returns {boolean}
   */
  isWalkable(col, row) {
    const tile = getTileAt(col, row, this.chunkCache);
    return !BLOCKED_TILES.includes(tile);
  }

  /**
   * @param {number} col
   * @param {number} row
   * @returns {{ x: number, y: number }}
   */
  tileToWorld(col, row) {
    return {
      x: col * TILE_SIZE + TILE_SIZE / 2,
      y: row * TILE_SIZE + TILE_SIZE / 2,
    };
  }

  /**
   * Finds shortest path to target using BFS
   * @param {number} targetCol
   * @param {number} targetRow
   */
  setMoveTarget(targetCol, targetRow) {
    if (!this.isWalkable(targetCol, targetRow)) return;
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
        if (visited.size > 2048) break;
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

    emit("player:moved", { col: newCol, row: newRow });

    const tileType = getTileAt(newCol, newRow, this.chunkCache);
    if (!this.inBattle && rollEncounter(tileType)) {
      this.inBattle = true;
      emit("encounter:start", { monster: getMonster(tileType) });
    }

    const world = this.tileToWorld(newCol, newRow);
    this.tweens.add({
      targets: this.player,
      x: world.x,
      y: world.y,
      duration: 100,
      ease: "Linear",
      onComplete: () => {
        this.isMoving = false;
        this.updateChunks();
      },
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
