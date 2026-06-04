import Phaser from "phaser";
import {
  TILES,
  TILE_SIZE,
  TILE_COLORS,
  BLOCKED_TILES,
  CHUNK_SIZE,
  RENDER_DISTANCE,
  TILE_ELEVATION,
} from "../config";
import { generateChunk, getTileAt } from "../systems/MapGenerator";
import { rollEncounter, getMonster } from "../systems/EncounterSystem";
import { emit, on } from "../EventBus";
import { generateNPCForChunk } from "../systems/NPCSystem";
import { drawChunkWithEdges } from "../systems/TerrainRenderer";
import { loadGame } from "../systems/SaveSystem";
import { hasRamp } from "../systems/RampSystem";
import {
  placeVillageTiles,
  generateVillageInterior,
  shouldHaveVillage,
} from "../systems/VillageGenerator";
import { renderVillageMarker } from "../systems/VillageRenderer";

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
    this.villages = new Map(); // key: chunkKey → village data
    this.villageGfx = new Map(); // key: chunkKey → Phaser Graphics
  }

  create() {
    const save = loadGame();

    if (save?.position) {
      this.tileX = save.position.tileX;
      this.tileY = save.position.tileY;
    } else {
      this.findSafeSpawn();
    }

    this.updateChunks();
    this.createPlayer();
    this.setupInput();

    this.cameras.main.setZoom(2.5);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    on("battle:end", () => {
      this.inBattle = false;
    });

    window.__getChunkCache = () => this.chunkCache;
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
    drawChunkWithEdges(gfx, chunkX, chunkY, tiles, this.chunkCache);
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
    if (this.npcs.has(`npc_${chunkX}_${chunkY}`)) return;

    const npc = generateNPCForChunk(chunkX, chunkY, this.chunkCache);
    if (!npc) return;

    this.npcs.set(npc.id, npc);

    const body = this.add
      .rectangle(
        npc.worldX,
        npc.worldY,
        TILE_SIZE - 2,
        TILE_SIZE - 2,
        npc.isMerchant ? 0x44aa66 : 0xf0c040,
      )
      .setDepth(9);

    body.setInteractive({ useHandCursor: true });
    body.on("pointerdown", () => {
      emit("npc:interact", { npc: this.npcs.get(npc.id) });
    });

    this.npcSprites.set(npc.id, { body });
  }

  /** Converts all NPC world positions to screen positions and emits to React */
  emitNPCPositions() {
    const positions = [];
    const cam = this.cameras.main;

    for (const [id, npc] of this.npcs.entries()) {
      if (!this.npcSprites.has(id)) continue;

      const sx = (npc.worldX - cam.worldView.x) * cam.zoom;
      const sy = (npc.worldY - cam.worldView.y) * cam.zoom;

      if (sx < -50 || sx > cam.width + 50) continue;
      if (sy < -50 || sy > cam.height + 50) continue;

      positions.push({
        id,
        name: npc.name,
        sx,
        sy,
        isMerchant: npc.isMerchant,
      });
    }

    emit("npc:positions", { positions });
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
        if (sprites.body && sprites.body.active) sprites.body.destroy();
        this.npcSprites.delete(id);
        this.npcs.delete(id);
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
        this.spawnVillageForChunk(playerChunkX + dx, playerChunkY + dy);
      }
    }

    this.unloadFarChunks(playerChunkX, playerChunkY);
    this.despawnFarNPCs(playerChunkX, playerChunkY);
    this.despawnFarVillages(playerChunkX, playerChunkY);
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
    return this.isWalkableFrom(this.tileX, this.tileY, col, row);
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
   * Checks if movement from a specific position to another is valid
   * @param {number} fromCol
   * @param {number} fromRow
   * @param {number} toCol
   * @param {number} toRow
   * @returns {boolean}
   */
  isWalkableFrom(fromCol, fromRow, toCol, toRow) {
    const tile = getTileAt(toCol, toRow, this.chunkCache);

    if (tile === TILES.VILLAGE) return true;
    if (BLOCKED_TILES.includes(tile)) return false;

    for (const village of this.villages.values()) {
      for (const b of village.interior?.buildings ?? []) {
        if (
          toCol >= b.col &&
          toCol < b.col + b.w &&
          toRow >= b.row &&
          toRow < b.row + b.h
        )
          return false;
      }
    }

    const fromTile = getTileAt(fromCol, fromRow, this.chunkCache);
    const fromElev = TILE_ELEVATION[fromTile] ?? 1;
    const toElev = TILE_ELEVATION[tile] ?? 1;

    if (fromElev === toElev) return true;
    return hasRamp(fromCol, fromRow, toCol, toRow, this.chunkCache);
  }

  /**
   * Finds shortest path to target using BFS, respecting elevation and ramps
   * @param {number} targetCol
   * @param {number} targetRow
   */
  setMoveTarget(targetCol, targetRow) {
    if (targetCol === this.tileX && targetRow === this.tileY) return;

    const targetTile = getTileAt(targetCol, targetRow, this.chunkCache);
    if (BLOCKED_TILES.includes(targetTile)) return;

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

        if (!this.isWalkableFrom(current.col, current.row, nextCol, nextRow))
          continue;

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

  enterVillage() {
    for (const [key, village] of this.villages.entries()) {
      const { centerCol, centerRow } = village;
      if (
        Math.abs(this.tileX - centerCol) <= 1 &&
        Math.abs(this.tileY - centerRow) <= 1
      ) {
        this.cameras.main.fade(400, 0, 0, 0, false, (cam, progress) => {
          if (progress === 1) {
            emit("village:enter", {
              villageData: village.interior,
              fromTileX: this.tileX,
              fromTileY: this.tileY,
            });
            this.scene.pause();
          }
        });
        return;
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

    emit("player:position", { tileX: this.tileX, tileY: this.tileY });

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

        const currentTile = getTileAt(this.tileX, this.tileY, this.chunkCache);
        if (currentTile === TILES.VILLAGE) {
          this.enterVillage();
        }
      },
    });
  }

  /**
   * Generates and renders village for a chunk if applicable
   * @param {number} chunkX
   * @param {number} chunkY
   */
  spawnVillageForChunk(chunkX, chunkY) {
    const key = `${chunkX},${chunkY}`;
    if (this.villages.has(key)) return;
    if (!shouldHaveVillage(chunkX, chunkY)) return;

    const villageInfo = placeVillageTiles(chunkX, chunkY, this.chunkCache);
    if (!villageInfo) return;

    // Generate interior (persistent — same seed)
    const interior = generateVillageInterior(
      villageInfo.villageId,
      villageInfo.centerCol,
      villageInfo.centerRow,
    );

    this.villages.set(key, { ...villageInfo, interior });

    const gfx = this.add.graphics();
    gfx.setDepth(1);
    renderVillageMarker(gfx, villageInfo.centerCol, villageInfo.centerRow);
    this.villageGfx.set(key, gfx);
  }

  /**
   * Spawns NPC sprites for a village
   * @param {object} village
   */
  spawnVillageNPCs(village) {
    const NPC_NAMES = ["Aldric", "Myrna", "Bram", "Lyra", "Gorund", "Tessa"];
    const MERCHANT_NAMES = ["Pedagang Tua", "Bartel", "Wren"];

    for (const npcData of village.npcs) {
      if (this.npcSprites.has(npcData.id)) continue;

      const worldX = npcData.tileX * TILE_SIZE + TILE_SIZE / 2;
      const worldY = npcData.tileY * TILE_SIZE + TILE_SIZE / 2;

      const hash =
        Math.abs((npcData.tileX * 374761393) ^ (npcData.tileY * 668265263)) % 6;
      const name = npcData.isMerchant
        ? MERCHANT_NAMES[hash % MERCHANT_NAMES.length]
        : NPC_NAMES[hash % NPC_NAMES.length];

      const npc = {
        id: npcData.id,
        name,
        dialogue: npcData.isMerchant
          ? "Selamat datang! Aku menjual berbagai barang berguna."
          : "Hei petualang! Aku punya tugas untukmu.",
        tileX: npcData.tileX,
        tileY: npcData.tileY,
        worldX,
        worldY,
        isMerchant: npcData.isMerchant,
        hasQuest: !npcData.isMerchant,
        questGiven: false,
      };

      this.npcs.set(npc.id, npc);

      const body = this.add
        .rectangle(
          worldX,
          worldY,
          TILE_SIZE - 2,
          TILE_SIZE - 2,
          npc.isMerchant ? 0x44aa66 : 0xf0c040,
        )
        .setDepth(9);

      body.setInteractive({ useHandCursor: true });
      body.on("pointerdown", () => {
        emit("npc:interact", { npc: this.npcs.get(npc.id) });
      });

      this.npcSprites.set(npc.id, { body });
    }
  }

  /**
   * Removes village graphics for far chunks
   * @param {number} playerChunkX
   * @param {number} playerChunkY
   */
  despawnFarVillages(playerChunkX, playerChunkY) {
    for (const [key, gfx] of this.villageGfx.entries()) {
      const [cx, cy] = key.split(",").map(Number);
      const dist = Math.max(
        Math.abs(cx - playerChunkX),
        Math.abs(cy - playerChunkY),
      );
      if (dist > RENDER_DISTANCE + 1) {
        gfx.destroy();
        this.villageGfx.delete(key);
      }
    }
  }

  update() {
    this.emitNPCPositions();

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
