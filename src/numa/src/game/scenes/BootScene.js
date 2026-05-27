import Phaser from "phaser";
import {
  TILE_SIZE,
  TILE_COLORS,
  BLOCKED_TILES,
  MAP_WIDTH,
  MAP_HEIGHT,
} from "../config";
import { generateMap, findSafeSpawn } from "../systems/MapGenerator";
import { emit } from '../EventBus'

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
    this.tileX = 10;
    this.tileY = 7;
    this.facing = "down";
    this.isMoving = false;
    this.targetWorldX = 0;
    this.targetWorldY = 0;
    this.movePath = [];
    this.mapData = [];
  }

  create() {
    const seed = Math.random();
    this.mapData = generateMap(MAP_WIDTH, MAP_HEIGHT, seed);

    const spawn = findSafeSpawn(this.mapData, MAP_WIDTH, MAP_HEIGHT);
    this.tileX = spawn.col;
    this.tileY = spawn.row;

    this.drawMap();
    this.createPlayer();
    this.setupInput();

    const mapPixelWidth = MAP_WIDTH * TILE_SIZE;
    const mapPixelHeight = MAP_HEIGHT * TILE_SIZE;
    this.cameras.main.setBounds(0, 0, mapPixelWidth, mapPixelHeight);
    this.cameras.main.setZoom(2.5);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
  }

  drawMap() {
    for (let row = 0; row < MAP_HEIGHT; row++) {
      for (let col = 0; col < MAP_WIDTH; col++) {
        const tileType = this.mapData[row][col];
        const color = TILE_COLORS[tileType];
        this.add.rectangle(
          col * TILE_SIZE + TILE_SIZE / 2,
          row * TILE_SIZE + TILE_SIZE / 2,
          TILE_SIZE,
          TILE_SIZE,
          color,
        );
      }
    }
  }

  createPlayer() {
    this.targetWorldX = this.tileX * TILE_SIZE + TILE_SIZE / 2;
    this.targetWorldY = this.tileY * TILE_SIZE + TILE_SIZE / 2;

    this.player = this.add.rectangle(
      this.targetWorldX,
      this.targetWorldY,
      TILE_SIZE - 2,
      TILE_SIZE - 2,
      0x4488ff,
    );
  }

  /** Sets up keyboard and pointer (click/tap) input */
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
   * Checks if a tile position is walkable
   * @param {number} col
   * @param {number} row
   * @returns {boolean}
   */
  isWalkable(col, row) {
    if (col < 0 || row < 0 || col >= MAP_WIDTH || row >= MAP_HEIGHT)
      return false;
    return !BLOCKED_TILES.includes(this.mapData[row][col]);
  }

  /**
   * Converts tile position to world pixel position (center of tile)
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
   * Finds a simple path from current tile to target tile
   * using Manhattan movement (no diagonal)
   * @param {number} targetCol
   * @param {number} targetRow
   */
  setMoveTarget(targetCol, targetRow) {
    if (!this.isWalkable(targetCol, targetRow)) return;

    const path = [];
    let col = this.tileX;
    let row = this.tileY;

    while (col !== targetCol || row !== targetRow) {
      const diffCol = targetCol - col;
      const diffRow = targetRow - row;

      if (Math.abs(diffCol) >= Math.abs(diffRow)) {
        const nextCol = col + Math.sign(diffCol);
        if (this.isWalkable(nextCol, row)) {
          col = nextCol;
        } else if (this.isWalkable(col, row + Math.sign(diffRow))) {
          row = row + Math.sign(diffRow);
        } else {
          break;
        }
      } else {
        const nextRow = row + Math.sign(diffRow);
        if (this.isWalkable(col, nextRow)) {
          row = nextRow;
        } else if (this.isWalkable(col + Math.sign(diffCol), row)) {
          col = col + Math.sign(diffCol);
        } else {
          break;
        }
      }

      path.push({ col, row });

      if (path.length > 100) break;
    }

    this.movePath = path;
  }

  /**
   * Rotates the player triangle to face a direction
   * @param {'up'|'down'|'left'|'right'} direction
   */
  setFacing(direction) {
    if (this.facing === direction) return;
    this.facing = direction;

    const angles = { down: 0, up: 180, right: -90, left: 90 };
    this.tweens.add({
      targets: this.player,
      angle: angles[direction],
      duration: 80,
      ease: "Linear",
    });
  }

  /**
   * Steps player one tile toward direction, updates tileX/tileY
   * and animates visual position
   * @param {number} dx - column delta (-1, 0, 1)
   * @param {number} dy - row delta (-1, 0, 1)
   */
  stepPlayer(dx, dy) {
    const newCol = this.tileX + dx;
    const newRow = this.tileY + dy;

    if (!this.isWalkable(newCol, newRow)) return;

    this.tileX = newCol;
    this.tileY = newRow;

    emit('player:moved', { col: newCol, row: newRow })
    
    this.isMoving = true;

    const world = this.tileToWorld(newCol, newRow);
    this.targetWorldX = world.x;
    this.targetWorldY = world.y;

    this.tweens.add({
      targets: this.player,
      x: world.x,
      y: world.y,
      duration: 100,
      ease: "Linear",
      onComplete: () => {
        this.isMoving = false;
      },
    });
  }

  update() {
    if (this.isMoving) return;

    let dx = 0;
    let dy = 0;

    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      dx = -1;
      this.setFacing("left");
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      dx = 1;
      this.setFacing("right");
    } else if (this.cursors.up.isDown || this.wasd.up.isDown) {
      dy = -1;
      this.setFacing("up");
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      dy = 1;
      this.setFacing("down");
    }

    if (dx !== 0 || dy !== 0) {
      this.movePath = [];
      this.stepPlayer(dx, dy);
      return;
    }

    if (this.movePath.length > 0) {
      const next = this.movePath.shift();
      const diffCol = next.col - this.tileX;
      const diffRow = next.row - this.tileY;

      if (diffCol < 0) this.setFacing("left");
      else if (diffCol > 0) this.setFacing("right");
      else if (diffRow < 0) this.setFacing("up");
      else if (diffRow > 0) this.setFacing("down");

      this.stepPlayer(diffCol, diffRow);
    }
  }
}
