import Phaser from 'phaser'
import { BootScene } from './scenes/BootScene'

export function createPhaserGame(containerId) {
  const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: containerId,
    backgroundColor: '#0a0a1a',
    pixelArt: true,
    scene: [BootScene],
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
  }

  return new Phaser.Game(config)
}