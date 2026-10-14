import { LEVELS } from "../config/levels.js";
export const SAVE_KEY = "fairy-unicorn-chase:v1";
export const freshSave = () => ({
  version: 1,
  completed: [],
  sound: true,
  quality: "auto",
  reducedMotion: false,
});
export function sanitizeSave(value) {
  if (!value || value.version !== 1) return freshSave();
  return {
    version: 1,
    completed: [
      ...new Set(
        Array.isArray(value.completed)
          ? value.completed.filter(
              (n) => Number.isInteger(n) && n >= 0 && n < LEVELS.length,
            )
          : [],
      ),
    ].sort((a, b) => a - b),
    sound: value.sound !== false,
    quality: ["auto", "low", "high"].includes(value.quality)
      ? value.quality
      : "auto",
    reducedMotion: value.reducedMotion === true,
  };
}
export function loadSave(storage) {
  try {
    return sanitizeSave(JSON.parse(storage.getItem(SAVE_KEY)));
  } catch {
    return freshSave();
  }
}
export function writeSave(storage, save) {
  try {
    storage.setItem(SAVE_KEY, JSON.stringify(sanitizeSave(save)));
    return true;
  } catch {
    return false;
  }
}
export function unlockCount(save) {
  return Math.min(LEVELS.length, Math.max(1, ...save.completed.map((i) => i + 2)));
}
export function completeLevel(save, id) {
  return sanitizeSave({ ...save, completed: [...save.completed, id] });
}
