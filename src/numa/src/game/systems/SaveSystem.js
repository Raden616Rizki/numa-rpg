const SAVE_KEY = "rpg_save";
const SEED_KEY = "rpg_world_seed";

/**
 * Saves or retrieves the world seed
 * @param {number|null} seed - if provided, saves it. if null, loads it.
 * @returns {number|null}
 */
export function getOrCreateWorldSeed(seed = null) {
  if (seed !== null) {
    localStorage.setItem(SEED_KEY, String(seed));
    return seed;
  }
  const saved = localStorage.getItem(SEED_KEY);
  return saved ? Number(saved) : null;
}

export function saveGame(state) {
  const data = { ...state, savedAt: new Date().toISOString() };
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

export function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function deleteSave() {
  localStorage.removeItem(SAVE_KEY);
  localStorage.removeItem(SEED_KEY);
}

export function hasSave() {
  return localStorage.getItem(SAVE_KEY) !== null;
}
