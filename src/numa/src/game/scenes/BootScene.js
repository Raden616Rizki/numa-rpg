import Phaser from "phaser";

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  create() {
    this.add
      .text(400, 300, "BootScene Running!", {
        fontSize: "24px",
        fill: "#e8b84b",
        fontFamily: "Courier New",
      })
      .setOrigin(0.5);
  }
}
