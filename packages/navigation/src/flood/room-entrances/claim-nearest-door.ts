/* @layer bridge-wasm @kind logic */
import type { ExitDoor } from './room-entrances.type';

const claimNearestDoor = (doors: ExitDoor[], row: number, col: number): ExitDoor | null => {
  let best: ExitDoor | null = null;
  let bestDist = Infinity;
  for (const door of doors) {
    if (door.used) continue;
    const dist = (door.row - row) ** 2 + (door.col - col) ** 2;
    if (dist < bestDist) { bestDist = dist; best = door; }
  }
  if (best) best.used = true;
  return best;
};

export { claimNearestDoor };
