import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";

export function createPhaserGame(containerId) {
  const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: containerId,
    backgroundColor: "#0a0a1a",
    scene: [BootScene],
  };

  return new Phaser.Game(config);
}
