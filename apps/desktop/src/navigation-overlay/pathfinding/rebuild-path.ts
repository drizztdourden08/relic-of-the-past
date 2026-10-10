/* @layer renderer-components @kind logic */
import type { GridPos } from '../navigation-overlay.type';

const posOfKey = (key: string): GridPos => {
  const [row, col] = key.split(',').map(Number);
  if (row === undefined || col === undefined) throw new Error(`path key "${key}" holds no row and column`);
  return { row, col };
};

const rebuildPath = (last: GridPos, lastKey: string, cameFrom: ReadonlyMap<string, string>): GridPos[] => {
  const path: GridPos[] = [last];
  let walk = cameFrom.get(lastKey);
  while (walk !== undefined) {
    path.push(posOfKey(walk));
    walk = cameFrom.get(walk);
  }
  return path.reverse();
};

export { rebuildPath };
