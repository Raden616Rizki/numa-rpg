import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";
import { VillageScene } from "./scenes/VillageScene";

let instance = null;

export function createPhaserGame(containerId) {
  if (instance) {
    instance.destroy(true);
    instance = null;
  }

  const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: containerId,
    backgroundColor: "#0a0a1a",
    pixelArt: true,
    scene: [BootScene, VillageScene],
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
  };

  instance = new Phaser.Game(config);
  return instance;
}

/**
 * Returns a running Phaser scene by key
 * @param {string} key
 * @returns {Phaser.Scene | null}
 */
export function getScene(key) {
  if (!instance) return null;
  return instance.scene.getScene(key);
}
