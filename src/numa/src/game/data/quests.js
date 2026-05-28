export const QUEST_TYPES = {
  KILL: "kill",
  EXPLORE: "explore",
};

/**
 * Generates a random quest based on player level
 * @param {number} playerLevel
 * @returns {object}
 */
export function generateQuest(playerLevel) {
  const killQuests = [
    {
      type: QUEST_TYPES.KILL,
      title: "Basmi Serigala",
      description: "Kalahkan 3 Wolf yang berkeliaran di hutan.",
      target: "Wolf",
      targetCount: 3,
      reward: { exp: 80 + playerLevel * 10, gold: 30 + playerLevel * 5 },
    },
    {
      type: QUEST_TYPES.KILL,
      title: "Berantas Goblin",
      description: "Kalahkan 5 Goblin yang mengganggu.",
      target: "Goblin",
      targetCount: 5,
      reward: { exp: 60 + playerLevel * 8, gold: 25 + playerLevel * 4 },
    },
    {
      type: QUEST_TYPES.KILL,
      title: "Slime Merajalela",
      description: "Kalahkan 5 Slime di sekitar area ini.",
      target: "Slime",
      targetCount: 5,
      reward: { exp: 40 + playerLevel * 5, gold: 20 + playerLevel * 3 },
    },
    {
      type: QUEST_TYPES.KILL,
      title: "Laba-laba Raksasa",
      description: "Kalahkan 3 Giant Spider di dalam hutan.",
      target: "Giant Spider",
      targetCount: 3,
      reward: { exp: 70 + playerLevel * 9, gold: 28 + playerLevel * 4 },
    },
  ];

  return {
    ...killQuests[Math.floor(Math.random() * killQuests.length)],
    id: Date.now(),
    progress: 0,
    completed: false,
  };
}
