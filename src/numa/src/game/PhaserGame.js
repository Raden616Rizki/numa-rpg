import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";

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
    scene: [BootScene],
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
  };

  instance = new Phaser.Game(config);
  return instance;
}
